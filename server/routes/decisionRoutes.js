const express = require('express');
const { postInfo, getallInfo, getInfo, putInfo, deleteInfo, getall, getInfo_Referred, getMonthlyDecisionCount } = require('../Controllers/decisionControllers');
const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.get('/', getall)
router.post('/details', postInfo);
router.get('/details', getallInfo);
router.get('/details/:id', getInfo);
router.get('/getInfo_Referred/:id', getInfo_Referred);
router.put('/details/:id', putInfo);
router.delete('/details/:id', deleteInfo);
router.get('/decisions/monthly-count', getMonthlyDecisionCount);
module.exports = router;