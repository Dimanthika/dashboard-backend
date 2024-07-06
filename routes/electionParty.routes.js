const db = require("../models");
const { electionParty: ElectionParty } = db;
const { authJwt } = require("../middleware");
const { checkers } = require("../services");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create an Election Party
  app.post("/election-party", authJwt.verifyToken, async (req, res) => {
    try {
      var checkElectionParty = await checkers.checkElectionParty(req.body.name);
      if (checkElectionParty) {
        res.status(409).send({
          message: "Duplicate Election Party Description!",
        });
      } else {
        const electionParty = await ElectionParty.create({
          name: req.body.name,
          description: req.body.description,
          isActive: 1,
        });

        if (Object.keys(electionParty).length) {
          res.status(200).send({
            message: "Election Party Created Successfully!",
            data: electionParty,
          });
        } else {
          res.status(200).send({
            message: "Election Party not Created!",
          });
        }
      }
    } catch (err) {
      res.status(500).send({
        message: "Election Party not Created!",
      });
    }
  });

  // Update an Election Party
  app.put("/election-party", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.body.id) {
        await ElectionParty.update(
          {
            name: req.body.name,
            description: req.body.description,
            isActive: req.body.isActive,
          },
          {
            where: {
              id: req.body.id,
            },
          }
        );

        res.status(200).send({
          message: "Election Party Updated Successfully!",
        });
      } else {
        res.status(409).send({
          message: "Election Party id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Election Party not Updated!",
      });
    }
  });

  // Suspend an Election Party
  app.delete("/election-party/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const electionParty = await ElectionParty.update(
          {
            isActive: 0,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(electionParty).length) {
          res.status(200).send({
            message: "Election Party Suspended Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Election Party not Suspended!",
          });
        }
      } else {
        res.status(409).send({
          message: "Election Party id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Election Party not Suspended!",
      });
    }
  });

  // Re-activate an Election Party
  app.patch("/election-party/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const electionParty = await ElectionParty.update(
          {
            isActive: 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(electionParty).length) {
          res.status(200).send({
            message: "Election Party Activated Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Election Party not Activated!",
          });
        }
      } else {
        res.status(409).send({
          message: "Election Party id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Election Party not Activated!",
      });
    }
  });

  // Get all Election Parties
  app.get("/election-party", authJwt.verifyToken, async (req, res) => {
    try {
      const electionParties = await ElectionParty.findAll({
        attributes: ["id", "name", "description", "isActive", "createdAt"],
      });

      res.status(200).send({ electionParties });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all Active Election Parties
  app.get("/active-election-party", authJwt.verifyToken, async (req, res) => {
    try {
      const electionParties = await ElectionParty.findAll({
        attributes: ["id", "name", "description", "isActive", "createdAt"],
        where: {
          isActive: 1,
        },
      });

      res.status(200).send({ electionParties });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all Inactive Election Parties
  app.get("/inactive-election-party", authJwt.verifyToken, async (req, res) => {
    try {
      const electionParties = await ElectionParty.findAll({
        attributes: ["id", "name", "description", "isActive", "createdAt"],
        where: {
          isActive: 0,
        },
      });

      res.status(200).send({ electionParties });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get a Election Party for given id
  app.get("/election-party/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const electionParties = await ElectionParty.findAll({
        attributes: ["id", "name", "description", "isActive", "createdAt"],
        where: {
          id: req.params.id,
        },
      });

      res.status(200).send({ electionParties });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });
};
