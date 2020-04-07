'use strict'

var express = require('express');

var controller = require('../controllers/topic');

var router = express.Router();

var midleware_auth = require('../middlewares/authenticate');

router.get('/topic/probando', controller.consiguiendo);

router.post('/topic/save', midleware_auth.authenticated, controller.save);
router.get('/topic/list/:page?', controller.get_topics);
router.get('/topic/usertopic/:userId', controller.gettopics_byuser);
router.get('/topic/:id', controller.get_topic);
router.put('/topic/:id', midleware_auth.authenticated, controller.update);
router.delete('/topic/:id', midleware_auth.authenticated, controller.delete);
router.get('/topic/buscar/:search',  controller.search);
module.exports = router;