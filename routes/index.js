const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

/* -----------------------------------------------------------------------\
| Funcao que seleciona um usuario dada uma entrada, a chave de selecao eh |
| o email e o ID do usuario.                                              |
\------------------------------------------------------------------------*/
function findUser(email) {

    let sql = 'SELECT ID, Email FROM usuarios WHERE Email = ?;';

    db.get(sql,[email.user], (err, row) =>{
      if(err){
        db.close();
        return console.error(err.message);
      }
      db.close();
      return row;
    });
}

function findPacote(body) {
    let sql = 'SELECT IDPacote, NomePacote FROM pacotes WHERE NomePacote = ?;';

    db.get(sql, [body.nomePacote], (err, row) => {
        if (err) return console.error(err.message);
        db.close();
        return row;
    });
}

/* -----------------------------------------------------------------------\
| Funcao que seleciona um usuario dada uma entrada, a chave de selecao eh |
| o email e o ID do usuario.                                              |
\------------------------------------------------------------------------*/
function createUser(user) {

    let sql = 'INSERT INTO usuarios(ID, Email, Nome)' + 'VALUES (?,?,?);';

    let sqlId = 'SELECT MAX(ID) FROM usuarios';

    //Captura o ultimo valor de ID da tabela para gerar o novo ID
    db.get(sqlId, [], (err, rows) => {
        if (err) {
            throw err;
        }
    });

    let ID = (1 + row.ID);

    db.get(sql, [ID,user.email,user.nome], (err, row) =>{
        if (err) {
            db.close();
            throw err;
        }
        //Retorna o id do usuario que foi inserido 
        console.log('Uma linha foi inserida: ${this.lastID}');
        db.close();
        return row;
    });
}


/* -----------------------------------------------------------------------\
|                    Vericia a conexao com o servidor                     |
\ -----------------------------------------------------------------------*/
router.get('/', (req, res, next) => {
    res.send({ "status": true });
});

// -----------------------------------------------------------------------\\
// | Funcao que realiza o cadastro de novos usuarios no banco de dados    |
// | caso os dados recebidos estarem incorretos um erro sera retornado    |
// | caso o usuario ja exista no banco um erro sera apresentado.          |
// -----------------------------------------------------------------------\\
router.post('/cadastro', (req, res, next) => {

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso')
    });

    var userCheck = findUser(req.body);
    var user = req.body;

    if (user == undefined) {
        res.send({ "status": false, "auth": false, "mensagem": "Houve um problema com o e-mail inserido!" });
    }
    else
        if (user == userCheck.Email) {
            res.send({ "status": false, "auth": false, "mensagem": "O e-mail já está cadastrado no site!" });
        }
        else {
            createUser(req.body);
            res.send({ "status": true, "auth": true, "mensagem": "Usuário cadastrado com sucesso!" });
        }

    db.close();

});

function getMax() {

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });

    let sqlId = 'SELECT (MAX(IDViagem)+1) as ID FROM pacotes';

    //Captura o ultimo valor de ID da tabela para gerar o novo ID
    db.get(sqlId, [], (err, rows) => {
        if (err) {
            throw err;
        }
    });

    return rows.ID;
}

function inserePacotes(idUser, idPassagem, idHotel, nomePacote) {

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });

    var sqlPacote = 'INSERT INTO pacotes(IDUsuario,IDViagem,IDHotel,NomePacote)' + 'VALUES(?,?,?,?);';

    db.run(sqlPacote, [idUser, idPassagem, idHotel, nomePacote], (err,row) => {
        if (err) {
            db.close();
            throw err;
        }
    });

    db.close();

    return row.IDPacote;
}

function insereHoteis(idHotel, idUser, hotelName, dataSaida, dataRetorno) {

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });

    var sqlHotel = 'INSERT INTO hoteis(idHotel,idUser,hotelName,dataSaida,dataRetorno)' + 'VALUES(?,?,?,?,?);';

    db.run(sqlHotel, [idHotel, idUser, hotelName, dataSaida, dataRetorno], (err) => {
        if (err) {
            db.close();
            throw err;
        }
    });

    db.close();
}

function insereViagens(idViagem, origem, destino, ida, volta, idUser) {

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });

    var sqlViagem = 'INSERT INTO viagens(IDViagem,AeroportoOrigem,AeroportoDestino,DataIda,DataVolta,IDUsuario)' + 'VALUES(?,?,?,?,?,?);';

    db.run(sqlViagem, [idViagem, origem, destino, ida, volta, idUser], (err) => {
        if (err) {
            db.close();
            throw err;
        }
    });

    db.close();
}

function insereAtracoes(atracao, idUsuario, idPacote) {

    var destinos = atracao.id;
    var nome = atracao.nome;

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });

    var sqlViagem = 'INSERT INTO destinos(IDDestinos,IDUsuarios,NomeDestinos,IDPacote)' + 'VALUES(?,?,?,?);';

    db.run(sqlViagem, [destinos, idUsuario, nome, idPacote], (err) => {
        if (err) {
            db.close();
            throw err;
        }
    });

    db.close();
}

function insereUser(email,nome) {
    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });

    var sql = 'INSERT INTO usuarios(login,password)' + 'VALUES(?,?);';

    db.run(sql, [email, nome], (err) => {
        if (err) {
            db.close();
            throw err;
        }
    });
    db.close;
}

/* -----------------------------------------------------------------------\
| Funcao que salva o pacote enviado e armazena as informacoes dos campos  |
| em suas respectivas tabelas.                                            |
\------------------------------------------------------------------------*/
router.post('/pacotes', (req, res, next) => {
    

    var pacotes = req.body;
    var nomePacote = pacotes.nome;
    var aux = findUser(pacotes);
    var idUser = aux.ID;
    if (idUser == undefined) {
        insereUser(pacotes.user, pacotes.user);
    }
    var idPassagem = getMax();
    var idHotel = pacotes.hoteis[0].id;
    var hotelName = pacotes.hoteis[0].nome;
    var checkin = pacotes.hoteis[0].checkin;
    var checkout = pacotes.hoteis[0].checkout;
    var origem = pacotes.passagens[0].aeroportoOrigem;
    var destino = pacotes.passagens[0].aeroportoDestino;
    var ida = pacotes.passagens[0].dataIda;
    var volta = pacotes.passagens[0].dataVolta;

    var idPacote = inserePacotes(idUser, idPassagem, idHotel, nomePacote);
    insereHoteis(idHotel, idUser, hotelName, checkout, checkin);
    insereViagens(idPassagem, origem, destino, ida, volta, idUser);
    for (var i = 0; i < pacotes.atracoes.length; i++) {
        insereAtracoes(pacotes.atracoes[i], idUser, idPacote);
    }
    
});

router.post('/recuperarPacotes', (req, res, next) => {

    var aux = findUser(res.body);
    var idUser = aux.ID;

    db.serialize(function () {
        var array = [];
        db.all("SELECT * FROM pacotes WHERE IDUsuario = idUser", function (err, rows) {
            if (err) console.log(err);
            let contador = 0;
            rows.forEach(function (row) {
                array[contador] = [row.idUsuario, row.IDPacote, row.IDViagem, row.IDHotel, row.NomePacote];
                contador++;
            });
            console.log(rows);
            db.close();
            var resposta = {"res": array };
            res.send(resposta);
        })
    })
    db.close();
});

router.post('/apagarPacote', (req, res, next) => {

    var aux = var aux = findUser(res.body);
    var idUser = aux.ID;

    var sql = 'DELETE FROM pacotes WHERE IDUsuario = ?;';

    db.run(sql, [idUser], (err) => { ]
        if (err) {
            db.close();
            throw err;
        }
    });

    db.close();
});


/* -----------------------------------------------------------------------\
| Funcao que salva o Destino que o usuario escolheu e armazena na tabela  |
| destinos do  banco de dados.                                            |
\------------------------------------------------------------------------*/
router.get('/sdestinos', (req, res, next) => {

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });

    //Olhei as tags do site e considerei que o Bruno vai me mandar elas
    //mas também considerei que ele me manda o email do usuario da sessao
    //e tambem o nome que o usuario deu pro pacote
    var destino = req.body;

    //Encontra o ID do usuario dado seu email da sessao
    let aux = findUser(destino.idUsuario);
    let ID = aux.ID;

    //Encontra o id do pacote que o usuario esta olhando
    let aux = findPacote(destino.nomePacote);
    let nomePacote = aux.NomePacote;
    let idPacote = aux.IDPacote;

    let sql = 'INSERT INTO destinos(IDDestinos, IDUsuarios, NomeDestinos, IDPacote)' + 'VALUES(?,?,?,?);';
    //Se o usuario nao criou um pacote na requisicao
    if (nomePacote == undefined) {
        db.run(sql, [destino.location_id, ID, destino.name, -1], (err, rows) => {
            if (err) {
                db.close();
                throw err;
            } 
        });
        db.close();
        res.send('status:': true, 'result': true, 'idDestino': destino.location_id, 'idUser': ID);
    }
    else {
        db.run(sql, [destino.location_id, ID, destino.name, idPacote], (err, rows) => {
            if (err) {
                db.close();
                throw err;
            }
        });
        db.close();
        res.send('status:': true, 'result': true, 'idDestino': destino.location_id, 'idUser': ID);
    }
});

/* -----------------------------------------------------------------------\
| Funcao que salva o Hotel que o usuario escolheu e armazena na tabela    |
| destinos do  banco de dados.                                            |
\------------------------------------------------------------------------*/
router.get('/shotel', (req, res, next) => {
    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });
    //Considerando os campos do SQL, alem do nome do pacote
    var hotel = req.body;

    //Encontra o ID do usuario dado seu email da sessao
    let aux = findUser(destino.idUsuario);
    let ID = aux.ID;

    let sql = 'INSERT INTO hoteis(IDHotel,IDUser,HotelName,DataSaida,DataRetorno)' + 'VALUES(?,?,?,?,?);';

    db.run(sql, [hotel.location_id,ID,hotel.Ida,hotel.volta], (err, rows) => {
        if (err) {
            db.close();
            throw err;
        }
    });

    //Se o usuario colocar em um pacote
    if (hotel.nomePacote != undefined) {
        id = hotel.location_id;
        let sql = 'UPDATE pacotes SET IDHotel = ? WHERE NomePacote = ?;';
        db.run(sql, [id, hotel.nomePacote], (err, rows) => {
            if (err) {
                db.close();
                throw err;
            }
        });
    }
    db.close();
    res.send('status:': true, 'result': true, 'idHotel': hotel.location_id, 'idUser': ID);
});

/* -----------------------------------------------------------------------\
| Funcao que salva a Passagem que o usuario escolheu e armazena na tabela |
| passagens do banco de dados.                                            |
\------------------------------------------------------------------------*/
//router.get('/spassagens', (err, res, next) => {
//    let db = new sqlite3.Database('./db/Database.db', (err) => {
//        if (err) {
//            return console.error(err.message);
//        }
//        console.log('Conexao ao Database feita com sucesso');
//    });

//    //Considerando os campos do SQL mais nome do pacote
//    var passagem = req.body;

//    //Encontra o ID do usuario dado seu email da sessao
//    let aux = findUser(destino.idUsuario);
//    let ID = aux.ID;

//});

/* -----------------------------------------------------------------------\
| Funcao que verifica se o usuario ja existe na base e alerta caso ele    |
| nao exista, caso exista um ok eh apresentado.                           |
\------------------------------------------------------------------------*/
router.post('/login', (req, res, next) => {

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso');
    });
      
    var user = findUser(req.body);
    if (user == undefined) {
        res.send({"status": false, "auth": false, "mensagem": "E-mail não está cadastrado!"});
    }

    if (user.Email == req.body.Email && user.Nome == req.body.Nome) {
        res.send({"status": true, "auth": true, "id": user.ID})
    } else {
        res.send({"status": true, "auth": false, "mensagem": "Senha incorreta!"})
    }

    db.close();

});

router.get('/info', (req, res, next) => {
    res.send({
        "status": true,
        "conexao": "conexão ao servidor feita com sucesso!"
    })
})



module.exports = router;


/* -----------------------------------------------------------------------\
| Funcao que inicia o banco de dados, passando seu caminho de arquivo     |
| e cria a tabela de usuarios. Esta funcao deve ser comentada depois      |
| de utilizada.                                                           |
\----------------------------------------------------------------------*/
/*
router.get('/users', (req, res, next) => {

    var path = './db/Database.db';
    var db = new sqlite3.Database(path, 'OPEN_READONLY');


    db.serialize(function () {
        console.log("Entrou no serialize");
        var array = [];
        db.all("SELECT * FROM usuarios", function (err, rows) {
            if (err) console.log(err);
            let contador = 0;
            rows.forEach(function (row) {
                array[contador] = row.ID + ';' + row.Email + ';' + row.Nome + ';';
                contador++;
            });
            console.log(rows);
            db.close();
            res.send (array);
        })
    })
});
*/
/* -----------------------------------------------------------------------\
| Funcao que inicia o banco de dados, passando seu caminho de arquivo     |
| e cria a tabela de usuarios. Esta funcao deve ser comentada depois      |
| de utilizada.                                                           |
\------------------------------------------------------------------------*/
/*
router.get('/create', (req, res, next) => {
    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso')
    });


    db.run('CREATE TABLE usuarios(ID INTEGER, Email TEXT, Nome TEXT);', function (err) {
        if (err) console.log(err.message);
        console.log("Sucesso");
    });

    db.close();


});
*/
// --------------------------------------------------------------------------\\
// | Funcao que popula o banco de dados com algumas tuplas. Deve ser apagada |
// | depois de utilizada.
// --------------------------------------------------------------------------\\
/*
router.get('/popula', (req, res, next) => {

    let db = new sqlite3.Database('./db/Database.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Conexao ao Database feita com sucesso')
    });

    //let usuariosInseridos = [
    //    [1, "brunofurquim@email.com", "Bruno Furquim"],
    //    [2, "andresolla@email.com", "Andre Solla"],
    //    [3, "marcusvinicius@email.com", "Marcus Vinicius"],
    //    [4, "gabrielbrandao@email.com", "Gabriel Brandao"]
    //];

    let usuario = [2, "andresolla@email.com", "Andre Solla"];

    let insertQuery = 'INSERT INTO usuarios (ID, Email, Nome)' + 'VALUES (?,?,?)';

    db.run(insertQuery, usuario, (err) => {
        if (err) {
            return console.log(err.message);
        }
        console.log('Linha adicionada no banco: ${this.lastID}');
    });

    //TODO
    //let statement = db.prepare(insertQuery);

    //for (var i = 0; i < usuariosInseridos.lenght; i++) {
    //    statement.run(usuariosInseridos[i], function (err) {
    //        if (err) throw err;
    //    });
    //}

    //statement.finalize();

    db.close();

});
*/

/*

var db = {
    "users": [
      {
        "id": 1,
        "login": "brunofurquim@email.com",
        "password": "senha123!"
      },
      {
        "id": 2,
        "login": "andresolla@email.com",
        "password": "senha456@"
      },
      {
        "id": 3,
        "login": "marcusvinicius@email.com",
        "password": "senha789#"
      },
      {
        "id": 4,
        "login": "gabrielbrandao@email.com",
        "password": "senha101112$"
      }
    ]
  }
*/
//TOKEEP
//router.get('/users', (req, res, next) => {

//    //let db = new sqlite3.Database('./db/Database.db', (err) => {
//    //    if (err) {
//    //        return console.error(err.message);
//    //    }
//    //    console.log('Conexao ao Database feita com sucesso')
//    //});

//    var usuariosBD = function (callback) {
//        var db = new sqlite3.Database('./db/Database.db', sqlite3.OPEN_READONLY);

//        db.serialize(function () {
//            db.all("SELECT * FROM usuarios", function (err, allRows) {
//                if (err != null) {
//                    console.log(err);
//                    callback(err);
//                }
//                console.log(util.inspect(allRows));

//                callback(allRows);
//                db.close();
//            });
//        });
//    }




//    //db.all("SELECT * FROM usuarios", function (err, rows) {
//    //    rows.forEach(function (row) {
//    //        console.log(row.ID, row.Emai, row.Nome);
//    //    });
//    //    callback(rows);
//    //});

//    //function callback(row) {
//    //    console.log(row);
//    //}


//    ////let sqlAll = 'SELECT * FROM usuarios'; 

//    ////db.all(sqlAll, function(err, rows) {
//    ////  if(err){
//    ////    throw err;
//    ////    }
//    ////    console.log(util.inspect(rows));
//    ////});

//    ////res.send({ "status": false, "auth": false, "mensagem": "O e-mail já está cadastrado no site!" });


//    //db.close();


//});