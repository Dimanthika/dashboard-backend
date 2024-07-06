const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: 0,

  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.admin = require("../models/admin.model.js")(sequelize, Sequelize);
db.candidate = require("../models/candidate.model.js")(sequelize, Sequelize);
db.election = require("../models/election.model.js")(sequelize, Sequelize);
db.electionParty = require("../models/electionParty.model.js")(
  sequelize,
  Sequelize
);
db.electorate = require("../models/electorate.model.js")(sequelize, Sequelize);
db.electorateDistrict = require("../models/electorateDistrict.model.js")(
  sequelize,
  Sequelize
);
db.voter = require("../models/voter.model.js")(sequelize, Sequelize);
db.refreshToken = require("../models/refreshToken.model.js")(
  sequelize,
  Sequelize
);
db.electorateResults = require("../models/electorateResults.model.js")(
  sequelize,
  Sequelize
);
// db.electionResults = require("../models/electionResults.model.js")(
//   sequelize,
//   Sequelize
// );
db.node = require("../models/node.model.js")(sequelize, Sequelize);

db.electionNode = sequelize.define("ElectionNode", {});

db.election.hasMany(db.electionNode, {
  foreignKey: { name: "election", allowNull: false },
});
db.electionNode.belongsTo(db.election, {
  foreignKey: { name: "election", allowNull: false },
});
db.node.hasMany(db.electionNode, {
  foreignKey: { name: "node", allowNull: false },
});
db.electionNode.belongsTo(db.node, {
  foreignKey: { name: "node", allowNull: false },
});

// Foreign Key -> electorate (Voter table)
db.electorate.hasMany(db.voter, {
  foreignKey: { name: "electorate", allowNull: false },
});
db.voter.belongsTo(db.electorate, {
  foreignKey: { name: "electorate", allowNull: false },
});

// Foreign Key -> nic (Candidate table)
db.voter.hasOne(db.candidate, {
  foreignKey: { name: "voter", allowNull: false },
});
db.candidate.belongsTo(db.voter, {
  foreignKey: { name: "voter", allowNull: false },
});

// Foreign Key -> electionParty (Candidate table)
db.electionParty.hasMany(db.candidate, {
  foreignKey: { name: "electionParty", allowNull: false },
});
db.candidate.belongsTo(db.electionParty, {
  foreignKey: { name: "electionParty", allowNull: false },
});

// Foreign Key -> election (Candidate table)
db.election.hasMany(db.candidate, {
  foreignKey: { name: "election", allowNull: false },
});
db.candidate.belongsTo(db.election, {
  foreignKey: { name: "election", allowNull: false },
});

// Foreign Key -> electorateDistrict (Electorate table)
db.electorateDistrict.hasMany(db.electorate, {
  foreignKey: { name: "electorateDistrict", allowNull: false },
});
db.electorate.belongsTo(db.electorateDistrict, {
  foreignKey: { name: "electorateDistrict", allowNull: false },
});

// Foreign Key -> voter
db.refreshToken.belongsTo(db.voter, {
  foreignKey: { name: "voter", allowNull: true },
});
db.voter.hasOne(db.refreshToken, {
  foreignKey: { name: "voter", allowNull: true },
});

// Foreign Key -> admin
db.refreshToken.belongsTo(db.admin, {
  foreignKey: { name: "admin", allowNull: true },
});
db.admin.hasOne(db.refreshToken, {
  foreignKey: { name: "admin", allowNull: true },
});

// Foreign Key -> election
db.electorateResults.belongsTo(db.election, {
  foreignKey: { name: "election", allowNull: true },
});
db.election.hasOne(db.electorateResults, {
  foreignKey: { name: "election", allowNull: true },
});

// Foreign Key -> candidate
db.electorateResults.belongsTo(db.candidate, {
  foreignKey: { name: "candidate", allowNull: true },
});
db.candidate.hasOne(db.electorateResults, {
  foreignKey: { name: "candidate", allowNull: true },
});

// Foreign Key -> electorate
db.electorateResults.belongsTo(db.electorate, {
  foreignKey: { name: "electorate", allowNull: true },
});
db.electorate.hasOne(db.electorateResults, {
  foreignKey: { name: "electorate", allowNull: true },
});

// Foreign Key -> electorate
db.electorateResults.belongsTo(db.electorateDistrict, {
  foreignKey: { name: "electorateDistrict", allowNull: true },
});
db.electorateDistrict.hasOne(db.electorateResults, {
  foreignKey: { name: "electorateDistrict", allowNull: true },
});

// Foreign Key -> candidate
// db.electionResults.belongsTo(db.candidate, {
//   foreignKey: { name: "candidate", allowNull: true },
// });
// db.candidate.hasOne(db.electionResults, {
//   foreignKey: { name: "candidate", allowNull: true },
// });

// // Foreign Key -> election
// db.electionResults.belongsTo(db.election, {
//   foreignKey: { name: "election", allowNull: true },
// });
// db.election.hasOne(db.electionResults, {
//   foreignKey: { name: "election", allowNull: true },
// });

module.exports = db;
