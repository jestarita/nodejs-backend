'use strict'


var secret = 'clave-secreta-para-generar-el-token-999';
var jwt = require('jwt-simple');
var moment = require('moment');

exports.authenticated = function (req, res, next) {

    //chequear la autorizacion

    if (!req.headers.authorization) {
        return res.status(403).send({
            mensaje: 'la peticion no tiene los headers'
        });
    }
    // limpiar token de comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        //decodificar el token 

        var payload = jwt.decode(token, secret);
        //comprobar si el token expiro
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                mensaje: 'token ha expirado'
            });
        }
          //adjuntar usuario expirado a request

          req.user = payload;
    } catch (ex) {
        return res.status(404).send({
            mensaje: 'token no es valido'
        });
    }
    next();
}