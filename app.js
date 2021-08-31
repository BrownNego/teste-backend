const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')
const urlencodeParser = bodyParser.urlencoded({ extended: false })
const neo4j = require('neo4j-driver')

const app = express();

//Neo4j
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'abc123'))
const session = driver.session()


// app.get("/teste", function (req, res) {
//     session
//         .run('use crud CREATE (a:Person {name: "Alex"}) RETURN a')
//         .then(function (result) {
//             result.records.forEach(function (record) {
//                 console.log(record._fields[0].properties);
//             });
//         })
//         .catch(function (err) {
//             console.log(err);
//         });
//     res.send('Ok!')
// })

//Template engine
app.engine("handlebars", handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))

//Routes and Templates
app.get("/", function (req, res) {
    res.render('index');
});

//INSERIR
app.get("/inserir", function (req, res) {
    res.render("inserir");
});
app.post("/controllerForm", urlencodeParser, function (req, res) {
    session
        .run('use crud CREATE (a:Cliente {name: $name, email: $email, sexo: $sexo }) RETURN a',
            {
                name: req.body.name,
                email: req.body.email,
                // dtaNascimento: req.body.dtaNascimento,
                sexo: req.body.sexo
            })
        .then(function (result) {
            result.records.forEach(function (record) {
                // console.log(record._fields[0].properties);
            });

            res.render('controllerForm', { name: req.body.name })
        })
        .catch(function (err) {
            console.log(err);
        });

});

//SELECT
app.get("/select:id?", function (req, res) {

    if (!req.params.id) {
        session
            .run('use crud MATCH (n) RETURN n LIMIT 25')
            .then(function (result) {
                var clientes = [];
                result.records.forEach(function (record) {
                    clientes.push({
                        name: record._fields[0].properties.name,
                        sexo: record._fields[0].properties.sexo,
                        email: record._fields[0].properties.email
                    });

                    console.log(record._fields[0].properties);
                });

                res.render('select', {
                    clientes: clientes
                });
            })
            .catch(function (err) {
                console.log(err);
            });

    }
});


//Start Server
app.listen(3000, function (req, res) {
    console.log('Running...')
});

module.exports = app;