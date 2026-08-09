//criarJanela("Meu Computador");

const iconeMeuComputador = document.querySelector(".icon-meucomputer");

iconeMeuComputador.addEventListener("dblclick", () => {
  criarJanela(
    "💻 Meu Computador",

    `
        <button>📁 Disco Local (C:)</button><br><br>

        <button>💾 Drive A:</button><br><br>

        <button>🌐 Rede</button>
        `,
  );
});
