const canvas = document.getElementById("audio-visualizer");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioCtx, analyser, dataArray, animationId;
let currentAudio = { element: null, source: null, gainNode: null };
let nextAudio = { element: null, source: null, gainNode: null };
let currentTrackPath = null;

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
    currentAudio.gainNode = audioCtx.createGain();
    currentAudio.source.connect(currentAudio.gainNode);
    currentAudio.gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    currentAudio.element.play();
    currentTrackPath = audioFile;
    drawVisualizer();
}

function switchTrack(newTrackPath) {
    if (!newTrackPath || newTrackPath === currentTrackPath || !audioCtx) return;
    nextAudio.element = new Audio(newTrackPath);
    nextAudio.element.loop = true;
    nextAudio.element.crossOrigin = "anonymous";
    nextAudio.source = audioCtx.createMediaElementSource(nextAudio.element);
    nextAudio.gainNode = audioCtx.createGain();
    nextAudio.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    nextAudio.source.connect(nextAudio.gainNode);
    nextAudio.gainNode.connect(analyser);
    nextAudio.element.play();
    const fadeDuration = 2.0;
    currentAudio.gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeDuration);
    nextAudio.gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + fadeDuration);
    currentTrackPath = newTrackPath;
    setTimeout(() => {
        if (currentAudio.element) currentAudio.element.pause();
        currentAudio = { ...nextAudio };
        nextAudio = { element: null, source: null, gainNode: null };
    }, fadeDuration * 1000);
}

function drawVisualizer() {
    animationId = requestAnimationFrame(drawVisualizer);
    if (!analyser) return;
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
    if (currentAudio.element) { currentAudio.element.pause(); currentAudio.element = null; }
    if (nextAudio.element) { nextAudio.element.pause(); nextAudio.element = null; }
    currentTrackPath = null;
    if (audioCtx) { audioCtx.close().catch(e => {}); audioCtx = null; }
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
//Alta Coesão: deve ter uma responsabilidade única e focada. Todas as funções dentro dele trabalham para um objetivo em comum.
//Alta Coesão: Módulo dedicado exclusivamente ao controle de áudio e visualização
//Reusabilidade: Pode ser reutilizado em outros projetos que necessitem de controle de áudio
//Facilidade de Manutenção: Código organizado e focado em uma única responsabilidade, facilitando futuras modificações