import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "yourDatabaseName",
  password: "yourPassword",
  port: 5432,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// let items = [
//   { id: 1, title: "Buy milk" },
//   { id: 2, title: "Finish homework" },
// ];

async function fillItems() {
  let items = [];
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  result.rows.forEach((item) => {
    items.push(item);
  });
  return items;
}

app.get("/", async (req, res) => {
  try {
    let items = await fillItems();
    res.render("index.ejs", {
      listTitle: "Today's ToDo List",
      listItems: items,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [
      req.body.updatedItemTitle,
      req.body.updatedItemId,
    ]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  try {
    console.log(req.body.deleteItemId);
    await db.query("DELETE FROM items WHERE id = $1", [req.body.deleteItemId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
