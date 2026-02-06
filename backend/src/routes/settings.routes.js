const router = require("express").Router();
const { authRequired } = require("../middleware/auth");
const ctrl = require("../controllers/settings.controller");

router.get("/", authRequired, ctrl.getSettings);
router.put("/profile", authRequired, ctrl.updateProfile);
router.put("/notifications", authRequired, ctrl.updateNotifications);
router.put("/appearance", authRequired, ctrl.updateAppearance);

module.exports = router;
