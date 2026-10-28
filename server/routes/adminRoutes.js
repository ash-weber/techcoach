const express = require('express');
const authMiddleware = require('../utils/AuthMiddleware');
const createUserKey = require('../utils/CreateUserKey');
const router = express.Router();
const adminController = require("../controllers/adminController");

router.use(authMiddleware);
router.use(createUserKey);

router.get('/',adminController.getAllInfo);
router.get('/type',adminController.getUserType);
router.get('/:id',adminController.getInfo);
router.get('/decision/count/:id',adminController.getTotalDecisionsCount);
router.get('/login/last/:userId',adminController.getLastLoginDate);
router.delete('/account/:id',adminController.deleteAccount);

module.exports = router;
