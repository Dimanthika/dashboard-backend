const db = require("../models");
const { Op } = require("sequelize");
const { election: Election } = db;
const { authJwt } = require("../middleware");
const { checkers } = require("../services");
const moment = require("moment-timezone");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create an Election
  app.post("/election", authJwt.verifyToken, async (req, res) => {
    try {
      var checkDescription = await checkers.checkDescription(
        req.body.description
      );
      if (checkDescription) {
        res.status(409).send({
          message: "Duplicate Election Description!",
        });
      } else {
        const election = await Election.create({
          description: req.body.description,
          electionDate: new Date(req.body.electionDate),
          isComplete: 0,
          isActive: 1,
        });

        if (Object.keys(election).length) {
          res.status(200).send({
            message: "Election Created Successfully!",
            election: election,
          });
        } else {
          res.status(200).send({
            message: "Election not Created!",
          });
        }
      }
    } catch (err) {
      res.status(500).send({
        message: "Election not Created!",
      });
    }
  });

  // Update an Election
  app.put("/election", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.body.id) {
        await Election.update(
          {
            description: req.body.description,
            electionDate: new Date(req.body.electionDate),
            isComplete: req.body.isComplete,
            isActive: req.body.isActive,
          },
          {
            where: {
              id: req.body.id,
            },
          }
        );

        res.status(200).send({
          message: "Election Updated Successfully!",
        });
      } else {
        res.status(409).send({
          message: "Election id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Election not Updated!",
      });
    }
  });

  // Suspend an Election
  app.delete("/election/:id", authJwt.verifyToken, async (req, res) => {
    try {
      console.log(req.params.id);
      if (req.params.id) {
        const election = await Election.update(
          {
            isActive: 0,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(election).length) {
          res.status(200).send({
            message: "Election Suspended Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Election not Suspended!",
          });
        }
      } else {
        res.status(409).send({
          message: "Election id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Election not Suspended!",
      });
    }
  });

  // Re-activate an Election
  app.patch("/election/:id", authJwt.verifyToken, async (req, res) => {
    try {
      console.log(req.params.id);
      if (req.params.id) {
        const election = await Election.update(
          {
            isActive: 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(election).length) {
          res.status(200).send({
            message: "Election Activated Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Election not Activated!",
          });
        }
      } else {
        res.status(409).send({
          message: "Election id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Election not Activated!",
      });
    }
  });

  // Mark Election as Incomplete
  app.post(
    "/incomplete-election/:id",
    authJwt.verifyToken,
    async (req, res) => {
      try {
        if (req.params.id) {
          const election = await Election.update(
            {
              isComplete: 0,
            },
            {
              where: {
                id: req.params.id,
              },
            }
          );

          if (Object.keys(election).length) {
            res.status(200).send({
              message: "Election Mark as Incomplete Successfully!",
            });
          } else {
            res.status(200).send({
              message: "Election not found!",
            });
          }
        } else {
          res.status(409).send({
            message: "Election id Needed!",
          });
        }
      } catch (err) {
        res.status(500).send({
          message: "Election not Mark as Incomplete!",
        });
      }
    }
  );

  // Mark Election as Complete
  app.post("/complete-election/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const election = await Election.update(
          {
            isComplete: 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(election).length) {
          res.status(200).send({
            message: "Election Mark as Complete Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Election not found!",
          });
        }
      } else {
        res.status(409).send({
          message: "Election id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Election not Mark as Complete!",
      });
    }
  });

  // Get All Elections
  app.get("/election", authJwt.verifyToken, async (req, res) => {
    try {
      const elections = await Election.findAll({
        attributes: [
          "id",
          "description",
          "electionDate",
          "isActive",
          "isComplete",
          "createdAt",
          "updatedAt",
        ],
        order: [["electionDate", "DESC"]],
      });

      res.status(200).send({ elections });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get Inactive Elections
  app.get("/inactive-election", authJwt.verifyToken, async (req, res) => {
    try {
      const elections = await Election.findAll({
        attributes: [
          "id",
          "description",
          "electionDate",
          "isActive",
          "isComplete",
        ],
        order: [["electionDate", "DESC"]],
        where: {
          isActive: 0,
        },
      });

      res.status(200).send({ elections });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get Incomplete Elections excluding inactive
  app.get("/incomplete-elections", async (req, res) => {
    try {
      const elections = await Election.findAll({
        attributes: ["id", "description", "electionDate", "isComplete"],
        order: [["updatedAt", "DESC"]],
        where: {
          isActive: 1,
          isComplete: 0,
        },
      });

      res.status(200).send({ elections });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get Single Election for given id
  app.get("/election/:id", async (req, res) => {
    try {
      const elections = await Election.findAll({
        attributes: [
          "id",
          "description",
          "electionDate",
          "isActive",
          "isComplete",
        ],
        where: {
          id: req.params.id,
        },
      });

      res.status(200).send({ elections });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Mobile App Routes

  // Get Active & incomplete Elections for Voter App
  app.get("/active-election", authJwt.verifyVoterToken, async (req, res) => {
    try {
      const currentDate = moment()
        .tz("Asia/Colombo")
        .subtract(1, "days")
        .format("YYYY-MM-DD");

      const elections = await Election.findAll({
        attributes: ["id", "description", "electionDate"],
        order: [["electionDate", "DESC"]],
        where: {
          isActive: 1,
          isComplete: 0,
          electionDate: {
            [Op.gte]: currentDate,
          },
        },
      });

      res.status(200).send({ elections });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get Complete Elections excluding inactive for Voter App
  app.get("/complete-elections", authJwt.verifyVoterToken, async (req, res) => {
    try {
      const elections = await Election.findAll({
        attributes: ["id", "description", "electionDate"],
        order: [["electionDate", "DESC"]],
        where: {
          isActive: 1,
          isComplete: 1,
        },
      });

      res.status(200).send({ elections });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });
};
