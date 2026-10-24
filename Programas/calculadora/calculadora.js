DesktopApp.registrarPrograma({
  id: "calculadora",
  titulo: "Calculadora",
  seletorIcone: ".icon-calculadora",
  caminhoHtml: "Programas/calculadora/calculadora.html",
  largura: 296,
  altura: 400,
});

(() => {
  const estados = new WeakMap();
  const operacoes = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => a / b,
  };

  function obterEstado(calculadora) {
    let estado = estados.get(calculadora);

    if (!estado) {
      estado = {
        display: "0",
        acumulado: null,
        operacao: null,
        aguardaOperando: false,
        memoria: null,
        erro: false,
      };
      estados.set(calculadora, estado);
    }

    return estado;
  }

  function formatarNumero(numero) {
    if (!Number.isFinite(numero)) return "Erro";
    if (Object.is(numero, -0)) return "0";
    const arredondado = Number.parseFloat(numero.toPrecision(12));
    const texto = String(arredondado);
    return texto.length > 15 ? arredondado.toExponential(8) : texto;
  }

  function atualizar(calculadora) {
    const estado = obterEstado(calculadora);
    const visor = calculadora.querySelector(".calculadora-display");
    const memoria = calculadora.querySelector(".calculadora-memoria");
    if (visor) visor.textContent = estado.display;
    if (memoria) memoria.textContent = estado.memoria === null ? "" : "M";
  }

  function mostrarErro(calculadora) {
    const estado = obterEstado(calculadora);
    estado.display = "Erro";
    estado.acumulado = null;
    estado.operacao = null;
    estado.aguardaOperando = true;
    estado.erro = true;
    atualizar(calculadora);
  }

  function inserirDigito(calculadora, digito) {
    const estado = obterEstado(calculadora);
    if (estado.erro || estado.aguardaOperando) {
      estado.display = digito;
      estado.aguardaOperando = false;
      estado.erro = false;
    } else if (estado.display === "0") {
      estado.display = digito;
    } else if (estado.display.replace(/[-.]/g, "").length < 15) {
      estado.display += digito;
    }
    atualizar(calculadora);
  }

  function inserirDecimal(calculadora) {
    const estado = obterEstado(calculadora);
    if (estado.erro || estado.aguardaOperando) {
      estado.display = "0.";
      estado.erro = false;
      estado.aguardaOperando = false;
    } else if (!estado.display.includes(".")) {
      estado.display += ".";
    }
    atualizar(calculadora);
  }

  function executarOperacao(calculadora, proximaOperacao) {
    const estado = obterEstado(calculadora);
    if (estado.erro) return;

    const atual = Number(estado.display);
    if (estado.operacao && !estado.aguardaOperando) {
      const resultado = operacoes[estado.operacao](estado.acumulado, atual);
      if (!Number.isFinite(resultado)) {
        mostrarErro(calculadora);
        return;
      }
      estado.display = formatarNumero(resultado);
      estado.acumulado = resultado;
    } else {
      estado.acumulado = atual;
    }

    estado.operacao = proximaOperacao;
    estado.aguardaOperando = true;
    atualizar(calculadora);
  }

  function calcularResultado(calculadora) {
    const estado = obterEstado(calculadora);
    if (!estado.operacao || estado.acumulado === null || estado.erro) return;

    const resultado = operacoes[estado.operacao](
      estado.acumulado,
      Number(estado.display),
    );
    if (!Number.isFinite(resultado)) {
      mostrarErro(calculadora);
      return;
    }

    estado.display = formatarNumero(resultado);
    estado.acumulado = null;
    estado.operacao = null;
    estado.aguardaOperando = true;
    atualizar(calculadora);
  }

  function aplicarAcao(calculadora, acao) {
    const estado = obterEstado(calculadora);
    const valor = Number(estado.display);
    const acoesDuranteErro = [
      "clear",
      "clear-entry",
      "memory-clear",
      "memory-recall",
    ];
    if (estado.erro && !acoesDuranteErro.includes(acao)) return;

    switch (acao) {
      case "clear":
        estado.display = "0";
        estado.acumulado = null;
        estado.operacao = null;
        estado.aguardaOperando = false;
        estado.erro = false;
        break;
      case "clear-entry":
        estado.display = "0";
        estado.erro = false;
        estado.aguardaOperando = false;
        break;
      case "backspace":
        if (!estado.aguardaOperando && !estado.erro) {
          estado.display = estado.display.length > 1
            ? estado.display.slice(0, -1)
            : "0";
          if (estado.display === "-") estado.display = "0";
        }
        break;
      case "sign":
        if (valor !== 0 && !estado.erro) {
          estado.display = formatarNumero(-valor);
        }
        break;
      case "decimal":
        inserirDecimal(calculadora);
        return;
      case "percent": {
        const porcentagem = estado.operacao && estado.acumulado !== null
          ? estado.acumulado * valor / 100
          : valor / 100;
        estado.display = formatarNumero(porcentagem);
        estado.aguardaOperando = false;
        break;
      }
      case "square-root":
        if (valor < 0 || estado.erro) {
          mostrarErro(calculadora);
          return;
        }
        estado.display = formatarNumero(Math.sqrt(valor));
        estado.aguardaOperando = true;
        break;
      case "reciprocal":
        if (valor === 0 || estado.erro) {
          mostrarErro(calculadora);
          return;
        }
        estado.display = formatarNumero(1 / valor);
        estado.aguardaOperando = true;
        break;
      case "memory-clear":
        estado.memoria = null;
        break;
      case "memory-recall":
        if (estado.memoria !== null) {
          estado.display = formatarNumero(estado.memoria);
          estado.aguardaOperando = true;
          estado.erro = false;
        }
        break;
      case "memory-store":
        estado.memoria = valor;
        break;
      case "memory-add":
        estado.memoria = (estado.memoria || 0) + valor;
        break;
      case "equals":
        calcularResultado(calculadora);
        return;
      default:
        return;
    }

    atualizar(calculadora);
  }

  function encontrarCalculadora(alvo) {
    return alvo instanceof Element ? alvo.closest(".calculadora") : null;
  }

  document.addEventListener("click", (evento) => {
    const calculadora = encontrarCalculadora(evento.target);
    const botao = evento.target.closest("[data-calc-action], [data-calc-value], [data-calc-op]");
    if (!calculadora || !botao) return;

    if (botao.dataset.calcValue !== undefined) {
      inserirDigito(calculadora, botao.dataset.calcValue);
    } else if (botao.dataset.calcOp) {
      executarOperacao(calculadora, botao.dataset.calcOp);
    } else {
      aplicarAcao(calculadora, botao.dataset.calcAction);
    }
  });

  document.addEventListener("keydown", (evento) => {
    const calculadora = encontrarCalculadora(evento.target);
    if (!calculadora || evento.altKey || evento.ctrlKey || evento.metaKey) return;

    // Enter e Espaço em um botão focado já disparam o clique nativo.
    if (
      evento.target.closest("button") &&
      (evento.key === "Enter" || evento.key === " ")
    ) {
      return;
    }

    const teclasDigito = evento.key.match(/^\d$/);
    if (teclasDigito) {
      inserirDigito(calculadora, teclasDigito[0]);
      evento.preventDefault();
      return;
    }

    const operacoesTeclado = {
      "+": "add",
      "-": "subtract",
      "*": "multiply",
      "/": "divide",
    };
    if (operacoesTeclado[evento.key]) {
      executarOperacao(calculadora, operacoesTeclado[evento.key]);
      evento.preventDefault();
    } else if (evento.key === "Enter" || evento.key === "=") {
      calcularResultado(calculadora);
      evento.preventDefault();
    } else if (evento.key === "." || evento.key === ",") {
      inserirDecimal(calculadora);
      evento.preventDefault();
    } else if (evento.key === "Backspace") {
      aplicarAcao(calculadora, "backspace");
      evento.preventDefault();
    } else if (evento.key === "Escape" || evento.key === "Delete") {
      aplicarAcao(calculadora, "clear");
      evento.preventDefault();
    } else if (evento.key === "%") {
      aplicarAcao(calculadora, "percent");
      evento.preventDefault();
    }
  });
})();
