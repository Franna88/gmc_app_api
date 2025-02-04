const express = require("express");
const router = express.Router();
const opcController = require("../controllers/opcController");
const redirectMiddleware = require("../middleware/redirects");
// Route to handle OPC data
router.put("/send-data", opcController.storeData);
router.put("/increment", opcController.storeData);

module.exports = router;

// https://us-central1-gmc-95f76.cloudfunctions.net/app/api/opc/increment