# Ateliê — suas ideias na web

Um editor visual em português para alunos criarem sites, explorarem o código e publicarem suas ideias. Feito com React, TypeScript e Vite.

## Executar

Requer Node.js 22.12 ou superior.

```bash
npm install
npm run dev
```

Abra o endereço indicado no terminal, normalmente **http://localhost:5173**.

## O que o editor oferece

- 12 blocos: menu, capa, título, texto, imagem, botão, cartões, galeria, perguntas, divisor, espaço e rodapé.
- Arrastar blocos para inserir e reordenar; botões equivalentes para usar por toque ou teclado.
- Edição de texto diretamente na página com dois cliques, ou pelo painel de propriedades.
- Upload de imagens, URLs, alinhamento, cores, espaçamento, fontes e paletas.
- Visualização em computador, tablet e celular, com prévia interativa.
- Desfazer/refazer e salvamento automático no navegador.
- Projetos portáteis `.atelie.json` para abrir em outro computador.
- Código HTML, CSS e JavaScript atualizado, com cópia e download de cada arquivo.
- Exportação ZIP contendo `index.html`, `style.css`, `script.js` e um guia de publicação.

O editor cria uma página responsiva organizada em blocos verticais. Na edição de texto direta, **Enter** conclui e **Shift+Enter** insere uma quebra de linha. **Esc** cancela a edição atual.

### Atalhos

| Atalho | Ação |
| --- | --- |
| Ctrl/Cmd + Z | Desfazer |
| Ctrl/Cmd + Shift + Z ou Ctrl/Cmd + Y | Refazer |
| Delete / Backspace | Excluir bloco selecionado |
| Ctrl/Cmd + S | Baixar projeto editável |
| Esc | Fechar janela ou desselecionar |

O salvamento automático pertence a este navegador e endereço; não é uma conta na nuvem. Para guardar trabalhos de alunos ou mudar de computador, use **Menu do projeto → Baixar projeto**. Imagens enviadas são incorporadas; imagens por URL continuam dependendo do endereço original.

## Publicar o site criado por um aluno

1. Clique em **Exportar site → Baixar meu site**.
2. Extraia o ZIP.
3. Crie um repositório público no GitHub.
4. Envie `index.html`, `style.css` e `script.js` para a raiz do repositório.
5. Em **Settings → Pages**, selecione **Deploy from a branch**, branch **main**, pasta **/ (root)** e clique em **Save**.
6. Aguarde o link de publicação aparecer.

O site exportado é estático, sem React, dependências externas obrigatórias, servidor ou etapa de compilação. Também abre localmente pelo `index.html`.

## Publicar o próprio editor

```bash
npm run build
```

Hospede o conteúdo de `dist/` em qualquer hospedagem estática. Os caminhos são relativos, permitindo publicar em uma subpasta do GitHub Pages. A pasta `dist/` é do **editor**; o ZIP baixado pela interface é do **site do aluno**.

Para conferir a versão de produção localmente:

```bash
npm run preview
```

## Verificação

```bash
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Os testes cobrem edição e persistência, arrastar/reordenar, desfazer/refazer, importação, exportação real de ZIP, execução dos arquivos exportados, navegação mobile e perguntas interativas.

## Organização

- `src/model.ts`: tipos, blocos disponíveis, modelo e validação de projetos.
- `src/site.ts`: HTML, CSS, JavaScript, prévia e ZIP exportados.
- `src/useProject.ts`: histórico e persistência local.
- `src/components/`: biblioteca de blocos, canvas, propriedades e janelas.
- `src/styles.css`: interface do editor.

O editor e a exportação compartilham o mesmo gerador de HTML e CSS para manter a página consistente. As ilustrações do modelo são SVGs próprios, incorporados ao projeto.
