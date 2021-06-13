import express from "express";
import cors from 'cors';
import dayjs from 'dayjs'

const app = express();
app.use(express.json());
app.use(cors());

const pessoas = [];
let localizador = null;
const mensagens = [];
let nameAvailable = true;
let messageStatus = true;

function verificarNome(nome) {
    let found = false;
    if (nome === "") {
        return false;
    }
    else {
        if (pessoas.length != 0) {
            for (let i = 0; i < pessoas.length; i++) {
                if (nome === pessoas[i].name) {
                    found = true;
                    localizador = i;
                }
            }
            if (found === true) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }

    }
}

function validarMensagem(mensagem) {
    if (mensagem.to === '' || mensagem.text === '') {
        return false;
    }
    if (mensagem.type != 'message' && mensagem.type != 'private_message') {
        return false;
    }
    let userOnline = !verificarNome(mensagem.from);
    if (userOnline === false) {
        return false;
    }
    else if(userOnline  === true) {
        return true;
    }

}

function selecionarMensagens(user, qtd){
    let lastMessages = [];
    let i = 1;
    if(mensagens.length == 1){
        lastMessages = [...mensagens];
    }
    else{
        console.log(mensagens.length);
       while(i < qtd && i <= mensagens.length){
            if(mensagens[(mensagens.length)-i].to === 'Todos' || mensagens[(mensagens.length)-i].to === user || mensagens[(mensagens.length)-i].from == user ){
                lastMessages.push(mensagens[mensagens.length-i]);
                i++;
           }
        }
        lastMessages=lastMessages.reverse();
    }
    return lastMessages;
}

function atualizarPessoas(){
    let now = dayjs();
    for(let i=0; i<pessoas.length; i++){
        let tempo = Date.now() - pessoas[i].lastStatus;
        if(tempo > 10000){
            mensagens.push({from:pessoas[i].name, to: 'Todos', text:'sai da sala...', type:'status', time: now.format('HH') + ":" + now.format('mm') + ":" + now.format('ss') });
            pessoas.splice(i,1);
        }
    }
}

app.post("/participants", (req, res) => {
    let now = dayjs();
    nameAvailable = verificarNome(req.body.name);
    if (nameAvailable === true) {
        const pessoa = { name: req.body.name, lastStatus: Date.now() };
        pessoas.push(pessoa);
        const mensagem = { from: pessoa.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: now.format('HH') + ":" + now.format('mm') + ":" + now.format('ss') };
        console.log(mensagem.time);
        mensagens.push(mensagem);
        res.status(200).end();
    }
    else {
        res.status(400).end();
    }
});

app.get("/participants", (req, res) => {
    res.send(pessoas);
});

app.post("/messages", (req, res) => {
    let now = dayjs();
    let user = req.header('User');
    let mensagem = req.body;
    mensagem = { from: user, time: now.format('HH') + ":" + now.format('mm') + ":" + now.format('ss'), ...mensagem  };
    messageStatus = validarMensagem(mensagem);
    if (messageStatus === true) {
        mensagens.push(mensagem);
        res.status(200).end();
    }
    else {
        res.status(400).end();
    }
});

app.get("/messages", (req, res) => {
    let user = req.header('User');
    const limit = req.query.limit;
    if(req.query.limit == {}){
        res.send(mensagens);
    }
    else{
        let lastMessages =  selecionarMensagens(user, limit);
        res.send(lastMessages);
    }
});

app.post("/status", (req, res) => {
    let user = req.header('User');
    localizador = null;
    let userOnline = !verificarNome(user);
    if(userOnline){
        pessoas[localizador].lastStatus = Date.now();
        res.status(200).end();
    }
    else{
        res.status(400).end();
    }
});


setInterval(atualizarPessoas,15000);

app.listen(4000);

