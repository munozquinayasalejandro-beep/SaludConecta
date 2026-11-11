import express from "express";
import {
  listarEntregas,
  crear,
  detalle,
  actualizar,
  eliminar
} from "../controllers/entregaController.js";

const router = express.Router();

router.get("/", listarEntregas);
router.post("/", crear);
router.get("/:id", detalle);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;

