document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const menuContainer = document.getElementById('menu-container');
    const botSelectionContainer = document.getElementById('bot-selection-container');
    const gameContainer = document.getElementById('game-container');
    const pvpButton = document.getElementById('pvpButton');
    const pvbButton = document.getElementById('pvbButton'); // NOVO: Faltava essa referência
    const backToMenuButton = document.getElementById('back-to-menu');
    const botList = document.getElementById('bot-list'); // NOVO: Faltava essa referência

    const chessboard = document.getElementById('chessboard');
    const turnDisplay = document.getElementById('turn-display');
    const statusDisplay = document.getElementById('status-display');
    const whiteScoreDisplay = document.getElementById('white-score');
    const blackScoreDisplay = document.getElementById('black-score');
    const moveHistoryList = document.querySelector('#move-history ul');
    
    // NOVO: Elementos para a personalidade do Bot
    const botDisplay = document.getElementById('bot-personality-display');
    const botImage = document.getElementById('bot-image');
    const botName = document.getElementById('bot-name');
    const botDialogue = document.getElementById('bot-dialogue');

    // --- Estado do Jogo (variáveis corrigidas e adicionadas) ---
    let board = [];
    let currentPlayer = "white"; 
    let selectedPiece = null; // Corrigido de 'selectpiece' para consistência
    let moveHistory = []; // Corrigido de 'historico_movimento'
    let gameEnded = false;
    let gameMode = 'pvp'; // NOVO: para saber se é PvP ou PvB
    let currentBot = null; // NOVO: para guardar os dados do bot escolhido
    let botCurrentMood = 'normal'; // NOVO: para guardar o humor do bot

    const pieceValues = { 'pawn': 1, 'knight': 3, 'bishop': 3, 'rook': 5, 'queen': 9, 'king': 1000 };
    const pieceUnicode = {
        'white': { 'king': '♔', 'queen': '♕', 'rook': '♖', 'bishop': '♗', 'knight': '♘', 'pawn': '♙' },
        'black': { 'king': '♚', 'queen': '♛', 'rook': '♜', 'bishop': '♝', 'knight': '♞', 'pawn': '♟' }
    };

    // Os Bots:
    const bots = {
        loliBot: {
            name: "Samantha Helkaiser",
            difficulty: "Dinâmico",
            images: {
                normal: "../Resources/Bots-IMGs/Samathan-Helkiser/normalGyaru.png",
                focused: "../Resources/Bots-IMGs/Samathan-Helkiser/normalGyaru.png",
                angry: "../Resources/Bots-IMGs/Samathan-Helkiser/AngryGyaru.png"
            },
            dialogue: {
                normal: {
                    start: ["O-Olá! Vamos jogar um pouquinho?", "Eu adoro xadrez! Espero que você goste também."],
                    winning: ["Vamos, sei que você é melhor que isso!", "Que divertido!"],
                    losing: ["Ah...", "Minhas pecinhas estão desaparecendo..."],
                    equal: ["Estamos empatados?", "Hmmm..."],
                },
                focused: {
                    winning: ["A vantagem é minha.", "Vamos, vamos!"],
                    losing: ["Preciso me concentrar mais...", "Até que você é bom!"],
                    equal: ["Cada movimento conta.", "Estou pensando..."]
                },
                angry: {
                    winning: ["..."],
                    losing: ["Entendi..."],
                }
            }
        }
    };
    
    pvpButton.addEventListener('click', () => startGame('pvp'));
    pvbButton.addEventListener('click', showBotSelection);

    function showBotSelection() {
        menuContainer.classList.add('hidden');
        botSelectionContainer.classList.remove('hidden');
        populateBotList();
    }

    backToMenuButton.addEventListener('click', () => {
        botSelectionContainer.classList.add('hidden');
        menuContainer.classList.remove('hidden');
    });

    function populateBotList() {
        botList.innerHTML = '';
        for (const botKey in bots) {
            const bot = bots[botKey];
            const card = document.createElement('div');
            card.className = 'bot-card';
            card.innerHTML = `
                <img src="${bot.images.normal}" alt="${bot.name}">
                <h3>${bot.name}</h3>
                <p>Dificuldade: ${bot.difficulty}</p>
            `;
            card.addEventListener('click', () => startGame('pvb', bot));
            botList.appendChild(card);
        }
    }

    function startGame(mode, bot = null) {
        gameMode = mode;
        currentBot = bot;
        gameEnded = false;
        moveHistory = [];
        moveHistoryList.innerHTML = '';
        selectedPiece = null;
        clearHighlights();
        currentPlayer = 'white';

        menuContainer.classList.add('hidden');
        botSelectionContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        if (gameMode === 'pvb' && currentBot) {
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
                    const pieceElement = document.createElement('span');
                    pieceElement.classList.add('piece');
                    pieceElement.textContent = pieceUnicode[piece.color][piece.type];
                    square.appendChild(pieceElement);
                }
                square.addEventListener('click', handleSquareClick);
                chessboard.appendChild(square);
            }
        }
    }
    
    function handleSquareClick(event) {
        if (gameEnded || (gameMode === 'pvb' && currentPlayer === 'black')) return;
        
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = board[row][col];

        if (selectedPiece) {
            const possibleMoves = getPossibleMoves(selectedPiece.row, selectedPiece.col);
            const isValidMove = possibleMoves.some(move => move.row === row && move.col === col);
            if (isValidMove) {
                movePiece({row: selectedPiece.row, col: selectedPiece.col}, { row, col });
            } else {
                clearHighlights();
                selectedPiece = null;
                if (piece && piece.color === currentPlayer) {
                   selectPiece(row, col);
                }
            }
        } else if (piece && piece.color === currentPlayer) {
            selectPiece(row, col);
        }
    }

    function selectPiece(row, col) {
        selectedPiece = { row, col, piece: board[row][col] };
        clearHighlights();
        
        const square = chessboard.querySelector(`[data-row='${row}'][data-col='${col}']`);
        square.classList.add('selected');
        
        const possibleMoves = getPossibleMoves(row, col);
        possibleMoves.forEach(move => {
            const moveSquare = chessboard.querySelector(`[data-row='${move.row}'][data-col='${move.col}']`);
            if(moveSquare){
                if(board[move.row][move.col]){
                    moveSquare.classList.add('possible-capture');
                } else {
                    moveSquare.classList.add('possible-move');
                }
            }
        });
    }

    function getPossibleMoves(row, col) {
        const piece = board[row][col]; if (!piece) return [];
        const moves = [];
        const addMove = (r,c) => { if (r >= 0 && r < 8 && c >= 0 && c < 8) { const target = board[r][c]; if (!target) { moves.push({ row: r, col: c }); return true; } else if (target.color !== piece.color) { moves.push({ row: r, col: c }); return false; } } return false; };
        const addSlidingMoves = (directions) => { directions.forEach(([dr, dc]) => { let r = row + dr, c = col + dc; while (r >= 0 && r < 8 && c >= 0 && c < 8) { const target = board[r][c]; if (target) { if (target.color !== piece.color) { moves.push({ row: r, col: c }); } break; } moves.push({ row: r, col: c }); r += dr; c += dc; } }); };
        switch (piece.type) {
            case 'pawn': 
                const dir = piece.color === 'white' ? -1 : 1; 
                if (row + dir >= 0 && row + dir < 8 && !board[row + dir][col]) { 
                    moves.push({ row: row + dir, col: col }); 
                    if (!piece.hasMoved && !board[row + 2 * dir][col]) { 
                        moves.push({ row: row + 2 * dir, col: col }); } 
                    } 
                    [-1, 1].forEach(cd => { if (col + cd >= 0 && col + cd < 8) { 
                        const target = board[row + dir]?.[col + cd];
                        if (target && target.color !== piece.color) { 
                            moves.push({ row: row + dir, col: col + cd }); 
                        } 
                    } }); 
            break;
            case 'knight': const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]; knightMoves.forEach(([dr, dc]) => addMove(row + dr, col + dc)); break;
            case 'rook': addSlidingMoves([[0, 1], [0, -1], [1, 0], [-1, 0]]); break;
            case 'bishop': addSlidingMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
            case 'queen': addSlidingMoves([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
            case 'king': const kingMoves = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]; kingMoves.forEach(([dr, dc]) => addMove(row + dr, col + dc)); break;
        } return moves;
    }

    function movePiece(from, to) {
        const pecaCapturada = board[to.row][to.col];
        const pecamovida = board[from.row][from.col];
        
        if (pecaCapturada && pecaCapturada.type === 'king') {
            endGame(pecamovida.color);
            return;
        }
        
        if (pecamovida.type === 'pawn' && (to.row === 0 || to.row === 7)) {
            pecamovida.type = 'queen';
        }
        
        board[to.row][to.col] = pecamovida;
        board[from.row][from.col] = null;
        pecamovida.hasMoved = true;
        
        addToHistory(pecamovida, from, to, pecaCapturada);

        selectedPiece = null;
        clearHighlights();
        renderBoard();
        
        const scores = updateScore();
        updateBotPersonalityAndDialogue(null, scores);
        
        if (!gameEnded) {
            switchPlayer();
        }
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        turnDisplay.textContent = `Vez das ${currentPlayer === 'white' ? 'Brancas' : 'Pretas'}`;

        if (gameMode === 'pvb' && currentPlayer === 'black' && !gameEnded) {
            setTimeout(makeBotMove, 1000);
        }
    }
    
    function makeBotMove() {
        const allPossibleMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === 'black') {
                    const moves = getPossibleMoves(r, c);
                    moves.forEach(move => {
                        allPossibleMoves.push({ from: { row: r, col: c }, to: move });
                    });
                }
            }
        }
        
        if (allPossibleMoves.length === 0) {
            endGame('white');
            return;
        }

        const randomMove = allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
        movePiece(randomMove.from, randomMove.to);
    }
    
    function updateBotPersonalityAndDialogue(state = null, scores = null) {
        if (!currentBot) return;

        let dialogueKey = state;
        if (!dialogueKey) {
            const scoreDiff = scores.black - scores.white;
            if (scoreDiff > 6) { botCurrentMood = 'angry'; dialogueKey = 'winning'; } 
            else if (scoreDiff > 2) { botCurrentMood = 'focused'; dialogueKey = 'winning'; } 
            else if (scoreDiff < -6) { botCurrentMood = 'angry'; dialogueKey = 'losing'; } 
            else if (scoreDiff < -2) { botCurrentMood = 'focused'; dialogueKey = 'losing'; } 
            else { botCurrentMood = 'normal'; dialogueKey = 'equal'; }
        }
        
        botImage.src = currentBot.images[botCurrentMood] || currentBot.images.normal;
        const phrases = currentBot.dialogue[botCurrentMood]?.[dialogueKey];
        if (phrases && phrases.length > 0) {
            botDialogue.textContent = `"${phrases[Math.floor(Math.random() * phrases.length)]}"`;
        } else {
             const fallbackPhrases = currentBot.dialogue.normal?.[dialogueKey];
             if(fallbackPhrases && fallbackPhrases.length > 0) {
                botDialogue.textContent = `"${fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)]}"`;
             }
        }
    }

    function clearHighlights() {
        document.querySelectorAll('.selected, .possible-move, .possible-capture').forEach(el => el.classList.remove('selected', 'possible-move', 'possible-capture'));
    }

    function updateScore() {
        let whiteScore = 0; let blackScore = 0;
        for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) { const piece = board[r][c]; if (piece && piece.type !== 'king') { if (piece.color === 'white') { whiteScore += pieceValues[piece.type]; } else { blackScore += pieceValues[piece.type]; } } } }
        whiteScoreDisplay.textContent = whiteScore; blackScoreDisplay.textContent = blackScore;
        if (whiteScore > blackScore) { statusDisplay.textContent = 'Brancas estão amassando.'; } else if (blackScore > whiteScore) { statusDisplay.textContent = 'Pretas estão sarneando.'; } else { statusDisplay.textContent = 'O jogo está pegando.'; }
        return { white: whiteScore, black: blackScore };
    }
    
    function addToHistory(piece, from, to, captured) {
        const time = new Date().toLocaleTimeString(); 
        const fromPos = `${String.fromCharCode(97 + from.col)}${8 - from.row}`; 
        const toPos = `${String.fromCharCode(97 + to.col)}${8 - to.row}`;      
        const color = piece.color === 'white' ? 'Brancas' : 'Pretas';
        const moveText = `${time} - ${color}: ${pieceUnicode[piece.color][piece.type]} de ${fromPos} para ${toPos}${captured ? ` (captura ${pieceUnicode[captured.color][captured.type]})` : ''}`;
        moveHistory.push(moveText);
        const li = document.createElement('li'); 
        li.textContent = moveText; 
        moveHistoryList.appendChild(li); 
        moveHistoryList.scrollTop = moveHistoryList.scrollHeight;
    }

    function endGame(winner) {
        gameEnded = true; 
        const winnerColor = winner === 'white' ? 'BRANCAS' : 'PRETAS';
        statusDisplay.textContent = `FIM DE JOGO! As ${winnerColor} venceram!`;
        turnDisplay.textContent = ''; 
    }
});