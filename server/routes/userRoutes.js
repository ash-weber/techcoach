const express = require('express');
const router = express.Router();

const userController = require("../Controllers/usercontroller.js");

const authMiddleware = require("../Utility/AuthMiddleware.js");
const createUserKey = require("../Utility/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey); 

router.get("/profile", userController.getUserList);

router.post("/data",userController.postGeneralProfile);
router.get("/data/master-profiles",userController.getMasterProfiles);
router.get("/data",userController.getProfile);
router.put("/data",userController.putProfile);
router.delete("/data",userController.deleteProfile);

router.post(
  "/migrate-google-to-microsoft",userController.migrateGoogleToMicrosoft
);

module.exports = router;
