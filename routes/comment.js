var express = require('express');

var router = express.Router();

var middleware_auth = require('../middlewares/authenticate');

var controller = require('../controllers/comment');

router.post('/comment/topic/:topicid', middleware_auth.authenticated, controller.agregar);
router.put('/comment/:commentid', middleware_auth.authenticated, controller.update);
router.delete('/comment/:topicid/:commentid', middleware_auth.authenticated, controller.delete);

module.exports = router;