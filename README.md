# ♟️ Projeto Zadrez em HTML/JavaScript
Este é um projeto de jogo de xadrez completo implementado em HTML, CSS e JavaScript puro. Ele oferece diversas funcionalidades e modos de jogo, incluindo um modo "Sandbox" para configuração de tabuleiro e um "Modo Aventura" externo desenvolvido com RPG Maker MV.

## 📂 Estrutura do Projeto
O projeto é organizado em arquivos JavaScript modulares, cada um com uma responsabilidade específica para manter a coesão e facilitar a manutenção.

**audio.js**: Gerencia a reprodução de áudio e a visualização no canvas.

**botLogic.js**: Contém a lógica de inteligência artificial dos bots, suas personalidades e reações.

**gameLogic.js**: O núcleo do jogo, controlando o estado do tabuleiro, o fluxo da partida e as regras principais.

**main.js**: Ponto de entrada da aplicação, configurando ouvintes de eventos e inicializando a interface.

**regrasXadrez.js**: Define as regras de movimento para todas as peças de xadrez e funções auxiliares do tabuleiro.

**UI.js**: Responsável por todas as interações e atualizações visuais na interface do usuário.

**sandbox.js**: Adiciona a lógica específica para o modo "Sandbox", permitindo a manipulação das peças no tabuleiro.

### 🕹️ Modo Aventura
Foi feito usando a ajuda da Engine _RPG Maker MV_ para passar uma experiencia divertida envolvendo todo o sistema do Zadrez.

## Diagrama de classe:
![GraficoDeClasse](DiagramaDeClasse.jpg)