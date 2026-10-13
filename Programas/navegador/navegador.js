DesktopApp.registrarPrograma({
  id: "navegador",
  titulo: "Navegador da Internet",
  seletorIcone: ".icon-navegador",
  caminhoHtml: "Programas/navegador/navegador.html",
});

(() => {
  const estados = new WeakMap();
  const paginaInicial = { tipo: "inicio", url: "https://www.google.com/" };
  function obterEstado(navegador) {
    let estado = estados.get(navegador);

    if (!estado) {
      estado = {
        historico: [paginaInicial],
        indice: 0,
        paginaInicialHtml: navegador.querySelector(".pagina-inicial").innerHTML,
      };
      estados.set(navegador, estado);
    }

    return estado;
  }

  function definirStatus(navegador, mensagem) {
    const status = navegador.querySelector(".texto-status");
    if (status) status.textContent = mensagem;
  }

  function atualizarEndereco(navegador, url) {
    const endereco = navegador.querySelector("#endereco");
    if (endereco) endereco.value = url;
  }

  function mostrarPagina(navegador, pagina) {
    const inicial = navegador.querySelector(".pagina-inicial");
    const externa = navegador.querySelector(".pagina-externa");
    if (!inicial || !externa) return;

    atualizarEndereco(navegador, pagina.url);
    if (pagina.tipo === "inicio") {
      inicial.hidden = false;
      externa.hidden = true;
      externa.removeAttribute("src");
      inicial.innerHTML = obterEstado(navegador).paginaInicialHtml;
      definirStatus(navegador, "Concluído");
      return;
    }

    if (pagina.tipo === "busca") {
      externa.hidden = true;
      externa.removeAttribute("src");
      renderizarResultados(navegador, pagina.consulta, pagina.url);
      definirStatus(navegador, "Resultados da pesquisa");
      return;
    }

    inicial.hidden = true;
    externa.hidden = false;
    externa.src = pagina.url;
    definirStatus(navegador, `Abrindo ${pagina.url}`);
  }

  function registrarPagina(navegador, pagina, adicionarAoHistorico = true) {
    const estado = obterEstado(navegador);

    if (adicionarAoHistorico) {
      estado.historico = estado.historico.slice(0, estado.indice + 1);
      estado.historico.push(pagina);
      estado.indice = estado.historico.length - 1;
    }

    mostrarPagina(navegador, pagina);
  }

  function navegarPara(navegador, valor) {
    const texto = valor.trim();
    if (!texto) {
      definirStatus(navegador, "Digite um endereço para continuar.");
      return;
    }

    const temProtocolo = /^[a-z][a-z\d+.-]*:/i.test(texto);
    const eLocalhost = /^localhost(?::\d+)?(?:\/|$)/i.test(texto);
    if (
      !temProtocolo &&
      (/\s/.test(texto) || (!texto.includes(".") && !eLocalhost))
    ) {
      pesquisar(navegador, texto);
      return;
    }

    let url;
    try {
      url = new URL(temProtocolo ? texto : `http://${texto}`);
    } catch {
      definirStatus(navegador, "O endereço informado não é válido.");
      return;
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      definirStatus(navegador, "Este tipo de endereço não é compatível.");
      return;
    }

    const endereco = url.href;
    const pagina = { tipo: "externa", url: endereco };

    if (
      url.hostname === "busca.local" &&
      url.pathname === "/"
    ) {
      pagina.tipo = "inicio";
      pagina.url = paginaInicial.url;
    } else if (
      url.hostname === "busca.local" &&
      url.pathname === "/search"
    ) {
      pagina.tipo = "busca";
      pagina.consulta = url.searchParams.get("q") || "";
      abrirUrlEmNovaAba(criarUrlBuscaGoogle(pagina.consulta));
    } else if (
      ["google.com", "www.google.com"].includes(url.hostname) &&
      url.pathname === "/"
    ) {
      pagina.tipo = "inicio";
      pagina.url = paginaInicial.url;
    } else if (
      ["google.com", "www.google.com"].includes(url.hostname) &&
      url.pathname === "/search"
    ) {
      pagina.tipo = "busca";
      pagina.consulta = url.searchParams.get("q") || "";
      abrirUrlEmNovaAba(criarUrlBuscaGoogle(pagina.consulta));
    }

    registrarPagina(navegador, pagina);
  }

  function renderizarResultados(navegador, consulta, urlBusca) {
    const inicial = navegador.querySelector(".pagina-inicial");
    const resultado = document.createElement("section");
    resultado.className = "pagina-resultados";

    const cabecalho = document.createElement("form");
    cabecalho.className = "resultados-cabecalho";
    cabecalho.innerHTML = `
      <div class="logo-busca" aria-label="Busca Web">Busca</div>
      <input name="q" type="search" aria-label="Pesquisar na Web">
      <button type="submit">Pesquisar</button>`;
    cabecalho.querySelector("input").value = consulta;
    resultado.append(cabecalho);

    const aviso = document.createElement("p");
    aviso.className = "aviso-busca";
    aviso.textContent = "Se a nova aba não abriu, use este link para ver os resultados atualizados:";
    resultado.append(aviso);

    const link = document.createElement("a");
    link.href = urlBusca || criarUrlBuscaGoogle(consulta);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `Ver resultados para “${consulta}” no Google`;
    resultado.append(link);

    inicial.replaceChildren(resultado);
    inicial.hidden = false;
    navegador.querySelector(".pagina-externa").hidden = true;
  }

  function pesquisar(navegador, consulta, estouComSorte = false) {
    const termo = consulta.trim();
    if (!termo) {
      definirStatus(navegador, "Digite um termo para pesquisar.");
      navegador.querySelector("#campo-busca")?.focus();
      return;
    }

    const url = criarUrlBuscaGoogle(termo, estouComSorte);
    abrirUrlEmNovaAba(url);
    registrarPagina(navegador, {
      tipo: "busca",
      url,
      consulta: termo,
    });
    definirStatus(navegador, "Pesquisa enviada. Os resultados abrem em outra aba.");
  }

  function criarUrlBuscaGoogle(consulta, estouComSorte = false) {
    const url = new URL("https://www.google.com/search");
    url.searchParams.set("q", consulta);
    if (estouComSorte) url.searchParams.set("btnI", "1");
    return url.href;
  }

  function abrirUrlEmNovaAba(url) {
    const novaAba = window.open(url, "_blank");
    if (novaAba) novaAba.opener = null;
  }

  function voltarOuAvancar(navegador, direcao) {
    const estado = obterEstado(navegador);
    const proximo = estado.indice + direcao;
    if (proximo < 0 || proximo >= estado.historico.length) {
      definirStatus(navegador, "Não há mais páginas no histórico.");
      return;
    }
    estado.indice = proximo;
    mostrarPagina(navegador, estado.historico[estado.indice]);
  }

  function encontrarNavegador(alvo) {
    return alvo.closest(".navegador");
  }

  document.addEventListener("submit", (evento) => {
    const navegador = encontrarNavegador(evento.target);
    if (!navegador) return;

    evento.preventDefault();
    if (evento.target.matches(".barra-endereco")) {
      navegarPara(navegador, navegador.querySelector("#endereco").value);
    } else if (evento.target.matches(".form-busca")) {
      pesquisar(navegador, evento.target.elements.q.value);
    } else if (evento.target.matches(".resultados-cabecalho")) {
      pesquisar(navegador, evento.target.elements.q.value);
    }
  });

  document.addEventListener("click", (evento) => {
    const navegador = encontrarNavegador(evento.target);
    if (!navegador) return;

    const link = evento.target.closest("a[data-url]");
    if (link) {
      evento.preventDefault();
      navegarPara(navegador, link.dataset.url);
      return;
    }

    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;

    switch (botao.dataset.acao) {
      case "inicio":
        registrarPagina(navegador, { ...paginaInicial });
        break;
      case "voltar":
        voltarOuAvancar(navegador, -1);
        break;
      case "avancar":
        voltarOuAvancar(navegador, 1);
        break;
      case "atualizar": {
        const estado = obterEstado(navegador);
        const pagina = estado.historico[estado.indice];
        if (pagina.tipo === "busca") abrirUrlEmNovaAba(pagina.url);
        mostrarPagina(navegador, pagina);
        break;
      }
      case "parar":
        navegador.querySelector(".pagina-externa").contentWindow.stop();
        definirStatus(navegador, "Carregamento interrompido");
        break;
      case "foco-busca":
        navegador.querySelector("#campo-busca")?.focus();
        break;
      case "favoritos":
        definirStatus(navegador, "Escolha um favorito na barra Links.");
        break;
      case "sorte":
        pesquisar(navegador, navegador.querySelector("#campo-busca").value, true);
        break;
      case "nova-aba": {
        const estado = obterEstado(navegador);
        const pagina = estado.historico[estado.indice];
        abrirUrlEmNovaAba(
          pagina.tipo === "inicio" ? "https://www.google.com/" : pagina.url,
        );
        break;
      }
      default:
        break;
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter" || !evento.target.matches("#endereco")) return;
    evento.preventDefault();
    const navegador = encontrarNavegador(evento.target);
    if (navegador) navegarPara(navegador, evento.target.value);
  });

  document.addEventListener("load", (evento) => {
    if (!evento.target.matches(".pagina-externa")) return;
    const navegador = encontrarNavegador(evento.target);
    if (navegador) definirStatus(navegador, "Concluído");
  }, true);
})();
