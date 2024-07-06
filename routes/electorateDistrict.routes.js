const db = require("../models");
const { electorateDistrict: ElectorateDistrict, electorate: Electorate } = db;
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

  // Create an Electorate District
  app.post("/electorate-district", authJwt.verifyToken, async (req, res) => {
    try {
      var checkElectorateDistrict = await checkers.checkElectorateDistrict(
        req.body.name
      );
      if (checkElectorateDistrict) {
        res.status(409).send({
          message: "Duplicate Electorate District Description!",
        });
      } else {
        const electorateDistrict = await ElectorateDistrict.create({
          name: req.body.name,
          currentVoters: 0,
          isActive: 1,
        });
        if (Object.keys(electorateDistrict).length) {
          res.status(200).send({
            message: "Electorate District Created Successfully!",
            data: electorateDistrict,
          });
        } else {
          res.status(200).send({
            message: "Electorate District not Created!",
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Electorate District not Created!",
      });
    }
  });

  // Update an Electorate District
  app.put("/electorate-district", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.body.id) {
        await ElectorateDistrict.update(
          {
            name: req.body.name,
            isActive: req.body.isActive,
          },
          {
            where: {
              id: req.body.id,
            },
          }
        );

        res.status(200).send({
          message: "Electorate District Updated Successfully!",
        });
      } else {
        res.status(409).send({
          message: "Electorate District id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Electorate District not Updated!",
      });
    }
  });

  // Suspend an Electorate District
  app.delete(
    "/electorate-district/:id",
    authJwt.verifyToken,
    async (req, res) => {
      try {
        if (req.params.id) {
          const electionParty = await ElectorateDistrict.update(
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
              message: "Electorate District Suspended Successfully!",
            });
          } else {
            res.status(200).send({
              message: "Electorate District not Suspended!",
            });
          }
        } else {
          res.status(409).send({
            message: "Electorate District id Needed!",
          });
        }
      } catch (err) {
        res.status(500).send({
          message: "Electorate District not Suspended!",
        });
      }
    }
  );

  // Re-activate an Electorate District
  app.patch(
    "/electorate-district/:id",
    authJwt.verifyToken,
    async (req, res) => {
      try {
        if (req.params.id) {
          const electionParty = await ElectorateDistrict.update(
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
              message: "Electorate District Activated Successfully!",
            });
          } else {
            res.status(200).send({
              message: "Electorate District not Activated!",
            });
          }
        } else {
          res.status(409).send({
            message: "Electorate District id Needed!",
          });
        }
      } catch (err) {
        res.status(500).send({
          message: "Electorate District not Activated!",
        });
      }
    }
  );

  // Get all Electorate District
  app.get("/electorate-district", authJwt.verifyToken, async (req, res) => {
    try {
      const electorateDistricts = await ElectorateDistrict.findAll({
        attributes: ["id", "name", "currentVoters", "isActive", "createdAt"],
      });

      res.status(200).send({
        districts: electorateDistricts,
      });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all active Electorate District
  app.get(
    "/active-electorate-district",
    authJwt.verifyToken,
    async (req, res) => {
      try {
        const electorateDistricts = await ElectorateDistrict.findAll({
          attributes: ["id", "name", "currentVoters", "isActive", "createdAt"],
          where: {
            isActive: 1,
          },
        });

        res.status(200).send({
          districts: electorateDistricts,
        });
      } catch (err) {
        res.status(500).send({
          message: "Something went wrong!",
        });
      }
    }
  );

  // Get all inactive Electorate District
  app.get(
    "/inactive-electorate-district",
    authJwt.verifyToken,
    async (req, res) => {
      try {
        const electorateDistricts = await ElectorateDistrict.findAll({
          attributes: ["id", "name", "currentVoters", "isActive", "createdAt"],
          where: {
            isActive: 0,
          },
        });

        res.status(200).send({
          districts: electorateDistricts,
        });
      } catch (err) {
        res.status(500).send({
          message: "Something went wrong!",
        });
      }
    }
  );

  // Get Electorate District for given id
  app.get("/electorate-district/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const electorateDistricts = await ElectorateDistrict.findOne({
        attributes: ["id", "name", "currentVoters", "isActive", "createdAt"],
        where: {
          id: req.params.id,
        },
      });

      res.status(200).send({ electorateDistricts });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });
};
