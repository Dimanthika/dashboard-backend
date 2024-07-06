var bcrypt = require("bcryptjs");
const db = require("../models");
const { admin: Admin, refreshToken: RefreshToken } = db;
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
const { authJwt } = require("../middleware");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create Admin
  app.post("/admin/create", async (req, res) => {
    try {
      const checkEmail = await Admin.findOne({
        where: {
          email: req.body.email,
        },
      });
      if (checkEmail && checkEmail.id) {
        res.status(400).send({
          message: "Admin already exists!",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        Admin.create({
          email: req.body.email,
          name: req.body.name,
          password: hashedPassword,
        });

        res.status(200).send({
          message: "Admin Created Successfully!",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Admin sign in
  app.post("/admin/sign-in", async (req, res) => {
    try {
      const admin = await Admin.findOne({
        where: {
          email: req.body.email,
        },
      });
      if (!admin) {
        return res.status(404).send({
          message: "You don't have a account please Sign Up!",
        });
      }

      if (!bcrypt.compareSync(req.body.password, admin.password)) {
        return res.status(400).send({
          message: "Invalid Credentials",
        });
      }

      const token = jwt.sign({ id: admin.id }, config.secret);

      const refreshToken = await RefreshToken.createAdminToken(admin);

      res.status(200).send({
        token: token,
        user: {
          id: admin.id,
          name: admin.name,
        },
        refreshToken: refreshToken,
      });
    } catch (err) {
      res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });

  // Get Admin data
  app.get("/admin", authJwt.verifyToken, async (req, res) => {
    res.status(200).json({
      id: req.userId,
    });
  });

  // Refresh Token for Admin
  app.get("/admin/refresh-token", async (req, res) => {
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
          message:
            "Refresh token was expired. Please make a new sign in request",
        });
        return;
      }

      const admin = refreshToken.admin;
      let newAccessToken = jwt.sign({ id: admin.id }, config.secret, {
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
      return res.status(500).send({
        message: "Something went wrong!",
      });
    }
  });
};
