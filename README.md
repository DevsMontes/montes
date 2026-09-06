# Montes Developers

Portfólio institucional e laboratório de demonstrações da Montes Developers.

## Estrutura

```text
.
├── assets/
│   ├── css/          # Estilos compartilhados do portfólio
│   ├── fonts/        # Fonte variável Instrument Sans e licença
│   └── js/           # Comportamentos de navegação e interface
├── imagens/          # Imagens usadas pelas demonstrações
├── server/           # Endpoint seguro da AltriX
├── sistemas/         # Protótipos e experiências demonstrativas
├── index.html        # Página principal
└── logomontes.png    # Identidade visual
```

## Desenvolvimento local

As páginas não exigem instalação de dependências. Sirva a raiz com um servidor HTTP local para testar links e recursos.

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Publicação

O conteúdo da branch `main` é publicado automaticamente no GitHub Pages pelo workflow de site estático.

O comando `node scripts/build.mjs` também prepara `dist/client` e `dist/server` para uma hospedagem com funções na borda.

## AltriX com Groq

A AltriX envia a conversa para `POST /api/altrix`. O endpoint valida a entrada, limita requisições, aplica tempo máximo de resposta e chama a API da Groq no servidor. A conversa permanece apenas na memória da aba.

Configure `GROQ_API_KEY` como segredo no ambiente de hospedagem. Para servir o frontend em outro domínio, configure também `ALTRIX_ALLOWED_ORIGIN` com a origem completa permitida. Nunca coloque a chave em HTML, JavaScript do navegador ou arquivos versionados.
