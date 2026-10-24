const IconesDesktop = (() => {
  const chave = "jeffersom.net:icones";
  const passoX = 84;
  const passoY = 78;
  const margemX = 8;
  const margemY = 10;
  const distanciaMinima = 60;

  function obterArea() {
    return document.getElementById("icones-desktop");
  }

  function ler() {
    try {
      const bruto = window.localStorage.getItem(chave);
      if (!bruto) return {};

      const dados = JSON.parse(bruto);
      return dados && typeof dados === "object" ? dados : {};
    } catch {
      return {};
    }
  }

  function gravar(posicoes) {
    try {
      window.localStorage.setItem(chave, JSON.stringify(posicoes));
      return true;
    } catch (erro) {
      console.error("Não foi possível salvar as posições dos ícones:", erro);
      return false;
    }
  }

  function limites(icone) {
    const area = obterArea();

    return {
      largura: Math.max(0, area.clientWidth - icone.offsetWidth),
      altura: Math.max(0, area.clientHeight - icone.offsetHeight),
    };
  }

  function posicionar(icone, x, y) {
    const { largura, altura } = limites(icone);

    icone.style.left = `${Math.min(Math.max(0, x), largura)}px`;
    icone.style.top = `${Math.min(Math.max(0, y), altura)}px`;
  }

  function posicaoAtual(icone) {
    return { x: icone.offsetLeft, y: icone.offsetTop };
  }

  function ocupado(x, y, usados) {
    return usados.some(
      (posicao) =>
        Math.abs(posicao.x - x) < distanciaMinima &&
        Math.abs(posicao.y - y) < distanciaMinima,
    );
  }

  function gerarSlots() {
    const area = obterArea();
    const porColuna = Math.max(
      1,
      Math.floor((area.clientHeight - margemY) / passoY),
    );
    const colunas = Math.max(
      1,
      Math.ceil((area.clientWidth - margemX) / passoX),
    );
    const slots = [];

    for (let coluna = 0; coluna < colunas; coluna += 1) {
      for (let linha = 0; linha < porColuna; linha += 1) {
        slots.push({
          x: margemX + coluna * passoX,
          y: margemY + linha * passoY,
        });
      }
    }

    return slots;
  }

  function posicionarTodos() {
    const area = obterArea();
    if (!area) return;

    const posicoes = ler();
    const usados = [];
    const slots = gerarSlots();
    let alterou = false;

    area.querySelectorAll(".icone-desktop").forEach((icone) => {
      const id = icone.dataset.icone;
      const salva = id ? posicoes[id] : null;

      if (
        salva &&
        Number.isFinite(salva.x) &&
        Number.isFinite(salva.y)
      ) {
        posicionar(icone, salva.x, salva.y);
      } else {
        const livre =
          slots.find((slot) => !ocupado(slot.x, slot.y, usados)) ||
          slots[slots.length - 1] || { x: margemX, y: margemY };

        posicionar(icone, livre.x, livre.y);

        if (id) {
          posicoes[id] = posicaoAtual(icone);
          alterou = true;
        }
      }

      usados.push(posicaoAtual(icone));
    });

    if (alterou) gravar(posicoes);
  }

  function esquecer(id) {
    const posicoes = ler();
    if (!(id in posicoes)) return;

    delete posicoes[id];
    gravar(posicoes);
  }

  /* Arraste dos ícones */

  let arraste = null;

  function mover(evento) {
    if (!arraste || evento.pointerId !== arraste.pointerId) return;

    const deslocamentoX = evento.clientX - arraste.inicioX;
    const deslocamentoY = evento.clientY - arraste.inicioY;

    if (
      !arraste.movido &&
      Math.hypot(deslocamentoX, deslocamentoY) < 4
    ) {
      return;
    }

    if (!arraste.movido) {
      arraste.movido = true;
      arraste.icone.classList.add("arrastando");
    }

    posicionar(
      arraste.icone,
      arraste.origemX + deslocamentoX,
      arraste.origemY + deslocamentoY,
    );
  }

  function finalizarArraste(evento) {
    if (!arraste || (evento && evento.pointerId !== arraste.pointerId)) {
      return;
    }

    const { icone, movido } = arraste;
    arraste = null;

    icone.classList.remove("arrastando");

    window.removeEventListener("pointermove", mover);
    window.removeEventListener("pointerup", finalizarArraste);
    window.removeEventListener("pointercancel", finalizarArraste);

    if (!movido) return;

    const id = icone.dataset.icone;
    if (!id) return;

    const posicoes = ler();
    posicoes[id] = posicaoAtual(icone);
    gravar(posicoes);
  }

  document.addEventListener("pointerdown", (evento) => {
    if (evento.button !== 0) return;

    const icone = evento.target.closest(".icone-desktop");
    if (!icone) return;

    const posicao = posicaoAtual(icone);

    arraste = {
      icone,
      pointerId: evento.pointerId,
      inicioX: evento.clientX,
      inicioY: evento.clientY,
      origemX: posicao.x,
      origemY: posicao.y,
      movido: false,
    };

    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", finalizarArraste);
    window.addEventListener("pointercancel", finalizarArraste);
  });

  window.addEventListener("resize", posicionarTodos);

  posicionarTodos();

  return {
    chave,
    posicionarTodos,
    esquecer,
  };
})();

window.IconesDesktop = IconesDesktop;
