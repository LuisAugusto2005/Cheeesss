import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors';
import { setTimeout } from 'node:timers/promises';
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

function newGame(gameId, p1, p2) {
  return {
    gameId: gameId,
    gameStats: 'inGame',
    moves: 0,
    board: null,
    player1: p1, 
    player2: p2
  };
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

        currentGames.push(newGame(gameId, Jogador1, res))
        
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
    }
})

app.get('/inGame/:id', async (req, res) => {

})

app.post('/inGame/:id', (req, res) => {
    const postedGame = req.body
    const thisGame = getGame(req.params.id)
    thisGame.moves++
    thisGame.board = postedGame.board
    thisGame.gameStats = postedGame.gameStats
    setGame(thisGame)
    p1 = thisGame.p1
    p1.json(thisGame)
    p2 = thisGame.p2
    p2.json(thisGame)
    res.end
})

const server = createServer(app)

server.on('listening', () => {
    console.log((`Servidor rodando em: http://localhost:${PORT}/`))
})

server.listen(PORT)