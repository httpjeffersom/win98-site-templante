const DesktopApp = (() => {
  const programas = new Map();
  let inicializado = false;

  const obterElemento = (id) => document.getElementById(id);

  function atualizarRelogio() {
    const relogio = obterElemento("relogio");

    if (!relogio) return;

    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");

    relogio.textContent = `${horas}:${minutos}`;
    relogio.title = agora.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function definirMenuIniciar(aberto) {
    const botao = obterElemento("iniciar-botao");
    const menu = obterElemento("menu-iniciar");

    if (!botao || !menu) return;

    menu.classList.toggle("aberto", aberto);
    botao.classList.toggle("ativo", aberto);
    botao.setAttribute("aria-expanded", String(aberto));
  }

  function configurarMenuIniciar() {
    const botao = obterElemento("iniciar-botao");
    const menu = obterElemento("menu-iniciar");

    if (!botao || !menu) return;

    botao.addEventListener("click", (evento) => {
      evento.stopPropagation();
      definirMenuIniciar(!menu.classList.contains("aberto"));
    });

    document.addEventListener("click", (evento) => {
      if (botao.contains(evento.target) || menu.contains(evento.target)) return;
      definirMenuIniciar(false);
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key !== "Escape") return;

      if (menu.classList.contains("aberto")) {
        definirMenuIniciar(false);
        botao.focus();
      }
    });

    menu.addEventListener("click", (evento) => {
      const item = evento.target.closest("[data-programa]");
      if (!item) return;

      abrirPrograma(item.dataset.programa);
      definirMenuIniciar(false);
    });
  }

  function configurarSelecaoDeIcones() {
    document.addEventListener("click", (evento) => {
      const clicado = evento.target.closest(".icone-desktop");

      document.querySelectorAll(".icone-desktop").forEach((icone) => {
        icone.classList.toggle("selecionado", icone === clicado);
      });
    });
  }

  function registrarPrograma({
    id,
    titulo,
    seletorIcone,
    caminhoHtml,
    largura,
    altura,
    icone,
  }) {
    if (!id || !titulo || !caminhoHtml) {
      return;
    }

    const elementoIcone = seletorIcone
      ? document.querySelector(seletorIcone)
      : null;

    const iconePrograma =
      icone ||
      elementoIcone?.querySelector("img")?.getAttribute("src") ||
      null;

    programas.set(id, {
      id,
      titulo,
      caminhoHtml,
      largura,
      altura,
      icone: iconePrograma,
    });

    if (!elementoIcone) return;

    elementoIcone.addEventListener("dblclick", () => abrirPrograma(id));

    // Enter e Espaço disparam "click" com detail 0 em botões.
    elementoIcone.addEventListener("click", (evento) => {
      if (evento.detail === 0) abrirPrograma(id);
    });
  }

  function abrirPrograma(id) {
    const programa = programas.get(id);

    if (!programa) {
      console.warn(`Programa não registrado: ${id}`);
      return null;
    }

    if (typeof WindowManager === "undefined") {
      console.warn(`janela.js ainda não foi carregado para abrir: ${programa.titulo}`);
      return null;
    }

    return WindowManager.criarJanela(programa.titulo, programa.caminhoHtml, {
      largura: programa.largura,
      altura: programa.altura,
      icone: programa.icone,
    });
  }

  function inicializar() {
    if (inicializado) return;

    inicializado = true;
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
    configurarMenuIniciar();
    configurarSelecaoDeIcones();
    definirMenuIniciar(false);
  }

  return {
    inicializar,
    registrarPrograma,
    abrirPrograma,
  };
})();

window.DesktopApp = DesktopApp;
DesktopApp.inicializar();
