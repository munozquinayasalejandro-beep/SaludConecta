import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// Importaciones con ruta corregida desde la raíz (./src)
import sequelize from "./src/config/database.js"; 
import medicamentoRoutes from "./src/routes/medicamentoRoutes.js";
import pacienteRoutes from "./src/routes/pacienteRoutes.js";
import prescripcionRoutes from "./src/routes/prescripcionRoutes.js";
import entregaRoutes from "./src/routes/entregaRoutes.js";
import facturaRoutes from "./src/routes/facturaRoutes.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import { autenticarToken } from "./src/middleware/authMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/img", express.static(path.join(process.cwd(), "img")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas API
app.use("/usuarios", usuarioRoutes);
app.use("/medicamentos", autenticarToken, medicamentoRoutes);
app.use("/pacientes", autenticarToken, pacienteRoutes);
app.use("/prescripciones", autenticarToken, prescripcionRoutes);
app.use("/entregas", entregaRoutes);
app.use("/facturas", autenticarToken, facturaRoutes);

// Vistas HTML
app.get("/", (req, res) => res.sendFile(process.cwd() + "/src/views/index.html"));
app.get("/vista/medicamentos", (req, res) => res.sendFile(process.cwd() + "/src/views/medicamentos.html"));
app.get("/vista/pacientes", (req, res) => res.sendFile(process.cwd() + "/src/views/pacientes.html"));
app.get("/vista/entregas", (req, res) => res.sendFile(process.cwd() + "/src/views/entregas.html"));
app.get("/vista/facturas", (req, res) => res.sendFile(process.cwd() + "/src/views/facturas.html"));
app.get("/vista/dashboard", (req, res) => res.sendFile(process.cwd() + "/src/views/dashboard.html"));
app.get("/vista/login.html", (req, res) => res.sendFile(process.cwd() + "/src/views/login.html"));
app.get("/vista/registro", (req, res) => res.sendFile(process.cwd() + "/src/views/registro.html"));

// Conexión y Server Start (Evita levantar puerto durante tests)
if (process.env.NODE_ENV !== 'test') {
  sequelize.sync({ alter: true })
    .then(() => {
      app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:3000`));
    })
    .catch(err => console.error("❌ Error DB:", err));
}

// Exportación correcta en ESM
export default app;