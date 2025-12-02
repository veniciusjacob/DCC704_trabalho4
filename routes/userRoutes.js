import { Router } from "express";
import {
  showHome,
  showRegisterUser,
  registerUser,
  showRegisterAdmin,
  registerAdmin,
  showLoginUser,
  loginUser,
  showLoginAdmin,
  loginAdmin,
  logout,
  showMe,
  showAdminUsers,
  adminCreateForm,
  adminCreate,
  adminEditForm,
  adminUpdate,
  adminDelete
} from "../controllers/userController.js";

import { ensureUser, ensureAdmin } from "../auth/authMiddleware.js";

import rateLimit from "express-rate-limit";

// Limiter para rotas de login
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // permite 5 tentativas
  message: "Muitas tentativas de login. Tente novamente daqui a 1 minutos."
});

const router = Router();

// Home
router.get("/", showHome);

// Registro
router.get("/register-user", showRegisterUser);
router.post("/register-user", registerUser);

router.get("/register-admin", showRegisterAdmin);
router.post("/register-admin", registerAdmin);

// Login
router.get("/login-user", showLoginUser);
router.post("/login-user", loginLimiter, loginUser);

router.get("/login-admin", showLoginAdmin);
router.post("/login-admin", loginLimiter, loginAdmin);

// Logout
router.get("/logout", logout);

// Usuário normal: ver cadastro
router.get("/me", ensureUser, showMe);

// Admin: ver todos usuários
router.get("/admin", ensureAdmin, showAdminUsers);

// ADMIN CRUD

// Criar novo usuário
router.get("/admin/users/new", ensureAdmin, adminCreateForm);
router.post("/admin/users", ensureAdmin, adminCreate);

// Editar usuário
router.get("/admin/users/:id/edit", ensureAdmin, adminEditForm);
router.post("/admin/users/:id/update", ensureAdmin, adminUpdate);

// Excluir usuário
router.post("/admin/users/:id/delete", ensureAdmin, adminDelete);

export default router;
