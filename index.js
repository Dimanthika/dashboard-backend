const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

var corsOptions = {
  Credentials: true,
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// database
// const db = require("./models");
// db.sequelize.sync();

// force: true will drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and Resync Database with { force: true }");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Free Thinkers - API Running!" });
});

// routes
require("./routes/voter.routes")(app);
require("./routes/admin.routes")(app);
require("./routes/electorateDistrict.routes")(app);
require("./routes/electorate.routes")(app);
require("./routes/electionParty.routes")(app);
require("./routes/election.routes")(app);
require("./routes/candidate.routes")(app);
require("./routes/dashboard.routes")(app);
require("./routes/nodeManagement.routes")(app);
require("./routes/node.routes")(app);

// set port, listen for requests
// For Local Host
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// For Production Server
// app.listen();
