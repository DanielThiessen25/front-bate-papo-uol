import express from "express";
import cors from 'cors';
import dayjs from 'dayjs'

const app = express();
app.use(express.json());
app.use(cors());

let now = dayjs();
const pessoas = [];
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

app.post("/participants", (req, res) => {
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
    let user = req.header('User');
    console.log(user);
    let mensagem = req.body;
    mensagem = { from: user, ...mensagem, time: now.format('HH') + ":" + now.format('mm') + ":" + now.format('ss') };
    console.log(mensagem);
    messageStatus = validarMensagem(mensagem);
    if (messageStatus === true) {
        mensagens.push(mensagem);
    }
    else {
        res.status(400).end();
    }
});


app.listen(4000);

