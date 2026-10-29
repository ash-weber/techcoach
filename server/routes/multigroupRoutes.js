const express = require("express");
const router = express.Router();
const multigroupController = require("../controllers/multigroupController");
const authMiddleware = require("../utils/AuthMiddleware");
const createUserKey = require("../utils/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);


router.get("/fetchUserList", multigroupController.getUserList);
router.post("/decisionCircleCreation", multigroupController.decisionCircleCreation);
router.get("/getUserDecisionCircles",multigroupController.getUserDecisionCircles);
// router.get("/getdecisionCircle/:group_id",multigroupController.getdecisionCircle);
router.get("/getdecisionCirclesByUser",multigroupController.getdecisionCirclesByUser);
router.get("/getdecisionCirclesByUserAndMember",multigroupController.getdecisionCirclesByUserAndMember);
// router.get("/getAllGroups", multigroupController.getAllGroups);
router.get("/getUsersForGroup/:groupId", multigroupController.getUsersForGroup);
router.get("/getGroupDetails/:groupId", multigroupController.getGroupDetails);
router.delete("/removeUsersFromGroup/:groupId/:userId", multigroupController.removeUsersFromGroup);
router.post("/sendDecisionCircleInvitation",multigroupController.sendDecisionCircleInvitation);
router.post("/decisionshareDecisionCircle",multigroupController.decisionshareDecisionCircle);
router.get("/getdecisionSharedDecisionCircle/:groupId",multigroupController.getdecisionSharedDecisionCircle);
router.get("/getMemberSharedDecisions/:groupId",multigroupController.getMemberSharedDecisions);
router.post("/decisionCirclePostComment",multigroupController.decisionCirclePostComment);
router.post("/decisionCircleReplyComment",multigroupController.decisionCircleReplyComment);
router.get("/sharedwithme",multigroupController.getdecisionSharedDecisionCirclebyuser);
router.get("/sharedbyme",multigroupController.getUserSharedDecisions);


module.exports = router;