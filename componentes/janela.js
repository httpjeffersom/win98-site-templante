function ativarArraste(janela) {
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

async function criarJanela(titulo, arquivoHtml) {
  const janela = document.createElement("div");

  janela.className = "window";

  const desktop = document.getElementById("desktop");

  // Tamanho da janela
  const largura = desktop.clientWidth * 0.8;
  const altura = desktop.clientHeight * 0.8;

  janela.style.width = `${largura}px`;
  janela.style.height = `${altura}px`;

  // Centraliza
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

  // Botão na barra de tarefas
  criarBotaoPrograma(janela, titulo);

  // Carrega o HTML do programa
  try {
    const resposta = await fetch(arquivoHtml);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar o arquivo.");
    }

    const html = await resposta.text();

    janela.querySelector(".window-content").innerHTML = html;
  } catch (erro) {
    janela.querySelector(".window-content").innerHTML = `
            <p>Erro ao carregar o programa.</p>
        `;

    console.error(erro);
  }

  const botaoMinimizar = janela.querySelector(".minimizar");

  botaoMinimizar.addEventListener("click", (evento) => {
    evento.stopPropagation();
    alternarEstadoJanela(janela);
  });

  // Fechar
  const botaoFechar = janela.querySelector(".fechar");

  botaoFechar.addEventListener("click", (evento) => {
    evento.stopPropagation();

    removerBotaoPrograma(janela);

    janela.remove();
  });

  // Arrastar
  ativarArraste(janela);
}
