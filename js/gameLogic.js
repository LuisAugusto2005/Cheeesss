
//variáveis do jogo
let board = [];
let boardUndo = [];
let boardRedo = [];
let currentPlayer = "white";
let selectedPiece = null;
let ElPassant = null;
let moveHistory = [];
let gameEnded = false;
let gameMode = 'pvp';
let currentBot = null;
let botCurrentMood = 'normal';
let currentPieceStyle = 'classic';
let currentBoardStyle = 'normal';

// constantes do jogo
const pieceValues = { 'pawn': 1, 'knight': 3, 'bishop': 3, 'rook': 5, 'queen': 9, 'king': 1000 };
const pieceUnicode = {
        classic: {
            'white': { 'king': '♔', 'queen': '♕', 'rook': '♖', 'bishop': '♗', 'knight': '♘', 'pawn': '♙' },
            'black': { 'king': '♚', 'queen': '♛', 'rook': '♜', 'bishop': '♝', 'knight': '♞', 'pawn': '♟' }
        },
        california: { 'white': { 'king': 'Resources/pecas_estilos/california/wK.svg', 'queen': 'Resources/pecas_estilos/california/wQ.svg', 'rook': 'Resources/pecas_estilos/california/wR.svg', 'bishop': 'Resources/pecas_estilos/california/wB.svg', 'knight': 'Resources/pecas_estilos/california/wN.svg', 'pawn': 'Resources/pecas_estilos/california/wP.svg' }, 'black': { 'king': 'Resources/pecas_estilos/california/bK.svg', 'queen': 'Resources/pecas_estilos/california/bQ.svg', 'rook': 'Resources/pecas_estilos/california/bR.svg', 'bishop': 'Resources/pecas_estilos/california/bB.svg', 'knight': 'Resources/pecas_estilos/california/bN.svg', 'pawn': 'Resources/pecas_estilos/california/bP.svg' } },
        fantasy: { 'white': { 'king': 'Resources/pecas_estilos/fantasy/wK.svg', 'queen': 'Resources/pecas_estilos/fantasy/wQ.svg', 'rook': 'Resources/pecas_estilos/fantasy/wR.svg', 'bishop': 'Resources/pecas_estilos/fantasy/wB.svg', 'knight': 'Resources/pecas_estilos/fantasy/wN.svg', 'pawn': 'Resources/pecas_estilos/fantasy/wP.svg' }, 'black': { 'king': 'Resources/pecas_estilos/fantasy/bK.svg', 'queen': 'Resources/pecas_estilos/fantasy/bQ.svg', 'rook': 'Resources/pecas_estilos/fantasy/bR.svg', 'bishop': 'Resources/pecas_estilos/fantasy/bB (1).svg', 'knight': 'Resources/pecas_estilos/fantasy/bN.svg', 'pawn': 'Resources/pecas_estilos/fantasy/bP.svg' } },
        janggi: {
            'white': {
                'king': 'Resources/pecas_estilos/jangi_red_black/wK.svg',
                'queen': 'Resources/pecas_estilos/jangi_red_black/wQ.svg',
                'rook': 'Resources/pecas_estilos/jangi_red_black/wR.svg',
                'bishop': 'Resources/pecas_estilos/jangi_red_black/wB.svg',
                'knight': 'Resources/pecas_estilos/jangi_red_black/wN.svg',
                'pawn': 'Resources/pecas_estilos/jangi_red_black/wP.svg'
            },
            'black': {
                'king': 'Resources/pecas_estilos/jangi_red_black/bK.svg',
                'queen': 'Resources/pecas_estilos/jangi_red_black/bQ.svg',
                'rook': 'Resources/pecas_estilos/jangi_red_black/bR.svg',
                'bishop': 'Resources/pecas_estilos/jangi_red_black/bB.svg',
                'knight': 'Resources/pecas_estilos/jangi_red_black/bN.svg',
                'pawn': 'Resources/pecas_estilos/jangi_red_black/bP.svg'
            }
        },
        horse: {
            'white': {
                'king': 'Resources/pecas_estilos/Horseys/WHITE_YEL.svg',
                'queen': 'Resources/pecas_estilos/Horseys/WHITE_MRY.svg',
                'rook': 'Resources/pecas_estilos/Horseys/WHITE_RES.svg',
                'bishop': 'Resources/pecas_estilos/Horseys/WHITE_SUP.svg',
                'knight': 'Resources/pecas_estilos/Horseys/WHITE_PNK.svg',
                'pawn': 'Resources/pecas_estilos/Horseys/WHITE_CYAN.svg'
            },
            'black': {
                'king': 'Resources/pecas_estilos/Horseys/BLACK_YEL.svg',
                'queen': 'Resources/pecas_estilos/Horseys/BLACK_MRY.svg',
                'rook': 'Resources/pecas_estilos/Horseys/BLACK_RES.svg',
                'bishop': 'Resources/pecas_estilos/Horseys/BLACK_SUP.svg',
                'knight': 'Resources/pecas_estilos/Horseys/BLACK_PNK.svg',
                'pawn': 'Resources/pecas_estilos/Horseys/BLACK_CYAN.svg'
            }
        }
    };

//funções de lógica do jogo
function startGame(mode, bot = null) {
    stopAudioVisualizer();
    gameMode = mode;
    currentBot = bot;
    if (currentBot && typeof currentBot.difficulty === 'object') {
        currentBot.difficulty.current = currentBot.difficulty.evolution[0];
    }
    gameEnded = false;
    moveHistory = [];
    moveHistoryList.innerHTML = '';
    selectedPiece = null;
    clearHighlights();
    currentPlayer = 'white';
    menuContainer.classList.add('hidden');
    botSelectionContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    document.getElementById('boardStyleDropdown').classList.remove('hidden');
    document.getElementById('pieceStyleDropdown').classList.remove('hidden');
    setBoardStyle('normal');
    if (gameMode === 'pvb' && currentBot) {
        const initialMusic = typeof currentBot.music === 'object' ? currentBot.music.normal : currentBot.music;
        initAudio(initialMusic);
        botDisplay.classList.remove('hidden');
        botCurrentMood = 'normal';
        botImage.src = currentBot.images.normal;
        botName.textContent = currentBot.name;
        updateBotPersonalityAndDialogue('start');
    } else {
        botDisplay.classList.add('hidden');
    }
    initBoard();
    renderBoard();
    updateScore();
    turnDisplay.textContent = 'Vez das Brancas';
    statusDisplay.textContent = 'O jogo começou.';
}

function initBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    boardUndo = [];
    boardRedo = [[ [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], [null,null,{"type":"pawn","color":"black","hasMoved":false},null,null,{"type":"pawn","color":"black","hasMoved":false},null,null], [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], [null,{"type":"pawn","color":"white","hasMoved":false},null,null,null,null,{"type":"pawn","color":"white","hasMoved":false},null], [null,null,{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},null,null], [null,null,null,null,null,null,null,null] ]];
    const setupPiece = (row, col, type, color) => { board[row][col] = { type, color, hasMoved: false}; };
    for (let i = 0; i < 8; i++) setupPiece(1, i, 'pawn', 'black');
    setupPiece(0, 0, 'rook', 'black'); setupPiece(0, 7, 'rook', 'black');
    setupPiece(0, 1, 'knight', 'black'); setupPiece(0, 6, 'knight', 'black');
    setupPiece(0, 2, 'bishop', 'black'); setupPiece(0, 5, 'bishop', 'black');
    setupPiece(0, 3, 'queen', 'black'); setupPiece(0, 4, 'king', 'black');
    for (let i = 0; i < 8; i++) setupPiece(6, i, 'pawn', 'white');
    setupPiece(7, 0, 'rook', 'white'); setupPiece(7, 7, 'rook', 'white');
    setupPiece(7, 1, 'knight', 'white'); setupPiece(7, 6, 'knight', 'white');
    setupPiece(7, 2, 'bishop', 'white'); setupPiece(7, 5, 'bishop', 'white');
    setupPiece(7, 3, 'queen', 'white'); setupPiece(7, 4, 'king', 'white');
    boardUndo.push(JSON.parse(JSON.stringify(board)));
}

function renderBoard() {
    chessboard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square', (row + col) % 2 === 0 ? 'white-square' : 'black-square');
            square.dataset.row = row; square.dataset.col = col;
            const piece = board[row][col];
            if (piece) {
                const pieceContainer = document.createElement('div');
                pieceContainer.className = 'piece-container';
                const representation = pieceUnicode[currentPieceStyle]?.[piece.color]?.[piece.type] || pieceUnicode.classic[piece.color][piece.type];
                if (representation.endsWith('.svg') || representation.endsWith('.png')) {
                    pieceContainer.innerHTML = `<img src="${representation}" class="piece" alt="${piece.type}">`;
                } else {
                    pieceContainer.textContent = representation;
                    pieceContainer.classList.add('piece-text');
                }
                square.appendChild(pieceContainer);
            }
            square.addEventListener('click', handleSquareClick);
            chessboard.appendChild(square);
        }
    }
}

    // Lida com o clique em uma casa do tabuleiro
    function handleSquareClick(event) {
        if (gameEnded || (gameMode === 'pvb' && currentPlayer === 'black')) return;
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = board[row][col];

        // Caso 1: existe peça selecionada
        if (selectedPiece) {
                //1.1: Clicou em um movimento possível
            if (square.classList.contains('possible-move') || square.classList.contains('possible-capture')) {
                return movePiece(selectedPiece.dataset, { row, col });
            }   //1.2: Clicou na mesma peça selecionada
            if (piece && piece.color === currentPlayer) {
                selectedPiece = square;
                clearHighlights();
                square.classList.add('selected');
                return highlightMoves(getPossibleMoves(piece, row, col), row, col);
            }   //1.3: Clicou em outro lugar
                selectedPiece = null;
                square.classList.remove('selected');
                return clearHighlights();
        }
        // Caso 2: n existe peça selecionada
        if (piece && piece.color === currentPlayer) {
            selectedPiece = square;
            square.classList.add('selected');
            highlightMoves(getPossibleMoves(piece, row, col), row, col);
        }
    }

    // Move a peça e atualiza o estado do jogo
    function movePiece(from, to) {
        from.row = parseInt(from.row); from.col = parseInt(from.col);
        const pecaCapturada = board[to.row][to.col];
        const pecamovida = board[from.row][from.col];
        if (pecaCapturada && pecaCapturada.type === 'king') { endGame(pecamovida.color); return; }// GGwp
        if (pecamovida.type === 'pawn' && (to.row === 0 || to.row === 7)) pecamovida.type = 'queen';// Mecanica de promoçao de peao
        if (pecamovida.type === 'king' && Math.abs(to.col - from.col) === 2) {// Mecanica de roque
            const r = pecamovida.color === "white" ? 7 : 0;
            console.log(pecamovida.color);
          if (to.col === 6) {
            board[r][6] = pecamovida;
            board[r][5] = getPiece(r,7);
            board[r][7] = null;
            board[r][4] = null;
          } else { 
            board[r][2] = pecamovida;
            board[r][3] = getPiece(r,0);    
            board[r][0] = null;
            board[r][4] = null;
          }
        }
        
        board[to.row][to.col] = pecamovida; // Move a peça
        board[from.row][from.col] = null; // Nulifica onde ela estava
        
        console.log(ElPassant);
        if (ElPassant) { // Finaliza El Passant
            if (pecamovida.type === 'pawn') {
                const dir = pecamovida.color === "white" ? -1 : 1;
                board[to.row - dir][to.col] = null;
            }
            ElPassant = null;
        }
        if (pecamovida.type === 'pawn' && Math.abs(to.row - from.row) === 2) ElPassant = to; // Inicia El Passant
        pecamovida.hasMoved = true;
        addToHistory(pecamovida, from, to, pecaCapturada);
        selectedPiece = null;
        clearHighlights();// Limpa indicaçoes de movimento
        renderBoard();// renderiza dnv
        const scores = updateScore();
        updateBotPersonalityAndDialogue(null, scores);

        if (!gameEnded) {
            switchPlayer();
        }   
        boardRedo = [];// Limpa o redo ao fazer um novo movimento
        boardUndo.push(JSON.parse(JSON.stringify(board)));// Salva o estado atual do tabuleiro para desfazer
    }

function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    turnDisplay.textContent = `Vez das ${currentPlayer === 'white' ? 'Brancas' : 'Pretas'}`;
    if (gameMode === 'pvb' && currentPlayer === 'black' && !gameEnded) {
        setTimeout(makeBotMove, 1000);
    }
}

function updateScore() {
    let whiteScore = 0; let blackScore = 0;
    for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) { const piece = board[r][c]; if (piece && piece.type !== 'king') { if (piece.color === 'white') whiteScore += pieceValues[piece.type]; else blackScore += pieceValues[piece.type]; } } }
    whiteScoreDisplay.textContent = whiteScore; blackScoreDisplay.textContent = blackScore;
    if (whiteScore > blackScore) statusDisplay.textContent = 'Brancas estão amassando.';
    else if (blackScore > whiteScore) statusDisplay.textContent = 'Pretas estão sarneando.';
    else statusDisplay.textContent = 'O jogo está pegando.';
    return { white: whiteScore, black: blackScore };
}

function addToHistory(piece, from, to, captured) {
    const time = new Date().toLocaleTimeString('pt-BR');
    const fromPos = `${String.fromCharCode(97 + from.col)}${8 - from.row}`;
    const toPos = `${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    const color = piece.color === 'white' ? 'Brancas' : 'Pretas';
    const pieceSymbol = pieceUnicode.classic[piece.color][piece.type];
    const capturedSymbol = captured ? ` (captura ${pieceUnicode.classic[captured.color][captured.type]})` : '';
    const moveText = `${time} - ${color}: ${pieceSymbol} de ${fromPos} para ${toPos}${capturedSymbol}`;
    moveHistory.push(moveText);
    const li = document.createElement('li'); li.textContent = moveText; moveHistoryList.appendChild(li);
    moveHistoryList.scrollTop = moveHistoryList.scrollHeight;
}

function endGame(winner) {
    gameEnded = true;
    const winnerColor = winner === 'white' ? 'BRANCAS' : 'PRETAS';
    statusDisplay.textContent = `FIM DE JOGO! As ${winnerColor} venceram!`;
    turnDisplay.textContent = '';
    updateBotPersonalityAndDialogue(winner === 'white' ? 'losing' : 'winning');
    stopAudioVisualizer();
}