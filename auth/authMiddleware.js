import User from "../models/User.js";

export const ensureUser = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const user = await User.findById(req.session.userId);
  if (!user || user.role !== "user") {
    return res.status(403).send("Acesso permitido apenas para usuários comuns.");
  }

  req.user = user;
  next();
};

export const ensureAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const user = await User.findById(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).send("Acesso permitido apenas para administradores.");
  }

  req.user = user;
  next();
};
