let localGame = {
    gameId: null,
    gameStats: 'inGame',
    moves: 0,
    board: null
}
let localColor

const SERVER_URL = 'https://defectingly-unworshipping-aida.ngrok-free.dev'

async function searchGameOnl() {
    try {
        console.log('vtncw')
        const search = await fetch(`${SERVER_URL}/waitAGame`, {
            method: 'GET',
        })

        if (!search.ok) {
            throw new Error(`Erro na requisição: ${search.statusText}`);
        }

        const game = await search.json()

        localGame.gameId = game.gameId
        
        startGameOnline(game)
    }
    catch (err) {
        console.log('Erro ao buscar jogo: ', err)
        console.log('O servidor esta ligado?')
    }
}

async function postMoviment() {
    const gameToPost = localGame
    localGame.board = board
    const req = await fetch(`${SERVER_URL}/inGame/${localGame.gameId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameToPost)
            })
    const res = await req.json()
    localGame = res
    console.log('localGame ', localGame)
}

async function getOnlineGame() {
        const res = await fetch(`${SERVER_URL}/inGame/${localGame.gameId}`, {
        method: 'GET',
    })
    const onlineBoard = await res.json()
    return onlineBoard
}

function endOnlineGame() {
    localGame.gameStats = 'ended'
}