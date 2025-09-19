document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const gameContainer = document.getElementById('game-container');
    const pvpButton = document.getElementById('pvpButton');
    const backToMenuButton = document.getElementById('back-to-menu');
     
    const chessboard = document.getElementById('chessboard');
    const turnDisplay = document.getElementById('turn-display');
    const statusDisplay = document.getElementById('status-display');
    const whiteScoreDisplay = document.getElementById('white-score');
    const blackScoreDisplay = document.getElementById('black-score');
    const moveHistoryList = document.querySelector('#move-history ul');

    let board = [];
    let currentplayer = "white"; 
    let selectpiece = null; 
    let historico_movimento = [];
    let gameEnded = false;

    const pieceValues = { 'pawn': 1, 'knight': 3, 'bishop': 3, 'rook': 5, 'queen': 9, 'king': 1000 };
    const pieceUnicode = {
        classic: {
            'white': { 'king': '♔', 'queen': '♕', 'rook': '♖', 'bishop': '♗', 'knight': '♘', 'pawn': '♙' },
            'black': { 'king': '♚', 'queen': '♛', 'rook': '♜', 'bishop': '♝', 'knight': '♞', 'pawn': '♟' }
        },
        california: {
            'white': { 'king': 'Resources/pecas_estilos/california/wK.svg', 'queen': 'Resources/pecas_estilos/california/wQ.svg', 'rook': 'Resources/pecas_estilos/california/wR.svg', 'bishop': 'Resources/pecas_estilos/california/wB.svg', 'knight': 'Resources/pecas_estilos/california/wN.svg', 'pawn': 'Resources/pecas_estilos/california/wP.svg' },
            'black': { 'king': 'Resources/pecas_estilos/california/bK.svg', 'queen': 'Resources/pecas_estilos/california/bQ.svg', 'rook': 'Resources/pecas_estilos/california/bR.svg', 'bishop': 'Resources/pecas_estilos/california/bB.svg', 'knight': 'Resources/pecas_estilos/california/bN.svg', 'pawn': 'Resources/pecas_estilos/california/bP.svg' }
        },
        fantasy: {
            'white': { 'king': 'Resources/pecas_estilos/fantasy/wK.svg', 'queen': 'Resources/pecas_estilos/fantasy/wQ.svg', 'rook': 'Resources/pecas_estilos/fantasy/wR.svg', 'bishop': 'Resources/pecas_estilos/fantasy/wB.svg', 'knight': 'Resources/pecas_estilos/fantasy/wN.svg', 'pawn': 'Resources/pecas_estilos/fantasy/wP.svg' },
            'black': { 'king': 'Resources/pecas_estilos/fantasy/bK.svg', 'queen': 'Resources/pecas_estilos/fantasy/bQ.svg', 'rook': 'Resources/pecas_estilos/fantasy/bR.svg', 'bishop': 'Resources/pecas_estilos/fantasy/bB.svg', 'knight': 'Resources/pecas_estilos/fantasy/bN.svg', 'pawn': 'Resources/pecas_estilos/fantasy/bP.svg' }
        }
    };

    let currentPieceStyle = 'classic'; 

    function setPieceStyle(styleName) {
        currentPieceStyle = styleName;

        document.querySelectorAll('#chessboard .square').forEach(square => {
            const pieceElement = square.querySelector('.piece');
            if (pieceElement) {
                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);
                const piece = board[row][col];
                if (!piece) return;

                const imgPath = pieceUnicode[styleName][piece.color][piece.type];
                if (imgPath.endsWith('.svg') || imgPath.endsWith('.png')) {
                    const img = document.createElement('img');
                    img.src = imgPath;
                    img.style.width = '60%';
                    img.style.height = '60%';
                    img.style.pointerEvents = 'none';
                    square.innerHTML = '';
                    square.appendChild(img);
                } else {
                    pieceElement.textContent = imgPath;
                }
            }
        });
    }

    pvpButton.addEventListener('click', startGame);

    backToMenuButton.addEventListener('click', () => {
        gameContainer.classList.add('hidden');
        menuContainer.classList.remove('hidden');
    });

    function startGame() {
        gameEnded = false;
        historico_movimento = [];
        moveHistoryList.innerHTML = '';
        selectpiece = null;
        clearHighlights();
        currentplayer = 'white';

        menuContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        document.getElementById('pieceStyleDropdown').classList.remove('hidden');

        initBoard();
        renderBoard();
        updateScore();
        turnDisplay.textContent = 'Vez das Brancas';
        statusDisplay.textContent = 'O jogo começou.';
    }

    function initBoard() {
        board = Array(8).fill(null).map(() => Array(8).fill(null));
        const setupPiece = (row, col, type, color) => {
            board[row][col] = { type, color, hasMoved: false };
        };
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
    }

    function renderBoard() {
        chessboard.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'white-square' : 'black-square');
                square.dataset.row = row;
                square.dataset.col = col;
                const piece = board[row][col];
                if (piece) {
                    const img = document.createElement('img');
                    img.classList.add('piece');
                    const imgPath = pieceUnicode[currentPieceStyle][piece.color][piece.type];
                    img.src = imgPath;
                    img.alt = piece.type;
                    square.appendChild(img);
                }
                square.addEventListener('click', handleSquareClick);
                chessboard.appendChild(square);
            }
        }
    }

    function handleSquareClick(event) {
        if (gameEnded) return;
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = board[row][col];

        if (!selectpiece && piece && piece.color === currentplayer) {
            selectpiece = getSquare(row, col);
            selectpiece.classList.add('selected');

            const moves = getPossibleMoves(piece, row, col);
            moves.forEach(([ir, ic]) => {
                const quadrado = getSquare(row + ir, col + ic);
                if (quadrado) quadrado.classList.add('possible-move');
            });
        } else {
            if (selectpiece && (square.classList.contains('possible-move') || square.classList.contains('possible-capture'))) {
                movePiece(selectpiece.dataset, { row, col });
                currentplayer = currentplayer === 'white' ? 'black' : 'white';
            }
            selectpiece = null;
            clearHighlights();
        }
    }

    function inBoard(row, col) { return row >= 0 && row < 8 && col >= 0 && col < 8; }
    function getSquare(row, col) { return inBoard(row, col) ? chessboard.querySelector(`[data-row='${row}'][data-col='${col}']`) : null; }
    function getPiece(row, col) { return inBoard(row, col) ? board[row][col] || null : null; }
    function clearHighlights() { document.querySelectorAll('.selected, .possible-move, .possible-capture').forEach(el => el.classList.remove('selected', 'possible-move', 'possible-capture')); }

    // MENU DE ESTILO
    const styleButton = document.getElementById('styleButton');
    const styleMenu = document.getElementById('styleMenu');

    styleButton.addEventListener('click', () => {
        styleMenu.style.display = styleMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!styleButton.contains(e.target) && !styleMenu.contains(e.target)) {
            styleMenu.style.display = 'none';
        }
    });

    styleMenu.querySelectorAll('div').forEach(item => {
        item.addEventListener('click', () => {
            const style = item.dataset.style;
            setPieceStyle(style);
            styleMenu.style.display = 'none';
        });
    });

    function getPossibleMoves(piece, row, col) {
        let moves = [];
        switch (piece.type) {
            case "pawn":
                let dir = piece.color === "white" ? -1 : 1;
                if (!getPiece(row + dir, col)) {
                    moves.push([dir, 0]);
                    if (!piece.hasMoved && !getPiece(row + 2*dir, col)) moves.push([2*dir, 0]);
                }
                [[dir, -1], [dir, 1]].forEach(([r, c]) => {
                    let target = getPiece(row + r, col + c);
                    if (target && target.color !== piece.color) moves.push([r, c]);
                });
                break;
            case "rook":
                [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc]) => {
                    for (let i=1;i<8;i++){
                        let target = getPiece(row+dr*i, col+dc*i);
                        if(!target) moves.push([dr*i, dc*i]);
                        else {if(target.color!==piece.color) moves.push([dr*i,dc*i]); break;}
                    }
                });
                break;
            case "knight":
                [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc])=>{
                    let target = getPiece(row+dr,col+dc);
                    if(!target || target.color!==piece.color) moves.push([dr,dc]);
                });
                break;
            case "bishop":
                [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
                    for(let i=1;i<8;i++){
                        let target=getPiece(row+dr*i,col+dc*i);
                        if(!target) moves.push([dr*i,dc*i]);
                        else {if(target.color!==piece.color) moves.push([dr*i,dc*i]); break;}
                    }
                });
                break;
            case "queen":
                [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
                    for(let i=1;i<8;i++){
                        let target=getPiece(row+dr*i,col+dc*i);
                        if(!target) moves.push([dr*i,dc*i]);
                        else {if(target.color!==piece.color) moves.push([dr*i,dc*i]); break;}
                    }
                });
                break;
            case "king":
                [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
                    let target = getPiece(row+dr, col+dc);
                    if(!target || target.color!==piece.color) moves.push([dr,dc]);
                });
                break;
        }
        return moves;
    }

    function movePiece(from, to) {
        const pecaCapturada = board[to.row][to.col];
        const pecamovida = board[from.row][from.col];

        if (pecaCapturada && pecaCapturada.type === 'king') { endGame(pecamovida.color); return; }

        if (pecamovida.type === 'pawn' && (to.row === 0 || to.row === 7)) pecamovida.type='queen';

        board[to.row][to.col] = pecamovida;
        board[from.row][from.col] = null;
        pecamovida.hasMoved = true;

        addToHistory(pecamovida, from, to, pecaCapturada);

        selectpiece = null;
        clearHighlights();
        renderBoard();
        updateScore();
    }

    function updateScore() {
        let whiteScore = 0; let blackScore = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.type !== 'king') {
                    if (piece.color === 'white') whiteScore += pieceValues[piece.type];
                    else blackScore += pieceValues[piece.type];
                }
            }
        }
        whiteScoreDisplay.textContent = whiteScore;
        blackScoreDisplay.textContent = blackScore;

        if (whiteScore > blackScore) statusDisplay.textContent = 'Brancas estão amassando.';
        else if (blackScore > whiteScore) statusDisplay.textContent = 'Pretas estão sarneando.';
        else statusDisplay.textContent = 'O jogo está pegando.';
    }

    function addToHistory(piece, from, to, captured) {
        const time = new Date().toLocaleTimeString();
        const fromPos = `${String.fromCharCode(97 + from.col)}${8 - from.row}`;
        const toPos = `${String.fromCharCode(97 + to.col)}${8 - to.row}`;
        const color = piece.color === 'white' ? 'Brancas' : 'Pretas';
        const moveText = `${time} - ${color}: ${pieceUnicode[currentPieceStyle][piece.color][piece.type]} de ${fromPos} para ${toPos}${captured ? ` (captura ${pieceUnicode[currentPieceStyle][captured.color][captured.type]})` : ''}`;
        historico_movimento.push(moveText);
        const li = document.createElement('li'); li.textContent = moveText; moveHistoryList.appendChild(li);
        moveHistoryList.scrollTop = moveHistoryList.scrollHeight;
    }

    function endGame(winner) {
        gameEnded = true;
        const winnerColor = winner === 'white' ? 'BRANCAS' : 'PRETAS';
        statusDisplay.textContent = `FIM DE JOGO! As ${winnerColor} venceram!`;
        turnDisplay.textContent = '';
    }
});
