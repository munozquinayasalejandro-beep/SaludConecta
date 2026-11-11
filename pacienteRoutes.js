import express from "express";
import {
  listarPacientes,
  crear,
  detalle,
  actualizar,
  eliminar,
  solicitarMedicamento
} from "../controllers/pacienteController.js";
import { autorizarRol } from "../middleware/authMiddleware.js";

// Montado en server.js detrás de autenticarToken: aquí solo se valida el rol.
const router = express.Router();

router.get("/", listarPacientes);
router.get("/:id", detalle);
router.post("/solicitudes", solicitarMedicamento);

router.post("/", autorizarRol(["medico", "admin"]), crear);
router.put("/:id", autorizarRol(["medico", "admin"]), actualizar);
router.delete("/:id", autorizarRol(["medico", "admin"]), eliminar);

export default router;
