const { asset } = require("../services");

exports.createAssetType = async (req, res, next) => {
  if (!req.body.assetType) {
    return res.status(404).send({
      message: "Asset Type Needed!",
    });
  } else {
    const find = await asset.findAssetType({
      name: req.body.assetType,
      tenant: req.tenantId,
    });
    if (find) {
      return res.status(404).send({
        message: "Asset Type Already Exists!",
      });
    } else {
      next();
    }
  }
};

exports.updateAssetType = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Asset Id Needed!",
    });
  } else {
    const find = await asset.findAssetTypeID({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      if (req.body.assetType) {
        const find = await asset.findAssetType({
          name: req.body.assetType,
          tenant: req.tenantId,
        });
        if (find) {
          return res.status(404).send({
            message: "Asset Type Already Exists!",
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } else {
      return res.status(404).send({
        message: "Asset Type not Exists!",
      });
    }
  }
};

exports.deleteAssetType = async (req, res, next) => {
  if (!req.body.id) {
    return res.status(404).send({
      message: "Asset Type ID Needed!",
    });
  } else {
    const find = await asset.findAssetTypeID({
      id: req.body.id,
      tenant: req.tenantId,
    });
    if (find) {
      next();
    } else {
      return res.status(404).send({
        message: "Asset Type not Exists!",
      });
    }
  }
};

exports.createAsset = async (req, res, next) => {
  if (!req.body.name || !req.body.assetType) {
    return res.status(404).send({
      message: "Asset Name Needed!",
    });
  } else {
    const find = await asset.findAssetTypeID({
      id: req.body.assetType,
      tenant: req.tenantId,
    });
    if (!find) {
      return res.status(404).send({
        message: "Asset Type Not Exists!",
      });
    } else {
      const find = await asset.findAsset({
        name: req.body.name,
        assetType: req.body.assetType,
      });
      if (find) {
        return res.status(404).send({
          message: "Asset Already Exists!",
        });
      } else {
        next();
      }
    }
  }
};

exports.updateAsset = async (req, res, next) => {
  if (req.body.id) {
    const assetId = await asset.findAssetID({
      id: req.body.id,
    });
    if (!assetId) {
      return res.status(404).send({
        message: "Asset Not Exists!",
      });
    }
    const assetTypeId = await asset.setAssetType(req.body.id);
    if (assetTypeId) {
      const assetType = await asset.findAssetTypeID({
        id: assetTypeId,
        tenant: req.tenantId,
      });
      if (!assetType) {
        return res.status(404).send({
          message: "Asset Not Exists!",
        });
      }

      if (req.body.assetType) {
        const find = await asset.findAssetTypeID({
          id: req.body.assetType,
          tenant: req.tenantId,
        });
        if (!find) {
          return res.status(404).send({
            message: "Asset Type Not Exists!",
          });
        }
      }

      if (req.body.name) {
        const find = await asset.findAsset({
          name: req.body.name,
          assetType: assetTypeId,
        });
        if (find) {
          return res.status(404).send({
            message: "Asset Name Already Exists!",
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
      message: "Asset ID Required",
    });
  }
};

exports.deleteAsset = async (req, res, next) => {
  if (req.body.id) {
    const assetId = await asset.findAssetID({
      id: req.body.id,
    });
    if (!assetId) {
      return res.status(404).send({
        message: "Asset Not Exists!",
      });
    }
    const assetTypeId = await asset.setAssetType(req.body.id);
    if (assetTypeId) {
      const assetType = await asset.findAssetTypeID({
        id: assetTypeId,
        tenant: req.tenantId,
      });
      if (!assetType) {
        return res.status(404).send({
          message: "Asset Not Exists!",
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
      message: "Asset ID Required",
    });
  }
};
