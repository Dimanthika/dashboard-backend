const db = require("../models");
const config = require("../config/auth.config");
const { voter: Voter, refreshToken: RefreshToken } = db;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.createAccount = async (tenant, voter, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(voter.password, salt);

  try {
    Voter.create({
      name: voter.name,
      email: voter.email,
      role: voter.role,
      password: hashedPassword,
      tenant: tenant.id,
    });

    res.status(200).send({
      message: "Voter Created Successfully!",
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.signIn = async (tenant, req, res) => {
  try {
    const voter = await Voter.findOne({
      where: {
        email: req.body.email,
        tenant: tenant.id,
      },
    });

    if (!voter) {
      return res.status(404).send({
        message: "You don't have a account please Sign Up!",
      });
    }

    if (!(await bcrypt.compareSync(req.body.password, voter.password))) {
      return res.status(400).send({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign({ id: voter.id }, config.secret);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: config.jwtExpiration,
    });

    const refreshToken = await RefreshToken.createToken(voter);

    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      maxAge: config.jwtRefreshExpiration,
    });

    res.send({
      message: {
        voterID: voter.id,
        tenantId: tenant.id,
        voter: voter.name,
        role: voter.role,
        tenant: req.body.tenant,
      },
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.findVoter = async (tenant, email, res) => {
  try {
    var voter = await Voter.findOne({
      where: {
        tenant: tenant.id,
        email: email,
      },
    });
    return voter;
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.refreshToken = async (req, res) => {
  const refresh = req.cookies["refresh"];

  if (refresh == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({
      where: { token: refresh },
    });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });

      res.status(403).json({
        message: "Refresh token was expired. Please make a new sign in request",
      });
      return;
    }

    const voter = await refreshToken.getVoter();
    let newAccessToken = jwt.sign({ id: voter.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    res.cookie("jwt", newAccessToken, {
      httpOnly: true,
      maxAge: config.jwtExpiration,
    });

    res.cookie("refresh", refreshToken.token, {
      httpOnly: true,
      maxAge: config.jwtRefreshExpiration,
    });

    res.send({
      message: "JWT token is Refreshed",
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.forgotPassword = (req, res) => {
  Voter.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then(async (voter) => {
      if (!voter) {
        return res.status(404).send({ message: "Voter Not found." });
      }

      const token = jwt.sign({ email: req.body.email }, config.pw_forget, {
        expiresIn: config.pwtExpiration,
      });

      Voter.update(
        {
          resetlink: token,
        },
        {
          where: {
            email: req.body.email,
          },
        }
      ).then(() => {
        emails.passwordResetEmail(req.body.email, token);

        res.status(200).send({
          message:
            "We just sent you an email with instructions to reset your password.",
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.resetPassword = (req, res) => {
  Voter.update(
    {
      password: bcrypt.hashSync(req.body.password, 8),
    },
    {
      where: {
        resetLink: req.body.token,
      },
    }
  )
    .then(() => {
      return res.status(200).send({
        message: "Password Successfully Rested, Please Logged in again!",
      });
    })
    .catch((err) => {
      res.status(500).send({ message: "Link Expired! controller" });
    });
};
