'use strict'


//requires

var express = require('express');
var bodyParser = require('body-parser');

//ejecutar express

var app =express();

//cargar rutas

var userRoutes = require('./routes/user');
var topicroutes = require('./routes/topic');
var commentroutes = require('./routes/comment');

//midlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();  
});


//Rescribir rutas
app.use('/api', userRoutes);
app.use('/api', topicroutes);
app.use('/api', commentroutes);


//Exportar
module.exports = app;