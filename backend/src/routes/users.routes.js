const router = require("express").Router();
const { authRequired, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/users.controller");

router.get("/", authRequired, ctrl.listUsers);
router.post("/", authRequired, requireRole(["SUPER_ADMIN", "MANAGER"]), ctrl.createUser);
router.put("/:id", authRequired, requireRole(["SUPER_ADMIN", "MANAGER"]), ctrl.updateUser);
router.delete("/:id", authRequired, requireRole(["SUPER_ADMIN"]), ctrl.deleteUser);

module.exports = router;
