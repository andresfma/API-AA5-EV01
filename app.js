const express = require('express')
const app = express()
const port = 3000

const cors = require('cors')
const session = require('express-session')

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(session({
  secret: 'sadasasdfasdfasdfaksjdfkagaskfdj'
}))

// Get the client
const mysql = require('mysql2/promise');

// Create the connection to database
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'sonyco',
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/login', async (req, res) => {
  const datos = req.query;

  // A simple SELECT query
  try {
    const [results, fields] = await connection.query(
      "SELECT * FROM `usuario` WHERE `nombre` = ? AND `contrasena` = ?",
      [datos.nombre, datos.contrasena]
    );

    if (results.length > 0) {
      req.session.usuario = datos.nombre;
      res.status(200).send('Inicio de sesión exitoso');
    } else {
      res.status(401).send('Usuario o contraseña incorrectos');
    }

    // console.log(results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
  } catch (err) {
    console.log(err);
  }
})

app.get('/validate', (req, res) => {
  if (req.session.usuario) {
    res.status(200).send(`Sesión activaba`);
  } else {
    res.status(401).send('Sesión no activada');
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
