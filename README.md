# Montes Developers

Portfólio institucional e laboratório de demonstrações da Montes Developers.

## Estrutura

```text
.
├── assets/
│   ├── css/          # Estilos compartilhados do portfólio
│   └── js/           # Comportamentos de navegação e interface
├── imagens/          # Imagens usadas pelas demonstrações
├── sistemas/         # Protótipos e experiências demonstrativas
├── index.html        # Página principal
└── logomontes.png    # Identidade visual
```

## Desenvolvimento local

O projeto é estático e não exige instalação de dependências. Sirva a raiz com um servidor HTTP local para testar links e recursos.

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Publicação

O conteúdo da branch `main` é publicado automaticamente no GitHub Pages pelo workflow de site estático.

## Demonstração AltriX

A página inicial inclui uma demonstração estática do atendente AltriX. Ela funciona inteiramente no navegador, não consulta banco de dados, não envia mensagens e não armazena informações. A integração real será habilitada somente quando a API possuir hospedagem HTTPS definitiva.
