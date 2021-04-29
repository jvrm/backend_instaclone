var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var multiparty = require('connect-multiparty');
var ObjectId = require('mongodb').ObjectId;
var fs = require('fs'); //Quando o servidor recebe um arquivo de um formulário, ele salva em uma pasta temporária, o fs é responsável por pegar essa imagem e salvar em um lugar


var app = express();

//body-parser
app.use(bodyParser.urlencoded({ extended:true}));
app.use(bodyParser.json());
app.use(multiparty());

var port = 8080;

app.listen(port);

var db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
)

console.log("Servidor HTTP está escutando");

app.get('/', function(req, res){
    res.send({msg: 'Olá'});
})

app.post('/api', function(req, res){

    res.setHeader("Access-Control-Allow-Origin","*" ); //Permite o servidor aceitar requisições

    var dados = req.body;

    //res.send(dados);

    console.log(req.files);
    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/'+req.files.arquivo.originalFilename;

    fs.rename(path_origem, path_destino, function(err){
        if (err){
            res.status(500).json({error: err});
            return;
        }
            
    }) //rename serve para movimentar os arquivos da origem, para o destino

    /*db.open( function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.insert(dados, function(err, records){
                if (err)
                    res.json(err);
                else
                    res.status(500).json(records);
                mongoclient.close();

            })
        })
    });*/
})

app.get('/api', function(req, res){
    db.open( function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.find().toArray(function(err, results){
                if (err)
                    res.json(err);
                else
                    res.json(results);
            })
            mongoclient.close();

        })
    })
});

app.get('/api/:id', function(req, res){
    db.open( function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.find({_id : ObjectId(req.params.id)}).toArray(function(err, results){
                if (err)
                    res.json(err);
                else
                    res.json(results);
            })
            mongoclient.close();

        })
    })
});

app.put('/api/:id', function(req, res){
    db.open( function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.update(
                {_id : ObjectId(req.params.id)},
                { $set : {titulo : req.body.titulo}},
                {},
                function(err, records){
                    if (err)
                        res.json(err)
                    else
                        res.json(records)
                }
            );
        });
        mongoclient.close();

    })
})

app.delete('/api/:id', function(req, res){
    db.open( function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.remove({_id : ObjectId(req.params.id)}, function(err, records){
                if (err)
                    res.json(err);
                else
                    res.json(records);
            });
        });
        mongoclient.close();

    })
})

