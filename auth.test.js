import request from 'supertest';
import app from '../server.js';
import sequelize from '../src/config/database.js';
import Usuario from '../src/models/Usuario.js';

// Usuario autocontenido: se crea antes de las pruebas y se elimina al terminar,
// para que esta prueba no dependa de datos precargados manualmente en la base.
const usuarioPrueba = {
  nombre: 'Usuario de Prueba',
  tipoDocumento: 'CC',
  numeroDocumento: '999999999',
  correo: 'prueba.auth@saludconecta.com',
  contraseña: 'Password123!',
  rol: 'medico'
};

describe('Pruebas de Integración - Autenticación / Login', () => {

  beforeAll(async () => {
    await sequelize.sync({ alter: true });
    await Usuario.destroy({ where: { numeroDocumento: usuarioPrueba.numeroDocumento } });
    await request(app).post('/usuarios/registro').send(usuarioPrueba);
  });

  afterAll(async () => {
    await Usuario.destroy({ where: { numeroDocumento: usuarioPrueba.numeroDocumento } });
    await sequelize.close();
  });

  test('CP01: Login exitoso con credenciales correctas', async () => {
    const res = await request(app)
      .post('/usuarios/login')
      .send({
        tipoDocumento: usuarioPrueba.tipoDocumento,
        numeroDocumento: usuarioPrueba.numeroDocumento,
        contraseña: usuarioPrueba.contraseña
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('CP02: Rechazo por contraseña incorrecta (401)', async () => {
    const res = await request(app)
      .post('/usuarios/login')
      .send({
        tipoDocumento: usuarioPrueba.tipoDocumento,
        numeroDocumento: usuarioPrueba.numeroDocumento,
        contraseña: 'PasswordErrada'
      });

    expect(res.statusCode).toBe(401);
  });

  test('CP03: Rechazo por tipo de documento que no coincide (401)', async () => {
    const res = await request(app)
      .post('/usuarios/login')
      .send({
        tipoDocumento: 'TI',
        numeroDocumento: usuarioPrueba.numeroDocumento,
        contraseña: usuarioPrueba.contraseña
      });

    expect(res.statusCode).toBe(401);
  });

  test('CP04: Rechazo por número de documento inexistente (401)', async () => {
    const res = await request(app)
      .post('/usuarios/login')
      .send({
        tipoDocumento: 'CC',
        numeroDocumento: '000000000',
        contraseña: 'CualquierClave123'
      });

    expect(res.statusCode).toBe(401);
  });

});
