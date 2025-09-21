
    const linhas = 8;
    const colunas = 8;
    const tabela = document.getElementById("tabuleiro");
    let selecionada = null;
    
        const pecasIniciais = [
      ["♜","♞","♝","♛","♚","♝","♞","♜"],
      ["♟","♟","♟","♟","♟","♟","♟","♟"],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["♙","♙","♙","♙","♙","♙","♙","♙"],
      ["♖","♘","♗","♕","♔","♗","♘","♖"]
    ];
    

    function criarMatriz() {
      for (let i = 0; i < linhas; i++) {
        const linha = document.createElement("tr");

        for (let j = 0; j < colunas; j++) {
          const celula = document.createElement("td");
          celula.textContent = pecasIniciais[i][j];

          celula.style.fontSize = "40px";
          celula.style.textAlign = "center";
          
          celula.row = i;
          celula.col = j;

          celula.vezesmovidos = 0;

          switch (celula.textContent) {
            case "♜": celula.tipo = "torre"; celula.cor = "preto"; break;
            case "♞": celula.tipo = "cavalo"; celula.cor = "preto"; break;
            case "♝": celula.tipo = "bispo"; celula.cor = "preto"; break;
            case "♛": celula.tipo = "rainha"; celula.cor = "preto"; break;
            case "♚": celula.tipo = "rei"; celula.cor = "preto"; break;
            case "♟": celula.tipo = "peao"; celula.cor = "preto"; break;
            case "♖": celula.tipo = "torre"; celula.cor = "branco"; break;
            case "♘": celula.tipo = "cavalo"; celula.cor = "branco"; break;
            case "♗": celula.tipo = "bispo"; celula.cor = "branco"; break;
            case "♕": celula.tipo = "rainha"; celula.cor = "branco"; break;
            case "♔": celula.tipo = "rei"; celula.cor = "branco"; break;
            case "♙": celula.tipo = "peao"; celula.cor = "branco"; break;
            default: celula.tipo = ""; celula.cor = ""; break;
          }
          
          celula.addEventListener("click", () => clicarCelula(celula));

          if ((i + j) % 2 === 0) {
            celula.classList.add("branco");
          } else {
            celula.classList.add("preto");
          }

          linha.appendChild(celula);
        }

        tabela.appendChild(linha);
      }
    }

    function clicarCelula(celula) {
        
        if (!selecionada && celula.textContent !== "") {
            selecionada = celula;
            celula.classList.add("selecionado");
            mostrarPossiveisMovimentos(possiveisMovimentos(celula));
        } else if (selecionada) {
            if (celula.classList.contains("movimento-possivel")) {
                moverPeca(selecionada, celula);
                selecionada.classList.remove("selecionado");
                selecionada = null;
            } else {
                tabela.querySelectorAll(".movimento-possivel").forEach(cel => cel.classList.remove("movimento-possivel"));
                selecionada.classList.remove("selecionado");
                selecionada = null;
            }
        } 
    }

    function moverPeca(origem, destino) {
      destino.textContent = origem.textContent;
      destino.tipo = origem.tipo;
      destino.cor = origem.cor;
      destino.vezesmovidos = origem.vezesmovidos + 1;
      tabela.querySelectorAll(".movimento-possivel").forEach(cel => cel.classList.remove("movimento-possivel"));
      origem.tipo = "";
      origem.cor = "";
      origem.textContent = "";
      origem.vezesmovidos = 0;
    }

function possiveisMovimentos(celula) {
  let row = celula.row;
  let col = celula.col;
  let movimentos = [];

  switch (celula.tipo) {
    case "peao":
      if (celula.cor === "preto") {
        if (getCelula(row + 1, col)?.tipo === "") {
          movimentos.push([1, 0]);
          if (celula.vezesmovidos === 0) {
            movimentos.push([2, 0]);
          }
        }
        if (getCelula(row + 1, col - 1)?.tipo != "" && getCelula(row + 1, col - 1)?.cor !== celula.cor) {
          movimentos.push([1, -1]);
        }
        if (getCelula(row + 1, col + 1)?.tipo != "" && getCelula(row + 1, col + 1)?.cor !== celula.cor) {
          movimentos.push([1, 1]);
        }
      } else {
        if (getCelula(row - 1, col)?.tipo === "") {
          movimentos.push([-1, 0]);
          if (celula.vezesmovidos === 0) {
            movimentos.push([-2, 0]);
          }
        }
        if (getCelula(row - 1, col - 1)?.tipo != "" && getCelula(row - 1, col - 1)?.cor !== celula.cor) {
          movimentos.push([-1, -1]);
        }
        if (getCelula(row - 1, col + 1)?.tipo != "" && getCelula(row - 1, col + 1)?.cor !== celula.cor) {
          movimentos.push([-1, 1]);
        }
      }
      break;
    case "torre":
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row + i, col);
        if (destino?.tipo === "") {
          movimentos.push([i, 0]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([i, 0]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row - i, col);
        if (destino?.tipo === "") {
          movimentos.push([-i, 0]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([-i, 0]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row, col + i);
        if (destino?.tipo === "") {
          movimentos.push([0, i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([0, i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row, col - i);
        if (destino?.tipo === "") {
          movimentos.push([0, -i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([0, -i]);
          break;
        } else {
          break;
        }
      }
      break;
    case "cavalo":
      const cavaloMovs = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
      ];
      cavaloMovs.forEach(([dr, dc]) => {
        const destino = getCelula(selecionada.row + dr, selecionada.col + dc);
        if (destino) {
          if (destino.tipo === "" || destino.cor !== celula.cor) {
            movimentos.push([dr, dc]);
          }
        }
      });
      break;
    case "bispo":
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row + i, col + i);
        if (destino?.tipo === "") {
          movimentos.push([i, i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([i, i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row - i, col + i);
        if (destino?.tipo === "") {
          movimentos.push([-i, i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([-i, i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row - i, col - i);
        if (destino?.tipo === "") {
          movimentos.push([-i, -i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([-i, -i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row + i, col - i);
        if (destino?.tipo === "") {
          movimentos.push([i, -i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([i, -i]);
          break;
        } else {
          break;
        }
      }
      break;
    case "rainha":
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row + i, col);
        if (destino?.tipo === "") {
          movimentos.push([i, 0]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([i, 0]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row - i, col);
        if (destino?.tipo === "") {
          movimentos.push([-i, 0]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([-i, 0]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row, col + i);
        if (destino?.tipo === "") {
          movimentos.push([0, i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([0, i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row, col - i);
        if (destino?.tipo === "") {
          movimentos.push([0, -i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([0, -i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row + i, col + i);
        if (destino?.tipo === "") {
          movimentos.push([i, i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([i, i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row - i, col + i);
        if (destino?.tipo === "") {
          movimentos.push([-i, i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([-i, i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row - i, col - i);
        if (destino?.tipo === "") {
          movimentos.push([-i, -i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([-i, -i]);
          break;
        } else {
          break;
        }
      }
      for (let i = 1; i < 8; i++) {
        let destino = getCelula(row + i, col - i);
        if (destino?.tipo === "") {
          movimentos.push([i, -i]);
        } else if (destino?.cor !== celula.cor) {
          movimentos.push([i, -i]);
          break;
        } else {
          break;
        }
      }
      break;
    case "rei":
      const reiMovs = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];
      reiMovs.forEach(([dr, dc]) => {
        const destino = getCelula(selecionada.row + dr, selecionada.col + dc);
        if (destino) {
          if (destino.tipo === "" || destino.cor !== celula.cor) {
            movimentos.push([dr, dc]);
          }
        }
      });
    }
  return movimentos;
}


    function mostrarPossiveisMovimentos(movimentos) {
      movimentos.forEach(([ir, ic]) => {
        const destino = getCelula(selecionada.row + ir, selecionada.col + ic);
        if (destino) {
          destino.classList.add("movimento-possivel");
        }
      });
    }
    
    function getCelula(row, col) {
      return tabela.rows[row]?.cells[col] || null;
    }

    criarMatriz();