'use strict'

var jwt = require('jwt-simple');

var moment = require('moment');

exports.createToken = function(user){

    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.suname,
        email: user.email,
        image: user.image,
        role: user.role,
        iat:moment().unix(),
        ext:moment().add(30, 'days').unix
    }
    return jwt.encode(payload, 'clave-secreta-para-generar-el-token-999')
}