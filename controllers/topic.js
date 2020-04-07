'use strict'

var validator = require('validator');
var Topic = require('../models/topic');



var controller = {

    consiguiendo: function (req, res) {

        return res.status(200).send({
            status: 'success',
            mensaje: 'exito desde el controllador'
        });
    },
    save: function (req, res) {

        //recoger parametros
        var params = req.body

        //validar los datos   

        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        } catch (error) {
            return res.status(400).send({
                status: 'error',
                mensaje: 'faltan datos por enviar',
                error: error
            });
        }

        //crear el objeto 
        if (validate_title && validate_content && validate_lang) {
            //asignar valores

            var topic = new Topic();

            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;
            //realizar el guardado en la base de datos

            topic.save((err, topicstored) => {

                if (err || !topicstored) {
                    return res.status(404).send({
                        status: 'error',
                        mensaje: 'no se pudo guardar el tema'
                    });
                }

                //devolver la respuesta
                return res.status(200).send({
                    status: 'success',
                    mensaje: 'se ha guardado el topic',
                    topic: topic
                });
            });
        } else {
            return res.status(500).send({
                status: 'error',
                mensaje: 'los datos no son validos'
            });
        }


    },
    get_topics: function (req, res) {

        //cargar libreria paginator en el modelo

        //se recoge pagina actual
        if (req.params.page == null || req.params.page == 0 || req.params.page == "0" || req.params.page == undefined || !req.params.page) {
            var page = 1;
        } else {
            var page = parseInt(req.params.page);
        }

        //indicar las opciones de paginacion 
        var options = {
            sort: {
                date: -1
            },
            populate: 'user',
            limit: 5,
            page: page
        }

        //find paginado 

        //devolver resultado

        Topic.paginate({}, options, (err, topiclist) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    mensaje: 'error al hacer la consulta'
                });
            }

            if (!topiclist) {
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'no se encontraron temas'
                });
            }

            return res.status(200).send({
                status: 'success',
                topic: topiclist.docs,
                totaldocs: topiclist.totalDocs,
                totapages: topiclist.totalPages
            });
        });
    },
    gettopics_byuser: function (req, res) {
        //Conseguir el id del usuario 
        var userId = req.params.userId;

        Topic.find({
            user: userId
        }).sort([
            ['date', 'descending']
        ]).exec((err, topiclist) => {
            if (err) {
                return res.status(500).send({
                    mensaje: 'ocurrio un error al buscar los temas',
                    status: 'error'
                });
            }
            if (!topiclist) {
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'este usuario no tiene temas'
                });
            }
            return res.status(200).send({
                status: 'success',
                topics: topiclist
            });
        });


    },
    get_topic: function (req, res) {

        var topicid = req.params.id;

        Topic.findById({
            _id: topicid
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
                topic: topicget
            });

        })

    },
    update: function (req, res) {

        //obtener datos del parametro
        var topicid = req.params.id;

        //recoger datos que llegan desde el post
        var params = req.body;

        //validar los datos   

        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);

        } catch (error) {
            return res.status(400).send({
                status: 'error',
                mensaje: 'faltan datos por enviar',
                error: error
            });
        }
        //json con datos a modificar

        var update = {
            title: params.title,
            content: params.content,
            code: params.code,
            lang: params.lang
        }
        if (validate_title && validate_content && validate_lang) {
            //realizar un find and update con la id parametros y la id del usuario
            Topic.findByIdAndUpdate({_id: topicid,user: req.user.sub},update, {new: true}, (err, topicupdated)=>{
                
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        mensaje: 'ocurrio un error al momento de actualizar',
                        error: err
                    });
                }

                if(!topicupdated){
                    return res.status(404).send({
                        status: 'error',
                        mensaje: 'no se ha podido actualizar el tema'
                    });
                }
                

                //respuesta
                return res.status(200).send({
                    status: 'success',
                    topic: topicupdated
                });
            });

        } else {
            return res.status(400).send({
                status: 'error',
                mensaje: 'la validacion no es correcta'
            });
        }
    },
    delete: function(req, res){

        var iddelete = req.params.id;

        Topic.findOneAndDelete({_id:iddelete, user: req.user.sub}, (err, topicdeleted)=>{

            if(err){
                return res.status(500).send({
                    status: 'error',
                    mensaje: 'ocurrio un error al momento de eliminar',
                    error: err
                });
            }

            if(!topicdeleted){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'no se ha podido eliminar el tema'
                });
            }
            return res.status(200).send({
                status: 'success',
                topic: topicdeleted
            });

        });
       
    }, search: function(req, res){

        //get string de la url

        var search_string = req.params.search;
        //metodo find or 
        Topic.find({
            "$or": [
                {"title": {"$regex":search_string, "$options": "i" } },
                {"content": {"$regex":search_string, "$options": "i" } },
                {"lang": {"$regex":search_string, "$options": "i" } },
                {"code": {"$regex":search_string, "$options": "i" } }
            ]
        }).populate('user')
        .sort([
            ['date', 'descending']
        ]).exec((err, topicsfound)=>{

            if(err){
                return res.status(500).send({
                    status: 'error',
                    mensaje: 'ocurrio un error al realizar la busqueda',
                    error: err
                });
            }

            if(!topicsfound){
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'no se han encontrado nada'
                });
            }
            return res.status(200).send({
                status: 'success',
                topics: topicsfound
            });
        });

    
    }

}
module.exports = controller;