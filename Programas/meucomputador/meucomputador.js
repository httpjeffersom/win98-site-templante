//criarJanela("Meu Computador");

const iconeMeuComputador = document.querySelector(".icon-meucomputer");

iconeMeuComputador.addEventListener("dblclick", () => {
  criarJanela(
    "💻 Meu Computador",
    "Programas/meucomputador/meucomputador.html"  
  );
});
