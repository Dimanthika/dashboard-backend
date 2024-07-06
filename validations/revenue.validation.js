const { revenue } = require("../services");

exports.createRevenueType = async (req, res, next) => {
  if (!req.body.revenueType) {
    return res.status(404).send({
      message: "Revenue Type Needed!",
    });
  } else {
    const find = await revenue.findRevenueType({
      name: req.body.revenueType,
      tenant: req.tenantId,
    });
    if (find) {
      return res.status(404).send({
        message: "Revenue Type Already Exists!",
      });
    } else {
      next();
    }
  }
};

exports.updateRevenueType = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Revenue Type Needed!",
    });
  } else {
    const find = await revenue.findRevenueTypeID({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      if (req.body.revenueType) {
        const find = await revenue.findRevenueType({
          name: req.body.revenueType,
          tenant: req.tenantId,
        });
        if (find) {
          return res.status(404).send({
            message: "Revenue Type Already Exists!",
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } else {
      return res.status(404).send({
        message: "Revenue Type not Exists!",
      });
    }
  }
};

exports.deleteRevenueType = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Revenue Type ID Needed!",
    });
  } else {
    const find = await revenue.findRevenueTypeID({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      next();
    } else {
      return res.status(404).send({
        message: "Revenue Type not Exists!",
      });
    }
  }
};

exports.createRevenue = async (req, res, next) => {
  if (!req.body.name || !req.body.revenueType) {
    return res.status(404).send({
      message: "Revenue Name Needed!",
    });
  } else {
    const find = await revenue.findRevenueTypeID({
      id: req.body.revenueType,
      tenant: req.tenantId,
    });
    if (!find) {
      return res.status(404).send({
        message: "Revenue Type Not Exists!",
      });
    } else {
      const find = await revenue.findRevenue({
        name: req.body.name,
        revenueType: req.body.revenueType,
      });
      if (find) {
        return res.status(404).send({
          message: "Revenue Already Exists!",
        });
      } else {
        next();
      }
    }
  }
};

exports.updateRevenue = async (req, res, next) => {
  if (req.body.id) {
    const revenueId = await revenue.findRevenueID({
      id: req.body.id,
    });
    if (!revenueId) {
      return res.status(404).send({
        message: "Revenue Not Exists!",
      });
    }
    const revenueTypeId = await revenue.setRevenueType(req.body.id);
    if (revenueTypeId) {
      const revenueType = await revenue.findRevenueTypeID({
        id: revenueTypeId,
        tenant: req.tenantId,
      });
      if (!revenueType) {
        return res.status(404).send({
          message: "Revenue Not Exists!",
        });
      }

      if (req.body.revenueType) {
        const find = await revenue.findRevenueTypeID({
          id: req.body.revenueType,
          tenant: req.tenantId,
        });
        if (!find) {
          return res.status(404).send({
            message: "Revenue Type Not Exists!",
          });
        }
      }

      if (req.body.name) {
        const find = await revenue.findRevenue({
          name: req.body.name,
          revenueType: revenueTypeId,
        });
        if (find) {
          return res.status(404).send({
            message: "Revenue Name Already Exists!",
          });
        }
      }

      next();
    } else {
      return res.status(500).send({
        message: "Something went wrong!",
      });
    }
  } else {
    return res.status(404).send({
      message: "Revenue ID Required",
    });
  }
};

exports.deleteRevenue = async (req, res, next) => {
  if (req.body.id) {
    const revenueId = await revenue.findRevenueID({
      id: req.body.id,
    });
    if (!revenueId) {
      return res.status(404).send({
        message: "Revenue Not Exists!",
      });
    }
    const revenueTypeId = await revenue.setRevenueType(req.body.id);
    if (revenueTypeId) {
      const revenueType = await revenue.findRevenueTypeID({
        id: revenueTypeId,
        tenant: req.tenantId,
      });
      if (!revenueType) {
        return res.status(404).send({
          message: "Revenue Not Exists!",
        });
      }

      next();
    } else {
      return res.status(500).send({
        message: "Something went wrong!",
      });
    }
  } else {
    return res.status(404).send({
      message: "Revenue ID Required",
    });
  }
};
