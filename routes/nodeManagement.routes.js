const db = require("../models");
const { election: Election, node: Node, electionNode: ElectionNode } = db;
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

  // Assign Nodes for Election
  app.post("/election-node", authJwt.verifyToken, async (req, res) => {
    try {
      var checkNodeURL = await checkers.checkNodeURL(
        req.body.node,
        req.body.election
      );
      if (checkNodeURL) {
        res.status(409).send({
          message: "Duplicate Node for Election!",
        });
      } else {
        const node = await ElectionNode.create({
          node: req.body.node,
          election: req.body.election,
        });

        if (Object.keys(node).length) {
          res.status(200).send({
            message: "Node Added Successfully!",
            node: node,
          });
        } else {
          res.status(200).send({
            message: "Node not Added!",
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Node not Added!",
      });
    }
  });

  // Delete Nodes of Election
  app.delete("/election-node/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        await ElectionNode.destroy({
          where: {
            id: req.params.id,
          },
        });

        res.status(200).send({
          message: "Node Deleted Successfully!",
        });
      } else {
        res.status(409).send({
          message: "Node id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Node not Deleted!",
      });
    }
  });

  // Get Nodes of Election
  app.get("/election-node/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const nodes = await ElectionNode.findAll({
        where: {
          election: req.params.id,
        },
        include: [
          {
            model: Node,
            attributes: ["id", "name", "url"],
          },
        ],
      });

      const availabilityPromises = nodes.map(async (node) => {
        const nodePlain = node.get({ plain: true });

        try {
          let response = await axios.get(
            `${node.Node.url}/election?election=${req.params.id}`
          );
          nodePlain.isSynced = Boolean(response.data.election);
          nodePlain.isOnline = true;
        } catch {
          nodePlain.isSynced = false;
          nodePlain.isOnline = false;
        }

        try {
          let response = await axios.get(
            `${node.Node.url}/nodes?election=${req.params.id}`
          );
          nodePlain.connectedNodes = response.data.all_nodes;
        } catch {
          nodePlain.connectedNodes = [];
        }

        try {
          let response = await axios.post(`${node.Node.url}/votes`, {
            election: req.params.id,
          });
          nodePlain.votes = response.data;
        } catch {
          nodePlain.votes = [];
        }

        return nodePlain;
      });

      const updatedNodes = await Promise.all(availabilityPromises);

      // Check for vote consistency
      const voteArrays = updatedNodes.map((node) => JSON.stringify(node.votes));
      const voteCount = {};

      voteArrays.forEach((voteArray) => {
        voteCount[voteArray] = (voteCount[voteArray] || 0) + 1;
      });

      const majorityVoteArray = Object.keys(voteCount).find(
        (key) => voteCount[key] > updatedNodes.length / 2
      );

      const incorrectNodes = updatedNodes.filter(
        (node) => JSON.stringify(node.votes) !== majorityVoteArray
      );

      // Prepare response
      const responseNodes = updatedNodes.map((node) => {
        const nodeCopy = { ...node };
        delete nodeCopy.votes;
        nodeCopy.conflicts = JSON.stringify(node.votes) !== majorityVoteArray;
        nodeCopy.minable = node.votes.length > 0;
        nodeCopy.votesEmpty = node.votes.length === 0;
        return nodeCopy;
      });

      res.status(200).send({
        nodes: responseNodes,
        incorrectNodes: incorrectNodes.map((node) => node.id),
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Sync Election with Node
  app.post("/sync-election", authJwt.verifyToken, async (req, res) => {
    await axios
      .post(req.body.url + "/create-election", {
        id: parseInt(req.body.id),
        description: req.body.description,
      })
      .then((response) => {
        res.status(200).send({
          message: response.data.message,
        });
      })
      .catch(() => {
        res.status(400).send({
          message: "Something Went Wrong",
        });
      });
  });

  // Initialize Node with Ballot
  app.post("/initialize-node", authJwt.verifyToken, async (req, res) => {
    await axios
      .post(req.body.url + "/ballot")
      .then((response) => {
        res.status(200).send({
          message: "Node Initialized Successfully!",
        });
      })
      .catch(() => {
        res.status(400).send({
          message: "Something Went Wrong",
        });
      });
  });

  // Connect Nodes (Initiate interconnections between nodes)
  app.post("/connect-nodes", authJwt.verifyToken, async (req, res) => {
    console.log("parent", req.body.parent);
    console.log("node", req.body.node);

    await axios
      .post(req.body.parent + "/node", {
        election: req.body.election,
        node: req.body.node,
      })
      .then((response) => {
        res.status(200).send({
          message: response.data.message,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send({
          message: "Something Went Wrong",
        });
      });
  });

  // Disconnect Nodes (Initiate interconnections between nodes)
  app.post("/disconnect-nodes", authJwt.verifyToken, async (req, res) => {
    await axios
      .delete(
        req.body.parent +
          "/node?election=" +
          req.body.election +
          "&node_url=" +
          req.body.node
      )
      .then((response) => {
        res.status(200).send({
          message: response.data.message,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send({
          message: "Something Went Wrong",
        });
      });
  });

  // Get Sync statuses of Elections for given Node
  app.get("/synced-election", authJwt.verifyToken, async (req, res) => {
    try {
      const elections = await Election.findAll({
        attributes: ["id", "description", "isComplete"],
        where: {
          isActive: 1,
        },
        order: [["isActive", "DESC"]],
        raw: true,
      });

      if (Object.keys(elections).length) {
        for (var j = 0; j < elections.length; j++) {
          var response = await axios.get(
            "http://" + req.body.url + "/election?election=" + elections[j].id
          );
          elections[j].isSynced = Boolean(response.data.election);
          elections[j].isComplete = Boolean(elections[j].isComplete);
        }

        res.status(200).send({ elections });
      } else {
        res.status(200).send({
          message: "Elections were not found!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });
};
