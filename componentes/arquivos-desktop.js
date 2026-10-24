const ArquivosDesktop = (() => {
  const chave = "jeffersom.net:notas";
  const limiteNome = 60;

  function ler() {
    try {
      const bruto = window.localStorage.getItem(chave);
      if (!bruto) return [];

      const lista = JSON.parse(bruto);
      if (!Array.isArray(lista)) return [];

      return lista.filter(
        (nota) =>
          nota &&
          typeof nota.id === "string" &&
          typeof nota.nome === "string" &&
          typeof nota.conteudo === "string",
      );
    } catch {
      return [];
    }
  }

  function gravar(lista) {
    try {
      window.localStorage.setItem(chave, JSON.stringify(lista));
      return true;
    } catch (erro) {
      console.error("Não foi possível gravar os arquivos do Desktop:", erro);
      return false;
    }
  }

  function criarId() {
    return `nota-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizarNome(valor) {
    const limpo = String(valor)
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limiteNome);

    if (!limpo) return "";

    return /\.[a-z0-9]{1,6}$/i.test(limpo) ? limpo : `${limpo}.txt`;
  }

  function listar() {
    return ler().sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
    );
  }

  function obter(id) {
    return ler().find((nota) => nota.id === id) || null;
  }

  function salvar({ id, nome, conteudo }) {
    const lista = ler();
    const alvo = nome.toLowerCase();

    let indice = lista.findIndex(
      (nota) => nota.nome.toLowerCase() === alvo,
    );

    if (indice === -1 && id) {
      indice = lista.findIndex((nota) => nota.id === id);
    }

    const nota = {
      id: indice >= 0 ? lista[indice].id : criarId(),
      nome,
      conteudo,
      atualizadoEm: Date.now(),
    };

    if (indice >= 0) {
      lista[indice] = nota;
    } else {
      lista.push(nota);
    }

    if (!gravar(lista)) return null;

    renderizar();
    return nota;
  }

  function remover(id) {
    const lista = ler().filter((nota) => nota.id !== id);
    if (!gravar(lista)) return false;

    window.IconesDesktop?.esquecer(`nota:${id}`);
    renderizar();
    return true;
  }

  function criarIcone(nota) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "icon-nota icone-desktop";
    botao.dataset.notaId = nota.id;
    botao.dataset.icone = `nota:${nota.id}`;
    botao.title = `${nota.nome} — salvo no Desktop`;
    botao.setAttribute("aria-label", `Abrir ${nota.nome}`);

    const imagem = document.createElement("img");
    imagem.src = "imagens/icons-desktop/notepad.png";
    imagem.alt = "";

    const texto = document.createElement("span");
    texto.textContent = nota.nome;

    botao.append(imagem, texto);
    return botao;
  }

  function renderizar() {
    const area = document.getElementById("icones-desktop");
    if (!area) return;

    area.querySelectorAll("[data-nota-id]").forEach((icone) => icone.remove());

    const fragmento = document.createDocumentFragment();
    listar().forEach((nota) => fragmento.append(criarIcone(nota)));
    area.append(fragmento);

    window.IconesDesktop?.posicionarTodos();
  }

  async function abrir(id) {
    const nota = obter(id);
    if (!nota) return;

    if (typeof DesktopApp === "undefined") return;

    const janela = await DesktopApp.abrirPrograma("bloco-de-notas");
    const bloco = janela?.querySelector(".bloco-de-notas");
    if (!bloco) return;

    bloco.dispatchEvent(
      new CustomEvent("bloco:abrir-nota", {
        detail: nota,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  /* Menu de contexto dos arquivos do Desktop */

  let notaDoMenu = null;

  function obterMenu() {
    return document.getElementById("menu-arquivo-desktop");
  }

  function fecharMenu() {
    const menu = obterMenu();
    if (!menu) return;

    menu.hidden = true;
    notaDoMenu = null;
  }

  function abrirMenu(x, y, id) {
    const menu = obterMenu();
    if (!menu) return;

    notaDoMenu = id;
    menu.hidden = false;
    menu.style.left = "0px";
    menu.style.top = "0px";

    const esquerda = Math.min(x, window.innerWidth - menu.offsetWidth - 4);
    const topo = Math.min(y, window.innerHeight - menu.offsetHeight - 4);

    menu.style.left = `${Math.max(0, esquerda)}px`;
    menu.style.top = `${Math.max(0, topo)}px`;
    menu.querySelector("button")?.focus();
  }

  function excluirDoMenu() {
    if (!notaDoMenu) return;

    const nota = obter(notaDoMenu);
    if (!nota) return;

    if (window.confirm(`Excluir "${nota.nome}" do Desktop?`)) {
      remover(nota.id);
    }
  }

  document.addEventListener("dblclick", (evento) => {
    const icone = evento.target.closest("[data-nota-id]");
    if (!icone) return;

    abrir(icone.dataset.notaId);
  });

  document.addEventListener("click", (evento) => {
    const acao = evento.target.closest("[data-acao-desktop]");

    if (acao) {
      const id = notaDoMenu;
      fecharMenu();

      if (!id) return;

      if (acao.dataset.acaoDesktop === "abrir") {
        abrir(id);
      } else if (acao.dataset.acaoDesktop === "excluir") {
        notaDoMenu = id;
        excluirDoMenu();
      }
      return;
    }

    const icone = evento.target.closest("[data-nota-id]");

    if (icone && evento.detail === 0) {
      abrir(icone.dataset.notaId);
      return;
    }

    fecharMenu();
  });

  document.addEventListener("contextmenu", (evento) => {
    const icone = evento.target.closest("[data-nota-id]");

    if (!icone) {
      fecharMenu();
      return;
    }

    evento.preventDefault();
    abrirMenu(evento.clientX, evento.clientY, icone.dataset.notaId);
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      fecharMenu();
      return;
    }

    if (evento.key !== "Delete") return;

    const icone = evento.target.closest?.("[data-nota-id]");
    if (!icone) return;

    evento.preventDefault();

    const nota = obter(icone.dataset.notaId);
    if (!nota) return;

    if (window.confirm(`Excluir "${nota.nome}" do Desktop?`)) {
      remover(nota.id);
    }
  });

  window.addEventListener("resize", fecharMenu);
  window.addEventListener("blur", fecharMenu);

  window.addEventListener("storage", (evento) => {
    if (evento.key === chave) renderizar();
  });

  renderizar();

  return {
    chave,
    listar,
    obter,
    salvar,
    remover,
    renderizar,
    abrir,
    normalizarNome,
  };
})();

window.ArquivosDesktop = ArquivosDesktop;
