module.exports = (sequelize, Sequelize) => {
  const Candidate = sequelize.define("Candidate", {
    candidateNo: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      required: true,
      allowNull: false,
    },
  });

  return Candidate;
};
