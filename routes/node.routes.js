const db = require("../models");
const { node: Node } = db;
const { authJwt } = require("../middleware");
const { checkers } = require("../services");
const axios = require("axios");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create an Node
  app.post("/node", authJwt.verifyToken, async (req, res) => {
    try {
      var checkNode = await checkers.checkNode(req.body.name, req.body.url);
      if (checkNode) {
        res.status(409).send({
          message: "Duplicate Node Name or URL !",
        });
      } else {
        const node = await Node.create({
          name: req.body.name,
          url: req.body.url,
          isActive: 1,
        });

        if (Object.keys(node).length) {
          res.status(200).send({
            message: "Node Created Successfully!",
            data: node,
          });
        } else {
          res.status(200).send({
            message: "Node not Created!",
          });
        }
      }
    } catch (err) {
      res.status(500).send({
        message: "Node not Created!",
      });
    }
  });

  // Update an Node
  app.put("/node", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.body.id) {
        await Node.update(
          {
            name: req.body.name,
            url: req.body.url,
            isActive: req.body.isActive,
          },
          {
            where: {
              id: req.body.id,
            },
          }
        );

        res.status(200).send({
          message: "Node Updated Successfully!",
        });
      } else {
        res.status(409).send({
          message: "Node id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Node not Updated!",
      });
    }
  });

  // Suspend an Node
  app.delete("/node/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const node = await Node.update(
          {
            isActive: 0,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(node).length) {
          res.status(200).send({
            message: "Node Suspended Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Node not Suspended!",
          });
        }
      } else {
        res.status(409).send({
          message: "Node id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Node not Suspended!",
      });
    }
  });

  // Re-activate an Node
  app.patch("/node/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const node = await Node.update(
          {
            isActive: 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(node).length) {
          res.status(200).send({
            message: "Node Activated Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Node not Activated!",
          });
        }
      } else {
        res.status(409).send({
          message: "Node id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Node not Activated!",
      });
    }
  });

  // Get all Nodes
  app.get("/node", authJwt.verifyToken, async (req, res) => {
    try {
      const nodes = await Node.findAll({
        attributes: ["id", "name", "url", "isActive", "createdAt"],
      });

      const availabilityPromises = nodes.map(async (node) => {
        const nodePlain = node.get({ plain: true });
        try {
          await axios.get(`${node.url}/ballot`);
          nodePlain.availability = true;
        } catch (error) {
          nodePlain.availability = false;
        }
        return nodePlain;
      });

      const updatedNodes = await Promise.all(availabilityPromises);

      res.status(200).send({ nodes: updatedNodes });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all Active Nodes
  app.get("/active-node", authJwt.verifyToken, async (req, res) => {
    try {
      const nodes = await Node.findAll({
        attributes: ["id", "name", "url", "isActive", "createdAt"],
        where: {
          isActive: 1,
        },
      });

      const availabilityPromises = nodes.map(async (node) => {
        const nodePlain = node.get({ plain: true });
        try {
          await axios.get(`${node.url}/ballot`);
          nodePlain.availability = true;
        } catch {
          nodePlain.availability = false;
        }
        return nodePlain;
      });

      const updatedNodes = await Promise.all(availabilityPromises);

      res.status(200).send({ nodes: updatedNodes });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all Inactive Nodes
  app.get("/inactive-node", authJwt.verifyToken, async (req, res) => {
    try {
      const nodes = await Node.findAll({
        attributes: ["id", "name", "url", "isActive", "createdAt"],
        where: {
          isActive: 0,
        },
      });

      const availabilityPromises = nodes.map(async (node) => {
        const nodePlain = node.get({ plain: true });
        try {
          await axios.get(`${node.url}/ballot`);
          nodePlain.availability = true;
        } catch {
          nodePlain.availability = false;
        }
        return nodePlain;
      });

      const updatedNodes = await Promise.all(availabilityPromises);

      res.status(200).send({ nodes: updatedNodes });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get a Node for given id
  app.get("/node/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const nodes = await Node.findAll({
        attributes: ["id", "name", "url", "isActive", "createdAt"],
        where: {
          id: req.params.id,
        },
      });

      const availabilityPromises = nodes.map(async (node) => {
        const nodePlain = node.get({ plain: true });
        try {
          await axios.get(`${node.url}/ballot`);
          nodePlain.availability = true;
        } catch {
          nodePlain.availability = false;
        }
        return nodePlain;
      });

      const updatedNodes = await Promise.all(availabilityPromises);

      res.status(200).send({ nodes: updatedNodes });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });
};
