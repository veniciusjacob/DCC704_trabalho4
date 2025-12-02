// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import session from "express-session";
import helmet from "helmet";           
import csrf from "csurf";      
import { dbConnect } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// conexão com banco
dbConnect();

// segurança HTTP básica
app.use(helmet());                          

// middlewares básicos
app.use(express.urlencoded({ extended: true }));

// sessão (login)
app.use(
  session({
    secret: process.env.SESSION_SECRET,     
    resave: false,
    saveUninitialized: false,
  })
);

// configuração csurf
const csrfProtection = csrf();
app.use(csrfProtection);   

// deixar infos do usuário + token CSRF disponíveis nas views
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.role = req.session.role || null;
  res.locals.csrfToken = req.csrfToken();   
  next();
});

// views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// rotas
app.use("/", userRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
