import express from "express";
import {
  listarMedicamentos,
  crear,
  detalle,
  actualizar,
  eliminar,
  historial,
  historialGeneral
} from "../controllers/medicamentoController.js";

const router = express.Router();

// CRUD básico
router.get("/", listarMedicamentos);          // GET /medicamentos
router.post("/", crear);                      // POST /medicamentos
router.get("/movimientos", historialGeneral); // GET /medicamentos/movimientos (auditoría general)
router.get("/:id", detalle);                  // GET /medicamentos/:id
router.put("/:id", actualizar);               // PUT /medicamentos/:id
router.delete("/:id", eliminar);              // DELETE /medicamentos/:id
router.get("/:id/movimientos", historial);    // GET /medicamentos/:id/movimientos

export default router;
