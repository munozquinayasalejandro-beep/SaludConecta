import express from "express";
import { listar, detalle, anular } from "../controllers/facturaController.js";
import { autorizarRol } from "../middleware/authMiddleware.js";

// Montado en server.js detrás de autenticarToken.
const router = express.Router();

router.get("/", listar);
router.get("/:id", detalle);
router.put("/:id/anular", autorizarRol(["medico", "admin"]), anular);

export default router;
