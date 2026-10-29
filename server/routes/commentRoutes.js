const express = require('express');
const router = express.Router();
const commentController = require("../Controllers/commentController");
const authMiddleware = require("../utils/AuthMiddleware");
const createUserKey = require("../utils/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);

// Conversation Routes
router.post('/comments',commentController.postComment);
router.get('/comments/:groupId/:decisionId',commentController.getComments); 
router.get('/comments/:decisionId',commentController.getDecisionComments); 
router.put('/comments/:commentId', commentController.updateComment);
router.post('/comments/reply', commentController.replyToComment);
router.delete('/comments/:commentId', commentController.deleteComment);
router.post('/comment', commentController.postShareWithComment);
router.get('/comment', commentController.getWithComments);
router.put('/comment/:commentId', commentController.editComments);


// GroupName Routes
router.post('/decisiongroup',commentController.postdecisionGroup);
router.get('/decisiongroup',commentController.getAlldecisionGroup);
router.get('/decisiongroup/:id',commentController.getDecisionGroup);
router.put('/decisiongroup/:id',commentController.putDecisionGroup);
router.delete('/decisiongroup/:id',commentController.deleteDecisionGroup);


module.exports = router;