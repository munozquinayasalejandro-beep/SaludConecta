// app.js
import express from 'express';
const app = express();
const PORT = 10000;

// Ruta por defecto
app.get('/', (req, res) => {
  res.send('Servidor activo en puerto 10000 🚀');
});

// Escuchar en el puerto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:`);
});

