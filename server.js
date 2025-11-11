import { createServer, get } from 'node:http'
import express from 'express'
import cors from 'cors';
import { setTimeout as wait } from 'node:timers/promises';
import  { randomUUID } from 'node:crypto'

const PORT = 3088
const app = express()
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}))
app.use(express.json())


let Jogador1 = null

let currentGames = []

function newGame(gameId) {
  return {
    gameId: gameId,
    gameStats: 'inGame',
    moves: 0,
    lastColor: 'white',
    board: [[{"type":"rook","color":"black","hasMoved":false},{"type":"knight","color":"black","hasMoved":false},{"type":"bishop","color":"black","hasMoved":false},{"type":"queen","color":"black","hasMoved":false},{"type":"king","color":"black","hasMoved":false},{"type":"bishop","color":"black","hasMoved":false},{"type":"knight","color":"black","hasMoved":false},{"type":"rook","color":"black","hasMoved":false}],[{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false}],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false}],[{"type":"rook","color":"white","hasMoved":false},{"type":"knight","color":"white","hasMoved":false},{"type":"bishop","color":"white","hasMoved":false},{"type":"queen","color":"white","hasMoved":false},{"type":"king","color":"white","hasMoved":false},{"type":"bishop","color":"white","hasMoved":false},{"type":"knight","color":"white","hasMoved":false},{"type":"rook","color":"white","hasMoved":false}]],
    needUpd: false
};
}

async function waitOpenntent(gameId, color) {
    await wait(400)
    const thisGame = getGame(gameId)

    if (!thisGame) {
        console.error('Jogo não encontrado para o ID:', gameId)
        return
    }
    if(color === thisGame.lastColor) return waitOpenntent(gameId, color)
    
    if (thisGame.needUpd) {
        thisGame.needUpd = false
        return thisGame
    }


    return waitOpenntent(gameId, color)
}

function getGame(gameId) {
    return currentGames.find(g => g.gameId === gameId)
}

function setGame(game) {
    const index = currentGames.findIndex(g => g.gameId === game.gameId);
        currentGames[index] = game
}

function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
app.get('/waitAGame', async (req, res) => {
    
    if (Jogador1 === null) {
        console.log('Esperando outro Jogador')

        Jogador1 = res

        req.on('close', () => {
            Jogador1 = null
        })
    } 
    
    else {
        const gameId = randomUUID()
        const colors = getRandomInt(1,2)
        
        Jogador1.json({ 
            message: 'Partida encontrada!',
            gameId: gameId,
            color: colors===1?'white':'black'
        })
        
        res.json({ 
            message: 'Partida encontrada!',
            gameId: gameId,
            color: colors===2?'white':'black'
        })
        
        console.log('Jogo iniciado', gameId)
        currentGames.push(newGame(gameId))
    }
})

app.get('/inGame/:id/:color', async (req, res) => {
    const thisGame = await waitOpenntent(req.params.id, req.params.color)
    console.log('espera acabou')
    res.json(thisGame)
    res.end
})

app.post('/inGame/:id/:color', (req, res) => {
    const postedGame = req.body
    console.log('postrecebido')
    const thisGame = getGame(req.params.id)
    thisGame.moves++
    thisGame.needUpd = true
    thisGame.board = postedGame.board
    thisGame.lastColor = req.params.color
    thisGame.gameStats = postedGame.gameStats
    setGame(thisGame)
    res.json(thisGame)
    res.end
})

const server = createServer(app)

server.on('listening', () => {
    console.log((`Servidor rodando em: http://localhost:${PORT}/`))
})

server.listen(PORT)