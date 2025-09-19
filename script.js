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
        'white': { 'king': '♔', 'queen': '♕', 'rook': '♖', 'bishop': '♗', 'knight': '♘', 'pawn': '♙' },
        'black': { 'king': '♚', 'queen': '♛', 'rook': '♜', 'bishop': '♝', 'knight': '♞', 'pawn': '♟' }
    };

    
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
            quadrado.classList.add('possible-move');
          });
          
        } else { 
          if (selectpiece && (square.classList.contains('possible-move') || square.classList.contains('possible-capture'))) {
            movePiece(selectpiece.dataset, { row, col });
            console.log("Peça movida para: Linha " + row + " Coluna " + col);
          }
          clearHighlights();
        }
    }

  

    function getPossibleMoves(piece, row, col) {
      let moves = [];
      console.log("Linha: " + row + " Coluna: " + col);
      switch (piece.type) {
        case "pawn":
          console.log("Peão selecionado");
          if (piece.color === "black") {
            if (getPiece(row + 1, col)?.type === "") {
              moves.push([1, 0]);
              if (!piece.hasMoved) {
                moves.push([2, 0]);
              }
            }
            if (getPiece(row + 1, col - 1)?.type != "" && getPiece(row + 1, col - 1)?.color !== piece.color) {
              moves.push([1, -1]);
            }
            if (getPiece(row + 1, col + 1)?.type != "" && getPiece(row + 1, col + 1)?.color !== piece.color) {
              moves.push([1, 1]);
            }
          } else {
            if (getPiece(row - 1, col)?.type === "") {
              moves.push([-1, 0]);
              if (!celula.hasMoved) {
                moves.push([-2, 0]);
              }
            }
            if (getPiece(row - 1, col - 1)?.type != "" && getPiece(row - 1, col - 1)?.color !== piece.color) {
              moves.push([-1, -1]);
            }
            if (getPiece(row - 1, col + 1)?.type != "" && getPiece(row - 1, col + 1)?.color !== piece.color) {
              moves.push([-1, 1]);
            }
          }
          break;
        case "rook":
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row + i, col);
            if (destino?.type === "") {
              moves.push([i, 0]);
            } else if (destino?.color !== piece.color) {
              moves.push([i, 0]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row - i, col);
            if (destino?.type === "") {
              moves.push([-i, 0]);
            } else if (destino?.color !== piece.color) {
              moves.push([-i, 0]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row, col + i);
            if (destino?.type === "") {
              moves.push([0, i]);
            } else if (destino?.color !== piece.color) {
              moves.push([0, i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row, col - i);
            if (destino?.type === "") {
              moves.push([0, -i]);
            } else if (destino?.color !== piece.color) {
              moves.push([0, -i]);
              break;
            } else {
              break;
            }
          }
          break;
        case "knight":
          const knightMoves = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
          ];
          knightMoves.forEach(([dr, dc]) => {
            const destino = getPiece(selecionada.row + dr, selecionada.col + dc);
            if (destino) {
              if (destino.type === "" || destino.color !== piece.color) {
                moves.push([dr, dc]);
              }
            }
          });
          break;
        case "bishop":
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row + i, col + i);
            if (destino?.type === "") {
              moves.push([i, i]);
            } else if (destino?.color !== piece.color) {
              moves.push([i, i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row - i, col + i);
            if (destino?.type === "") {
              moves.push([-i, i]);
            } else if (destino?.color !== piece.color) {
              moves.push([-i, i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row - i, col - i);
            if (destino?.type === "") {
              moves.push([-i, -i]);
            } else if (destino?.color !== piece.color) {
              moves.push([-i, -i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row + i, col - i);
            if (destino?.type === "") {
              moves.push([i, -i]);
            } else if (destino?.color !== piece.color) {
              moves.push([i, -i]);
              break;
            } else {
              break;
            }
          }
          break;
        case "queen":
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row + i, col);
            if (destino?.type === "") {
              moves.push([i, 0]);
            } else if (destino?.color !== piece.color) {
              moves.push([i, 0]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row - i, col);
            if (destino?.type === "") {
              moves.push([-i, 0]);
            } else if (destino?.color !== piece.color) {
              moves.push([-i, 0]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row, col + i);
            if (destino?.type === "") {
              moves.push([0, i]);
            } else if (destino?.color !== piece.color) {
              moves.push([0, i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row, col - i);
            if (destino?.type === "") {
              moves.push([0, -i]);
            } else if (destino?.color !== piece.color) {
              moves.push([0, -i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row + i, col + i);
            if (destino?.type === "") {
              moves.push([i, i]);
            } else if (destino?.color !== piece.color) {
              moves.push([i, i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row - i, col + i);
            if (destino?.type === "") {
              moves.push([-i, i]);
            } else if (destino?.color !== piece.color) {
              moves.push([-i, i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row - i, col - i);
            if (destino?.type === "") {
              moves.push([-i, -i]);
            } else if (destino?.color !== piece.color) {
              moves.push([-i, -i]);
              break;
            } else {
              break;
            }
          }
          for (let i = 1; i < 8; i++) {
            let destino = getPiece(row + i, col - i);
            if (destino?.type === "") {
              moves.push([i, -i]);
            } else if (destino?.color !== piece.color) {
              moves.push([i, -i]);
              break;
            } else {
              break;
            }
          }
          break;
        case "king":
          const kingMoves = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
          ];
          kingMoves.forEach(([dr, dc]) => {
            const destino = getPiece(selecionada.row + dr, selecionada.col + dc);
            if (destino) {
              if (destino.type === "" || destino.color !== piece.color) {
                moves.push([dr, dc]);
              }
            }
          });
        }
      return moves;
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

        selectpiece = null;
        clearHighlights();
        renderBoard();
        
        updateScore();
        
        if (!gameEnded) {
            
        }
    }

    function getSquare(row, col) {
      return chessboard.querySelector(`[data-row='${row}'][data-col='${col}']`);
    }

    function getPiece(row, col) {
      console.log("GetPiece - Linha: " + row + " Coluna: " + col);
      return board[row][col];
    }

    function clearHighlights() {
        document.querySelectorAll('.selected, .possible-move, .possible-capture').forEach(el => el.classList.remove('selected', 'possible-move', 'possible-capture'));
    }
    
    

    function updateScore() { 
        let whiteScore = 0; let blackScore = 0;
        for (let r = 0; r < 8; r++) { 
            for (let c = 0; c < 8; c++) { 
                const piece = board[r][c]; 
                if (piece && piece.type !== 'king') { 
                    if (piece.color === 'white') { 
                        whiteScore += pieceValues[piece.type]; 
                    } else { 
                        blackScore += pieceValues[piece.type]; 
                    } 
                } 
            } 
        }
        whiteScoreDisplay.textContent = whiteScore; 
        blackScoreDisplay.textContent = blackScore;
        
        if (whiteScore > blackScore) { 
            statusDisplay.textContent = 'Brancas estão amassando.'; 
        } else if (blackScore > whiteScore) { 
            statusDisplay.textContent = 'Pretas estão sarneando.'; 
        } else { 
            statusDisplay.textContent = 'O jogo está pegando.'; 
        }
        return { white: whiteScore, black: blackScore };
    }
    
    function addToHistory(piece, from, to, captured) {
        const time = new Date().toLocaleTimeString(); 
        const fromPos = `${String.fromCharCode(97 + from.col)}${8 - from.row}`; 
        const toPos = `${String.fromCharCode(97 + to.col)}${8 - to.row}`;     
        const color = piece.color === 'white' ? 'Brancas' : 'Pretas';
        
        const moveText = `${time} - ${color}: ${pieceUnicode[piece.color][piece.type]} de ${fromPos} para ${toPos}${captured ? ` (captura ${pieceUnicode[captured.color][captured.type]})` : ''}`;
        
        historico_movimento.push(moveText);
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