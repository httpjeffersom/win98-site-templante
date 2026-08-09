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
                <button class="fechar">X</button>
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

    // Fechar
    const botaoFechar = janela.querySelector(".fechar");

    botaoFechar.addEventListener("click", () => {

        removerBotaoPrograma(janela);

        janela.remove();

    });

    // Arrastar
    ativarArraste(janela);

}