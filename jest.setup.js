// jest.setup.js
// Se ejecuta antes de cargar los archivos de prueba (ver "jest.setupFiles" en package.json).
// Evita que server.js llame a app.listen() durante las pruebas automatizadas.
process.env.NODE_ENV = "test";
