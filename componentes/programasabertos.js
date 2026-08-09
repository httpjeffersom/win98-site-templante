function criarBotaoPrograma(janela, titulo) {
  const area = document.getElementById("programas-abertos");

  const botao = document.createElement("button");

  botao.className = "botao-programa";
  botao.textContent = titulo;

  area.appendChild(botao);

  // Guarda referência do botão na janela
  janela.botaoPrograma = botao;

  // Ao clicar, mostra a janela
  botao.addEventListener("click", () => {
    janela.style.display = "block";
  });
}

function removerBotaoPrograma(janela) {
  if (janela.botaoPrograma) {
    janela.botaoPrograma.remove();
  }
}
