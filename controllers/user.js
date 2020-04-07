'use strict';

var validator = require('validator');

var User = require('../models/user');

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

var fs = require('fs');
var path = require('path');
var controller = {
    probando: function (req, res) {
        return res.status(200).send({
            mensaje: 'funcion exitosa'
        });
    },
    testeando: function (req, res) {
        return res.status(200).send({
            mensaje: 'funcion exitosa #1'
        });
    },
    save: function (req, res) {
        //recoger
        var params = req.body;

        //validar
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (error) {
            return res.status(404).send({
                mensaje: 'faltan datos por enviar',
                status: 'error'
            });
        }
        if (validate_name && validate_surname && validate_email && validate_password) {
            //crear objeto usuario
            var usuario = new User();
            //asignar valores al usuario 
            usuario.name = params.name;
            usuario.surname = params.surname;
            usuario.email = params.email.toLowerCase();
            usuario.role = 'Role_User';
            usuario.image = null;

            //comprobar que exista

            User.findOne({
                email: usuario.email
            }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        mensaje: 'error al comprobar duplicidad del usuario',
                        status: 'error'
                    });
                }
                if (!issetUser) {

                    //cifrar contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        usuario.password = hash;

                        usuario.save((err, userSaved) => {
                            if (err) {
                                return res.status(500).send({
                                    mensaje: 'ocurrio un error al guardar el usuario',
                                    status: 'error'
                                });
                            }
                            if (!userSaved) {
                                return res.status(400).send({
                                    mensaje: 'El usuario no se ha guardado',
                                    status: 'error'
                                });
                            }
                            return res.status(200).send({
                                mensaje: 'El Usuario se ha registrado',
                                status: 'success',
                                code: 200,
                                user: usuario
                            });
                        }); //close save                     
                    }); //close bcrypt                 
                } else {
                    return res.status(500).send({
                        mensaje: 'error el usuario ya existe',
                        status: 'error'
                    });
                }
            });

        } else {
            return res.status(200).send({
                mensaje: 'La validacion a fallado',
                status: 'error'
            });
        }


    },
    login: function (req, res) {
        //recoger datos de la peticion 
        var params = req.body;
        //validar el usuario
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
            if (!validate_email || !validate_password) {
                return res.status(500).send({
                    mensaje: 'Los datos son incorrectos, envialos bien'
                });
            }

        } catch (error) {
            return res.status(404).send({
                mensaje: 'faltan datos por enviar'
            });
        }
        //buscar usuarios que coincidan

        User.findOne({
            email: params.email.toLowerCase()
        }, (err, user) => {

            if (err) {
                return res.status(500).send({
                    mensaje: 'Error al identificarse'
                });
            }
            if (!user) {
                return res.status(404).send({
                    mensaje: 'Error ese usuario no existe'
                });
            }
            //si es encontrado
            bcrypt.compare(params.password, user.password, (err, check) => {
                //comprueba la contraseña cifrada
                if (check) {
                    //generar token si es correcto

                    //devolver objeto
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //limpiar objeto
                        user.password = undefined;
                        user.__v = undefined;
                        return res.status(200).send({
                            user: user
                        });

                    }
                } else {
                    return res.status(200).send({
                        mensaje: 'las credenciales no son correctas'
                    });
                }
            });
        });
    },
    update: function (req, res) {

        //obtener datos del usuario
        var params = req.body;

        //validar datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (error) {
            return res.status(404).send({
                mensaje: 'faltan datos por enviar'
            });
        }

        //eliminar propiedades innecesarias

        delete params.password;
        //buscar y actualizar documento de la base de datos
        var userid = req.user.sub;

        //chequear si email es unico 
        if (req.user.email != params.email) {
            User.findOne({
                email: params.email.toLowerCase()
            }, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        mensaje: 'Error al identificarse'
                    });
                }
                if (user && user.email == params.email) {
                    return res.status(200).send({
                        mensaje: 'existe un usuario con ese correo'
                    });
                }else{

                    User.findOneAndUpdate({
                        _id: userid
                    }, params, {
                        new: true
                    }, (err, userupdate) => {
                        if (err) {
                            return res.status(500).send({
                                mensaje: 'ocurrio un error al actualizar el usuario',
                                status: 'error'
                            });
                        }
    
                        if (!userupdate) {
                            return res.status(200).send({
                                mensaje: 'No se pudo actualizar el usuario',
                                status: 'error'
                            });
                        }
                        //devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userupdate
                        });
    
                    })
                }            

            });

        } else {
            User.findOneAndUpdate({
                _id: userid
            }, params, {
                new: true
            }, (err, userupdate) => {
                if (err) {
                    return res.status(500).send({
                        mensaje: 'ocurrio un error al actualizar el usuario',
                        status: 'error'
                    });
                }

                if (!userupdate) {
                    return res.status(200).send({
                        mensaje: 'No se pudo actualizar el usuario',
                        status: 'error'
                    });
                }
                //devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userupdate
                });

            });

        }


    },
    upload_avatar: function (req, res) {

        //configurar modulo multiparty realizado en routes/user

        //recoger el fichero del front
        var avatar_name = 'avatar no subido';

        if (!req.files) {

            return res.status(404).send({
                status: 'error',
                mensaje: avatar_name
            });
        } else {
            //obtener nombre y extension del archivo

            var filepath = req.files.file0.path;

            //advertencia **//** en linux o mac es ('/') */
            var filesplit = filepath.split('\\');

            //nombre del archivo
            var file_name = filesplit[2];

            //extension 

            var split_file = file_name.split('\.');
            var file_ext = split_file[1];

            //comprobar la extension si es valido si no es eliminarlo

            if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {

                fs.unlink(filepath, (err) => {

                    return res.status(200).send({
                        status: 'error',
                        mensaje: 'la extension del archivo no es valida'
                    });
                });
            } else {
                //sacar el id del usuario identificado
                var userid = req.user.sub;

                //buscar y actualizar  el documento

                User.findByIdAndUpdate({_id:userid}, {image:file_name}, {new:true}, (err, userupdated) =>{

                    if(err || !userupdated){
                        return res.status(500).send({
                            status: 'error',
                            mensaje: 'Error al momento de guardar los cambios'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        mensaje: 'se ha actualizado el avatar',
                        user: userupdated
                    });
                });
              

            }


        }


    },
    avatar: function(req, res){

        var filename = req.params.fileName;

        var pathfile = './uploads/users/'+filename;

        fs.exists(pathfile, (exists)=>{

            if(exists){
                return res.sendFile(path.resolve(pathfile));
            }else{
                return res.status(404).send({
                    mensaje:'no existe ese avatar'
                });
            }
        });
    },
     get_users: function(req, res){
        User.find().exec((err, users)=>{
            if(err || !users){
                return res.status(404).send({
                    mensaje: 'No hay usuarios para mostrar',
                    status: 'error'
                });
            }

            return res.status(200).send({
                status: 'success',
                usuarios: users
            });       

        });
    },
    get_user: function(req, res){
        var userId = req.params.userId;
        User.findById({_id:userId}, (err, userget)=>{

            if(err, !userget){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'El usuario no existe'
                });
            }
            return res.status(200).send({
                status:'success',
                usuario: userget
            });
        });
    }
}

module.exports = controller;