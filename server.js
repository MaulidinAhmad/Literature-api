const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(express.static("uploads"));

const route = require("./src/routes/route");

app.use("/api/v1", route);
global.__basedir = __dirname;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
