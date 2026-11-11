import express from "express";
import { registrar, listar, login } from "../controllers/usuarioController.js";
import { autenticarToken, autorizarRol } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/registro", registrar);
router.post("/login", login);
router.get("/", autenticarToken, autorizarRol(["admin"]), listar);

export default router;

