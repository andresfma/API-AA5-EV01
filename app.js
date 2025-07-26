const express = require('express')
const app = express()
const port = 3000

const cors = require('cors')
const session = require('express-session')
const mysql = require('mysql2/promise');

// Configuración de CORS y sesión
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(session({
  secret: 'sadasasdfasdfasdfaksjdfkagaskfdj',
  resave: false,
  saveUninitialized: false
}))

app.use(express.json()); // Para leer el body JSON

// Conexión a la base de datos
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'sonyco',
});

// Ruta principal
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Registro de usuario
app.post('/register', async (req, res) => {
  const { nombre, contrasena, email } = req.body;

  // Validar que todos los campos estén presentes
  if (!nombre || !contrasena || !email) {
    return res.status(400).send('Faltan datos: nombre, contraseña o email');
  }

  try {
    // Verificar si ya existe un usuario con el mismo nombre o correo
    const [existing] = await connection.query(
      "SELECT * FROM `usuario` WHERE `nombre` = ? OR `email` = ?",
      [nombre, email]
    );

    if (existing.length > 0) {
      return res.status(409).send('El usuario o correo ya están registrados');
    }

    // Insertar nuevo usuario
    await connection.query(
      "INSERT INTO `usuario` (`nombre`, `contrasena`, `email`) VALUES (?, ?, ?)",
      [nombre, contrasena, email]
    );

    res.status(201).send('Usuario registrado correctamente');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error en el servidor');
  }
});

// Login
app.post('/login', async (req, res) => {
  const { nombre, contrasena } = req.body;

  if (!nombre || !contrasena) {
    return res.status(400).send('Faltan datos');
  }

  try {
    const [results] = await connection.query(
      "SELECT * FROM `usuario` WHERE `nombre` = ? AND `contrasena` = ?",
      [nombre, contrasena]
    );

    if (results.length > 0) {
      req.session.usuario = nombre;
      res.status(200).send('Inicio de sesión exitoso');
    } else {
      res.status(401).send('Usuario o contraseña incorrectos');
    }

  } catch (err) {
    console.log(err);
    res.status(500).send('Error en el servidor');
  }
});


// 🔒 Validar sesión
app.get('/validate', (req, res) => {
  if (req.session.usuario) {
    res.status(200).send(`Sesión activada para el usuario: ${req.session.usuario}`);
  } else {
    res.status(401).send('Sesión no activada');
  }
});

app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`);
})

