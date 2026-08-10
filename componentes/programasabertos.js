function criarBotaoPrograma(janela, titulo) {
  const area = document.getElementById("programas-abertos");

  const botao = document.createElement("button");

  botao.className = "botao-programa";
  botao.textContent = titulo;

  area.appendChild(botao);

  // Guarda referência do botão na janela
  janela.botaoPrograma = botao;

  // Ao clicar, alterna entre mostrar e minimizar a janela
  botao.addEventListener("click", () => {
    alternarEstadoJanela(janela);
  });
}

function alternarEstadoJanela(janela) {
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

function removerBotaoPrograma(janela) {
  if (janela.botaoPrograma) {
    janela.botaoPrograma.remove();
  }
}
