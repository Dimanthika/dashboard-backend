const axios = require("axios");
const db = require("../models");
const {
  voter: Voter,
  electorate: Electorate,
  electorateDistrict: ElectorateDistrict,
} = db;

exports.loadKeys = async (url) => {
  const ballot = await axios({
    method: "post",
    url: url + "/generateKeys",
  });
  return ballot.data;
};

exports.vote = async (vote) => {
  const votes = await axios({
    method: "post",
    url: url + "/vote",
    data: {
      candidate: vote.candidate,
      voter_public_key: vote.publicKey,
      voter_private_key: vote.privateKey,
      election: vote.election,
    },
  });
  return votes.data;
};

exports.checkKey = async (public_key) => {
  const voters = await Voter.findAll({
    where: {
      publicKey: public_key,
    },
  });

  if (Object.keys(voters).length) {
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
  const findElect = await Electorate.findOne({
    where: {
      id: electorate,
    },
  });

  await findElect.increment("currentVoters");

  const electorateDistrict = await ElectorateDistrict.findOne({
    where: {
      id: findElect.electorateDistrict,
    },
  });

  await electorateDistrict.increment("currentVoters");
};
