const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static(path.join(path.resolve(), "dist")));

const client = new Client({
  connectionString: process.env.PGURI,
});
client.connect();

const port = process.env.PORT || 3000;

// Hämta alla sektioner
app.get("/api/sections", async (_req, res) => {
  try {
    const { rows } = await client.query("SELECT * FROM sections ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Hämta alla produkter med sektion
app.get("/api/products", async (_req, res) => {
  try {
    const { rows } = await client.query(`
      SELECT p.id, p.name, s.name AS section
      FROM products p
      JOIN sections s ON s.id = p.section_id
      ORDER BY p.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Lägg till produkt
app.post("/api/products", async (req, res) => {
  try {
    const { name, section } = req.body;

    if (!name || !section) {
      return res.status(400).json({ error: "Produkt och sektion krävs" });
    }

    const result = await client.query(
      "INSERT INTO products (name, section_id) VALUES ($1, $2) RETURNING *",
      [name, section]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products", async (req, res) => {
  const { id } = req.body; // hämta id från request body

  if (!id) {
    return res.status(400).json({ error: "Produktens id saknas" });
  }

  try {
    await client.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



app.listen(port, () => {
  console.log(`Backend är igång på port ${port}`);
});
