import express from "express";
import pool from "./db";

const port = 8080;

const app = express();

type Shape = "straight" | "round" | "curve";

var urlencodedParser = express.urlencoded({ extended: false });
var jsonParser = express.json();

const tableName = "fruit";

interface Fruit {
  name: string;
  look: Shape;
  lengthcm: number;
  description: string;
}

const relation = {
  _name: "name",
  _look: "look",
  _lengthcm: "lengthcm",
  _description: "description",
};

app.get("/api/v1/fruits", urlencodedParser, jsonParser, async (req, res) => {
  try {
    let defaultQuerryString = `SELECT * FROM ${tableName}`;
    const querry = req.query;

    if ("name" in querry) {
      defaultQuerryString += `${
        defaultQuerryString.includes("WHERE") ? " AND " : " WHERE "
      } _name = '${querry.name}'`;
    }

    if ("shape" in querry) {
      defaultQuerryString += `${
        defaultQuerryString.includes("WHERE") ? " AND " : " WHERE "
      } _look = '${querry.shape}'`;
    }

    if ("lengthcm" in querry) {
      defaultQuerryString += `${
        defaultQuerryString.includes("WHERE") ? " AND " : " WHERE "
      } _lengthcm >= ${querry.lengthcm} * 0.9 AND _lengthcm <= ${
        querry.lengthcm
      } * 1.1`;
    }

    if ("comestible" in querry) {
      defaultQuerryString += `${
        defaultQuerryString.includes("WHERE") ? " AND " : " WHERE "
      } _description LIKE '%Comestible'`;
    }
    console.log(defaultQuerryString);
    const content = await pool.query(defaultQuerryString);
    res.status(200);
    res.send(content.rows);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send(err);
  }
});

app.put(
  "/api/v1/fruit/:name",
  urlencodedParser,
  jsonParser,
  async (req, res) => {
    try {
      const fruit = req.body as Fruit;
      let querryString = `UPDATE ${tableName} SET`;

      for (let i in fruit) {
        if (typeof (fruit as any)[i] == "string") {
          (fruit as any)[i] = "'" + (fruit as any)[i];
          (fruit as any)[i] += "'";
        }
      }
      let tab = Object.keys(relation).map(e => `${e} = ${(fruit as any )[(relation as any)[e]]}`);
      querryString += " "  + tab.join(", ");
      querryString += " WHERE _name = '" + req.params.name + "'";
      console.log(querryString);
      const content = await pool.query(querryString);
      res.status(200);
      res.send(content.rows);
    } catch (err) {
      console.log(err);
      res.status(500);
      res.send(err);
    }
  }
);

app.post("/api/v1/fruit", urlencodedParser, jsonParser, async (req, res) => {
  try {
    const fruit = req.body as Fruit;

    const newFruit = await pool.query(
      `INSERT INTO ${tableName} (${String(Object.keys(relation))}) VALUES (${String(
        Object.keys(relation).map((_, index) => `$${index + 1}`)
      )}) RETURNING _id`,
      Object.keys(fruit).map((e) => (fruit as any)[e])
    );
    if (newFruit) {
      res.send(newFruit);
    }
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send(err);
  }
});

app.listen(port, () => {
  console.log("app listening on port ", port);
});
