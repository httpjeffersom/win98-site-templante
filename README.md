# Jeffersom.net

Projeto de desktop com visual estilo Windows 98, recriando uma experiência de ambiente de sistema com ícones, menu iniciar e programas como navegador, calculadora, bloco de notas e meu computador.

![Preview do projeto](./imagens/readme-preview.png)

## Funcionalidades

- Área de trabalho com ícones selecionáveis (duplo clique ou Enter)
- Ícones arrastáveis, com posições salvas no navegador
- Menu Iniciar funcional, com atalhos para os programas e "Sobre"
- Janelas arrastáveis pela barra de título, minimizáveis, com foco e ordem de sobreposição
- Barra de tarefas com botões dos programas abertos e relógio com data
- Navegador com histórico, barra de endereços, busca e aviso de sites que bloqueiam iframe
- Calculadora funcional com memória, teclado e operações básicas
- Bloco de Notas com menus, abrir/salvar arquivos, quebra de linha, hora/data e atalhos
- Arquivos do Bloco de Notas salvos no Desktop via `localStorage`
- Meu Computador com atalhos para os programas
- Som de inicialização gerado via Web Audio

## Como executar

As janelas são carregadas com `fetch()`, então o projeto **precisa de um servidor local**. Abrir o `index.html` direto do disco faz o navegador bloquear o carregamento por CORS.

### Opção 1 — Node.js (sem dependências)

```bash
npm start
```

Depois acesse <http://localhost:3000>.

### Opção 2 — servidor estático qualquer

```bash
npx serve .
```

ou

```bash
python -m http.server 8000
```

## Estrutura

```
index.html                 Área de trabalho, menu iniciar e barra de tarefas
style.css                  Estilos globais (desktop, janelas, menu)
script.js                  Registro de programas, relógio e menu iniciar
componentes/
  janela.js                Gerenciador de janelas (arraste, foco, minimizar)
  arquivos-desktop.js      Arquivos do Bloco de Notas no Desktop (localStorage)
  icones-desktop.js        Arraste e posições dos ícones (localStorage)
  som-inicializacao.js     Som de inicialização via Web Audio
Programas/
  blocodenotas/            Bloco de Notas (abrir, salvar, formatar)
  calculadora/             Calculadora
  navegador/               Navegador com iframe
  meucomputador/           Meu Computador
  sobre/                   Janela "Sobre"
imagens/                   Ícones e imagens
servidor.js                Servidor estático local (Node, sem dependências)
```

## Como adicionar um programa

1. Crie uma pasta em `Programas/` com o HTML (fragmento, sem `<html>`/`<body>`) e, se precisar, CSS e JS.
2. Registre o programa no JS:

    ```js
    DesktopApp.registrarPrograma({
      id: "meu-programa",
      titulo: "Meu Programa",
      seletorIcone: ".icon-meu-programa", // opcional
      caminhoHtml: "Programas/meu-programa/meu-programa.html",
      largura: 500, // opcional (padrão: 80% do desktop)
      altura: 350,  // opcional
      icone: "imagens/meu-icone.png", // opcional (padrão: ícone do seletorIcone)
    });
    ```

3. Adicione o CSS no `index.html` e o script depois de `script.js` e `componentes/janela.js`.

## Arquivos e ícones do Desktop

O Bloco de Notas salva os arquivos no próprio navegador, usando `localStorage`:

- **Salvar / Salvar como…** grava o arquivo no Desktop (não baixa para o disco).
- O arquivo aparece como um ícone na área de trabalho e continua lá depois de recarregar a página.
- **Abrir…** lista os arquivos salvos no Desktop; **Do computador…** importa um `.txt` do disco.
- Para excluir: clique com o botão direito no ícone e escolha **Excluir**, selecione o ícone e pressione **Delete**, ou use **Arquivo → Excluir do Desktop** no Bloco de Notas.
- Os ícones podem ser arrastados livremente; as posições são salvas automaticamente.

Chaves usadas no `localStorage`:

| Chave | Conteúdo |
| --- | --- |
| `jeffersom.net:notas` | Arquivos salvos no Desktop (nome e conteúdo) |
| `jeffersom.net:icones` | Posições dos ícones da área de trabalho |

## Limitações

- Muitos sites (Google, por exemplo) enviam `X-Frame-Options` e não podem ser exibidos dentro do navegador do projeto. Nesses casos use o botão **Abrir no navegador** ou **Abrir fora**.
- O som de inicialização depende de interação do usuário: navegadores bloqueiam áudio automático.
- O botão "Parar" não consegue interromper páginas externas por restrições de segurança do navegador.
- Os arquivos e as posições dos ícones ficam apenas neste navegador. Limpar os dados do site remove tudo, e o `localStorage` tem um limite de alguns megabytes.

## Tecnologias

- HTML
- CSS
- JavaScript
- Node.js apenas para o servidor local de desenvolvimento

## Licença

GPL-3.0. Veja [LICENSE](./LICENSE).
