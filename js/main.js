document.addEventListener('DOMContentLoaded', () => {
    //ISERT CODE
    const insertCodeInput = document.getElementById("insert_code");
    insertCodeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const code = insertCodeInput.value.trim();
            if (code.toLowerCase() === "story mode") {
                const resposta = confirm("Você se responsabiliza por todas as suas escolhas?");
                if (resposta) {
                    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                }
            }
        }
    });

    //botões do menu
    pvpButton.addEventListener('click', () => startGame('pvp'));
    pvbButton.addEventListener('click', showBotSelection);
    adventureButton.addEventListener('click', function() {
        window.location.replace("../www/index.html");
    });

    backFromBotSelection.addEventListener('click', () => {
        botSelectionContainer.classList.add('hidden');
        menuContainer.classList.remove('hidden');
    });

    backFromGame.addEventListener('click', () => {
        gameContainer.classList.add('hidden');
        menuContainer.classList.remove('hidden');
        stopAudioVisualizer();
    });

    //eventos de Undo/Redo
    undoButton.addEventListener('click', () => {
        if (!currentBot && boardUndo.length > 1) {
            boardRedo.push(JSON.parse(JSON.stringify(board)));
            boardUndo.pop();
            board = JSON.parse(JSON.stringify(boardUndo[boardUndo.length - 1]));
            renderBoard();
            switchPlayer();
            updateScore();
        }
    });

    redoButton.addEventListener('click', () => {
        if (boardRedo.length > 0) {
            board = JSON.parse(JSON.stringify(boardRedo.pop()));
            boardUndo.push(JSON.parse(JSON.stringify(board)));
            renderBoard();
            switchPlayer();
            updateScore();
        }
    });
    
    //inicia o tema padrão do tabuleiro
    setBoardStyle('normal');
});