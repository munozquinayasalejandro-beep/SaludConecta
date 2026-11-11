import express from "express";
import { listar, crear, dispensar, cancelar } from "../controllers/prescripcionController.js";
import { autorizarRol } from "../middleware/authMiddleware.js";

// Este router se monta en server.js ya detrás de autenticarToken (igual que /medicamentos),
// así que aquí solo se valida el rol.
const router = express.Router();

router.get("/", listar);
router.post("/", autorizarRol(["medico", "admin"]), crear);
router.put("/:id/dispensar", autorizarRol(["medico", "admin"]), dispensar);
router.put("/:id/cancelar", autorizarRol(["medico", "admin"]), cancelar);

export default router;
