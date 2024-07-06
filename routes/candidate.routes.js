const db = require("../models");
const {
  candidate: Candidate,
  voter: Voter,
  electionParty: ElectionParty,
  election: Election,
} = db;
const { authJwt } = require("../middleware");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create Candidate
  app.post("/candidate", authJwt.verifyToken, async (req, res) => {
    try {
      var voter = "";
      if (req.body.voter) {
        voter = await Voter.findOne({
          attributes: ["id"],
          where: {
            nic: req.body.voter,
          },
        });
      } else {
        res.status(400).send({
          message: "Voter NIC needed!",
        });
      }
      const candidate = await Candidate.create({
        candidateNo: req.body.candidateNo,
        voter: voter.id,
        electionParty: req.body.electionParty,
        election: req.body.election,
        isActive: 1,
      });

      if (Object.keys(candidate).length) {
        res.status(200).send({
          message: "Candidate Created Successfully!",
          data: candidate,
        });
      } else {
        res.status(400).send({
          message: "Candidate not Created!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Candidate not Created!",
      });
    }
  });

  // Update Candidate
  app.put("/candidate", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.body.id) {
        await Candidate.update(
          {
            candidateNo: req.body.candidateNo,
            voter: req.body.voter,
            electionParty: req.body.electionParty,
            election: req.body.election,
            isActive: req.body.isActive,
          },
          {
            where: {
              id: req.body.id,
            },
          }
        );

        res.status(200).send({
          message: "Candidate Updated Successfully!",
        });
      } else {
        res.status(409).send({
          message: "Candidate id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Candidate not Updated!",
      });
    }
  });

  // Suspend Candidate
  app.delete("/candidate/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const candidate = await Candidate.update(
          {
            isActive: 0,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(candidate).length) {
          res.status(200).send({
            message: "Candidate Suspended Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Candidate not Suspended!",
          });
        }
      } else {
        res.status(409).send({
          message: "Candidate id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Candidate not Suspended!",
      });
    }
  });

  // Re-activate Candidate
  app.patch("/candidate/:id", authJwt.verifyToken, async (req, res) => {
    try {
      if (req.params.id) {
        const candidate = await Candidate.update(
          {
            isActive: 1,
          },
          {
            where: {
              id: req.params.id,
            },
          }
        );

        if (Object.keys(candidate).length) {
          res.status(200).send({
            message: "Candidate Activated Successfully!",
          });
        } else {
          res.status(200).send({
            message: "Candidate not Activated!",
          });
        }
      } else {
        res.status(409).send({
          message: "Candidate id Needed!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Candidate not Activated!",
      });
    }
  });

  // Get All Candidate
  app.get("/candidate", authJwt.verifyToken, async (req, res) => {
    try {
      const candidates = await Candidate.findAll({
        attributes: ["id", "candidateNo", "election", "isActive", "createdAt"],
        include: [
          {
            model: Voter,
            attributes: ["name", "nic"],
          },
          {
            model: ElectionParty,
            attributes: ["name"],
          },
          {
            model: Election,
            attributes: ["description"],
          },
        ],
      });

      res.status(200).send({
        candidates: candidates,
      });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get All Active Candidate
  app.get("/active-candidate", authJwt.verifyToken, async (req, res) => {
    try {
      const candidates = await Candidate.findAll({
        attributes: ["id", "candidateNo", "election", "createdAt"],
        where: {
          isActive: 1,
        },
        include: [
          {
            model: Voter,
            attributes: ["name", "nic"],
          },
          {
            model: ElectionParty,
            attributes: ["name"],
          },
          {
            model: Election,
            attributes: ["description"],
          },
        ],
      });

      res.status(200).send({
        candidates: candidates,
      });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get All Inactive Candidate
  app.get("/inactive-candidate", authJwt.verifyToken, async (req, res) => {
    try {
      const candidates = await Candidate.findAll({
        attributes: ["id", "candidateNo", "election", "createdAt"],
        where: {
          isActive: 0,
        },
        include: [
          {
            model: Voter,
            attributes: ["name", "nic"],
          },
          {
            model: ElectionParty,
            attributes: ["name"],
          },
          {
            model: Election,
            attributes: ["description"],
          },
        ],
      });

      res.status(200).send({
        candidates: candidates,
      });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get a Candidate for given id
  app.get("/candidate/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const candidates = await Candidate.findAll({
        attributes: [
          "id",
          "candidateNo",
          "voter",
          "electionParty",
          "election",
          "isActive",
          "createdAt",
        ],
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: Voter,
            attributes: [
              "name",
              "nic",
              "email",
              "gender",
              "dateOfBirth",
              "isActive",
            ],
          },
        ],
      });

      res.status(200).send({
        candidates: candidates,
      });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get All Candidate for given Election
  app.get("/election-candidate/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const candidates = await Candidate.findAll({
        where: {
          election: req.params.id,
        },
        attributes: [
          "id",
          "candidateNo",
          "election",
          "electionParty",
          "isActive",
          "createdAt",
        ],
        include: [
          {
            model: Voter,
            attributes: ["name", "nic"],
          },
          {
            model: ElectionParty,
            attributes: ["name"],
          },
        ],
      });

      res.status(200).send({
        candidates: candidates,
      });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get All Candidate for given Election Party
  app.get(
    "/election-party-candidate/:id",
    authJwt.verifyToken,
    async (req, res) => {
      try {
        const candidates = await Candidate.findAll({
          where: {
            electionparty: req.params.id,
          },
          attributes: [
            "id",
            "candidateNo",
            "election",
            "isActive",
            "createdAt",
          ],
          include: [
            {
              model: Voter,
              attributes: ["name"],
            },
            {
              model: Election,
              attributes: ["description"],
            },
          ],
        });

        res.status(200).send({
          candidates: candidates,
        });
      } catch (err) {
        res.status(500).send({
          message: "Something went wrong!",
        });
      }
    }
  );

  // Mobile App Routes

  // Get All Candidate for given Election
  app.get(
    "/voter/election-candidate/:id",
    // authJwt.verifyVoterToken,
    async (req, res) => {
      try {
        const candidates = await Candidate.findAll({
          where: {
            election: req.params.id,
            isActive: 1,
          },
          attributes: ["id", "candidateNo"],
          include: [
            {
              model: Voter,
              attributes: ["name", "publicKey"],
            },
            {
              model: ElectionParty,
              attributes: ["name"],
            },
          ],
        });

        const mappedCandidates = candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.Voter.name,
          key: candidate.Voter.publicKey || "",
          candidateNo: candidate.candidateNo,
          electionParty: candidate.ElectionParty.name,
        }));

        res.status(200).send({
          candidates: mappedCandidates,
        });
      } catch (err) {
        res.status(500).send({
          message: "Something went wrong!",
        });
      }
    }
  );
};
