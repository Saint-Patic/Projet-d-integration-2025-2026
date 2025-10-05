const express = require("express");
const cors = require("cors");
require("dotenv").config();

const teams = require("./routes/teams");
const matches = require("./routes/matches");
const auth = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/teams", teams);
app.use("/api/matches", matches);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API server listening on ${port}`));
