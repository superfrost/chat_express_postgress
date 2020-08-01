const express = require("express")
const formData = require("express-form-data")
const { Client, Pool } = require('pg');
const cors = require('cors');

if(process.env.NODE_ENV == "production") {
  require('dotenv').config()
}

const PORT = process.env.PORT || 4000

const DB_USER_NAME = process.env.DB_USER_NAME || "postgres";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_NAME = process.env.DB_NAME || "doc2";
const DB_PASS = process.env.DB_PASS || "12345678";
const DB_PORT = process.env.DB_PORT || 5432;


const pool = new Pool({
  user: DB_USER_NAME,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASS,
  port: DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const app = express()
app.use(cors())
app.set('trust proxy',true); 
// app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(formData.parse())
app.use(express.static(__dirname + '/public'))
app.use(ipLog)

app.get("/", (req, res) => {
  console.log(req.query)
  res.status(200).json({
    msg: "Hi it's Node.JS server"
  })
})

app.post("/users/insert", (req, res) => {
  const {name, message} = req.body
  console.log(name, message);
  const query = {
    text: "INSERT INTO users (name, message, msg_time) VALUES ($1, $2, now())",
    values: [name, message],
  }
  pool.query(query, (err, response) => {
    if(err) {
      console.error(err.stack)
      res.status(500).send(err.stack)
    } else {
      res.status(200).send({
        command: response.command,
        status: "OK",
      })
      console.log({
        command: response.command,
        rowCount: response.rowCount,
        oid: response.oid,
      })
    }
  })
})

app.get("/users/messages", (req, res) => {
  const sqlText = "SELECT * FROM users ORDER BY msg_time DESC LIMIT 15"
  pool.query(sqlText, (err, response) => {
    if(err) {
      console.error(err.stack)
      res.status(500).json(err.stack)
    } else {
      res.status(200).json(response.rows)
      //console.log(response.rows)
    }
  })
})

function ipLog(req, res, next) {
  let ip = req.ip;
  console.log("Request IP: ", ip.split(':').pop(), Date.now());
  next()
}

app.listen(PORT, () => {
  console.log(`Server start on http://127.0.0.1:${PORT}`);
})
