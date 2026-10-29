const express = require("express");
const router = express.Router();
const groupController = require("../Controllers/group.controller");
const authMiddleware = require("../utils/AuthMiddleware");
const createUserKey = require("../utils/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);


router.get("/fetchUserList", groupController.getUserList);
router.post("/innerCircleCreation", groupController.innerCircleCreation);
router.get("/checkInnerCircleExists", groupController.checkInnerCircleExists);
router.get("/getInnerCircleDetails",groupController.getInnerCircleDetails);
router.delete("/removeMemberFromInner",groupController.removeMemberFromInner);
router.post("/getAddMemberNameList",groupController.getAddMemberNameList);
router.put("/addMemberInInnerCircle",groupController.addMemberInInnerCircle);
router.post("/shareDecisionInInnerCircle",groupController.shareDecisionInInnerCircle);
router.post("/getSharedMembers",groupController.getSharedMembers);
router.get("/getInnerCircleAcceptNotification",groupController.getInnerCircleAcceptNotification);
router.put("/acceptOrRejectInnerCircle",groupController.acceptOrRejectInnerCircle);
router.get("/getSharedDecisions",groupController.getSharedDecisions);
router.put("/postCommentForDecision",groupController.postCommentForDecision);
router.get("/comments",groupController.getComments);
router.post("/getSharedComments",groupController.getSharedComments);
router.delete("/removeCommentsAdded",groupController.removeCommentsAdded);
router.post("/postReplyComment",groupController.postReplyComment);
router.put("/editCommentsAdded",groupController.editCommentsAdded);
router.post("/innerCircleDecisionShare",groupController.innerCircleDecisionShare);
router.post("/innerCirclePostComment",groupController.innerCirclePostComment);
router.post("/innerCirclePostReply",groupController.innerCirclePostReply);
router.post("/innerCircleInvitation",groupController.innerCircleInvitation);
router.post("/innerCircleAddInvitation",groupController.innerCircleAddInvitation);
router.get("/getSharedDecisionDetails",groupController.getSharedDecisionDetails);
router.get("/getSharedDecisionsCount",groupController.getSharedwithDecisionsCount);
router.get("/getSharedByDecisionsCount",groupController.getSharedByDecisionsCount);

module.exports = router;