const { equity } = require("../services");

exports.createEquityType = async (req, res, next) => {
  if (!req.body.equityType) {
    return res.status(404).send({
      message: "Equity Type Needed!",
    });
  } else {
    const find = await equity.findEquityType({
      name: req.body.equityType,
      tenant: req.tenantId,
    });
    if (find) {
      return res.status(404).send({
        message: "Equity Type Already Exists!",
      });
    } else {
      next();
    }
  }
};

exports.updateEquityType = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Equity Type Needed!",
    });
  } else {
    const find = await equity.findEquityTypeID({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      if (req.body.equityType) {
        const find = await equity.findEquityType({
          name: req.body.equityType,
          tenant: req.tenantId,
        });
        if (find) {
          return res.status(404).send({
            message: "Equity Type Already Exists!",
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } else {
      return res.status(404).send({
        message: "Equity Type not Exists!",
      });
    }
  }
};

exports.deleteEquityType = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Equity Type ID Needed!",
    });
  } else {
    const find = await equity.findEquityTypeID({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      next();
    } else {
      return res.status(404).send({
        message: "Equity Type not Exists!",
      });
    }
  }
};

exports.createEquity = async (req, res, next) => {
  if (!req.body.name || !req.body.equityType) {
    return res.status(404).send({
      message: "Equity Name Needed!",
    });
  } else {
    const find = await equity.findEquityTypeID({
      id: req.body.equityType,
      tenant: req.tenantId,
    });
    if (!find) {
      return res.status(404).send({
        message: "Equity Type Not Exists!",
      });
    } else {
      const find = await equity.findEquity({
        name: req.body.name,
        equityType: req.body.equityType,
      });
      if (find) {
        return res.status(404).send({
          message: "Equity Already Exists!",
        });
      } else {
        next();
      }
    }
  }
};

exports.updateEquity = async (req, res, next) => {
  if (req.body.id) {
    const equityId = await equity.findEquityID({
      id: req.body.id,
    });
    if (!equityId) {
      return res.status(404).send({
        message: "Equity Not Exists!",
      });
    }
    const equityTypeId = await equity.setEquityType(req.body.id);
    if (equityTypeId) {
      const equityType = await equity.findEquityTypeID({
        id: equityTypeId,
        tenant: req.tenantId,
      });
      if (!equityType) {
        return res.status(404).send({
          message: "Equity Not Exists!",
        });
      }

      if (req.body.equityType) {
        const find = await equity.findEquityTypeID({
          id: req.body.equityType,
          tenant: req.tenantId,
        });
        if (!find) {
          return res.status(404).send({
            message: "Equity Type Not Exists!",
          });
        }
      }

      if (req.body.name) {
        const find = await equity.findEquity({
          name: req.body.name,
          equityType: equityTypeId,
        });
        if (find) {
          return res.status(404).send({
            message: "Equity Name Already Exists!",
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
      message: "Equity ID Required",
    });
  }
};

exports.deleteEquity = async (req, res, next) => {
  if (req.body.id) {
    const equityId = await equity.findEquityID({
      id: req.body.id,
    });
    if (!equityId) {
      return res.status(404).send({
        message: "Equity Not Exists!",
      });
    }
    const equityTypeId = await equity.setEquityType(req.body.id);
    if (equityTypeId) {
      const equityType = await equity.findEquityTypeID({
        id: equityTypeId,
        tenant: req.tenantId,
      });
      if (!equityType) {
        return res.status(404).send({
          message: "Equity Not Exists!",
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
      message: "Equity ID Required",
    });
  }
};
