const express = require('express');
const authMiddleware = require('../utils/AuthMiddleware');
const createUserKey = require('../utils/CreateUserKey');
const { postSkill,getMasterSkills, getAllSkill, getSkill,putSkill,deleteSkill,deleteAllSkill } = require('../Controllers/skillController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.post('/', postSkill);
router.get('/master-skills', getMasterSkills);
router.get('/get', getAllSkill);
router.get('/:id', getSkill);
router.put('/:id', putSkill);
router.delete('/:id', deleteSkill);
router.delete('/', deleteAllSkill);


module.exports = router;