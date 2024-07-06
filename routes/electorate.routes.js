const db = require("../models");
const { electorate: Electorate, electorateDistrict: ElectorateDistrict } = db;
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

  // Create an Electorate
  app.post("/electorate", authJwt.verifyToken, async (req, res) => {
    try {
      var checkElectorate = await checkers.checkElectorate(req.body.name);
      if (checkElectorate) {
        res.status(409).send({
          message: "Duplicate Electorate Name!",
        });
      } else {
        const electorate = await Electorate.create({
          name: req.body.name,
          electorateDistrict: req.body.electorateDistrict,
          currentVoters: 0,
          isActive: 1,
        });
        if (Object.keys(electorate).length) {
          res.status(200).send({
            message: "Electorate Created Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Electorate not Created!",
          });
        }
      }
    } catch (err) {
      res.status(500).send({
        message: "Electorate not Created!",
      });
    }
  });

  // Update an Electorate
  app.put("/electorate", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.body.id) {
        await Electorate.update(
          {
            name: req.body.name,
            electorateDistrict: req.body.electorateDistrict,
            isActive: req.body.isActive,
          },
          {
            where: {
              id: req.body.id,
            },
          }
        );

        res.status(200).send({
          message: "Electorate Updated Successfully!",
        });
      } else {
        res.status(409).send({
          message: "Electorate id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Electorate not Updated!",
      });
    }
  });

  // Suspend an Electorate
  app.delete("/electorate/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const electorate = await Electorate.update(
          {
            isActive: 0,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(electorate).length) {
          res.status(200).send({
            message: "Electorate Suspended Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Electorate not Suspended!",
          });
        }
      } else {
        res.status(409).send({
          message: "Electorate id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Electorate not Suspended!",
      });
    }
  });

  // Re-activate an Electorate
  app.patch("/electorate/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const electorates = await Electorate.update(
          {
            isActive: 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(electorates).length) {
          res.status(200).send({
            message: "Electorate Activated Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Electorate not Activated!",
          });
        }
      } else {
        res.status(409).send({
          message: "Electorate id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Electorate not Activated!",
      });
    }
  });

  // Get all Electorates
  app.get("/electorate", authJwt.verifyToken, async (req, res) => {
    try {
      const electorates = await Electorate.findAll({
        attributes: [
          "id",
          "name",
          "currentVoters",
          "electorateDistrict",
          "isActive",
          "createdAt",
        ],
      });

      res.status(200).send({ electorates });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all active Electorates
  app.get("/active-electorate", authJwt.verifyToken, async (req, res) => {
    try {
      const electorates = await Electorate.findAll({
        attributes: [
          "id",
          "name",
          "currentVoters",
          "electorateDistrict",
          "isActive",
          "createdAt",
        ],
        include: [
          {
            model: ElectorateDistrict,
            attributes: ["id", "name"],
          },
        ],
        where: {
          isActive: 1,
        },
      });
      res.status(200).send({ electorates });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all inactive Electorates
  app.get("/inactive-electorate", authJwt.verifyToken, async (req, res) => {
    try {
      const electorates = await Electorate.findAll({
        attributes: [
          "id",
          "name",
          "currentVoters",
          "electorateDistrict",
          "isActive",
          "createdAt",
        ],
        where: {
          isActive: 0,
        },
      });
      res.status(200).send({ electorates });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get an Electorate for given id
  app.get("/electorate/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const electorates = await Electorate.findAll({
        attributes: [
          "id",
          "name",
          "currentVoters",
          "isActive",
          "electorateDistrict",
        ],
        where: {
          id: req.params.id,
        },
      });

      res.status(200).send({ electorates });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get an Electorate for given electorateDistrict id
  app.get(
    "/electorate/electorate-district/:id",
    authJwt.verifyToken,
    async (req, res) => {
      try {
        const electorates = await Electorate.findAll({
          attributes: ["id", "name", "currentVoters", "isActive", "createdAt"],
          where: {
            electorateDistrict: req.params.id,
          },
        });

        if (Object.keys(electorates).length) {
          res.status(200).send({
            electorates: electorates,
          });
        } else {
          res.status(200).send({
            electorates: [],
          });
        }
      } catch (err) {
        res.status(500).send({
          message: "Something went wrong!",
        });
      }
    }
  );
};
