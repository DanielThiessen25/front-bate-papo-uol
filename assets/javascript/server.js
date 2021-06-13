import express from "express";
import cors from 'cors';
import dayjs from 'dayjs'

const app = express();
app.use(express.json());
app.use(cors());

let now = dayjs();
const pessoas = [];
const mensagens = [];
let statusCode = 200;

function verificarNome(nome){
    if(nome === ""){
            statusCode = 400;
    }
    else{
        if(pessoas.length != 0){
            for(let i=o; i < pessoas.length; i++){
                if(nome === pessoas[i].name){
                     statusCode = 400;
                 }
            }
        }
    }
}

app.post("/participants", (req, res) => {
    verificarNome(req.body.name);
    if(statusCode === 200){
        const pessoa = {name: req.body.name, lastStatus:Date.now()};
        pessoas.push(pessoa);
        const mensagem = {from:pessoa.name, to:'Todos', text:'entra na sala...', type:'status', time: now.format('HH')+":"+now.format('mm')+":"+now.format('ss')};
        console.log(mensagem.time);
        mensagens.push(mensagem);
        res.status(200).end();

    }
    else{
        res.status(400).end();
    }
});

app.listen(4000);

