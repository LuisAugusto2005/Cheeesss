function startGameOnline(game) {
    stopAudioVisualizer();
    lastGameMode = 'online';
    lastBot = null;

    gameMode = 'online';
    currentBot = null;

    gameEnded = false;
    hasBotStolenThisGame = false;
    playerAtBottom = 'white'; // isso aqui existe porque tava tendo uns problemas na hora da virada do board (com o ladrão)
    moveHistory = [];
    moveHistoryList.innerHTML = '';
    selectedPiece = null;
    clearHighlights();
    chessboard.classList.remove('rotated'); // tentando corrigir um bug da rotação do tabuleiro
    currentPlayer = 'white'
    localColor = game.color
    menuContainer.classList.add('hidden');
    loadingContainer.classList.add('hidden')
    botSelectionContainer.classList.add('hidden');
    botDisplay.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    document.getElementById('boardStyleDropdown').classList.remove('hidden');
    document.getElementById('pieceStyleDropdown').classList.remove('hidden');
    initBoard(game.color);
    renderBoard();
    updateScore();
    turnDisplay.textContent = 'Vez das Brancas';
    statusDisplay.textContent = 'O jogo começou.';
    if(localColor!=currentPlayer) waitOponentMove()
        console.log(board)
}

async function onlineHandleSquare(event) {
        if (localColor!=currentPlayer) return
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = board[row][col];
        
        
        // Caso 1: Captura
        if (square.classList.contains('possible-move') || square.classList.contains('possible-capture')) {
            movePiece(selectedPiece.dataset, { row, col });
            await postMoviment()
            console.log('postado com sucesso')
            clearHighlights()
            waitOponentMove()
            return
        }
        
        //Caso 2: Existe Peça
        if (piece) {
            if (gameMode != 'sandbox' && piece.color != currentPlayer) return;
                selectedPiece = square;
                clearHighlights();
                square.classList.add('selected');
                return highlightMoves(getPossibleMoves(piece, row, col), row, col, piece);

        // Caso 3: n existe peça
        } else {
                selectedPiece = null;
                return clearHighlights();
            }
}
async function waitOponentMove() {
    const onlineGame = await getOnlineGame() //GetServerGame
    console.log('getonlineGame: ', onlineGame)

    board = onlineGame.board || [[{"type":"rook","color":"black","hasMoved":false},{"type":"knight","color":"black","hasMoved":false},{"type":"bishop","color":"black","hasMoved":false},{"type":"queen","color":"black","hasMoved":false},{"type":"king","color":"black","hasMoved":false},{"type":"bishop","color":"black","hasMoved":false},{"type":"knight","color":"black","hasMoved":false},{"type":"rook","color":"black","hasMoved":false}],[{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false},{"type":"pawn","color":"black","hasMoved":false}],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false}],[{"type":"rook","color":"white","hasMoved":false},{"type":"knight","color":"white","hasMoved":false},{"type":"bishop","color":"white","hasMoved":false},{"type":"queen","color":"white","hasMoved":false},{"type":"king","color":"white","hasMoved":false},{"type":"bishop","color":"white","hasMoved":false},{"type":"knight","color":"white","hasMoved":false},{"type":"rook","color":"white","hasMoved":false}]]
    renderBoard()
    updateScore()
    switchPlayer()
    if (onlineGame.gameStats === 'ended') {
        endGame(localColor === 'white'?'white':'black')
    }
    console.log('get com sucesso')
}