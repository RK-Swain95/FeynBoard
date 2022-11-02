const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home_controller");

//Home user page
router.get("/user", homeController.home);
//For creating the user
router.post('/users/create',homeController.create);
//For dashboard page
router.get('/dashboard',homeController.dashboard);
//for Topic/content Page
router.get('/users/topic',homeController.topicspage);
//For adding topic to the user database
router.post('/users/create/topic',homeController.createtopic);
//For changing the colour of the content/paragraph
router.post('/users/value',homeController.colorchange);
//For rendering the topic page when click on the topic
router.get('/users/topic/:topic',homeController.topicpage)
module.exports = router;
