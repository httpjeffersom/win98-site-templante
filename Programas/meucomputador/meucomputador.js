DesktopApp.registrarPrograma({
  id: "meu-computador",
  titulo: "Meu Computador",
  seletorIcone: ".icon-meucomputer",
  caminhoHtml: "Programas/meucomputador/meucomputador.html",
});

document.addEventListener("click", (evento) => {
  const item = evento.target.closest(".meucomputador [data-programa]");
  if (!item) return;

  DesktopApp.abrirPrograma(item.dataset.programa);
});
