const express = require('express');
const authMiddleware = require('../utils/AuthMiddleware');
const createUserKey = require('../utils/CreateUserKey');
const advancedLinkController = require('../Controllers/advancedLinkController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.post('/advancedLink',advancedLinkController.postAdvancedProfile);
router.get('/advancedLink',advancedLinkController.getAllAdvancedProfileLink);
router.delete('/advancedLink/:id',advancedLinkController.deleteAdvancedProfileLink);


module.exports = router;