DesktopApp.registrarPrograma({
  id: "bloco-de-notas",
  titulo: "Bloco de Notas",
  seletorIcone: ".icon-notepad",
  caminhoHtml: "Programas/blocodenotas/blocodenotas.html",
  largura: 620,
  altura: 460,
});

(() => {
  const estados = new WeakMap();

  function encontrarBloco(alvo) {
    return alvo instanceof Element ? alvo.closest(".bloco-de-notas") : null;
  }

  function obterEstado(bloco) {
    let estado = estados.get(bloco);

    if (!estado) {
      estado = {
        nomeArquivo: "",
        notaId: null,
        sujo: false,
        quebraLinha: true,
        botaoTarefa: null,
      };
      estados.set(bloco, estado);
    }

    return estado;
  }

  function obterTexto(bloco) {
    return bloco.querySelector(".bloco-texto");
  }

  function obterDialogo(bloco, nome) {
    return bloco.querySelector(`[data-dialogo="${nome}"]`);
  }

  function dialogoAberto(bloco) {
    return (
      [...bloco.querySelectorAll(".bloco-dialogo")].find(
        (dialogo) => !dialogo.hidden,
      ) || null
    );
  }

  function fecharDialogos(bloco, devolverFoco = true) {
    bloco.querySelectorAll(".bloco-dialogo").forEach((dialogo) => {
      dialogo.hidden = true;
    });

    if (devolverFoco) obterTexto(bloco)?.focus();
  }

  function abrirDialogo(bloco, nome) {
    fecharDialogos(bloco, false);

    const dialogo = obterDialogo(bloco, nome);
    if (!dialogo) return null;

    dialogo.hidden = false;
    return dialogo;
  }

  function definirMensagem(bloco, mensagem) {
    const status = bloco.querySelector(".bloco-status-estado");
    if (status) status.textContent = mensagem;
  }

  function atualizarStatus(bloco) {
    const estado = obterEstado(bloco);
    const texto = obterTexto(bloco);
    const nome = bloco.querySelector(".bloco-status-arquivo");

    if (nome) {
      nome.textContent = estado.nomeArquivo
        ? `${estado.nomeArquivo}${estado.sujo ? " *" : ""}`
        : `Sem título${estado.sujo ? " *" : ""}`;
    }

    if (texto) {
      const posicao = texto.selectionStart ?? 0;
      const antes = texto.value.slice(0, posicao);
      const linha = antes.split("\n").length;
      const coluna = posicao - antes.lastIndexOf("\n");

      const posicaoStatus = bloco.querySelector(".bloco-status-posicao");
      if (posicaoStatus) {
        posicaoStatus.textContent = `Ln ${linha}, Col ${coluna}`;
      }
    }

    definirMensagem(bloco, estado.sujo ? "Modificado" : "Pronto");
  }

  function atualizarTitulo(bloco) {
    const estado = obterEstado(bloco);
    const janela = bloco.closest(".window");
    if (!janela) return;

    const titulo = estado.nomeArquivo
      ? `Bloco de Notas - ${estado.nomeArquivo}`
      : "Bloco de Notas";

    const textoTitulo = janela.querySelector(".window-title-text");
    if (textoTitulo) textoTitulo.textContent = titulo;

    if (!estado.botaoTarefa) {
      estado.botaoTarefa =
        [...document.querySelectorAll(".botao-programa")].find(
          (botao) => botao.textContent === "Bloco de Notas",
        ) || null;
    }

    if (estado.botaoTarefa) {
      const textoTarefa = estado.botaoTarefa.querySelector(
        ".botao-programa-texto",
      );

      if (textoTarefa) textoTarefa.textContent = titulo;
      estado.botaoTarefa.title = titulo;
    }
  }

  function marcarSujo(bloco, sujo) {
    const estado = obterEstado(bloco);
    estado.sujo = sujo;
    atualizarStatus(bloco);
  }

  function atualizarMenuArquivo(bloco) {
    const botao = bloco.querySelector('[data-acao="excluir-do-desktop"]');
    if (!botao) return;

    botao.disabled = !obterEstado(bloco).notaId;
  }

  function confirmarDescarte(bloco) {
    const estado = obterEstado(bloco);
    if (!estado.sujo) return true;

    const alvo = estado.nomeArquivo || "Sem título";
    return window.confirm(
      `As alterações em "${alvo}" não foram salvas. Deseja descartá-las?`,
    );
  }

  function inserirTexto(bloco, conteudo) {
    const texto = obterTexto(bloco);
    if (!texto) return;

    const inicio = texto.selectionStart ?? texto.value.length;
    const fim = texto.selectionEnd ?? inicio;

    texto.setRangeText(conteudo, inicio, fim, "end");
    texto.focus();
    marcarSujo(bloco, true);
  }

  function formatarData(valor) {
    return new Date(valor).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function novoDocumento(bloco) {
    if (!confirmarDescarte(bloco)) return;

    const texto = obterTexto(bloco);
    if (texto) {
      texto.value = "";
      texto.focus();
      texto.scrollTop = 0;
      texto.setSelectionRange(0, 0);
    }

    const estado = obterEstado(bloco);
    estado.nomeArquivo = "";
    estado.notaId = null;
    estado.sujo = false;

    atualizarMenuArquivo(bloco);
    atualizarTitulo(bloco);
    atualizarStatus(bloco);
  }

  function abrirArquivoDoComputador(bloco) {
    bloco.querySelector(".bloco-arquivo")?.click();
  }

  function gravarNota(bloco, nome) {
    if (typeof ArquivosDesktop === "undefined") {
      definirMensagem(bloco, "Armazenamento indisponível");
      return false;
    }

    const texto = obterTexto(bloco);
    const estado = obterEstado(bloco);
    const mesmoNome =
      estado.nomeArquivo &&
      nome.toLowerCase() === estado.nomeArquivo.toLowerCase();

    const nota = ArquivosDesktop.salvar({
      id: mesmoNome ? estado.notaId : null,
      nome,
      conteudo: texto.value,
    });

    if (!nota) {
      definirMensagem(bloco, "Não foi possível salvar no Desktop");
      return false;
    }

    estado.notaId = nota.id;
    estado.nomeArquivo = nota.nome;
    estado.sujo = false;

    fecharDialogos(bloco);
    atualizarMenuArquivo(bloco);
    atualizarTitulo(bloco);
    atualizarStatus(bloco);
    definirMensagem(bloco, "Salvo no Desktop");
    return true;
  }

  function abrirSalvarComo(bloco) {
    const dialogo = abrirDialogo(bloco, "salvar");
    if (!dialogo) return;

    const estado = obterEstado(bloco);
    const campo = dialogo.querySelector(".bloco-campo");
    const erro = dialogo.querySelector("[data-erro-salvar]");

    erro.hidden = true;
    erro.textContent = "";
    campo.value = estado.nomeArquivo || "";
    campo.focus();
    campo.select();
  }

  function salvarArquivo(bloco, como = false) {
    const estado = obterEstado(bloco);

    if (como || !estado.nomeArquivo) {
      abrirSalvarComo(bloco);
      return;
    }

    gravarNota(bloco, estado.nomeArquivo);
  }

  function atualizarListaArquivos(bloco) {
    const lista = bloco.querySelector(".bloco-lista-arquivos");
    const vazia = bloco.querySelector(".bloco-lista-vazia");
    const botaoAbrir = bloco.querySelector('[data-acao="abrir-selecionado"]');
    const notas =
      typeof ArquivosDesktop === "undefined" ? [] : ArquivosDesktop.listar();

    lista.replaceChildren();
    vazia.hidden = notas.length > 0;
    if (botaoAbrir) botaoAbrir.disabled = notas.length === 0;

    notas.forEach((nota) => {
      const item = document.createElement("li");
      const arquivo = document.createElement("button");

      arquivo.type = "button";
      arquivo.className = "bloco-arquivo-item";
      arquivo.dataset.arquivoId = nota.id;
      arquivo.setAttribute("aria-selected", "false");

      const imagem = document.createElement("img");
      imagem.src = "imagens/icons-desktop/notepad.png";
      imagem.alt = "";

      const nome = document.createElement("span");
      nome.className = "bloco-arquivo-nome";
      nome.textContent = nota.nome;

      const data = document.createElement("span");
      data.className = "bloco-arquivo-data";
      data.textContent = formatarData(nota.atualizadoEm);

      arquivo.append(imagem, nome, data);
      item.append(arquivo);
      lista.append(item);
    });
  }

  function abrirDialogoAbrir(bloco) {
    const dialogo = abrirDialogo(bloco, "abrir");
    if (!dialogo) return;

    atualizarListaArquivos(bloco);

    const primeiro = dialogo.querySelector(".bloco-arquivo-item");
    if (primeiro) {
      primeiro.setAttribute("aria-selected", "true");
      primeiro.focus();
    } else {
      dialogo.querySelector('[data-acao="abrir-selecionado"]')?.focus();
    }
  }

  function selecionarArquivo(item) {
    const bloco = encontrarBloco(item);
    if (!bloco) return;

    bloco.querySelectorAll(".bloco-arquivo-item").forEach((outro) => {
      outro.setAttribute("aria-selected", String(outro === item));
    });
  }

  function carregarNota(bloco, nota) {
    if (!nota) return false;
    if (!confirmarDescarte(bloco)) return false;

    const texto = obterTexto(bloco);
    const estado = obterEstado(bloco);

    if (texto) {
      texto.value = nota.conteudo;
      texto.focus();
      texto.scrollTop = 0;
      texto.setSelectionRange(0, 0);
    }

    estado.nomeArquivo = nota.nome;
    estado.notaId = nota.id;
    estado.sujo = false;

    atualizarMenuArquivo(bloco);
    atualizarTitulo(bloco);
    atualizarStatus(bloco);
    definirMensagem(bloco, "Arquivo aberto");
    return true;
  }

  function abrirNotaDoDesktop(bloco, id) {
    if (typeof ArquivosDesktop === "undefined") return;

    const nota = ArquivosDesktop.obter(id);
    if (carregarNota(bloco, nota)) fecharDialogos(bloco);
  }

  function abrirSelecionado(bloco) {
    const item = bloco.querySelector('.bloco-arquivo-item[aria-selected="true"]');
    if (!item) return;

    abrirNotaDoDesktop(bloco, item.dataset.arquivoId);
  }

  function sair(bloco) {
    if (!confirmarDescarte(bloco)) return;

    const janela = bloco.closest(".window");
    if (janela) WindowManager.fecharJanela(janela);
  }

  function excluirDoDesktop(bloco) {
    const estado = obterEstado(bloco);

    if (typeof ArquivosDesktop === "undefined" || !estado.notaId) {
      definirMensagem(bloco, "Este arquivo não está no Desktop");
      return;
    }

    const nota = ArquivosDesktop.obter(estado.notaId);

    if (!nota) {
      estado.notaId = null;
      atualizarMenuArquivo(bloco);
      atualizarStatus(bloco);
      definirMensagem(bloco, "Arquivo não encontrado no Desktop");
      return;
    }

    if (!window.confirm(`Excluir "${nota.nome}" do Desktop?`)) return;

    if (!ArquivosDesktop.remover(nota.id)) {
      definirMensagem(bloco, "Não foi possível excluir o arquivo");
      return;
    }

    estado.notaId = null;
    estado.sujo = true;

    atualizarMenuArquivo(bloco);
    atualizarTitulo(bloco);
    atualizarStatus(bloco);
    definirMensagem(bloco, "Arquivo excluído do Desktop");
  }

  function selecionarTudo(bloco) {
    const texto = obterTexto(bloco);
    if (!texto) return;

    texto.focus();
    texto.select();
    atualizarStatus(bloco);
  }

  function inserirHoraData(bloco) {
    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const data = agora.toLocaleDateString("pt-BR");

    inserirTexto(bloco, `${hora} ${data}`);
  }

  function alternarQuebraLinha(bloco) {
    const estado = obterEstado(bloco);
    const texto = obterTexto(bloco);
    const botao = bloco.querySelector('[data-acao="quebra-linha"]');

    estado.quebraLinha = !estado.quebraLinha;

    if (texto) {
      texto.wrap = estado.quebraLinha ? "soft" : "off";
      texto.focus();
    }

    if (botao) {
      botao.setAttribute("aria-pressed", String(estado.quebraLinha));
    }

    atualizarStatus(bloco);
    definirMensagem(
      bloco,
      estado.quebraLinha
        ? "Quebra de linha ativada"
        : "Quebra de linha desativada",
    );
  }

  function abrirSobre(bloco) {
    const dialogo = abrirDialogo(bloco, "sobre");
    if (!dialogo) return;

    dialogo.querySelector('[data-acao="fechar-dialogo"]')?.focus();
  }

  function fecharMenus(bloco) {
    bloco.querySelectorAll(".bloco-menu-botao").forEach((botao) => {
      botao.setAttribute("aria-expanded", "false");
    });

    bloco.querySelectorAll(".bloco-menu-lista").forEach((lista) => {
      lista.hidden = true;
    });
  }

  function alternarMenu(bloco, botao) {
    const lista = bloco.querySelector(`[data-lista="${botao.dataset.menu}"]`);
    if (!lista) return;

    const estavaAberto = botao.getAttribute("aria-expanded") === "true";
    fecharMenus(bloco);

    if (estavaAberto) return;

    botao.setAttribute("aria-expanded", "true");
    lista.hidden = false;

    if (botao.dataset.menu === "arquivo") atualizarMenuArquivo(bloco);
  }

  function executarAcao(bloco, acao) {
    fecharMenus(bloco);

    switch (acao) {
      case "novo":
        novoDocumento(bloco);
        break;
      case "abrir":
        abrirDialogoAbrir(bloco);
        break;
      case "salvar":
        salvarArquivo(bloco);
        break;
      case "salvar-como":
        salvarArquivo(bloco, true);
        break;
      case "excluir-do-desktop":
        excluirDoDesktop(bloco);
        break;
      case "sair":
        sair(bloco);
        break;
      case "selecionar-tudo":
        selecionarTudo(bloco);
        break;
      case "hora-data":
        inserirHoraData(bloco);
        break;
      case "quebra-linha":
        alternarQuebraLinha(bloco);
        break;
      case "sobre":
        abrirSobre(bloco);
        break;
      case "abrir-selecionado":
        abrirSelecionado(bloco);
        break;
      case "abrir-computador":
        fecharDialogos(bloco, false);
        abrirArquivoDoComputador(bloco);
        break;
      case "fechar-dialogo":
        fecharDialogos(bloco);
        break;
      default:
        break;
    }
  }

  function focarItemDaLista(lista, passo) {
    const itens = [...lista.querySelectorAll("button:not([disabled])")];
    if (!itens.length) return;

    const atual = itens.indexOf(document.activeElement);
    const proximo = (atual + passo + itens.length) % itens.length;
    itens[proximo].focus();
  }

  document.addEventListener("click", (evento) => {
    const botaoMenu = evento.target.closest(".bloco-menu-botao");

    if (botaoMenu) {
      const bloco = encontrarBloco(botaoMenu);
      if (bloco) alternarMenu(bloco, botaoMenu);
      return;
    }

    const itemArquivo = evento.target.closest(".bloco-arquivo-item");

    if (itemArquivo) {
      selecionarArquivo(itemArquivo);
      return;
    }

    const acao = evento.target.closest(".bloco-de-notas [data-acao]");

    if (acao) {
      const bloco = encontrarBloco(acao);
      if (bloco) executarAcao(bloco, acao.dataset.acao);
      return;
    }

    const bloco = encontrarBloco(evento.target);

    if (bloco) {
      fecharMenus(bloco);
      return;
    }

    document.querySelectorAll(".bloco-de-notas").forEach(fecharMenus);
  });

  document.addEventListener("dblclick", (evento) => {
    const item = evento.target.closest(".bloco-arquivo-item");
    if (!item) return;

    const bloco = encontrarBloco(item);
    if (bloco) abrirNotaDoDesktop(bloco, item.dataset.arquivoId);
  });

  document.addEventListener("pointerover", (evento) => {
    const botao = evento.target.closest(".bloco-menu-botao");
    if (!botao) return;

    const bloco = encontrarBloco(botao);
    if (!bloco) return;

    const temMenuAberto = bloco.querySelector(
      '.bloco-menu-botao[aria-expanded="true"]',
    );
    if (!temMenuAberto || temMenuAberto === botao) return;

    alternarMenu(bloco, botao);
  });

  document.addEventListener("input", (evento) => {
    const bloco = encontrarBloco(evento.target);
    if (!bloco || !evento.target.matches(".bloco-texto")) return;

    marcarSujo(bloco, true);
  });

  ["keyup", "click", "select"].forEach((tipo) => {
    document.addEventListener(tipo, (evento) => {
      const bloco = encontrarBloco(evento.target);
      if (!bloco || !evento.target.matches(".bloco-texto")) return;

      atualizarStatus(bloco);
    });
  });

  document.addEventListener("submit", (evento) => {
    const formulario = evento.target.closest('[data-formulario="salvar"]');
    if (!formulario) return;

    evento.preventDefault();

    const bloco = encontrarBloco(formulario);
    if (!bloco) return;

    const campo = formulario.querySelector(".bloco-campo");
    const erro = formulario.querySelector("[data-erro-salvar]");
    const nome =
      typeof ArquivosDesktop === "undefined"
        ? ""
        : ArquivosDesktop.normalizarNome(campo.value);

    if (!nome) {
      erro.textContent = "Digite um nome de arquivo válido.";
      erro.hidden = false;
      campo.focus();
      return;
    }

    const estado = obterEstado(bloco);
    const existente = ArquivosDesktop.listar().find(
      (nota) => nota.nome.toLowerCase() === nome.toLowerCase(),
    );

    if (existente && existente.id !== estado.notaId) {
      const substituir = window.confirm(
        `Já existe "${nome}" no Desktop. Deseja substituir?`,
      );

      if (!substituir) {
        campo.focus();
        return;
      }
    }

    gravarNota(bloco, nome);
  });

  document.addEventListener("change", async (evento) => {
    const entrada = evento.target.closest(".bloco-arquivo");
    if (!entrada) return;

    const bloco = encontrarBloco(entrada);
    const arquivo = entrada.files?.[0];
    entrada.value = "";

    if (!bloco || !arquivo) return;
    if (!confirmarDescarte(bloco)) return;

    try {
      const conteudo = await arquivo.text();
      const texto = obterTexto(bloco);
      const estado = obterEstado(bloco);

      if (texto) {
        texto.value = conteudo;
        texto.focus();
        texto.scrollTop = 0;
        texto.setSelectionRange(0, 0);
      }

      estado.nomeArquivo = arquivo.name;
      estado.notaId = null;
      estado.sujo = true;

      atualizarMenuArquivo(bloco);
      atualizarTitulo(bloco);
      atualizarStatus(bloco);
      definirMensagem(bloco, "Arquivo importado do computador");
    } catch {
      definirMensagem(bloco, "Não foi possível abrir o arquivo");
    }
  });

  document.addEventListener("bloco:abrir-nota", (evento) => {
    const bloco = encontrarBloco(evento.target);
    if (!bloco || !evento.detail) return;

    if (!carregarNota(bloco, evento.detail)) evento.preventDefault();
  });

  document.addEventListener("keydown", (evento) => {
    const bloco = encontrarBloco(evento.target);
    if (!bloco) return;

    if (evento.key === "Escape") {
      const dialogo = dialogoAberto(bloco);

      if (dialogo) {
        evento.preventDefault();
        fecharDialogos(bloco);
        return;
      }

      const menuAberto = bloco.querySelector(
        '.bloco-menu-botao[aria-expanded="true"]',
      );

      if (menuAberto) {
        evento.preventDefault();
        fecharMenus(bloco);
        menuAberto.focus();
      }
      return;
    }

    if (dialogoAberto(bloco)) return;

    const itemMenu = evento.target.closest(".bloco-menu-lista button");

    if (itemMenu) {
      if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
        evento.preventDefault();
        focarItemDaLista(
          itemMenu.closest(".bloco-menu-lista"),
          evento.key === "ArrowDown" ? 1 : -1,
        );
        return;
      }

      if (evento.key === "Tab") {
        fecharMenus(bloco);
        return;
      }
    }

    const botaoMenu = evento.target.closest(".bloco-menu-botao");

    if (botaoMenu && evento.key === "ArrowDown") {
      evento.preventDefault();
      alternarMenu(bloco, botaoMenu);
      const lista = bloco.querySelector(
        `[data-lista="${botaoMenu.dataset.menu}"]`,
      );
      if (lista) focarItemDaLista(lista, 1);
      return;
    }

    if (
      evento.key === "Tab" &&
      !evento.shiftKey &&
      evento.target.matches(".bloco-texto")
    ) {
      evento.preventDefault();
      inserirTexto(bloco, "\t");
      atualizarStatus(bloco);
      return;
    }

    if (evento.key === "F5") {
      evento.preventDefault();
      inserirHoraData(bloco);
      atualizarStatus(bloco);
      return;
    }

    if (!evento.ctrlKey && !evento.metaKey) return;

    if (evento.key.toLowerCase() === "s" && evento.shiftKey) {
      evento.preventDefault();
      salvarArquivo(bloco, true);
      return;
    }

    const atalhos = {
      n: "novo",
      o: "abrir",
      s: "salvar",
      a: "selecionar-tudo",
    };
    const acao = atalhos[evento.key.toLowerCase()];

    if (!acao) return;

    evento.preventDefault();
    executarAcao(bloco, acao);
  });
})();
