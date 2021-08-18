const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')

const app = express();

//Template engine
app.engine("handlebars", handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//Routes and Templates
app.get("/:id?", function (req, res) {
    res.render('index', { id: req.params.id });
})


//Start Server
app.listen(3000, function (req, res) {
    console.log('Running...')
});