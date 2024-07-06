module.exports = (sequelize, Sequelize) => {
  const Voter = sequelize.define("Voter", {
    publicKey: {
      type: Sequelize.STRING(324),
      unique: true,
    },
    nic: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      unique: true,
    },
    gender: {
      type: Sequelize.ENUM("Male", "Female"),
      required: true,
      allowNull: false,
    },
    dateOfBirth: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    voteEligibility: {
      type: Sequelize.BOOLEAN,
      required: true,
      allowNull: false,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      required: true,
      allowNull: false,
    },
    resetLink: {
      type: Sequelize.STRING,
    },
  });

  return Voter;
};
