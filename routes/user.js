'use strict'

var express = require('express');

var userController = require('../controllers/user');

var router = express.Router();

var midleware_auth = require('../middlewares/authenticate')

var multipart = require('connect-multiparty');

var md_upload = multipart({uploadDir: './uploads/users'})

router.get('/probando', userController.probando);
router.get('/testeando', userController.testeando);

//rutas originales para los usuarios
router.post('/save', userController.save);
router.post('/login', userController.login);
router.put('/user/update', midleware_auth.authenticated, userController.update);
router.post('/upload-avatar', [midleware_auth.authenticated, md_upload], userController.upload_avatar);
router.get('/avatar/:fileName', userController.avatar)
router.get('/get-users', userController.get_users)
router.get('/get-user/:userId', userController.get_user)
module.exports = router;