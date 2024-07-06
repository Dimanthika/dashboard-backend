var bcrypt = require("bcryptjs");
const db = require("../models");
const {
  voter: Voter,
  // refreshToken: RefreshToken,
  electionNode: ElectionNode,
  electorate: Electorate,
  electorateDistrict: ElectorateDistrict,
  candidate: Candidate,
  node: Node,
} = db;
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
const { authJwt } = require("../middleware");
const { voter } = require("../services");
const axios = require("axios");
const { Op } = require("sequelize");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create a new voter
  app.post("/voter", authJwt.verifyToken, async (req, res) => {
    try {
      var checkNIC = await voter.checkNIC(req.body.nic);

      var checkEmail = await voter.checkEmail(req.body.email);

      if (checkNIC) {
        res.status(409).send({
          message: "NIC already exists!",
        });
      } else if (checkEmail) {
        res.status(409).send({
          message: "Email already exists!",
        });
      } else {
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const voters = Voter.create({
          // publicKey: keys.public_key,
          // privateKey: keys.private_key,
          nic: req.body.nic,
          name: req.body.name,
          gender: req.body.gender,
          dateOfBirth: req.body.dateOfBirth,
          isActive: 1,
          email: req.body.email,
          electorate: req.body.electorate,
          password: hashedPassword,
          voteEligibility: 1,
        });

        if (voters) {
          await voter.incrementElectorate(req.body.electorate);

          res.status(200).send({
            message: "User Created Successfully!",
          });
        } else {
          res.status(200).send({
            message: "User not Created!",
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Add public key to voter
  app.post("/voter-register", authJwt.verifyVoterToken, async (req, res) => {
    try {
      if (!req.body.public_key) {
        res.status(409).send({
          message: "Public key is empty!",
        });
        return;
      }

      const voters = await Voter.update(
        {
          publicKey: req.body.public_key,
        },
        {
          where: {
            id: req.voterId,
            publicKey: {
              [Op.eq]: null,
            },
          },
        }
      );

      if (voters[0]) {
        res.status(200).send({
          message: "User Registered Successfully!",
        });
      } else {
        res.status(400).send({
          message: "User initialization failed, contact authorities!",
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Update a voter
  app.put("/voter", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.body.id) {
        if (req.body.password) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);

          await Voter.update(
            {
              nic: req.body.nic,
              name: req.body.name,
              gender: req.body.gender,
              dateOfBirth: req.body.dateOfBirth,
              isActive: req.body.isActive,
              email: req.body.email,
              electorate: req.body.electorate,
              password: hashedPassword,
            },
            {
              where: {
                id: req.body.id,
              },
            }
          );
        } else {
          await Voter.update(
            {
              nic: req.body.nic,
              name: req.body.name,
              gender: req.body.gender,
              dateOfBirth: req.body.dateOfBirth,
              isActive: req.body.dateOfBirth,
              email: req.body.email,
              electorate: req.body.electorate,
            },
            {
              where: {
                id: req.body.id,
              },
            }
          );
        }

        res.status(200).send({
          message: "Voter Updated Successfully!",
        });
      } else {
        res.status(409).send({
          message: "Voter id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Voter not Updated!",
      });
    }
  });

  // Suspend a voter
  app.delete("/voter/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const voter = await Voter.update(
          {
            isActive: 0,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(voter).length) {
          res.status(200).send({
            message: "Voter Suspended Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Voter not Suspended!",
          });
        }
      } else {
        res.status(409).send({
          message: "Voter id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Voter not Suspended!",
      });
    }
  });

  // Re-activate a voter
  app.patch("/voter/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const voter = await Voter.update(
          {
            isActive: 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(voter).length) {
          res.status(200).send({
            message: "Voter Activated Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Voter not Activated!",
          });
        }
      } else {
        res.status(409).send({
          message: "Voter id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Voter not Activated!",
      });
    }
  });

  // Get all voters (Active and Inactive)
  app.get("/voters", authJwt.verifyToken, async (req, res) => {
    try {
      const voters = await Voter.findAll({
        attributes: [
          "id",
          "nic",
          "name",
          "email",
          "gender",
          "dateOfBirth",
          "isActive",
          "electorate",
          "createdAt",
        ],
        include: [
          {
            model: Electorate,
            attributes: ["id", "name", "electorateDistrict"],
          },
        ],
      });

      res.status(200).send({ voters });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all active voters
  app.get("/active-voter", authJwt.verifyToken, async (req, res) => {
    try {
      const voters = await Voter.findAll({
        attributes: [
          "id",
          "nic",
          "name",
          "email",
          "gender",
          "dateOfBirth",
          "isActive",
          "electorate",
          "createdAt",
        ],
        include: [
          {
            model: Electorate,
            attributes: ["id", "name", "electorateDistrict"],
          },
        ],
        where: {
          isActive: 1,
        },
      });

      res.status(200).send({ voters });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get all inactive voters
  app.get("/inactive-voter", authJwt.verifyToken, async (req, res) => {
    try {
      const voters = await Voter.findAll({
        attributes: [
          "id",
          "nic",
          "name",
          "email",
          "gender",
          "dateOfBirth",
          "isActive",
          "electorate",
          "createdAt",
        ],
        include: [
          {
            model: Electorate,
            attributes: ["id", "name", "electorateDistrict"],
          },
        ],
        where: {
          isActive: 0,
        },
      });

      res.status(200).send({ voters });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get single voter for given id
  app.get("/voter/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const voters = await Voter.findAll({
        attributes: [
          "id",
          "nic",
          "name",
          "email",
          "gender",
          "dateOfBirth",
          "isActive",
          "electorate",
          "createdAt",
        ],
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Electorate,
            attributes: ["id", "name", "electorateDistrict"],
          },
        ],
      });

      res.status(200).send({ voters });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Voter Sign In
  app.post("/voter/sign-in", async (req, res) => {
    try {
      let voter = "";

      if (req.body.publicKey) {
        voter = await Voter.findOne({
          where: {
            email: req.body.email,
            publicKey: req.body.publicKey,
          },
        });
      } else {
        voter = await Voter.findOne({
          where: {
            email: req.body.email,
            publicKey: {
              [Op.eq]: null,
            },
          },
        });
      }

      if (!voter) {
        if (req.body.publicKey) {
          return res.status(402).send({
            message: "You are not authorized to sign up from this device!",
          });
        } else {
          return res.status(404).send({
            message: "You don't have a account please Sign Up!",
          });
        }
      }
      if (!voter.isActive) {
        return res.status(404).send({
          message: "You are Suspended from Voting!",
        });
      }

      if (!bcrypt.compareSync(req.body.password, voter.password)) {
        return res.status(400).send({
          message: "Invalid Credentials",
        });
      }

      const token = jwt.sign({ id: voter.id }, config.secretVoter);
      // const refreshToken = await RefreshToken.createVoterToken(voter);

      res.status(200).send({
        id: voter.id,
        name: voter.name,
        token: token,
        // refreshToken: refreshToken,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Voter Refresh Token
  // app.post("/voter/refresh-token", authJwt.verifyToken, async (req, res) => {
  //   const refresh = req.cookies["refresh"];

  //   if (refresh == null) {
  //     return res.status(403).json({ message: "Refresh Token is required!" });
  //   }

  //   try {
  //     let refreshToken = await RefreshToken.findOne({
  //       where: { token: refresh },
  //     });

  //     if (!refreshToken) {
  //       res.status(403).json({ message: "Refresh token is not in database!" });
  //       return;
  //     }

  //     if (RefreshToken.verifyExpiration(refreshToken)) {
  //       RefreshToken.destroy({ where: { id: refreshToken.id } });

  //       res.status(403).json({
  //         message:
  //           "Refresh token was expired. Please make a new sign in request",
  //       });
  //       return;
  //     }

  //     const voter = refreshToken.voter;
  //     let newAccessToken = jwt.sign({ id: voter.id }, config.secret, {
  //       expiresIn: config.jwtExpiration,
  //     });

  //     res.cookie("jwt", newAccessToken, {
  //       httpOnly: true,
  //       maxAge: config.jwtExpiration,
  //     });

  //     res.cookie("refresh", refreshToken.token, {
  //       httpOnly: true,
  //       maxAge: config.jwtRefreshExpiration,
  //     });

  //     res.send({
  //       message: "JWT token is Refreshed",
  //     });
  //   } catch (err) {
  //     return res.status(500).send({
  //       message: "Something went wrong!",
  //     });
  //   }
  // });

  // Voting by voter
  app.post("/vote", authJwt.verifyVoterToken, async (req, res) => {
    try {
      const voter = await Voter.findOne({
        attributes: ["id"],
        where: {
          publicKey: req.body.publicKey,
        },
      });

      console.log(voter);

      if (!(voter && voter.id == req.voterId)) {
        res.status(404).send({
          message: "User cannot be found!",
        });
        return;
      }

      const candidate = await Candidate.findOne({
        attributes: [],
        include: [
          {
            model: Voter,
            attributes: ["publicKey"],
          },
        ],
        where: {
          id: req.body.candidate,
        },
      });

      console.log(candidate);

      let message = null;

      const nodes = await Node.findAll({ attributes: ["id", "url"] });

      for (const node of nodes) {
        try {
          const response = await axios.post(`${node.url}/vote`, {
            voter_public_key: req.body.publicKey,
            voter_private_key: req.body.privateKey,
            candidate: candidate.Voter.publicKey,
            election: parseInt(req.body.election),
          });
          if (response && response.data) {
            message = response.data.message;
            break;
          }
        } catch {
          continue;
        }
      }

      res.status(200).send({ message });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Generate Voter Keys
  app.post("/voter-keys", authJwt.verifyVoterToken, async (req, res) => {
    try {
      const nodes = await Node.findAll({ attributes: ["id", "url"] });

      const firstAvailableNode = await Promise.any(
        nodes.map(async (node) => {
          const nodePlain = node.get({ plain: true });
          try {
            await axios.get(`${node.url}/ballot`);
            nodePlain.availability = true;
            return nodePlain;
          } catch (error) {
            nodePlain.availability = false;
            throw new Error("Node unavailable");
          }
        })
      );

      if (!firstAvailableNode || !firstAvailableNode.url) {
        throw new Error("No available nodes found");
      }

      let keys;
      let checkKey = true;

      while (checkKey) {
        keys = await voter.loadKeys(firstAvailableNode.url);
        checkKey = await voter.checkKey(keys.public_key);
      }
      res.status(200).send(keys);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Something went wrong!" });
    }
  });

  // Check Eligibility to Vote
  app.post("/vote-eligibility", authJwt.verifyVoterToken, async (req, res) => {
    try {
      let eligibility = true;

      const voter = await Voter.findOne({
        attributes: ["id"],
        where: {
          publicKey: req.body.publicKey,
        },
      });

      if (voter && voter.id == req.voterId) {
        const nodes = await ElectionNode.findAll({
          where: {
            election: parseInt(req.body.election),
          },
          include: [
            {
              model: Node,
              attributes: ["url"],
            },
          ],
        });

        for (const node of nodes) {
          try {
            const response = await axios.post(
              `${node.Node.url}/vote-eligibility`,
              {
                voter: req.body.publicKey,
                election: parseInt(req.body.election),
              }
            );
            if (response && response.data) {
              eligibility = response.data.isVote;
              continue;
            }
          } catch {
            continue;
          }
        }

        res.status(200).send({
          isVote: !eligibility,
        });
      } else {
        res.status(404).send({
          message: "User cannot be found!",
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get single voter for given id
  app.get("/voter", authJwt.verifyVoterToken, async (req, res) => {
    try {
      const voter = await Voter.findOne({
        attributes: ["id", "nic", "name", "email", "gender", "dateOfBirth"],
        where: {
          id: req.voterId,
        },
        include: [
          {
            model: Electorate,
            attributes: ["name"],
            include: [
              {
                model: ElectorateDistrict,
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      res.status(200).send({ voter });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });
};
