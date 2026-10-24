const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const raiz = __dirname;
const porta = Number(process.env.PORT) || 3000;

const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

const servidor = http.createServer((requisicao, resposta) => {
  let caminhoUrl;

  try {
    caminhoUrl = decodeURIComponent(
      new URL(requisicao.url, `http://${requisicao.headers.host}`).pathname,
    );
  } catch {
    resposta.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    resposta.end("Endereço inválido.");
    return;
  }

  const relativo = caminhoUrl === "/" ? "index.html" : caminhoUrl.slice(1);
  const arquivo = path.resolve(raiz, relativo);

  if (arquivo !== raiz && !arquivo.startsWith(`${raiz}${path.sep}`)) {
    resposta.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    resposta.end("Acesso negado.");
    return;
  }

  fs.readFile(arquivo, (erro, dados) => {
    if (erro) {
      resposta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      resposta.end(`Arquivo não encontrado: ${relativo}`);
      return;
    }

    resposta.writeHead(200, {
      "Content-Type": tipos[path.extname(arquivo).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    resposta.end(dados);
  });
});

servidor.listen(porta, () => {
  console.log(`Servidor iniciado em http://localhost:${porta}`);
  console.log("Pressione Ctrl+C para encerrar.");
});
