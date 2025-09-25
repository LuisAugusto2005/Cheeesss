function getPossibleMoves(piece, row, col) {
    let moves = [];
    switch (piece.type) {
        case "pawn":
            let dir = piece.color === "white" ? -1 : 1;
            if (!getPiece(row + dir, col)) {
                moves.push([dir, 0]);
                if (!piece.hasMoved && !getPiece(row + 2 * dir, col)) moves.push([2 * dir, 0]);
            }
            [[dir, -1], [dir, 1]].forEach(([r, c]) => {
                let target = getPiece(row + r, col + c);
                if (target && target.color !== piece.color) moves.push([r, c]);
            });
            break;
        case "rook":
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    let target = getPiece(row + dr * i, col + dc * i);
                    if (!target) moves.push([dr * i, dc * i]);
                    else { if (target.color !== piece.color) moves.push([dr * i, dc * i]); break; }
                }
            });
            break;
        case "knight":
            [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
                let target = getPiece(row + dr, col + dc);
                if (!target || target.color !== piece.color) moves.push([dr, dc]);
            });
            break;
        case "bishop":
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    let target = getPiece(row + dr * i, col + dc * i);
                    if (!target) moves.push([dr * i, dc * i]);
                    else { if (target.color !== piece.color) moves.push([dr * i, dc * i]); break; }
                }
            });
            break;
        case "queen":
            [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    let target = getPiece(row + dr * i, col + dc * i);
                    if (!target) moves.push([dr * i, dc * i]);
                    else { if (target.color !== piece.color) moves.push([dr * i, dc * i]); break; }
                }
            });
            break;
        case "king":
            [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                let t = getPiece(row + dr, col + dc);
                if (!t || t.color !== piece.color) moves.push([dr, dc]);
            });
            if (piece.hasMoved) break;
            const Kr = piece.color === "white" ? 7 : 0;
            for (const { rookPos, path, move } of [{ rookPos: 7, path: [5, 6], move: [0, 2] }, { rookPos: 0, path: [1, 2, 3], move: [0, -2] }]) {
                let r = getPiece(Kr, rookPos);
                if (r && r.type === "rook" && !r.hasMoved && r.color === piece.color && path.every(c => !getPiece(Kr, c)))
                    moves.push(move);
            }
            break;
    }
    return moves.filter(([r, c]) => inBoard(row + r, col + c));
}

//funções utilitárias do tabuleiro
function inBoard(row, col) { return row >= 0 && row < 8 && col >= 0 && col < 8; }
function getSquare(row, col) { return inBoard(row, col) ? chessboard.querySelector(`[data-row='${row}'][data-col='${col}']`) : null; }
function getPiece(row, col) { return inBoard(row, col) ? board[row][col] || null : null; }

//Alta Coesão: deve ter uma responsabilidade única e focada. Todas as funções dentro dele trabalham para um objetivo em comum.
//Alta Coesão: Módulo dedicado exclusivamente ao controle de peças e regras do xadrez

//Baixo Acoplamento: regraXadrez.js não sabe nada sobre os outros arquivos.
//Especialista na Informação (Information Expert): É o princípio que nos ajuda a decidir onde colocar uma função. A responsabilidade de fazer algo deve ser dada ao módulo que já tem a maior parte da informação necessária para aquilo.