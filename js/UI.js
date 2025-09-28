//variáveis de interface
const menuContainer = document.getElementById('menu-container');
const botSelectionContainer = document.getElementById('bot-selection-container');
const gameContainer = document.getElementById('game-container');
const pvpButton = document.getElementById('pvpButton');
const pvbButton = document.getElementById('pvbButton');
const adventureButton = document.getElementById('adventureButton');
const botList = document.getElementById('bot-list');
const backFromBotSelection = botSelectionContainer.querySelector('#back-to-menu');
const backFromGame = gameContainer.querySelector('#back-to-menu');
const undoButton = gameContainer.querySelector('#undo-button');
const redoButton = gameContainer.querySelector('#redo-button');
const chessboard = document.getElementById('chessboard');
const turnDisplay = document.getElementById('turn-display');
const statusDisplay = document.getElementById('status-display');
const whiteScoreDisplay = document.getElementById('white-score');
const blackScoreDisplay = document.getElementById('black-score');
const moveHistoryList = document.querySelector('#move-history ul');
const botDisplay = document.getElementById('bot-personality-display');
const botImage = document.getElementById('bot-image');
const botName = document.getElementById('bot-name');
const botDialogue = document.getElementById('bot-dialogue');
const mainArea = document.getElementById('main-game-area');

//funções de UI

function showBotSelection() {
    menuContainer.classList.add('hidden');
    botSelectionContainer.classList.remove('hidden');
    populateBotList();
}

function populateBotList() {
    botList.innerHTML = '';
    for (const botKey in bots) {
        const bot = bots[botKey];
        const card = document.createElement('div');
        card.className = 'bot-card';
        card.innerHTML = `<img src="${bot.images.normal}" alt="${bot.name}"><h3>${bot.name}</h3><p>${bot.difficultyType}</p>`;
        card.addEventListener('click', () => startGame('pvb', bot));
        botList.appendChild(card);
    }
}

function setPieceStyle(styleName) {
    currentPieceStyle = styleName;
    renderBoard();
}

function setBoardStyle(style) {
    mainArea.classList.remove('chess-theme-normal', 'chess-theme-light', 'chess-theme-neon', 'chess-theme-arthur_wermont', 'chess-theme-vivi', 'chess-theme-shrek', 'chess-theme-ryan', 'chess-theme-lumberjack');
    mainArea.classList.add(`chess-theme-${style}`);
    currentBoardStyle = style;
}

function highlightMoves(moves, row, col, piece) {
    moves.forEach(([dr, dc]) => {
        const r = row + dr, c = col + dc;
        const target = getSquare(r, c);
        if (!target) return;
        target.classList.add(getPiece(r, c) ? 'possible-capture' : 'possible-move');
    });
    if (ElPassant && piece.type === 'pawn' && ElPassant.row === row && piece.color != ElPassant.color){
        const dir = piece.color === "white" ? -1 : 1;
        getSquare(ElPassant.row + dir, ElPassant.col).classList.add('possible-capture');
    }
}

function clearHighlights() {
    document.querySelectorAll('.selected, .possible-move, .possible-capture').forEach(el => el.classList.remove('selected', 'possible-move', 'possible-capture'));
}

//styles
const styleButton = document.getElementById('styleButton');
const styleMenu = document.getElementById('styleMenu');
styleButton.addEventListener('click', () => { styleMenu.style.display = styleMenu.style.display === 'block' ? 'none' : 'block'; });
document.addEventListener('click', (e) => { if (!styleButton.contains(e.target) && !styleMenu.contains(e.target)) { styleMenu.style.display = 'none'; } });
styleMenu.querySelectorAll('div').forEach(item => { item.addEventListener('click', () => { const style = item.dataset.style; setPieceStyle(style); styleMenu.style.display = 'none'; }); });

const styleButtonBoard = document.getElementById("styleButtonboard");
const styleMenuBoard = document.getElementById("styleMenuBoard");
styleButtonBoard.addEventListener('click', () => { styleMenuBoard.style.display = styleMenuBoard.style.display === 'block' ? 'none' : 'block'; });
document.addEventListener('click', (e) => { if (!styleButtonBoard.contains(e.target) && !styleMenuBoard.contains(e.target)) { styleMenuBoard.style.display = 'none'; } });
styleMenuBoard.querySelectorAll('div').forEach((item) => { item.addEventListener('click', () => { const style = item.dataset.style; setBoardStyle(style); styleMenuBoard.style.display = 'none'; }); });

//Especialista na Informação (Information Expert): É o princípio que nos ajuda a decidir onde colocar uma função. A responsabilidade de fazer algo deve ser dada ao módulo que já tem a maior parte da informação necessária para aquilo.