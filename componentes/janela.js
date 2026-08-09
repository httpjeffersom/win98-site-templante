function criarJanela(titulo, conteudo) {
  const janela = document.createElement("div");

  janela.className = "window";

  const desktop = document.getElementById("desktop");

  // Define o tamanho da janela (80% do desktop)
  const largura = desktop.clientWidth * 0.8;
  const altura = desktop.clientHeight * 0.8;

  janela.style.width = `${largura}px`;
  janela.style.height = `${altura}px`;

  // Centraliza a janela no desktop
  janela.style.left = `${(desktop.clientWidth - largura) / 2}px`;
  janela.style.top = `${(desktop.clientHeight - altura) / 2}px`;

  janela.innerHTML = `
        <div class="window-title">
            <span>${titulo}</span>

            <div class="window-buttons">
                <button class="fechar">X</button>
            </div>
        </div>

        <div class="window-content">
            ${conteudo}
        </div>
    `;

  // Adiciona a janela ao desktop
  desktop.appendChild(janela);

  // Cria o botão correspondente na barra de tarefas
  criarBotaoPrograma(janela, titulo);

  // Botão de fechar
  const botaoFechar = janela.querySelector(".fechar");

  botaoFechar.addEventListener("click", () => {
    removerBotaoPrograma(janela);

    janela.remove();
  });

  // função para ativar o arraste da janela
  function ativarArraste(janela) {
    const barra = janela.querySelector(".window-title");
    const desktop = document.getElementById("desktop");

    let arrastando = false;
    let offsetX = 0;
    let offsetY = 0;

    barra.addEventListener("mousedown", (e) => {
      arrastando = true;

      offsetX = e.clientX - janela.offsetLeft;
      offsetY = e.clientY - janela.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (!arrastando) return;

      // Posição do mouse relativa ao desktop
      const rect = desktop.getBoundingClientRect();

      let novoLeft = e.clientX - rect.left - offsetX;
      let novoTop = e.clientY - rect.top - offsetY;

      const maxLeft = desktop.clientWidth - janela.offsetWidth;
      const maxTop = desktop.clientHeight - janela.offsetHeight;

      novoLeft = Math.max(0, Math.min(novoLeft, maxLeft));
      novoTop = Math.max(0, Math.min(novoTop, maxTop));

      janela.style.left = novoLeft + "px";
      janela.style.top = novoTop + "px";
    });

    document.addEventListener("mouseup", () => {
      arrastando = false;
    });
  }

  // Ativa o arraste da janela
  ativarArraste(janela);
}
