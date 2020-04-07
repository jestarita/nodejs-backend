'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_nodejs', {useNewUrlParser: true, useUnifiedTopology: true})
        .then(()=>{
            console.log('la conexion a la base de datos se ha realizado exitosamente');
            app.listen(port,()=>{
                console.log("el servidor http:localhost:3999 esta funcionando");
            });
        })
        .catch(error=> console.log('Ocurrio el siguiente error '+error));