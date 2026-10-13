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
  }

  function configurarMenuIniciar() {
    const botao = obterElemento("iniciar-botao");
    const menu = obterElemento("menu-iniciar");

    if (!botao || !menu) return;

    botao.addEventListener("click", (evento) => {
      evento.stopPropagation();
      const deveExibir = menu.style.display !== "flex";
      menu.style.display = deveExibir ? "flex" : "none";
    });

    document.addEventListener("click", (evento) => {
      const clicouNoBotao = botao.contains(evento.target);
      const clicouNoMenu = menu.contains(evento.target);

      if (!clicouNoBotao && !clicouNoMenu) {
        menu.style.display = "none";
      }
    });
  }

  function registrarPrograma({ id, titulo, seletorIcone, caminhoHtml }) {
    if (!id || !titulo || !seletorIcone || !caminhoHtml) {
      return;
    }

    programas.set(id, { id, titulo, seletorIcone, caminhoHtml });

    const icone = document.querySelector(seletorIcone);

    if (icone) {
      icone.addEventListener("dblclick", () => abrirPrograma(id));
    }
  }

  function abrirPrograma(id) {
    const programa = programas.get(id);

    if (!programa) {
      return;
    }

    if (typeof criarJanela === "function") {
      criarJanela(programa.titulo, programa.caminhoHtml);
      return;
    }

    console.warn(`janela.js ainda não foi carregado para abrir: ${programa.titulo}`);
  }

  function inicializar() {
    if (inicializado) return;

    inicializado = true;
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
    configurarMenuIniciar();
  }

  return {
    inicializar,
    registrarPrograma,
    abrirPrograma,
  };
})();

window.DesktopApp = DesktopApp;
DesktopApp.inicializar();
