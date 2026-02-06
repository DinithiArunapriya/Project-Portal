const router = require("express").Router();
const { authRequired } = require("../middleware/auth");
const ctrl = require("../controllers/projects.controller");

router.get("/", authRequired, ctrl.listProjects);
router.get("/:id", authRequired, ctrl.getProjectById);
router.post("/", authRequired, ctrl.createProject);
router.put("/:id", authRequired, ctrl.updateProject);
router.delete("/:id", authRequired, ctrl.deleteProject);

module.exports = router;
    