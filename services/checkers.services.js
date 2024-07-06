const axios = require("axios");
const db = require("../models");
const { Op } = require("sequelize");

const {
  voter: Voter,
  electorate: Electorate,
  election: Election,
  node: Node,
  electorateDistrict: ElectorateDistrict,
  electionParty: ElectionParty,
  electionNode: ElectionNode,
} = db;

exports.checkDescription = async (description) => {
  const election = await Election.findAll({
    where: {
      description: description,
    },
  });

  if (Object.keys(election).length) {
    return true;
  } else {
    return false;
  }
};

exports.checkNodeURL = async (nodeId, election) => {
  const node = await ElectionNode.findAll({
    where: {
      node: nodeId,
      election: election,
    },
  });

  if (Object.keys(node).length) {
    return true;
  } else {
    return false;
  }
};

exports.checkNode = async (name, url) => {
  const node = await Node.findAll({
    where: {
      [Op.or]: [{ url: url }, { name: name }],
    },
  });

  if (Object.keys(node).length) {
    return true;
  } else {
    return false;
  }
};

exports.checkElectionParty = async (name) => {
  const electionParty = await ElectionParty.findAll({
    where: {
      name: name,
    },
  });

  if (Object.keys(electionParty).length) {
    return true;
  } else {
    return false;
  }
};

exports.checkElectorateDistrict = async (name) => {
  const electorateDistrict = await ElectorateDistrict.findAll({
    where: {
      name: name,
    },
  });

  if (Object.keys(electorateDistrict).length) {
    return true;
  } else {
    return false;
  }
};

exports.checkElectorate = async (name) => {
  const electorate = await Electorate.findAll({
    where: {
      name: name,
    },
  });

  if (Object.keys(electorate).length) {
    return true;
  } else {
    return false;
  }
};

exports.checkNIC = async (nic) => {
  const voters = await Voter.findAll({
    where: {
      nic: nic,
    },
  });

  if (Object.keys(voters).length) {
    return true;
  } else {
    return false;
  }
};

exports.checkEmail = async (email) => {
  const voters = await Voter.findAll({
    where: {
      email: email,
    },
  });

  if (Object.keys(voters).length) {
    return true;
  } else {
    return false;
  }
};

exports.incrementElectorate = async (electorate) => {
  await Electorate.update(
    {
      currentVoters: +1,
    },
    {
      where: {
        id: electorate,
      },
    }
  );
  const electorateDistrict = await Electorate.findAll({
    attributes: ["electorateDistrict"],
    where: {
      id: electorate,
    },
  });
  await ElectorateDistrict.update(
    {
      currentVoters: +1,
    },
    {
      where: {
        id: electorateDistrict[0].dataValues.electorateDistrict,
      },
    }
  );
};
