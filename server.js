const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const db = new sqlite3.Database(
  "./sqlite-tools-win-x64-3450100/hackDatabase.db",
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to the SQLite database.");
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table';",
        (err, tables) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log("Tables in the database:", tables);
          }
        }
      );
    }
  }
);

app.use(express.json());

//GET

//returns json of nonprofit row
app.get("/nonProfit", (req, res) => {
  db.serialize(() => {
    db.all(
      "SELECT * FROM MainParent WHERE Name = 'One World Aid'",
      (err, row) => {
        if (err) {
          console.error(err.message);
          res.status(500).send(err.message);
        } else {
          res.status(200).json(row);
        }
      }
    );
  });
});

//returns json of countries and their info (rows)
//tied to nonprofit with id
app.get("/countries", (req, res) => {
  db.serialize(() => {
    db.all("SELECT * FROM Country", (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      } else {
        res.status(200).json(rows);
      }
    });
  });
});

//returns json of cities and their info (rows)
//tied to country with id
app.get("/cities", (req, res) => {
  db.serialize(() => {
    db.all("SELECT * FROM City", (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      } else {
        res.status(200).json(rows);
      }
    });
  });
});

//POST
app.post("/update-supplies", (req, res) => {
  const { typeOfAid, quantity, cityLocation } = req.body;

  db.serialize(() => {
    let sql = `UPDATE City SET NumberOfSupplies = NumberOfSupplies + ? WHERE CityName = ? AND SupplyType = ?`;

    db.run(sql, [quantity, cityLocation, typeOfAid], function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
      } else {
        res
          .status(200)
          .json({
            message: `Updated supplies for ${typeOfAid} in ${cityLocation} by ${quantity}`,
          });
      }
    });
  });
});

// the default info -----------
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Remember to close the database connection when you're done
process.on("SIGINT", () => {
  db.close();
  process.exit();
});
