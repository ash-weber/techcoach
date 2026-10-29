const express = require('express');
const authMiddleware = require('../utils/AuthMiddleware');
const createUserKey = require('../utils/CreateUserKey');
const { postSkillLink,postProfileLink,getAllProfileLink, getAllSkillLink, deleteProfileLink, deleteSkillLink } = require('../controllers/linkController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.post('/link', postSkillLink);
router.post('/links', postProfileLink);
router.get('/link', getAllSkillLink);
router.get('/links', getAllProfileLink);
router.delete('/link/:id', deleteSkillLink);
router.delete('/links/:id',deleteProfileLink);

module.exports = router;