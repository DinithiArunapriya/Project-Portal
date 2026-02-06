const router = require("express").Router();
const { authRequired } = require("../middleware/auth");
const ctrl = require("../controllers/tasks.controller");

router.get("/", authRequired, ctrl.listTasks);
router.get("/my", authRequired, ctrl.myTasks);
router.get("/project/:projectId", authRequired, ctrl.listTasksByProject);

router.get("/:id", authRequired, ctrl.getTaskById);
router.post("/", authRequired, ctrl.createTask);
router.put("/:id", authRequired, ctrl.updateTask);
router.delete("/:id", authRequired, ctrl.deleteTask);

module.exports = router;
