const { expense } = require("../services");

exports.createExpenseType = async (req, res, next) => {
  if (!req.body.expenseType) {
    return res.status(404).send({
      message: "Expense Type Needed!",
    });
  } else {
    const find = await expense.findExpenseType({
      name: req.body.expenseType,
      tenant: req.tenantId,
    });
    if (find) {
      return res.status(404).send({
        message: "Expense Type Already Exists!",
      });
    } else {
      next();
    }
  }
};

exports.updateExpenseType = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Expense Type Needed!",
    });
  } else {
    const find = await expense.findExpenseTypeID({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      if (req.body.expenseType) {
        const find = await expense.findExpenseType({
          name: req.body.expenseType,
          tenant: req.tenantId,
        });
        if (find) {
          return res.status(404).send({
            message: "Expense Type Already Exists!",
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } else {
      return res.status(404).send({
        message: "Expense Type not Exists!",
      });
    }
  }
};

exports.deleteExpenseType = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Expense Type ID Needed!",
    });
  } else {
    const find = await expense.findExpenseTypeID({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      next();
    } else {
      return res.status(404).send({
        message: "Expense Type not Exists!",
      });
    }
  }
};

exports.createExpense = async (req, res, next) => {
  if (!req.body.name || !req.body.expenseType) {
    return res.status(404).send({
      message: "Expense Name Needed!",
    });
  } else {
    const find = await expense.findExpenseTypeID({
      id: req.body.expenseType,
      tenant: req.tenantId,
    });
    if (!find) {
      return res.status(404).send({
        message: "Expense Type Not Exists!",
      });
    } else {
      const find = await expense.findExpense({
        name: req.body.name,
        expenseType: req.body.expenseType,
      });
      if (find) {
        return res.status(404).send({
          message: "Expense Already Exists!",
        });
      } else {
        next();
      }
    }
  }
};

exports.updateExpense = async (req, res, next) => {
  if (req.body.id) {
    const expenseId = await expense.findExpenseID({
      id: req.body.id,
    });
    if (!expenseId) {
      return res.status(404).send({
        message: "Expense Not Exists!",
      });
    }
    const expenseTypeId = await expense.setExpenseType(req.body.id);
    if (expenseTypeId) {
      const expenseType = await expense.findExpenseTypeID({
        id: expenseTypeId,
        tenant: req.tenantId,
      });
      if (!expenseType) {
        return res.status(404).send({
          message: "Expense Not Exists!",
        });
      }

      if (req.body.expenseType) {
        const find = await expense.findExpenseTypeID({
          id: req.body.expenseType,
          tenant: req.tenantId,
        });
        if (!find) {
          return res.status(404).send({
            message: "Expense Type Not Exists!",
          });
        }
      }

      if (req.body.name) {
        const find = await expense.findExpense({
          name: req.body.name,
          expenseType: expenseTypeId,
        });
        if (find) {
          return res.status(404).send({
            message: "Expense Name Already Exists!",
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
      message: "Expense ID Required",
    });
  }
};

exports.deleteExpense = async (req, res, next) => {
  if (req.body.id) {
    const expenseId = await expense.findExpenseID({
      id: req.body.id,
    });
    if (!expenseId) {
      return res.status(404).send({
        message: "Expense Not Exists!",
      });
    }
    const expenseTypeId = await expense.setExpenseType(req.body.id);
    if (expenseTypeId) {
      const expenseType = await expense.findExpenseTypeID({
        id: expenseTypeId,
        tenant: req.tenantId,
      });
      if (!expenseType) {
        return res.status(404).send({
          message: "Expense Not Exists!",
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
      message: "Expense ID Required",
    });
  }
};
