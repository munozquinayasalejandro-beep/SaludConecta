import { crearUsuario, obtenerUsuarios, loginUsuario } from "../services/usuarioService.js";
import jwt from "jsonwebtoken";

export async function registrar(req, res) {
  try {
    const nuevo = await crearUsuario(req.body);
    const { contraseña, ...usuarioSinContraseña } = nuevo.toJSON();
    res.json(usuarioSinContraseña);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "Ya existe un usuario registrado con ese correo o número de documento."
      });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Datos de registro incompletos o inválidos." });
    }
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error interno al registrar el usuario." });
  }
}

export async function listar(req, res) {
  const usuarios = await obtenerUsuarios();
  res.json(usuarios);
}

export async function login(req, res) {
  try {
    const { tipoDocumento, numeroDocumento, contraseña } = req.body;

    if (!tipoDocumento || !numeroDocumento || !contraseña) {
      return res.status(400).json({ error: "Tipo de documento, número de documento y contraseña son obligatorios." });
    }

    const usuario = await loginUsuario(numeroDocumento, contraseña);
    if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });
    if (usuario.tipoDocumento !== tipoDocumento) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.idUsuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ mensaje: "Login exitoso", rol: usuario.rol, token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error interno al iniciar sesión." });
  }
}

