const WindowManager = (() => {
  const janelas = new Map();
  let zIndexAtual = 10;
  let janelaAtiva = null;

  const obterDesktop = () => document.getElementById("desktop");

  function limitarPosicao(janela) {
    const desktop = obterDesktop();
    if (!desktop) return;

    const esquerdaMaxima = Math.max(0, desktop.clientWidth - janela.offsetWidth);
    const topoMaximo = Math.max(0, desktop.clientHeight - janela.offsetHeight);
    const esquerda = Number.parseFloat(janela.style.left) || 0;
    const topo = Number.parseFloat(janela.style.top) || 0;

    janela.style.left = `${Math.min(Math.max(0, esquerda), esquerdaMaxima)}px`;
    janela.style.top = `${Math.min(Math.max(0, topo), topoMaximo)}px`;
  }

  function atualizarBarraDeTarefas() {
    janelas.forEach((registro, janela) => {
      if (!registro.botao) return;

      const ativa =
        janela === janelaAtiva && !janela.classList.contains("minimizada");

      registro.botao.classList.toggle("ativo", ativa);
      registro.botao.setAttribute("aria-pressed", String(ativa));
    });
  }

  function trazerParaFrente(janela) {
    if (!janelas.has(janela)) return;

    janelaAtiva = janela;
    zIndexAtual += 1;
    janela.style.zIndex = String(zIndexAtual);
    atualizarBarraDeTarefas();
  }

  function configurarArraste(janela) {
    const titulo = janela.querySelector(".window-title");
    const desktop = obterDesktop();
    if (!titulo || !desktop) return;

    let arrastando = false;
    let offsetX = 0;
    let offsetY = 0;

    const mover = (evento) => {
      if (!arrastando) return;

      const areaDesktop = desktop.getBoundingClientRect();
      const esquerdaMaxima = Math.max(0, areaDesktop.width - janela.offsetWidth);
      const topoMaximo = Math.max(0, areaDesktop.height - janela.offsetHeight);
      const esquerda = Math.min(
        Math.max(0, evento.clientX - offsetX - areaDesktop.left),
        esquerdaMaxima,
      );
      const topo = Math.min(
        Math.max(0, evento.clientY - offsetY - areaDesktop.top),
        topoMaximo,
      );

      janela.style.left = `${esquerda}px`;
      janela.style.top = `${topo}px`;
    };

    const soltar = (evento) => {
      if (!arrastando) return;

      arrastando = false;
      janela.classList.remove("arrastando");
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);

      if (evento && titulo.hasPointerCapture?.(evento.pointerId)) {
        titulo.releasePointerCapture(evento.pointerId);
      }
    };

    titulo.addEventListener("pointerdown", (evento) => {
      if (evento.button !== 0) return;
      if (evento.target.closest("button, a, input, select, textarea")) return;

      const areaJanela = janela.getBoundingClientRect();
      offsetX = evento.clientX - areaJanela.left;
      offsetY = evento.clientY - areaJanela.top;
      arrastando = true;
      janela.classList.add("arrastando");

      try {
        titulo.setPointerCapture(evento.pointerId);
      } catch {
        // Navegadores sem suporte a captura usam os listeners globais abaixo.
      }

      window.addEventListener("pointermove", mover);
      window.addEventListener("pointerup", soltar);
      window.addEventListener("pointercancel", soltar);
      evento.preventDefault();
    });

    janela.addEventListener("pointerdown", () => trazerParaFrente(janela));
    janela.addEventListener("focusin", () => trazerParaFrente(janela));
  }

  function montarJanela(titulo) {
    const janela = document.createElement("div");
    janela.className = "window";
    janela.setAttribute("role", "dialog");
    janela.setAttribute("aria-label", titulo);

    const barraTitulo = document.createElement("div");
    barraTitulo.className = "window-title";

    const textoTitulo = document.createElement("span");
    textoTitulo.className = "window-title-text";
    textoTitulo.textContent = titulo;

    const areaBotoes = document.createElement("div");
    areaBotoes.className = "window-buttons";

    const botaoMinimizar = document.createElement("button");
    botaoMinimizar.type = "button";
    botaoMinimizar.className = "minimizar";
    botaoMinimizar.title = "Minimizar";
    botaoMinimizar.setAttribute("aria-label", "Minimizar janela");
    botaoMinimizar.textContent = "_";

    const botaoFechar = document.createElement("button");
    botaoFechar.type = "button";
    botaoFechar.className = "fechar";
    botaoFechar.title = "Fechar";
    botaoFechar.setAttribute("aria-label", "Fechar janela");
    botaoFechar.textContent = "×";

    areaBotoes.append(botaoMinimizar, botaoFechar);
    barraTitulo.append(textoTitulo, areaBotoes);

    const conteudo = document.createElement("div");
    conteudo.className = "window-content";
    conteudo.textContent = "Carregando...";

    janela.append(barraTitulo, conteudo);

    return { janela, conteudo, botaoMinimizar, botaoFechar };
  }

  function calcularTamanho(desktop, opcoes) {
    const larguraDisponivel = Math.max(200, desktop.clientWidth - 16);
    const alturaDisponivel = Math.max(160, desktop.clientHeight - 16);
    const largura = Math.min(
      opcoes.largura ?? desktop.clientWidth * 0.8,
      larguraDisponivel,
    );
    const altura = Math.min(
      opcoes.altura ?? desktop.clientHeight * 0.8,
      alturaDisponivel,
    );

    return { largura, altura };
  }

  function posicionarNoCentro(janela, desktop) {
    const esquerda = Math.max(0, (desktop.clientWidth - janela.offsetWidth) / 2);
    const topo = Math.max(0, (desktop.clientHeight - janela.offsetHeight) / 2);

    janela.style.left = `${esquerda}px`;
    janela.style.top = `${topo}px`;
  }

  function criarBotaoPrograma(janela, titulo, icone) {
    const area = document.getElementById("programas-abertos");
    if (!area) return null;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-programa";
    botao.title = titulo;
    botao.setAttribute("aria-pressed", "false");

    const texto = document.createElement("span");
    texto.className = "botao-programa-texto";
    texto.textContent = titulo;

    if (icone) {
      const imagem = document.createElement("img");
      imagem.src = icone;
      imagem.alt = "";
      botao.append(imagem, texto);
    } else {
      botao.append(texto);
    }

    area.appendChild(botao);

    botao.addEventListener("click", () => {
      const minimizada = janela.classList.contains("minimizada");

      if (!minimizada && janela === janelaAtiva) {
        alternarEstadoJanela(janela);
        return;
      }

      if (minimizada) {
        alternarEstadoJanela(janela);
      } else {
        trazerParaFrente(janela);
      }
    });

    return botao;
  }

  function alternarEstadoJanela(janela) {
    if (!janelas.has(janela)) return;

    const minimizada = janela.classList.toggle("minimizada");
    janela.style.display = minimizada ? "none" : "flex";

    if (minimizada) {
      if (janelaAtiva === janela) janelaAtiva = null;
      atualizarBarraDeTarefas();
      return;
    }

    trazerParaFrente(janela);
  }

  function fecharJanela(janela) {
    const registro = janelas.get(janela);
    if (!registro) return;

    if (registro.botao) registro.botao.remove();
    janelas.delete(janela);
    janela.remove();

    if (janelaAtiva !== janela) {
      atualizarBarraDeTarefas();
      return;
    }

    janelaAtiva = null;

    const restantes = [...janelas.keys()].filter(
      (outra) => !outra.classList.contains("minimizada"),
    );
    const proxima = restantes[restantes.length - 1];

    if (proxima) {
      trazerParaFrente(proxima);
    } else {
      atualizarBarraDeTarefas();
    }
  }

  async function criarJanela(titulo, arquivoHtml, opcoes = {}) {
    const desktop = obterDesktop();
    if (!desktop) return null;

    const existente = [...janelas.keys()].find(
      (janela) => janela.dataset.arquivoHtml === arquivoHtml,
    );

    if (existente) {
      if (existente.classList.contains("minimizada")) {
        alternarEstadoJanela(existente);
      }
      trazerParaFrente(existente);
      return existente;
    }

    const { janela, conteudo, botaoMinimizar, botaoFechar } =
      montarJanela(titulo);

    janela.dataset.arquivoHtml = arquivoHtml;

    const { largura, altura } = calcularTamanho(desktop, opcoes);
    janela.style.width = `${largura}px`;
    janela.style.height = `${altura}px`;

    desktop.appendChild(janela);
    posicionarNoCentro(janela, desktop);

    const botao = criarBotaoPrograma(janela, titulo, opcoes.icone);
    janelas.set(janela, { titulo, arquivoHtml, botao });
    configurarArraste(janela);
    trazerParaFrente(janela);

    botaoMinimizar.addEventListener("click", (evento) => {
      evento.stopPropagation();
      alternarEstadoJanela(janela);
    });

    botaoFechar.addEventListener("click", (evento) => {
      evento.stopPropagation();
      fecharJanela(janela);
    });

    try {
      const resposta = await fetch(arquivoHtml);

      if (!resposta.ok) {
        throw new Error(`Não foi possível carregar ${arquivoHtml} (HTTP ${resposta.status}).`);
      }

      conteudo.innerHTML = await resposta.text();

      const focoInicial = conteudo.querySelector("[data-foco-inicial]");
      if (focoInicial && janela === janelaAtiva) focoInicial.focus();
    } catch (erro) {
      conteudo.replaceChildren();

      const mensagem = document.createElement("p");
      mensagem.className = "window-erro";
      mensagem.textContent = "Não foi possível carregar o programa.";

      const dica = document.createElement("p");
      dica.className = "window-erro-dica";
      dica.textContent =
        "Se você abriu o index.html direto do disco, inicie um servidor local (veja o README).";

      conteudo.append(mensagem, dica);
      console.error(erro);
    }

    return janela;
  }

  function ajustarJanelas() {
    janelas.forEach((_, janela) => limitarPosicao(janela));
  }

  window.addEventListener("resize", ajustarJanelas);

  return {
    criarJanela,
    fecharJanela,
    alternarEstadoJanela,
    trazerParaFrente,
  };
})();

window.WindowManager = WindowManager;
