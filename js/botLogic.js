

const bots = {
    loliBot: {
        name: "Samantha Helkaiser", difficultyType: "Fácil?",
        difficulty: { current: "medium", evolution: ["medium", "hard", "impossible"] },
        music: { normal: "Resources/Musics/Guardia-Millennial-Fair.mp3", focused: "Resources/Musics/Guardia-Millennial-Fair.mp3", angry: "Resources/Musics/Blade-Arts-IV.mp3" },
        images: { normal: "Resources/Bots-IMGs/Samathan-Helkiser/normalGyaru.png", focused: "Resources/Bots-IMGs/Samathan-Helkiser/normalGyaru.png", angry: "Resources/Bots-IMGs/Samathan-Helkiser/AngryGyaru.png" },
        dialogue: {
            normal: { start: ["O-Olá! Vamos jogar um pouquinho?", "Eu adoro xadrez! Espero que você goste também."], winning: ["Vamos, sei que você é melhor que isso!", "Que divertido!"], losing: ["Ah...", "Minhas pecinhas estão desaparecendo..."], equal: ["Empatados por enquanto...", "Hmmm..."] },
            focused: { winning: ["A vantagem é minha.", "Vamos, vamos!"], losing: ["Preciso me concentrar mais...", "Até que você é bom!"], equal: ["Cada movimento conta.", "Estou pensando..."] },
            angry: { winning: ["..."], losing: ["Nah i'd win", "Não posso deixar assim..."] }
        }
    },
    professor: {
        name: "Professor Xadrez", difficultyType: "Fácil", difficulty: "easy",
        music: "Resources/Musics/Crossroads.mp3",
        images: { normal: "Resources/Bots-IMGs/Professor-Xadrez/ProffX.png", focused: "Resources/Bots-IMGs/Professor-Xadrez/ProffX.png", angry: "Resources/Bots-IMGs/Professor-Xadrez/ProffX.png" },
        dialogue: {
            normal: { start: ["Que começe a partida!"], winning: ["Sei que pode fazer melhor que isso.", "Jogue com calma."], losing: ["Bom movimento", "Boa jogada!"], equal: ["Jogue!", "Hmmm..."] },
            focused: { winning: ["A vantagem é minha.", "Vamos, vamos!"], losing: ["Preciso me concentrar mais...", "Até que você é bom!"], equal: ["Cada movimento conta.", "Estou pensando..."] },
            angry: { winning: ["Vamos!!"], losing: ["Você está indo bem!"] }
        }
    }
};

function makeBotMove() {
    const difficulty = typeof currentBot.difficulty === 'object' ? currentBot.difficulty.current : currentBot.difficulty;
    const bestMove = getBestMove(difficulty);
    if (bestMove) {
        movePiece(bestMove.from, bestMove.to);
    } else {
        endGame('white'); // bot não tem movimentos, jogador vence
    }
}

function getBestMove(difficulty) {
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
    if (allPossibleMoves.length === 0) return null;

    switch (difficulty) {
        case 'easy':
            return allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
        case 'medium': {
            const captures = allPossibleMoves.filter(move => getPiece(move.to.row, move.to.col));
            if (captures.length > 0) {
                captures.sort((a, b) => pieceValues[getPiece(b.to.row, b.to.col).type] - pieceValues[getPiece(a.to.row, a.to.col).type]);
                return captures[0];
            }
            return allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
        }
        case 'hard':
        case 'impossible': {
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
        default:
            return allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
    }
}

function evaluateMove(move, color) {
    let score = 0;
    const targetPiece = getPiece(move.to.row, move.to.col);
    if (targetPiece) {
        score += pieceValues[targetPiece.type];
    }
    const opponentColor = color === 'white' ? 'black' : 'white';
    const originalPiece = getPiece(move.from.row, move.from.col);
    board[move.to.row][move.to.col] = originalPiece;
    board[move.from.row][move.from.col] = null;
    if (isSquareAttacked(move.to, opponentColor)) {
        score -= pieceValues[originalPiece.type] * 0.8;
    }
    board[move.from.row][move.from.col] = originalPiece;
    board[move.to.row][move.to.col] = targetPiece;
    if (move.to.row > 1 && move.to.row < 6 && move.to.col > 1 && move.to.col < 6) {
        score += 0.1;
    }
    return score;
}

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

function updateBotPersonalityAndDialogue(state = null, scores = null) {
    if (!currentBot) return;
    let dialogueKey = state;
    const previousMood = botCurrentMood;
    if (!dialogueKey) {
        if (scores.black >= 30) botCurrentMood = 'normal';
        else if (scores.black >= 20) botCurrentMood = 'focused';
        else botCurrentMood = 'angry';
        const scoreDiff = scores.black - scores.white;
        if (scoreDiff > 6) dialogueKey = 'winning';
        else if (scoreDiff < -6) dialogueKey = 'losing';
        else dialogueKey = 'equal';
    }

    if (typeof currentBot.difficulty === 'object') {
        const botScore = scores ? scores.black : 39;
        const evolution = currentBot.difficulty.evolution;
        if (botScore < 10) currentBot.difficulty.current = evolution[3] || 'impossible';
        else if (botScore < 20) currentBot.difficulty.current = evolution[2] || 'hard';
        else if (botScore < 30) currentBot.difficulty.current = evolution[1] || 'medium';
        else currentBot.difficulty.current = evolution[0] || 'easy';
    }

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