const { miscellaneous } = require("../services");

exports.createBankAccount = async (req, res, next) => {
  if (isNaN(req.body.accountNumber)) {
    return res.status(404).send({
      message: "Account Number Needed!",
    });
  } else if (!req.body.bank) {
    return res.status(404).send({
      message: "Bank Name Needed!",
    });
  } else if (!req.body.branch) {
    return res.status(404).send({
      message: "Branch Name Needed!",
    });
  } else if (!(req.body.type == "business" || req.body.type == "personal")) {
    return res.status(404).send({
      message: "Bank Type Incorrect!",
    });
  } else {
    const find = await miscellaneous.findByBankNumber({
      accountNumber: req.body.accountNumber,
      tenant: req.tenantId,
    });
    if (find) {
      return res.status(404).send({
        message: "Account Number Already Exists!",
      });
    } else {
      next();
    }
  }
};

exports.updateBankAccount = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Account ID Needed!",
    });
  } else {
    if (req.body.type) {
      if (!(req.body.type == "business" || req.body.type == "personal")) {
        return res.status(404).send({
          message: "Bank Type Incorrect!",
        });
      }
    }
    if (req.body.accountNumber) {
      if (isNaN(req.body.accountNumber)) {
        return res.status(404).send({
          message: "Account Number Needed!",
        });
      } else {
        const find = await miscellaneous.findByBankNumber({
          accountNumber: req.body.accountNumber,
          tenant: req.tenantId,
        });
        if (find) {
          return res.status(404).send({
            message: "Account Number Already Exists!",
          });
        }
      }
    }
    const find = await miscellaneous.findBankAccount({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      next();
    } else {
      return res.status(404).send({
        message: "Account Number doesn't Exists!",
      });
    }
  }
};

exports.deleteBankAccount = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Account ID Needed!",
    });
  } else {
    const find = await miscellaneous.findBankAccount({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      next();
    } else {
      return res.status(404).send({
        message: "Account Number doesn't Exists!",
      });
    }
  }
};

exports.createCash = async (req, res, next) => {
  if (req.body.currentBalance != null) {
    if (
      isNaN(req.body.currentBalance) ||
      (req.body.currentCorrectBalance && isNaN(req.body.currentCorrectBalance))
    ) {
      return res.status(404).send({
        message: "Current Balance Needed!",
      });
    } else {
      const find = await miscellaneous.findCash(req.tenantId);
      if (find) {
        return res.status(404).send({
          message: "Cash Account already Exists!",
        });
      } else {
        next();
      }
    }
  } else {
    return res.status(404).send({
      message: "Current Balance Needed!",
    });
  }
};

exports.updateCash = async (req, res, next) => {
  if (req.body.currentBalance != null) {
    if (
      isNaN(req.body.currentBalance) ||
      (req.body.currentCorrectBalance && isNaN(req.body.currentCorrectBalance))
    ) {
      return res.status(404).send({
        message: "Current Balance Needed!",
      });
    } else {
      const find = await miscellaneous.findCash(req.tenantId);
      if (find) {
        next();
      } else {
        return res.status(404).send({
          message: "Cash Account doesn't Exists!",
        });
      }
    }
  } else {
    return res.status(404).send({
      message: "Current Balance Needed!",
    });
  }
};

exports.deleteCash = async (req, res, next) => {
  const find = await miscellaneous.findCash(req.tenantId);
  if (find) {
    next();
  } else {
    return res.status(404).send({
      message: "Cash Account doesn't Exists!",
    });
  }
};
