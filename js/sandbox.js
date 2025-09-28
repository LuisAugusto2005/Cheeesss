let sandPiece = null;
let nullifier = false;

let sandbordBlack = [[
    { "type": "king", "color": "black", "hasMoved": false },
    { "type": "queen", "color": "black", "hasMoved": false },
    { "type": "bishop", "color": "black", "hasMoved": false },
    { "type": "knight", "color": "black", "hasMoved": false },
    { "type": "rook", "color": "black", "hasMoved": false },
    { "type": "pawn", "color": "black", "hasMoved": false }
]];

let sandbordWhite = [[
    { "type": "king", "color": "white", "hasMoved": false },
    { "type": "queen", "color": "white", "hasMoved": false },
    { "type": "bishop", "color": "white", "hasMoved": false },
    { "type": "knight", "color": "white", "hasMoved": false },
    { "type": "rook", "color": "white", "hasMoved": false },
    { "type": "pawn", "color": "white", "hasMoved": false }
]];


function sandboxRender(color) {
    const container = (color === 'black') ? SandBoxBlack : SandBoxWhite;
    container.innerHTML = '';

    for (let col = 0; col < 6; col++) {
        const square = document.createElement('div');
        square.classList.add('square', (col % 2 === 0 ? 'white-square' : 'black-square'));

        square.dataset.row = 0; // sempre linha 0 no sandbox
        square.dataset.col = col;
        square.dataset.color = color;

        const piece = (color === 'black' ? sandbordBlack[0][col] : sandbordWhite[0][col]);

        if (piece) {
            const pieceContainer = document.createElement('div');
            pieceContainer.className = 'piece-container';
            const representation =
                pieceUnicode[currentPieceStyle]?.[piece.color]?.[piece.type] ||
                pieceUnicode.classic[piece.color][piece.type];

            if (representation.endsWith('.svg') || representation.endsWith('.png')) {
                pieceContainer.innerHTML = `<img src="${representation}" class="piece" alt="${piece.type}">`;
            } else {
                pieceContainer.textContent = representation;
                pieceContainer.classList.add('piece-text');
            }
            square.appendChild(pieceContainer);
        }

        square.addEventListener('click', SandSquareClick);
        container.appendChild(square);
    }
}

function SandRemoveRender() {
    SandRemoveBox.innerHTML = '';

    const square1 = document.createElement('div');
    square1.classList.add('square', 'black-square');
    square1.innerHTML = '↻';
    square1.addEventListener('click', SandReset);
    
    const square2 = document.createElement('div');
    square2.classList.add('square', 'white-square');
    square2.innerHTML = 'X';
    square2.addEventListener('click', SandNull);

    SandRemoveBox.appendChild(square1);
    SandRemoveBox.appendChild(square2);
}

function SandSquareClick(event) {
    console.log(JSON.parse(JSON.stringify(board)));
    if (gameMode != 'sandbox') return;

    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const color = square.dataset.color;

    if (square.classList.contains('sanded')) {
        sandPiece = null;
        clearHighlights();
    } else {
        clearHighlights();
        square.classList.add('sanded');
        sandPiece = (color === 'black' ? sandbordBlack[row][col] : sandbordWhite[row][col]);
        nullifier = false
    }
}

function SandReset () {
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    renderBoard();
}

function SandNull(event) {
    const square = event.currentTarget;
    if (square.classList.contains('nullifier')) {
        square.classList.remove('nullifier');
        nullifier = false
    } else {
        clearHighlights();
        square.classList.add('nullifier');
        nullifier = true
        sandPiece = false
    }
}

function insertSandPiece(square) {
    const newPiece = nullifier ? null : sandPiece;
    board[square.dataset.row][square.dataset.col] = newPiece;
    renderBoard();
    updateScore();
}