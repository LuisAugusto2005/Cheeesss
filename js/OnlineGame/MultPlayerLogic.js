let localGame = {
    gameId: null,
    gameStats: 'inGame',
    moves: 0,
    board: [[{"type":"rook","color":"black","hasMoved":false},{"type":"knight","color":"black","hasMoved":false},{"type":"bishop","color":"black","hasMoved":false},{"type":"queen","color":"black","hasMoved":false},{"type":"king","color":"black","hasMoved":false},{"type":"bishop","color":"black","hasMoved":false},{"type":"knight","color":"black","hasMoved":false},{"type":"rook","color":"black","hasMoved":false}],[{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false}],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false}],[{"type":"rook","color":"white","hasMoved":false},{"type":"knight","color":"white","hasMoved":false},{"type":"bishop","color":"white","hasMoved":false},{"type":"queen","color":"white","hasMoved":false},{"type":"king","color":"white","hasMoved":false},{"type":"bishop","color":"white","hasMoved":false},{"type":"knight","color":"white","hasMoved":false},{"type":"rook","color":"white","hasMoved":false}]],
    oldBoard: null
}
let localColor

const SERVER_URL = 'https://zadrezserver.onrender.com'

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
    localGame.board = JSON.parse(JSON.stringify(board))
    console.log('a jogar: ', localGame)
    const gameToPost = localGame
    const req = await fetch(`${SERVER_URL}/inGame/${localGame.gameId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameToPost)
            })
    const res = await req.json()
    localGame = res
    console.log('localGame: ', localGame)
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