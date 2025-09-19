document.addEventListener('DOMContentLoaded', () => {
    // Parte do áudio, tentei seguir um vídeo e coisinhas que pesquisei
    const canvas = document.getElementById("audio-visualizer");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let audio, audioCtx, analyser, source, dataArray;

    function initAudioVisualizer(audioFile) {
        audio = new Audio(audioFile);
        audio.loop = true;
        audio.play();

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        drawVisualizer();
    }

    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i];
            ctx.fillStyle = `rgb(${barHeight + 100}, 50, 200)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    function stopAudioVisualizer() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
    }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
    
    const menuContainer = document.getElementById('menu-container');
    const botSelectionContainer = document.getElementById('bot-selection-container');
    const gameContainer = document.getElementById('game-container');
    const pvpButton = document.getElementById('pvpButton');
    const pvbButton = document.getElementById('pvbButton');
    const botList = document.getElementById('bot-list');

    const backFromBotSelection = botSelectionContainer.querySelector('#back-to-menu');
    const backFromGame = gameContainer.querySelector('#back-to-menu');
     
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

    let board = [];
    let currentPlayer = "white"; 
    let selectedPiece = null; 
    let moveHistory = [];
    let gameEnded = false;
    let gameMode = 'pvp';
    let currentBot = null;
    let botCurrentMood = 'normal';

    const pieceValues = { 'pawn': 1, 'knight': 3, 'bishop': 3, 'rook': 5, 'queen': 9, 'king': 1000 };
    const pieceUnicode = {
        classic: {
            'white': { 'king': '♔', 'queen': '♕', 'rook': '♖', 'bishop': '♗', 'knight': '♘', 'pawn': '♙' },
            'black': { 'king': '♚', 'queen': '♛', 'rook': '♜', 'bishop': '♝', 'knight': '♞', 'pawn': '♟' }
        },
        california: { 'white': { 'king': 'Resources/pecas_estilos/california/wK.svg', 'queen': 'Resources/pecas_estilos/california/wQ.svg', 'rook': 'Resources/pecas_estilos/california/wR.svg', 'bishop': 'Resources/pecas_estilos/california/wB.svg', 'knight': 'Resources/pecas_estilos/california/wN.svg', 'pawn': 'Resources/pecas_estilos/california/wP.svg' }, 'black': { 'king': 'Resources/pecas_estilos/california/bK.svg', 'queen': 'Resources/pecas_estilos/california/bQ.svg', 'rook': 'Resources/pecas_estilos/california/bR.svg', 'bishop': 'Resources/pecas_estilos/california/bB.svg', 'knight': 'Resources/pecas_estilos/california/bN.svg', 'pawn': 'Resources/pecas_estilos/california/bP.svg' } },
        fantasy: { 'white': { 'king': 'Resources/pecas_estilos/fantasy/wK.svg', 'queen': 'Resources/pecas_estilos/fantasy/wQ.svg', 'rook': 'Resources/pecas_estilos/fantasy/wR.svg', 'bishop': 'Resources/pecas_estilos/fantasy/wB.svg', 'knight': 'Resources/pecas_estilos/fantasy/wN.svg', 'pawn': 'Resources/pecas_estilos/fantasy/wP.svg' }, 'black': { 'king': 'Resources/pecas_estilos/fantasy/bK.svg', 'queen': 'Resources/pecas_estilos/fantasy/bQ.svg', 'rook': 'Resources/pecas_estilos/fantasy/bR.svg', 'bishop': 'Resources/pecas_estilos/fantasy/bB (1).svg', 'knight': 'Resources/pecas_estilos/fantasy/bN.svg', 'pawn': 'Resources/pecas_estilos/fantasy/bP.svg' } }
    };

    let currentPieceStyle = 'classic'; 

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

    backFromBotSelection.addEventListener('click', () => {
        botSelectionContainer.classList.add('hidden');
        menuContainer.classList.remove('hidden');
    });

    backFromGame.addEventListener('click', () => {
        gameContainer.classList.add('hidden');
        menuContainer.classList.remove('hidden');
        stopAudioVisualizer();
    });

    function populateBotList() {
        botList.innerHTML = '';
        for (const botKey in bots) {
            const bot = bots[botKey];
            const card = document.createElement('div');
            card.className = 'bot-card';
            card.innerHTML = `<img src="${bot.images.normal}" alt="${bot.name}"><h3>${bot.name}</h3><p>Dificuldade: ${bot.difficulty}</p>`;
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
        document.getElementById('pieceStyleDropdown').classList.remove('hidden');
        if (gameMode === 'pvb' && currentBot) {
            initAudioVisualizer("Resources/Musics/Blade-Arts-III.mp3");
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
        const setupPiece = (row, col, type, color) => { board[row][col] = { type, color, hasMoved: false }; };
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

    function handleSquareClick(event) {
        if (gameEnded || (gameMode === 'pvb' && currentPlayer === 'black')) return;
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = board[row][col];

        if (selectedPiece) {
            if (square.classList.contains('possible-move') || square.classList.contains('possible-capture')) {
                movePiece(selectedPiece.dataset, { row, col });
            } else {
                selectedPiece = null;
                clearHighlights();
            }
        } else if (piece && piece.color === currentPlayer) {
            selectedPiece = getSquare(row, col);
            selectedPiece.classList.add('selected');
            const moves = getPossibleMoves(piece, row, col);
            moves.forEach(([ir, ic]) => {
                const targetSquare = getSquare(row + ir, col + ic);
                if (targetSquare) {
                    if (getPiece(row + ir, col + ic)) {
                        targetSquare.classList.add('possible-capture');
                    } else {
                        targetSquare.classList.add('possible-move');
                    }
                }
            });
        }
    }

    function movePiece(from, to) {
        from.row = parseInt(from.row); from.col = parseInt(from.col);
        const pecaCapturada = board[to.row][to.col];
        const pecamovida = board[from.row][from.col];
        if (pecaCapturada && pecaCapturada.type === 'king') { endGame(pecamovida.color); return; }
        if (pecamovida.type === 'pawn' && (to.row === 0 || to.row === 7)) pecamovida.type = 'queen';
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
                    const moves = getPossibleMoves(piece, r, c);
                    moves.forEach(move => {
                        allPossibleMoves.push({ from: { row: r, col: c }, to: { row: r + move[0], col: c + move[1] } });
                    });
                }
            }
        }
        if (allPossibleMoves.length === 0) { endGame('white'); return; }
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
        }
    }
    
    function setPieceStyle(styleName) {
        currentPieceStyle = styleName;
        renderBoard();
    }

    function inBoard(row, col) { return row >= 0 && row < 8 && col >= 0 && col < 8; }
    function getSquare(row, col) { return inBoard(row, col) ? chessboard.querySelector(`[data-row='${row}'][data-col='${col}']`) : null; }
    function getPiece(row, col) { return inBoard(row, col) ? board[row][col] || null : null; }
    function clearHighlights() { document.querySelectorAll('.selected, .possible-move, .possible-capture').forEach(el => el.classList.remove('selected', 'possible-move', 'possible-capture')); }
    
    // MENU DE ESTILO
    const styleButton = document.getElementById('styleButton');
    const styleMenu = document.getElementById('styleMenu');
    styleButton.addEventListener('click', () => { styleMenu.style.display = styleMenu.style.display === 'block' ? 'none' : 'block'; });
    document.addEventListener('click', (e) => { if (!styleButton.contains(e.target) && !styleMenu.contains(e.target)) { styleMenu.style.display = 'none'; } });
    styleMenu.querySelectorAll('div').forEach(item => { item.addEventListener('click', () => { const style = item.dataset.style; setPieceStyle(style); styleMenu.style.display = 'none'; }); });

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
        //return moves;
        return moves.filter(([r, c]) => inBoard(row + r, col + c));
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
    }
});