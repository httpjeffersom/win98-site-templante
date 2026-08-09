const iconeNavegador = document.querySelector(".icon-navegador");

iconeNavegador.addEventListener("dblclick", () => {
  criarJanela(
    "🌐 Navegador",

    `
        <iframe
        
            src="https://cat-bounce.com/message/index.html"
            width="100%"
            height="100%"
            frameborder="0">
        </iframe>
        `,
  );
});
