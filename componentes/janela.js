const WindowManager = (() => {
  class WindowManager {
    constructor() {
      this.janelas = new Map();
    }

    ativarArraste(janela) {
      const desktop = document.getElementById("desktop");
      let arrastando = false;
      let offsetX = 0;
      let offsetY = 0;

      const iniciarArraste = (evento) => {
        if (evento.button !== 0) return;

        const alvoInterativo = evento.target.closest(
          "button, input, select, textarea, a",
        );

        if (alvoInterativo) return;

        arrastando = true;
        janela.classList.add("arrastando");

        const rect = janela.getBoundingClientRect();
        offsetX = evento.clientX - rect.left;
        offsetY = evento.clientY - rect.top;

        evento.preventDefault();
      };

      const moverJanela = (evento) => {
        if (!arrastando) return;

        const rectDesktop = desktop.getBoundingClientRect();
        let novaEsquerda = evento.clientX - offsetX - rectDesktop.left;
        let novaTopo = evento.clientY - offsetY - rectDesktop.top;

        const limiteEsquerda = 0;
        const limiteTopo = 0;
        const limiteDireita = rectDesktop.width - janela.offsetWidth;
        const limiteBaixo = rectDesktop.height - janela.offsetHeight;

        novaEsquerda = Math.max(
          limiteEsquerda,
          Math.min(novaEsquerda, limiteDireita),
        );
        novaTopo = Math.max(limiteTopo, Math.min(novaTopo, limiteBaixo));

        janela.style.left = `${novaEsquerda}px`;
        janela.style.top = `${novaTopo}px`;
      };

      const pararArraste = () => {
        if (!arrastando) return;

        arrastando = false;
        janela.classList.remove("arrastando");
      };

      janela.addEventListener("mousedown", iniciarArraste);
      window.addEventListener("mousemove", moverJanela);
      window.addEventListener("mouseup", pararArraste);
    }

    async criarJanela(titulo, arquivoHtml) {
      const janela = document.createElement("div");
      const desktop = document.getElementById("desktop");

      janela.className = "window";

      const largura = desktop.clientWidth * 0.8;
      const altura = desktop.clientHeight * 0.8;

      janela.style.width = `${largura}px`;
      janela.style.height = `${altura}px`;
      janela.style.left = `${(desktop.clientWidth - largura) / 2}px`;
      janela.style.top = `${(desktop.clientHeight - altura) / 2}px`;

      janela.innerHTML = `
        <div class="window-title">
          <span>${titulo}</span>

          <div class="window-buttons">
            <button class="minimizar" title="Minimizar">_</button>
            <button class="fechar" title="Fechar">×</button>
          </div>
        </div>

        <div class="window-content">
          Carregando...
        </div>
      `;

      desktop.appendChild(janela);
      this.criarBotaoPrograma(janela, titulo);
      this.janelas.set(janela, { titulo, arquivoHtml });

      try {
        const resposta = await fetch(arquivoHtml);

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar o arquivo.");
        }

        const html = await resposta.text();
        janela.querySelector(".window-content").innerHTML = html;

        if (janela.querySelector(".calculadora")) {
          const largura = Math.max(
            220,
            Math.min(296, desktop.clientWidth - 16),
          );
          const altura = Math.max(
            300,
            Math.min(400, desktop.clientHeight - 16),
          );

          janela.style.width = `${largura}px`;
          janela.style.height = `${altura}px`;
          janela.style.left = `${(desktop.clientWidth - largura) / 2}px`;
          janela.style.top = `${(desktop.clientHeight - altura) / 2}px`;
        }
      } catch (erro) {
        janela.querySelector(".window-content").innerHTML = `
          <p>Erro ao carregar o programa.</p>
        `;

        console.error(erro);
      }

      const botaoMinimizar = janela.querySelector(".minimizar");
      botaoMinimizar.addEventListener("click", (evento) => {
        evento.stopPropagation();
        this.alternarEstadoJanela(janela);
      });

      const botaoFechar = janela.querySelector(".fechar");
      botaoFechar.addEventListener("click", (evento) => {
        evento.stopPropagation();
        this.removerBotaoPrograma(janela);
        this.janelas.delete(janela);
        janela.remove();
      });

      this.ativarArraste(janela);
    }

    criarBotaoPrograma(janela, titulo) {
      const area = document.getElementById("programas-abertos");
      const botao = document.createElement("button");

      botao.className = "botao-programa";
      botao.textContent = titulo;
      area.appendChild(botao);

      janela.botaoPrograma = botao;

      botao.addEventListener("click", () => {
        this.alternarEstadoJanela(janela);
      });
    }

    alternarEstadoJanela(janela) {
      const minimizada = janela.classList.contains("minimizada");

      if (minimizada) {
        janela.classList.remove("minimizada");
        janela.style.display = "flex";
      } else {
        janela.classList.add("minimizada");
        janela.style.display = "none";
      }

      if (janela.botaoPrograma) {
        janela.botaoPrograma.classList.toggle(
          "ativo",
          !janela.classList.contains("minimizada"),
        );
      }
    }

    removerBotaoPrograma(janela) {
      if (janela.botaoPrograma) {
        janela.botaoPrograma.remove();
      }
    }
  }

  const manager = new WindowManager();

  return {
    ativarArraste: (janela) => manager.ativarArraste(janela),
    criarJanela: (titulo, arquivoHtml) => manager.criarJanela(titulo, arquivoHtml),
    criarBotaoPrograma: (janela, titulo) =>
      manager.criarBotaoPrograma(janela, titulo),
    alternarEstadoJanela: (janela) => manager.alternarEstadoJanela(janela),
    removerBotaoPrograma: (janela) => manager.removerBotaoPrograma(janela),
  };
})();

function ativarArraste(janela) {
  return WindowManager.ativarArraste(janela);
}

async function criarJanela(titulo, arquivoHtml) {
  return WindowManager.criarJanela(titulo, arquivoHtml);
}

function criarBotaoPrograma(janela, titulo) {
  return WindowManager.criarBotaoPrograma(janela, titulo);
}

function alternarEstadoJanela(janela) {
  return WindowManager.alternarEstadoJanela(janela);
}

function removerBotaoPrograma(janela) {
  return WindowManager.removerBotaoPrograma(janela);
}

window.WindowManager = WindowManager;
