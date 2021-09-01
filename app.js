const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')
const urlencodeParser = bodyParser.urlencoded({ extended: false })
const neo4j = require('neo4j-driver')

const app = express();

//Neo4j
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'abc123'))
const session = driver.session()

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
        .run(`use crud 
                CREATE 
                    (a:Cliente {Nome: $nome, Email: $email, Sexo: $sexo })                 
                RETURN a`,
            {
                nome: req.body.Nome,
                email: req.body.Email,
                sexo: req.body.Sexo
            })

        .then(function (result) {
            result.records.forEach(function (record) {
                // console.log(record._fields[0].properties);
            });

            // session
            //     .run(`use crud 
            //             MATCH
            //                 (c:Cliente {Sexo: 'M'}),
            //                 (s:Sexo {Tipo: 'M'})
            //             MERGE (c)-[r:sexo]-(s)
            //             RETURN r`)

            //     .then(function (result2) {
            //         res.render('controllerForm', { name: req.body.Nome })

            //     })
            //     .catch(function (err) {
            //         console.log(err);
            //     });

            // session
            //     .run(`use crud 
            //             MATCH
            //                 (c:Cliente {Sexo: 'F'}),
            //                 (s:Sexo {Tipo: 'F'})
            //             MERGE (c)-[r:sexo]-(s)
            //             RETURN r`)

            //     .then(function (result3) {
            //         res.render('controllerForm', { name: req.body.Nome })

            //     })
            //     .catch(function (err) {
            //         console.log(err);
            //     });

            res.render('controllerForm', { name: req.body.Nome })

        })
        .catch(function (err) {
            console.log(err);
        });
    res.redirect('/select');
});

//SELECT
app.get("/select/:id?", function (req, res) {

    if (!req.params.id) {
        session
            .run(`use crud 
                    MATCH (n:Cliente) 
                    RETURN n LIMIT 25`)

            .then(function (result) {
                var clientes = [];
                result.records.forEach(function (record) {
                    clientes.push({
                        id: record._fields[0].identity.low,
                        nome: record._fields[0].properties.Nome,
                        sexo: record._fields[0].properties.Sexo,
                        email: record._fields[0].properties.Email
                    });

                    // console.log(record._fields[0].identity.low);
                });
                res.render('select', {

                    clientes: clientes
                });
            })
            .catch(function (err) {
                console.log(err);
            });

    } else {
        session
            .run(`use crud 
                    MATCH (n:Cliente) 
                    WHERE id(n) = $id 
                    RETURN n`,
                {
                    id: req.params.id

                })

            .then(function (result) {
                var clientes = [];
                result.records.forEach(function (record) {
                    clientes.push({
                        id: record._fields[0].identity.low,
                        nome: record._fields[0].properties.Nome,
                        sexo: record._fields[0].properties.Sexo,
                        email: record._fields[0].properties.Email
                    });

                    // console.log(record._fields[0].properties);
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

//DELETE
app.get("/deletar/:id", function (req, res) {
    session
        .run(`use crud 
                MATCH (n:Cliente)
                WHERE id(n) = $id
                DETACH DELETE n`,
            {
                id: req.params.id
            })
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log(record._fields[0].properties);
            })
        })
        .catch(function (err) {
            console.log(err);
        });

    res.render('deletar')
})

//UPDATE
app.get("/update/:id", urlencodeParser, function (req, res) {
    res.render('update', { id: req.params.id })
})
app.post("/controllerUpdate", urlencodeParser, function (req, res) {
    session
        .run(`use crud 
                MATCH (c:Cliente)
                WHERE id(c) = $id
                SET c.Nome = $nome
                SET c.Email = $email
                SET c.Sexo = $sexo
                RETURN c`,
            {
                id: req.params.id,
                nome: req.body.Nome,
                email: req.body.Email,
                sexo: req.body.Sexo
            })
        .then(function (result) {
            result.records.forEach(function (record) {
                // console.log(record._fields[0].properties);
            });
        })
        .catch(function (err) {
            console.log(err);
        });

})


//Start Server
app.listen(3000, function (req, res) {
    console.log('Running...')
});

module.exports = app;