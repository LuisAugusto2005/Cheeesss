
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
          
          celula.addEventListener("click", () => clicarCelula(celula));

          celula.dataset.row = i;
          celula.dataset.col = j;

          celula.textContent = pecasIniciais[i][j];
          celula.style.fontSize = "40px";
          celula.style.textAlign = "center";
          
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
        } else if (selecionada) {
            celula.style.backgroundColor = "yellow";
            celula.textContent = selecionada.textContent;
            selecionada.textContent = "";
            selecionada.classList.remove("selecionado");
            selecionada = null;
        }
    }

    criarMatriz();