const express = require("express")
const server = express()

// pegar o banco de dados
const db = require("./database/db")

//habilita o uso do req.body na nossa aplicacao
server.use(express.urlencoded({extended: true}))

// configurar pasta public
server.use(express.static("public"))

///Utilizando template engine 
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

// configurar caminhos da minha aplicacao
// pagina inicial
// req: requisicao
// res: resposta
server.get("/", (req, res) => {
    return res.render("index.html")
})

server.get("/create-point", (req, res) => {
    //console.log(req.query)
    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    //console.log(req.body)
    // inserir dados no banco de dados 
    const query = `INSERT INTO places (image, name, address, address2, state, city, items)
                        VALUES(?,?,?,?,?,?,?);`
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err){
        if(err){
            //console.log(err)
            return res.send("Erro no cadastro")
        }
        // console.log("Cadastrado com sucesso")
        // console.log(this)
        return res.render("create-point.html",{saved : true} )
    }
    db.run(query, values, afterInsertData)    
})

server.get("/search-results", (req, res) => {

    const search = req.query.search

    if(search == ""){
        // pesquisa vazia
        return res.render("search-results.html", {total: 0})
    }

    // pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE CITY like '%${search}%' or  STATE  LIKE '%${search}%'`, function(err, rows){
        if(err){
            console.log(err)
        }
        const total = rows.length;
        //mostrar a pagina htm com os dados do banco de dados
        return res.render("search-results.html", {places: rows, total: total})
    })
    
})

server.get("/delete", (req, res) => {

    const search = req.query.search

    if(search == ""){
        // pesquisa vazia
        return res.render("search-results.html", {total: 0})
    }

    // pegar os dados do banco de dados
    db.all(`SELECT * FROM places`, function(err, rows){
        if(err){
            console.log(err)
        }
        const total = rows.length;
        //mostrar a pagina htm com os dados do banco de dados
        return res.render("delete-point.html", {places: rows, total: total})
    })
    
})

server.get("/delete/:id", (req, res) => {
    // deletar os dados da tabela 
    const deleteId = req.params.id;      
    db.run(`DELETE FROM places WHERE id = ?`, [deleteId], function(err){
        if(err){
        return console.log(err)
    }
         return res.render("delete-point.html",{excluido : true} )
    })
})

// ligar o servidor
server.listen(3000)