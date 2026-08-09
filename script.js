// relogio

function atualizarRelogio() {
  const agora = new Date();

  let horas = agora.getHours();
  let minutos = agora.getMinutes();

  horas = String(horas).padStart(2, "0");
  minutos = String(minutos).padStart(2, "0");

  document.getElementById("relogio").textContent = `${horas}:${minutos}`;
}

atualizarRelogio();

setInterval(atualizarRelogio, 1000);

//Menu iniciar

const botao = document.getElementById("iniciar-botao");
const menu = document.getElementById("menu-iniciar");

botao.onclick = function () {
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
};
