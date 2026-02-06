const router = require("express").Router();
const { authRequired } = require("../middleware/auth");
const { getSummary } = require("../controllers/reports.controller");

router.get("/summary", authRequired, getSummary);

module.exports = router;
