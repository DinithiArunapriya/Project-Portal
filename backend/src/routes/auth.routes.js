const router = require("express").Router();
const { login, listDemoUsers } = require("../controllers/auth.controller");

router.post("/login", login);
router.get("/demo-users", listDemoUsers);

module.exports = router;
