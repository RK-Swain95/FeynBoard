const express = require("express");

const router = express.Router();
const homeController = require("../controllers/home_controller");

router.get("/user", homeController.home);
router.post('/users/create',homeController.create);
router.get('/dashboard',homeController.dashboard);
router.get('/users/topic',homeController.topicspage);
router.post('/users/create/topic',homeController.createtopic);
router.post('/users/value',homeController.colorchange);
router.get('/users/topic/:topic',homeController.topicpage)
module.exports = router;
