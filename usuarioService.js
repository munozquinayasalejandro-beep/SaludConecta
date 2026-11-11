import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

export async function crearUsuario(data) {
  const hash = await bcrypt.hash(data.contraseña, 10);
  return await Usuario.create({ ...data, contraseña: hash });
}

export async function obtenerUsuarios() {
  return await Usuario.findAll();
}

export async function loginUsuario(numeroDocumento, contraseña) {
  const usuario = await Usuario.findOne({ where: { numeroDocumento } });
  if (!usuario) return null;
  const valido = await bcrypt.compare(contraseña, usuario.contraseña);
  return valido ? usuario : null;
}
