(() => {
  const botao = document.getElementById("botao-som-inicializacao");
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!botao || !AudioContext) {
    if (botao) {
      botao.disabled = true;
      botao.title = "Áudio não disponível neste navegador";
    }
    return;
  }

  let contexto;

  function tocarNota(frequencia, inicio, duracao, volume = 0.075) {
    const oscilador = contexto.createOscillator();
    const ganho = contexto.createGain();
    const comeco = inicio;
    const fim = comeco + duracao;

    oscilador.type = "triangle";
    oscilador.frequency.setValueAtTime(frequencia, comeco);
    ganho.gain.setValueAtTime(0, comeco);
    ganho.gain.linearRampToValueAtTime(volume, comeco + 0.025);
    ganho.gain.exponentialRampToValueAtTime(0.001, fim);
    oscilador.connect(ganho);
    ganho.connect(contexto.destination);
    oscilador.start(comeco);
    oscilador.stop(fim + 0.02);
  }

  async function tocarInicializacao() {
    if (!contexto) contexto = new AudioContext();

    try {
      await contexto.resume();
    } catch (erro) {
      botao.title = "Clique para permitir o som de inicialização";
      console.warn("A reprodução do som aguarda interação do usuário.", erro);
      return;
    }

    if (contexto.state !== "running") {
      botao.title = "Clique para permitir o som de inicialização";
      return;
    }

    const agora = contexto.currentTime + 0.04;
    const melodia = [
      [523.25, 0, 0.24],
      [659.25, 0.19, 0.24],
      [783.99, 0.38, 0.32],
      [1046.5, 0.66, 0.58],
    ];

    melodia.forEach(([frequencia, atraso, duracao]) => {
      tocarNota(frequencia, agora + atraso, duracao);
    });
    tocarNota(659.25, agora + 0.66, 0.58, 0.035);
    botao.title = "Reproduzir novamente o som de inicialização";
  }

  botao.addEventListener("click", tocarInicializacao);
  window.addEventListener("load", () => {
    tocarInicializacao();
  }, { once: true });
})();
