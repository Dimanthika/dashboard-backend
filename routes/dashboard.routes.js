const db = require("../models");
const {
  electorate: Electorate,
  // electionResults: ElectionResults,
  electionParty: ElectionParty,
  candidate: Candidate,
  voter: Voter,
  node: Node,
  electionNode: ElectionNode,
  electorateResults: ElectorateResults,
  electorateDistrict: ElectorateDistrict,
} = db;
const { authJwt } = require("../middleware");
const axios = require("axios");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/mine", authJwt.verifyToken, async (req, res) => {
    await axios
      .post(req.body.url + "/mine", {
        election: parseInt(req.body.election),
      })
      .then((response) => {
        res.status(200).send({
          message: response.data.message,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: error.response.data.message,
        });
      });
  });

  app.post("/resolve-conflicts", authJwt.verifyToken, async (req, res) => {
    await axios
      .post(req.body.url + "/resolve-conflicts", {
        election: parseInt(req.body.election),
      })
      .then((response) => {
        res.status(200).send({
          message: response.data.message,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: error.response.data.message,
        });
      });
  });

  app.get("/calculateResults/:id", authJwt.verifyToken, async (req, res) => {
    try {
      const candidates = await Candidate.findAll({
        attributes: ["id"],
        where: {
          election: req.params.id,
        },
        include: [
          {
            model: Voter,
            attributes: ["publicKey"],
          },
        ],
        raw: true,
        nest: true,
      });

      // Fetch nodes to get the URL
      const nodes = await ElectionNode.findAll({
        attributes: [],
        where: {
          election: req.params.id,
        },
        include: [
          {
            model: Node,
            attributes: ["url"],
          },
        ],
        raw: true,
        nest: true,
      });

      let workingUrl = null;

      // Find the first working URL
      for (const node of nodes) {
        try {
          await axios.get(
            `${node.Node.url}/election?election=${req.params.id}`
          );
          workingUrl = node.Node.url;
          break;
        } catch (err) {
          console.log(`URL ${node.Node.url} is not working`);
        }
      }

      if (!workingUrl) {
        return res.status(500).send({
          message: "No working node URL found!",
        });
      }

      if (Object.keys(candidates).length) {
        for (var j = 0; j < candidates.length; j++) {
          var response = await axios.post(workingUrl + "/results-voters", {
            candidate: candidates[j].Voter.publicKey,
            election: parseInt(req.params.id),
          });

          var voterArr = response.data.Voters;

          var electorateResults = new Object();

          var allElectorates = new Object();

          for (var y = 0; y < voterArr.length; y++) {
            for (var i = 0; i < voterArr[y].length; i++) {
              const voter = await Voter.findOne({
                attributes: ["electorate"],
                where: {
                  publicKey: voterArr[y][i],
                },
                raw: true,
              });

              if (electorateResults[voter.electorate] == null) {
                electorateResults[voter.electorate] = 1;
              } else {
                electorateResults[voter.electorate] += 1;
              }
            }
          }

          allElectorates = await Electorate.findAll({
            attributes: ["id", "electorateDistrict"],
            raw: true,
          });

          for (var x = 0; x < allElectorates.length; x++) {
            if (electorateResults[allElectorates[x].id] != null) {
              const foundItem = await ElectorateResults.findOne({
                where: {
                  election: req.params.id,
                  candidate: candidates[j].id,
                  electorate: allElectorates[x].id,
                },
                raw: true,
              });
              if (!foundItem) {
                await ElectorateResults.create({
                  election: req.params.id,
                  candidate: candidates[j].id,
                  electorate: allElectorates[x].id,
                  electorateDistrict: allElectorates[x].electorateDistrict,
                  votes: electorateResults[allElectorates[x].id],
                });
              } else {
                await ElectorateResults.update(
                  {
                    election: req.params.id,
                    candidate: candidates[j].id,
                    electorate: allElectorates[x].id,
                    votes: electorateResults[allElectorates[x].id],
                  },
                  {
                    where: {
                      election: req.params.id,
                      candidate: candidates[j].id,
                      electorate: allElectorates[x].id,
                    },
                  }
                );
              }
            }
          }
        }

        res
          .status(200)
          .send({ message: "Elections results Calculated Successfully!" });
      } else {
        res.status(200).send({
          message: "Elections results were not found!",
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  app.get("/resultsSummary/:id", async (req, res) => {
    try {
      var candidateResults = [];

      var totalVotes = await ElectorateResults.sum("votes", {
        where: { election: req.params.id },
      });

      const candidates = await Candidate.findAll({
        attributes: ["id", "candidateNo"],
        where: {
          election: req.params.id,
        },
        include: [
          {
            model: Voter,
            attributes: ["name"],
          },
          {
            model: ElectionParty,
            attributes: ["name", "description"],
          },
        ],
        raw: true,
        nest: true,
      });

      for (var y = 0; y < candidates.length; y++) {
        var votes = await ElectorateResults.sum("votes", {
          where: { candidate: candidates[y].id, election: req.params.id },
        });
        candidateResults.push({
          id: candidates[y].id,
          candidateNo: candidates[y].candidateNo,
          name: candidates[y].Voter.name,
          electionParty: candidates[y].ElectionParty.name,
          partyDescription: candidates[y].ElectionParty.description,
          votes: votes,
          percentage: ((votes / totalVotes) * 100).toFixed(2),
        });
      }

      candidateResults.sort((a, b) => {
        return b.votes - a.votes;
      });

      res.status(200).send({
        candidateResults,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  app.get("/resultsElectorate/:id", async (req, res) => {
    try {
      var electorateResults = [];

      const electorate = await Electorate.findAll({
        attributes: ["id", "name"],
        raw: true,
      });

      const candidates = await Candidate.findAll({
        attributes: ["id", "candidateNo"],
        where: {
          election: req.params.id,
        },
        include: [
          {
            model: Voter,
            attributes: ["name"],
          },
          {
            model: ElectionParty,
            attributes: ["name", "description"],
          },
        ],
        raw: true,
        nest: true,
      });

      for (var x = 0; x < electorate.length; x++) {
        var candidateResults = [];

        var totalVotes = await ElectorateResults.sum("votes", {
          where: { electorate: electorate[x].id, election: req.params.id },
        });

        for (var y = 0; y < candidates.length; y++) {
          var votes = await ElectorateResults.sum("votes", {
            where: {
              candidate: candidates[y].id,
              electorate: electorate[x].id,
              election: req.params.id,
            },
          });
          candidateResults.push({
            id: candidates[y].id,
            candidateNo: candidates[y].candidateNo,
            name: candidates[y].Voter.name,
            electionParty: candidates[y].ElectionParty.name,
            partyDescription: candidates[y].ElectionParty.description,
            votes: votes,
            percentage: ((votes / totalVotes) * 100).toFixed(2),
          });
        }

        candidateResults.sort((a, b) => {
          return b.votes - a.votes;
        });

        electorateResults.push({
          id: electorate[x].id,
          name: electorate[x].name,
          totalResult: totalVotes,
          results: candidateResults,
          election: req.params.id,
        });
      }

      electorateResults.sort((a, b) => {
        return b.totalResult - a.totalResult;
      });

      res.status(200).send({
        electorateResults,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  app.get("/resultsElectDist/:id", async (req, res) => {
    try {
      var electDistResults = [];

      const electDistrict = await ElectorateDistrict.findAll({
        attributes: ["id", "name"],
        raw: true,
      });

      const candidates = await Candidate.findAll({
        attributes: ["id", "candidateNo"],
        where: {
          election: req.params.id,
        },
        include: [
          {
            model: Voter,
            attributes: ["name"],
          },
          {
            model: ElectionParty,
            attributes: ["name", "description"],
          },
        ],
        raw: true,
        nest: true,
      });

      for (var x = 0; x < electDistrict.length; x++) {
        var candidateResults = [];

        var totalVotes = await ElectorateResults.sum("votes", {
          where: {
            electorateDistrict: electDistrict[x].id,
            election: parseInt(req.params.id),
          },
        });

        for (var y = 0; y < candidates.length; y++) {
          var votes = await ElectorateResults.sum("votes", {
            where: {
              candidate: candidates[y].id,
              electorateDistrict: electDistrict[x].id,
              election: parseInt(req.params.id),
            },
          });
          candidateResults.push({
            id: candidates[y].id,
            candidateNo: candidates[y].candidateNo,
            name: candidates[y].Voter.name,
            electionParty: candidates[y].ElectionParty.name,
            partyDescription: candidates[y].ElectionParty.description,
            votes: votes,
            percentage: ((votes / totalVotes) * 100).toFixed(2),
          });
        }

        candidateResults.sort((a, b) => {
          return b.votes - a.votes;
        });

        electDistResults.push({
          id: electDistrict[x].id,
          name: electDistrict[x].name,
          totalResult: totalVotes,
          results: candidateResults,
        });
      }

      electDistResults.sort((a, b) => {
        return b.totalResult - a.totalResult;
      });

      res.status(200).send({
        electDistResults,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // app.get("/results/:id", authJwt.verifyToken, async (req, res) => {
  //   try {
  //     const candidates = await Candidate.findAll({
  //       attributes: ["id", "candidateNo"],
  //       where: {
  //         election: req.params.id,
  //       },
  //       include: [
  //         {
  //           model: Voter,
  //           attributes: ["name", "publicKey"],
  //         },
  //         {
  //           model: ElectionParty,
  //           attributes: ["name", "description"],
  //         },
  //       ],
  //       raw: true,
  //       nest: true,
  //     });

  //     // Fetch nodes to get the URL
  //     const nodes = await ElectionNode.findAll({
  //       attributes: [],
  //       where: {
  //         election: req.params.id,
  //       },
  //       include: [
  //         {
  //           model: Node,
  //           attributes: ["url"],
  //         },
  //       ],
  //       raw: true,
  //       nest: true,
  //     });

  //     let workingUrl = null;

  //     // Find the first working URL
  //     for (const node of nodes) {
  //       try {
  //         await axios.get(
  //           `${node.Node.url}/election?election=${req.params.id}`
  //         );
  //         workingUrl = node.Node.url;
  //         break;
  //       } catch (err) {
  //         console.log(`URL ${node.Node.url} is not working`);
  //       }
  //     }

  //     if (!workingUrl) {
  //       return res.status(500).send({
  //         message: "No working node URL found!",
  //       });
  //     }

  //     let totalVotes = 0;
  //     if (Object.keys(candidates).length) {
  //       for (let j = 0; j < candidates.length; j++) {
  //         try {
  //           const response = await axios.post(`${workingUrl}/results`, {
  //             candidate: candidates[j].Voter.publicKey,
  //             election: parseInt(req.params.id),
  //           });
  //           candidates[j].results = response.data.Votes;
  //           totalVotes += parseInt(response.data.Votes);
  //         } catch (error) {
  //           console.error(`Failed to fetch results from ${workingUrl}:`, error);
  //           candidates[j].results = 0; // Set default result to handle error case
  //         }
  //       }

  //       for (let i = 0; i < candidates.length; i++) {
  //         const foundItem = await ElectionResults.findOne({
  //           where: {
  //             election: req.params.id,
  //             candidate: candidates[i].id,
  //           },
  //           raw: true,
  //         });
  //         if (!foundItem) {
  //           await ElectionResults.create({
  //             election: req.params.id,
  //             candidate: candidates[i].id,
  //             votes: candidates[i].results,
  //           });
  //         } else {
  //           await ElectionResults.update(
  //             {
  //               election: req.params.id,
  //               candidate: candidates[i].id,
  //               votes: candidates[i].results,
  //             },
  //             {
  //               where: {
  //                 election: req.params.id,
  //                 candidate: candidates[i].id,
  //               },
  //             }
  //           );
  //         }
  //       }

  //       res.status(200).send({ candidates, totalVotes });
  //     } else {
  //       res.status(200).send({
  //         message: "Elections were not found!",
  //       });
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).send({
  //       message: "Something went wrong!",
  //     });
  //   }
  // });

  // app.get("/results/:id", authJwt.verifyToken, async (req, res) => {
  //   try {
  //     const candidates = await Candidate.findAll({
  //       attributes: ["id", "candidateNo"],
  //       where: {
  //         election: req.params.id,
  //       },
  //       include: [
  //         {
  //           model: Voter,
  //           attributes: ["name", "publicKey"],
  //         },
  //         {
  //           model: ElectionParty,
  //           attributes: ["name", "description"],
  //         },
  //       ],
  //       raw: true,
  //       nest: true,
  //     });

  //     // Fetch nodes to get the URL
  //     const nodes = await ElectionNode.findAll({
  //       attributes: [],
  //       where: {
  //         election: req.params.id,
  //       },
  //       include: [
  //         {
  //           model: Node,
  //           attributes: ["url"],
  //         },
  //       ],
  //       raw: true,
  //       nest: true,
  //     });

  //     let workingUrl = null;

  //     // Find the first working URL
  //     for (const node of nodes) {
  //       try {
  //         await axios.get(
  //           `${node.Node.url}/election?election=${req.params.id}`
  //         );
  //         workingUrl = node.Node.url;
  //         break;
  //       } catch (err) {
  //         console.log(`URL ${node.Node.url} is not working`);
  //       }
  //     }

  //     if (!workingUrl) {
  //       return res.status(500).send({
  //         message: "No working node URL found!",
  //       });
  //     }

  //     let totalVotes = 0;
  //     if (Object.keys(candidates).length) {
  //       for (let j = 0; j < candidates.length; j++) {
  //         try {
  //           const response = await axios.post(`${workingUrl}/results`, {
  //             candidate: candidates[j].Voter.publicKey,
  //             election: parseInt(req.params.id),
  //           });
  //           candidates[j].results = response.data.Votes;
  //           totalVotes += parseInt(response.data.Votes);
  //         } catch (error) {
  //           console.error(`Failed to fetch results from ${workingUrl}:`, error);
  //           candidates[j].results = 0; // Set default result to handle error case
  //         }
  //       }

  //       for (let i = 0; i < candidates.length; i++) {
  //         const foundItem = await ElectionResults.findOne({
  //           where: {
  //             election: req.params.id,
  //             candidate: candidates[i].id,
  //           },
  //           raw: true,
  //         });
  //         if (!foundItem) {
  //           await ElectionResults.create({
  //             election: req.params.id,
  //             candidate: candidates[i].id,
  //             votes: candidates[i].results,
  //           });
  //         } else {
  //           await ElectionResults.update(
  //             {
  //               election: req.params.id,
  //               candidate: candidates[i].id,
  //               votes: candidates[i].results,
  //             },
  //             {
  //               where: {
  //                 election: req.params.id,
  //                 candidate: candidates[i].id,
  //               },
  //             }
  //           );
  //         }
  //       }

  //       res.status(200).send({ candidates, totalVotes });
  //     } else {
  //       res.status(200).send({
  //         message: "Elections were not found!",
  //       });
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).send({
  //       message: "Something went wrong!",
  //     });
  //   }
  // });
};
