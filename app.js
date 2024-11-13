const mysql = require("mysql");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

connection.connect((err) => {
  if (err) throw new Error(err);
  console.log("Connected to MySQL");

  connection.query("CREATE DATABASE IF NOT EXISTS mydb", (err) => {
    if (err) throw new Error(err);
    console.log("Database created/exists");
    connection.changeUser({ database: "mydb" }, (err) => {
      if (err) throw new Error(err);
      createTable();
    });
  });
});

function createTable() {
  connection.query(
    `CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
        title VARCHAR(100),
        status VARCHAR(100)
      )`,
    (err) => {
      if (err) throw new Error(err);
      console.log("Table created/exists");
    }
  );
}

app.use(express.json());

app.get("/tasks", (req, res) => {
  connection.query("SELECT * FROM tasks", (err, result) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).send("Server error");
      return;
    }
    console.log("Tasks fetched:", result);
    res.json(result);
  });
});

app.post("/tasks", (req, res) => {
  const { title, status } = req.body;
  if (!title || !status) {
    return res.status(400).json({ error: "Title and status are required" });
  }

  const query = "INSERT INTO tasks (title, status) VALUES (?, ?)";
  connection.query(query, [title, status], (err, result) => {
    if (err) {
      console.error("Error adding task:", err);
      return res.status(500).send("Server error");
    }
    res
      .status(201)
      .json({ message: "Task added successfully", taskId: result.insertId });
  });
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  connection.query(
    "DELETE FROM tasks WHERE id = ?",
    [taskId],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Error deleting task" });
      } else {
        res.status(200).json({ message: "Task deleted successfully" });
      }
    }
  );
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
