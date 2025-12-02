
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// HOME 
export const showHome = (req, res) => {
  res.render("home");
};

//REGISTRO USUÁRIO COMUM
export const showRegisterUser = (req, res) => {
  res.render("register-user");
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.send("E-mail já cadastrado.");
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      role: "user",
    });

    // já loga o usuário direto
    req.session.userId = user._id;
    req.session.role = user.role;

    res.redirect("/me");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao registrar usuário");
  }
};

// REGISTRO ADMIN
export const showRegisterAdmin = (req, res) => {
  res.render("register-admin");
};

export const registerAdmin = async (req, res) => {
  const { name, email, password, adminCode } = req.body;

  if (adminCode !== process.env.ADMIN_CODE) {
    return res.send("Código de administrador inválido.");
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.send("E-mail já cadastrado.");
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      role: "admin",
    });

    req.session.userId = user._id;
    req.session.role = user.role;

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao registrar admin");
  }
};

// LOGIN USUÁRIO
export const showLoginUser = (req, res) => {
  res.render("login-user");
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.role !== "user") {
    return res.render("login-user", { error: "Usuário ou senha inválidos." });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.render("login-user", { error: "Usuário ou senha inválidos." });
  }

  req.session.userId = user._id;
  req.session.role = user.role;
  res.redirect("/me");
};


//  LOGIN ADMIN 
export const showLoginAdmin = (req, res) => {
  res.render("login-admin");
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.role !== "admin") {
    return res.render("login-admin", { error: "Usuário ou senha inválidos." });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.render("login-admin", { error: "Usuário ou senha inválidos." });
  }

  req.session.userId = user._id;
  req.session.role = user.role;

  res.redirect("/admin");
};


// LOGOUT
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

// PÁGINA "VER CADASTRO" DO USUÁRIO
export const showMe = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect("/");

  res.render("me", { user });
};

//  PÁGINA ADMIN: VER TODOS USUÁRIOS 
export const showAdminUsers = async (req, res) => {
  const users = await User.find();
  res.render("admin", { users });
};

// ADMIN: CRIAR USUÁRIO 
export const adminCreateForm = (req, res) => {
  res.render("admin-new");
};

export const adminCreate = async (req, res) => {
  const { name, email, password, role } = req.body;

  // criptografa senha
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    role
  });

  res.redirect("/admin");
};

// ADMIN: EDITAR USUÁRIO 
export const adminEditForm = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render("admin-edit", { user });
};

export const adminUpdate = async (req, res) => {
  const { name, email, role } = req.body;

  await User.findByIdAndUpdate(req.params.id, {
    name,
    email,
    role,
  });

  res.redirect("/admin");
};

// --- ADMIN: EXCLUIR USUÁRIO ---
export const adminDelete = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
};
