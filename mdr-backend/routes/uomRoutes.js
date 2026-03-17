const express = require("express");
const router = express.Router();
const uomController = require("../controllers/uomController");

router.get("/uom", uomController.getAllUOMs);
router.post("/uom", uomController.createUOM);
router.put("/uom/:id", uomController.updateUOM);
router.delete("/uom/:id", uomController.deleteUOM);

module.exports = router;
