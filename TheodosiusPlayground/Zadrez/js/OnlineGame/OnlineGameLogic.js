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

    if (onlineGame.moves > localGame.moves) { // Recebeu novo moviento
        board = onlineGame.board
        renderBoard()
        updateScore()
        switchPlayer()
        if (onlineGame.gameStats === 'ended') {
            endGame(localColor === 'white'?'white':'black')
        }
        return
    }
    console.log('esperando') // n recebeu nada novo
    waitOponentMove()
    return
}