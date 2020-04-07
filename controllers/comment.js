var Topic = require('../models/topic');

var validator = require('validator');
var controller = {

    agregar: function (req, res) {

        //obtener el id del tema

        var idtopic = req.params.topicid;



        //find id by topic
        Topic.findById(idtopic).exec((err, topicfind) => {

            if (err) {
                return res.status(500).send({
                    mensaje: 'ocurrio un error al buscar el tema',
                    status: 'error'
                });

            }

            if (!topicfind) {
                return res.status(404).send({
                    mensaje: 'no existe el tema',
                    status: 'error'
                });
            }

            if (req.body.content) {
                //validar los datos   

                try {
                    var validate_content = !validator.isEmpty(req.body.content);


                } catch (error) {
                    return res.status(400).send({
                        status: 'error',
                        mensaje: 'no has comentado nada'
                    });
                }

                //si paso la validacion
                if (validate_content) {

                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    }

                    //realiza un push a comment
                    topicfind.comments.push(comment);

                    //guardar el topic 
                    topicfind.save((err, topic) => {
                        if (err) {
                            return res.status(500).send({
                                mensaje: 'ocurrio un error al guardar el comentario',
                                status: 'error'
                            });

                        }

                        if (!topic) {
                            return res.status(404).send({
                                mensaje: 'no se pudo agregar el comentario',
                                status: 'error'
                            });
                        }

                        Topic.findById({
                            _id: topic._id
                        }).populate('user')
                        .populate('comments.user')
                        .exec((err, topicget) => {
                
                            if (err) {
                                return res.status(500).send({
                                    mensaje: 'error en la peticion',
                                    status: 'error'
                                });
                            }
                
                            if (!topicget) {
                                return res.status(404).send({
                                    status: 'error',
                                    mensaje: 'no existe ningun tema'
                                });
                            }
                
                            return res.status(200).send({
                                status: 'success',
                                mensaje: 'se ha agregado el comentario',
                                topic: topicget
                            });
                
                        })                  

                    })

                } else {
                    return res.status(400).send({
                        status: 'error',
                        mensaje: 'no se han validado bien los datos'
                    });
                }


            }


        });

    },
    update: function (req, res) {

        //conseguir el id del comentario de la url

        var comentId = req.params.commentid;


        //validar los datos y validar

        var params = req.body;

        try {
            var validate_content = !validator.isEmpty(params.content);


        } catch (error) {
            return res.status(400).send({
                status: 'error',
                mensaje: 'no has comentado nada'
            });
        }

        if (validate_content) {

            Topic.findOneAndUpdate({
                    "comments._id": comentId
                }, {
                    "$set": {
                        "comments.$.content": params.content
                    }
                }, {
                    new: true
                },
                (err, topicupdated) => {

                    if (err) {
                        return res.status(500).send({
                            mensaje: 'ocurrio un error al actualizar el comentario',
                            status: 'error'
                        });

                    }

                    if (!topicupdated) {
                        return res.status(404).send({
                            mensaje: 'no se pudo actualizar el comentario',
                            status: 'error'
                        });
                    }

                    //find and update de un subdocumento
                    return res.status(200).send({
                        status: 'success',
                        mensaje: 'se ha actualizado el comentario',
                        topic: topicupdated
                    });
                })



        } else {
            return res.status(400).send({
                status: 'success',
                mensaje: 'no se ha pasado la validacion'
            });

        }

    },
    delete: function (req, res) {

        //sacar id del topic y comentario

        var topicId = req.params.topicid;
        var comentId = req.params.commentid;

        console.log(topicId);
       
        //buscar el topic
        Topic.findById(
             topicId
        , (err, topiget) => {
            if (err) {
                return res.status(500).send({
                    mensaje: 'ocurrio un error al buscar el comentario',
                    status: 'error'
                });

            }

            if (!topiget) {
                return res.status(404).send({
                    mensaje: 'no se encuentra el comentario',
                    status: 'error'
                });
            }

            //seleccionar el subdocumento (comentario)

            var comment = topiget.comments.id(comentId);      


            //borrar comentario
            if (comment) {
                comment.remove();

                //guardar topic
                topiget.save((err, topicupdated) => {
                    if (err) {
                        return res.status(500).send({
                            mensaje: 'ocurrio un error al eliminar el comentario',
                            status: 'error'
                        });

                    }

                    if (!topicupdated) {
                        return res.status(404).send({
                            mensaje: 'no se pudo eliminar el comentario',
                            status: 'error'
                        });
                    }
                    Topic.findById({
                        _id: topicupdated._id
                    }).populate('user')
                    .populate('comments.user')
                    .exec((err, topicget) => {
            
                        if (err) {
                            return res.status(500).send({
                                mensaje: 'error en la peticion',
                                status: 'error'
                            });
                        }
            
                        if (!topicget) {
                            return res.status(404).send({
                                status: 'error',
                                mensaje: 'no existe ningun tema'
                            });
                        }
            
                        return res.status(200).send({
                            status: 'success',
                            mensaje: 'se ha eliminado el comentario',
                            topic: topicget
                        });
            
                    })
                });

            } else {
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'no existe el comenario'
                });
            }


        });


    }
}

module.exports = controller;