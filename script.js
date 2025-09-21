document.addEventListener('DOMContentLoaded', () => {
    // Parte do áudio, tentei seguir um vídeo e coisinhas que pesquisei
    const canvas = document.getElementById("audio-visualizer");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let audioCtx, analyser, dataArray, animationId;
    let currentAudio = { element: null, source: null, gainNode: null }; // Objeto para a música atual
    let nextAudio = { element: null, source: null, gainNode: null }; // Objeto para a próxima música (durante o fade)
    let currentTrackPath = null; // Caminho da música que está tocando
    
    // Inicia o áudio e o visualizador com a primeira música
    function initAudio(audioFile) {
        if (currentAudio.element || !audioFile) return;

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        currentAudio.element = new Audio(audioFile);
        currentAudio.element.loop = true;
        currentAudio.element.crossOrigin = "anonymous";
        
        currentAudio.source = audioCtx.createMediaElementSource(currentAudio.element);
        currentAudio.gainNode = audioCtx.createGain(); // Controle de volume para fade
        
        currentAudio.source.connect(currentAudio.gainNode);
        currentAudio.gainNode.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        currentAudio.element.play();
        currentTrackPath = audioFile;

        drawVisualizer();
    }

    // NOVO: Função para trocar de música com efeito de fade
    function switchTrack(newTrackPath) {
        if (!newTrackPath || newTrackPath === currentTrackPath || !audioCtx) return;

        // 1. Prepara a nova música (nextAudio)
        nextAudio.element = new Audio(newTrackPath);
        nextAudio.element.loop = true;
        nextAudio.element.crossOrigin = "anonymous";
        nextAudio.source = audioCtx.createMediaElementSource(nextAudio.element);
        nextAudio.gainNode = audioCtx.createGain();
        nextAudio.gainNode.gain.setValueAtTime(0, audioCtx.currentTime); // Começa com volume 0
        
        nextAudio.source.connect(nextAudio.gainNode);
        nextAudio.gainNode.connect(analyser); // Conecta ao mesmo analisador
        
        nextAudio.element.play();

        // 2. Faz o fade out da música atual e o fade in da nova
        const fadeDuration = 2.0; // 2 segundos de transição
        currentAudio.gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeDuration);
        nextAudio.gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + fadeDuration);
        
        currentTrackPath = newTrackPath;

        // 3. Após o fade, a nova música se torna a música atual
        setTimeout(() => {
            if (currentAudio.element) currentAudio.element.pause();
            currentAudio = { ...nextAudio };
            nextAudio = { element: null, source: null, gainNode: null };
        }, fadeDuration * 1000);
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
    // Para parar o áudio e o visualizador
    function stopAudioVisualizer() { /* ... (Seu código, MODIFICADO para limpar ambos os áudios) ... */ 
        if (currentAudio.element) { currentAudio.element.pause(); currentAudio.element = null; }
        if (nextAudio.element) { nextAudio.element.pause(); nextAudio.element = null; }
        currentTrackPath = null;
        if (audioCtx) { audioCtx.close().catch(e => {}); audioCtx = null; }
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Variáveis de interface
    const menuContainer = document.getElementById('menu-container');
    const botSelectionContainer = document.getElementById('bot-selection-container');
    const gameContainer = document.getElementById('game-container');
    const pvpButton = document.getElementById('pvpButton');
    const pvbButton = document.getElementById('pvbButton');
    const botList = document.getElementById('bot-list');
    // Botões de voltar
    const backFromBotSelection = botSelectionContainer.querySelector('#back-to-menu');
    const backFromGame = gameContainer.querySelector('#back-to-menu');
    // Botões
    const undo = gameContainer.querySelector('#undo-button');
    const redo = gameContainer.querySelector('#redo-button');
     // Variáveis do jogo
    const chessboard = document.getElementById('chessboard');
    const turnDisplay = document.getElementById('turn-display');
    const statusDisplay = document.getElementById('status-display');
    const whiteScoreDisplay = document.getElementById('white-score');
    const blackScoreDisplay = document.getElementById('black-score');
    const moveHistoryList = document.querySelector('#move-history ul');
    // Variáveis do bot
    const botDisplay = document.getElementById('bot-personality-display');
    const botImage = document.getElementById('bot-image');
    const botName = document.getElementById('bot-name');
    const botDialogue = document.getElementById('bot-dialogue');
    // Variáveis do jogo
    let board = [];
    let boardUndo = [];
    let boardRedo = [[ [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], [null,null,{"type":"pawn","color":"black","hasMoved":false},null,null,{"type":"pawn","color":"black","hasMoved":false},null,null], [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], [null,{"type":"pawn","color":"white","hasMoved":false},null,null,null,null,{"type":"pawn","color":"white","hasMoved":false},null], [null,null,{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},{"type":"pawn","color":"white","hasMoved":false},null,null], [null,null,null,null,null,null,null,null] ]];
    let currentPlayer = "white"; 
    let selectedPiece = null; 
    let moveHistory = [];
    let gameEnded = false;
    let gameMode = 'pvp';
    let currentBot = null;
    let botCurrentMood = 'normal';
    // Define os valores das peças e suas representações Unicode
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
    // Define os bots
    const bots = {
        loliBot: {
            name: "Samantha Helkaiser",
            difficultyType: "Fácil?",
            difficulty: {
                current: "medium",
                evolution: ["medium", "hard", "impossible"]
            },
            music: { // Músicas para cada humor
                normal: "Resources/Musics/Guardia-Millennial-Fair.mp3",
                focused: "Resources/Musics/Guardia-Millennial-Fair.mp3", // Exemplo de outra música
                angry: "Resources/Musics/Blade-Arts-IV.mp3"    // Pode ser a mesma
            },
            images: {
                normal: "Resources/Bots-IMGs/Samathan-Helkiser/normalGyaru.png",
                focused: "Resources/Bots-IMGs/Samathan-Helkiser/normalGyaru.png",
                angry: "Resources/Bots-IMGs/Samathan-Helkiser/AngryGyaru.png"
            },
            dialogue: {
                normal: {
                    start: ["O-Olá! Vamos jogar um pouquinho?", "Eu adoro xadrez! Espero que você goste também."],
                    winning: ["Vamos, sei que você é melhor que isso!", "Que divertido!"],
                    losing: ["Ah...", "Minhas pecinhas estão desaparecendo..."],
                    equal: ["Empatados por enquanto...", "Hmmm..."],
                },
                focused: {
                    winning: ["A vantagem é minha.", "Vamos, vamos!"],
                    losing: ["Preciso me concentrar mais...", "Até que você é bom!"],
                    equal: ["Cada movimento conta.", "Estou pensando..."]
                },
                angry: {
                    winning: ["..."],
                    losing: ["Nah i'd win", "Não posso deixar assim..."],
                }
            }
        },
        professor: {
            name: "Professor Xadrez",
            difficultyType: "Fácil",
            difficulty: "easy",
            music: "Resources/Musics/Crossroads.mp3",
            images: {
                normal: "Resources/Bots-IMGs/Professor-Xadrez/ProffX.png",
                focused: "Resources/Bots-IMGs/Professor-Xadrez/ProffX.png",
                angry: "Resources/Bots-IMGs/Professor-Xadrez/ProffX.png"
            },
            dialogue: {
                normal: {
                    start: ["Que começe a partida!"],
                    winning: ["Sei que pode fazer melhor que isso.", "Jogue com calma."],
                    losing: ["Bom movimento", "Boa jogada!"],
                    equal: ["Jogue!", "Hmmm..."],
                },
                focused: {
                    winning: ["A vantagem é minha.", "Vamos, vamos!"],
                    losing: ["Preciso me concentrar mais...", "Até que você é bom!"],
                    equal: ["Cada movimento conta.", "Estou pensando..."]
                },
                angry: {
                    winning: ["Vamos!!"],
                    losing: ["Você está indo bem!"],
                }
            }
        }
    };
    // Eventos dos botões do menu
    pvpButton.addEventListener('click', () => startGame('pvp'));
    pvbButton.addEventListener('click', showBotSelection);
    // Mostra a tela de seleção de bots
    function showBotSelection() {
        menuContainer.classList.add('hidden');
        botSelectionContainer.classList.remove('hidden');
        populateBotList();
    }
    // Volta para o menu principal
    backFromBotSelection.addEventListener('click', () => {
        botSelectionContainer.classList.add('hidden');
        menuContainer.classList.remove('hidden');
    });
    // Volta para o menu principal
    backFromGame.addEventListener('click', () => {
        gameContainer.classList.add('hidden');
        menuContainer.classList.remove('hidden');
        stopAudioVisualizer();
    });
    // Eventos dos botões de desfazer e refazer
    undo.addEventListener('click', () => {
        if (!currentBot) {
            if (boardUndo.length > 1) {
                boardRedo.push(JSON.parse(JSON.stringify(board)));
                boardUndo.pop();
                board = JSON.parse(JSON.stringify(boardUndo[boardUndo.length - 1]));
                renderBoard();
                switchPlayer();
                updateScore();
            }
        }
    });
    redo.addEventListener('click', () => {
        if (boardRedo.length > 0) {
            board = JSON.parse(JSON.stringify(boardRedo.pop()));
            boardUndo.push(JSON.parse(JSON.stringify(board)));
            renderBoard();
            switchPlayer();
            updateScore();
        }
    });
    // Popula a lista de bots na tela de seleção
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
    // Inicia o jogo com o modo selecionado
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
    // Inicializa o tabuleiro com as peças na posição inicial
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
        boardUndo.push(JSON.parse(JSON.stringify(board)));

    }
    // Renderiza o tabuleiro e as peças
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
    // Destaca os movimentos possíveis
    function highlightMoves(moves, row, col) {
        moves.forEach(([dr, dc]) => {
            const r = row + dr, c = col + dc;
            const target = getSquare(r, c);
            if (!target) return;
            target.classList.add(getPiece(r, c) ? 'possible-capture' : 'possible-move');
        });
    }
    // Move a peça e atualiza o estado do jogo
    function movePiece(from, to) {
        from.row = parseInt(from.row); from.col = parseInt(from.col);
        const pecaCapturada = board[to.row][to.col];
        const pecamovida = board[from.row][from.col];
        if (pecaCapturada && pecaCapturada.type === 'king') { endGame(pecamovida.color); return; }
        if (pecamovida.type === 'pawn' && (to.row === 0 || to.row === 7)) pecamovida.type = 'queen';
        if (pecamovida.type === 'king' && Math.abs(to.col - from.col) === 2) {
          if (to.col === 6) {
            movePiece({row: from.row, col: 7}, {row: from.row, col: 5});
          } else { 
            movePiece({row: from.row, col: 0}, {row: from.row, col: 3});
          }
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
        boardRedo = [];// Limpa o redo ao fazer um novo movimento
        boardUndo.push(JSON.parse(JSON.stringify(board)));// Salva o estado atual do tabuleiro para desfazer
    }
    // Alterna o jogador atual e, se for o bot, faz a jogada
    function switchPlayer() {
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        turnDisplay.textContent = `Vez das ${currentPlayer === 'white' ? 'Brancas' : 'Pretas'}`;
        if (gameMode === 'pvb' && currentPlayer === 'black' && !gameEnded) {
            setTimeout(makeBotMove, 1000);
        }
    }
    // Lógica do bot
    function makeBotMove() {
        const difficulty = typeof currentBot.difficulty === 'object' ? currentBot.difficulty.current : currentBot.difficulty;
        const bestMove = getBestMove(difficulty); // Chama o "cérebro" do bot... cerebro tem acento?
        if (bestMove) {
            movePiece(bestMove.from, bestMove.to);
        } else {
            endGame('white'); // Bot não tem movimentos, jogador vence
        }
    }

    // decide o melhor movimento baseado na dificuldade
    function getBestMove(difficulty) {
        const allPossibleMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === 'black') {
                    const moves = getPossibleMoves(piece, r, c);
                    moves.forEach(move => {
                        allPossibleMoves.push({
                            from: { row: r, col: c },
                            to: { row: r + move[0], col: c + move[1] }
                        });
                    });
                }
            }
        }
        if (allPossibleMoves.length === 0) return null;

        // Estratégias de Dificuldade
        switch (difficulty) {
            case 'easy': {
                return allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
            }
            case 'medium': {
                const captures = allPossibleMoves.filter(move => getPiece(move.to.row, move.to.col));
                if (captures.length > 0) {
                    // Prioriza a captura de maior valor
                    captures.sort((a, b) => pieceValues[getPiece(b.to.row, b.to.col).type] - pieceValues[getPiece(a.to.row, a.to.col).type]);
                    return captures[0];
                }
                return allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
            }
            case 'hard':
            case 'impossible': { // Impossível usa a mesma lógica do difícil ww
                let bestScore = -Infinity;
                let bestMoves = [];

                allPossibleMoves.forEach(move => {
                    const score = evaluateMove(move, 'black');
                    if (score > bestScore) {
                        bestScore = score;
                        bestMoves = [move];
                    } else if (score === bestScore) {
                        bestMoves.push(move);
                    }
                });
                return bestMoves[Math.floor(Math.random() * bestMoves.length)];
            }
            default: { // Caso padrão é fácil
                return allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
            }
        }
    }

    // Função que calcula a pontuação de uma jogada
    function evaluateMove(move, color) {
        let score = 0;
        const targetPiece = getPiece(move.to.row, move.to.col);
        
        // Recompensa por Captura
        if (targetPiece) {
            score += pieceValues[targetPiece.type];
        }

        // Penalidade por se mover para um local perigoso (simulação de 1 jogada à frente)
        const opponentColor = color === 'white' ? 'black' : 'white';
        // Simula o movimento
        const originalPiece = getPiece(move.from.row, move.from.col);
        board[move.to.row][move.to.col] = originalPiece;
        board[move.from.row][move.from.col] = null;

        if (isSquareAttacked(move.to, opponentColor)) {
            score -= pieceValues[originalPiece.type] * 0.8; // Perder a peça que moveu é ruim
        }

        // Desfaz a simulação
        board[move.from.row][move.from.col] = originalPiece;
        board[move.to.row][move.to.col] = targetPiece;

        if (move.to.row > 1 && move.to.row < 6 && move.to.col > 1 && move.to.col < 6) {
            score += 0.1;
        }

        return score;
    }

    // Função auxiliar para verificar se um quadrado está sob ataque
    function isSquareAttacked(square, attackerColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = getPiece(r, c);
                if (piece && piece.color === attackerColor) {
                    const moves = getPossibleMoves(piece, r, c);
                    if (moves.some(([dr, dc]) => r + dr === square.row && c + dc === square.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // Mias coisa de bot
    function updateBotPersonalityAndDialogue(state = null, scores = null) {
        if (!currentBot) return;
        let dialogueKey = state;
        const previousMood = botCurrentMood;
        if (!dialogueKey) {
            if (scores.black >= 30) {
                botCurrentMood = 'normal';
            } else if (scores.black >= 20) {
                botCurrentMood = 'focused';
            } else {
                botCurrentMood = 'angry';
            }

            const scoreDiff = scores.black - scores.white;
            if (scoreDiff > 6) { dialogueKey = 'winning'; } 
            else if (scoreDiff > 2) { dialogueKey = 'winning'; } 
            else if (scoreDiff < -6) { dialogueKey = 'losing'; } 
            else if (scoreDiff < -2) { dialogueKey = 'losing'; } 
            else { dialogueKey = 'equal'; }
        }

        // Mudar dificuldade INgame
        if (typeof currentBot.difficulty === 'object') {
            const botScore = scores ? scores.black : 39;
            const evolution = currentBot.difficulty.evolution;
            if (botScore < 10) { currentBot.difficulty.current = evolution[3] || 'impossible'; }
            else if (botScore < 20) { currentBot.difficulty.current = evolution[2] || 'hard'; }
            else if (botScore < 30) { currentBot.difficulty.current = evolution[1] || 'medium'; }
            else { currentBot.difficulty.current = evolution[0] || 'easy'; }
        }

        // Troca de musíca
        if (previousMood !== botCurrentMood && typeof currentBot.music === 'object') {
            const newTrack = currentBot.music[botCurrentMood];
            switchTrack(newTrack);
        }

        botImage.src = currentBot.images[botCurrentMood] || currentBot.images.normal;
        const phrases = currentBot.dialogue[botCurrentMood]?.[dialogueKey];
        if (phrases && phrases.length > 0) {
            botDialogue.textContent = `"${phrases[Math.floor(Math.random() * phrases.length)]}"`;
        }
    }

    // Muda o estilo das peças
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



        // MENU TABULEIRO
    const styleButtonBoard = document.getElementById("styleButtonboard");
    const styleMenuBoard = document.getElementById("styleMenuBoard");

    styleButtonBoard.addEventListener('click', () => {
    styleMenuBoard.style.display =
        styleMenuBoard.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
    if (!styleButtonBoard.contains(e.target) && !styleMenuBoard.contains(e.target)) {
        styleMenuBoard.style.display = 'none';
    }
    });

    styleMenuBoard.querySelectorAll('div').forEach((item) => {
    item.addEventListener('click', () => {
        const style = item.dataset.style;
        setBoardStyle(style);
        styleMenuBoard.style.display = 'none';
    });
    });

    let currentBoardStyle = 'normal';
    mainArea.classList.add(`chess-theme-normal`);
    function setBoardStyle(style) {
    const mainArea = document.getElementById('main-game-area');
        
        mainArea.classList.remove('chess-theme-normal', 'chess-theme-light', 'chess-theme-neon', 'chess-theme-arthur_wermont', 'chess-theme-vivi', 'chess-theme-shrek');
        
        mainArea.classList.add(`chess-theme-${style}`);
        currentBoardStyle = style;
    }










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
                // movimentos normais
                [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
                .forEach(([dr,dc])=>{
                    let t=getPiece(row+dr,col+dc);
                    if(!t||t.color!==piece.color) moves.push([dr,dc]);
                });

                // roques
                if (piece.hasMoved) break;
                const Kr = piece.color==="white"?7:0;
                for(const {rookPos,path,move} of [
                {rookPos:7,path:[5,6],move:[0,2]},   // pequeno
                {rookPos:0,path:[1,2,3],move:[0,-2]} // grande
                ]) {
                let r=getPiece(Kr,rookPos);
                if(r&&r.type==="rook"&&!r.hasMoved&&r.color===piece.color &&
                    path.every(c=>!getPiece(Kr,c)))
                    moves.push(move);
                }
                break;

        }
        
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