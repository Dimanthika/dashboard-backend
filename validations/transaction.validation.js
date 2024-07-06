const { miscellaneous, expense, revenue, transaction } = require("../services");

exports.createBill = async (req, res, next) => {
  if (isNaN(req.body.amount)) {
    return res.status(404).send({
      message: "Bill Amount Needed!",
    });
  } else if (!req.body.expense) {
    return res.status(404).send({
      message: "Expense Needed!",
    });
  } else {
    if (req.body.correctAmount != null && isNaN(req.body.correctAmount)) {
      return res.status(404).send({
        message: "Bill Amount Incorrect!",
      });
    }
    if (req.body.bankAccount) {
      const find = await miscellaneous.findByBankId({
        id: req.body.bankAccount,
        tenant: req.tenantId,
      });
      if (!find) {
        return res.status(404).send({
          message: "Bank Account not Exists!",
        });
      }
      if (req.body.amount != req.body.correctAmount && req.body.correctAmount) {
        return res.status(404).send({
          message: "Invalid Bill amount",
        });
      }
    }
    const find = await expense.findExpenseID({
      id: req.body.expense,
    });
    if (!find) {
      return res.status(404).send({
        message: "Expense Not Valid!",
      });
    } else {
      next();
    }
  }
};

exports.updateBill = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Bill ID Needed!",
    });
  } else {
    const bill = await transaction.findBill({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (bill) {
      if (req.body.amount || req.body.correctAmount) {
        if (isNaN(req.body.amount)) {
          return res.status(404).send({
            message: "Bill Amount Needed!",
          });
        } else {
          if (req.body.correctAmount) {
            if (isNaN(req.body.correctAmount)) {
              return res.status(404).send({
                message: "Bill Amount Incorrect!",
              });
            }
          } else {
            return res.status(404).send({
              message: "Bill Amount Needed!",
            });
          }
        }
      }
      if (req.body.bankAccount) {
        const find = await miscellaneous.findByBankId({
          id: req.body.bankAccount,
          tenant: req.tenantId,
        });
        if (!find) {
          return res.status(404).send({
            message: "Bank Account not Exists!",
          });
        }
        if (
          req.body.amount != req.body.correctAmount &&
          req.body.correctAmount
        ) {
          return res.status(404).send({
            message: "Invalid Bill amount",
          });
        }
      }
      if (req.body.expense) {
        const find = await expense.findExpenseID({
          id: req.body.expense,
        });
        if (!find) {
          return res.status(404).send({
            message: "Expense Not Valid!",
          });
        }
      }
      next();
    } else {
      return res.status(404).send({
        message: "Bill doesn't Exists!",
      });
    }
  }
};

exports.deleteBill = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Bill ID Needed!",
    });
  } else {
    const bill = await transaction.findBill({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (bill) {
      next();
    } else {
      return res.status(404).send({
        message: "Bill doesn't Exists!",
      });
    }
  }
};

exports.createInvoice = async (req, res, next) => {
  if (isNaN(req.body.amount)) {
    return res.status(404).send({
      message: "Invoice Amount Needed!",
    });
  } else if (!req.body.revenue) {
    return res.status(404).send({
      message: "Revenue Needed!",
    });
  } else {
    if (req.body.correctAmount != null && isNaN(req.body.correctAmount)) {
      return res.status(404).send({
        message: "Invoice Amount Incorrect!",
      });
    }
    if (req.body.bankAccount) {
      const find = await miscellaneous.findByBankId({
        id: req.body.bankAccount,
        tenant: req.tenantId,
      });
      if (!find) {
        return res.status(404).send({
          message: "Bank Account not Exists!",
        });
      }
      if (req.body.amount != req.body.correctAmount && req.body.correctAmount) {
        return res.status(404).send({
          message: "Invalid Invoice amount",
        });
      }
    }
    const find = await revenue.findRevenueID({
      id: req.body.revenue,
    });
    if (!find) {
      return res.status(404).send({
        message: "Revenue Not Valid!",
      });
    } else {
      next();
    }
  }
};

exports.deleteInvoice = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Invoice ID Needed!",
    });
  } else {
    const find = await transaction.findInvoice({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      next();
    } else {
      return res.status(404).send({
        message: "Invoice doesn't Exists!",
      });
    }
  }
};
