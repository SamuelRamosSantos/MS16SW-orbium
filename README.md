# 🎮 Orbium — Manutenção de Software

> Projeto acadêmico da disciplina de **Manutenção de Software** — UTFPR  
> Baseado no jogo original [Orbium](http://bni.github.com/orbium) de Björn Nilsson, uma versão moderna do clássico jogo dos anos 90 [Log!cal](http://hol.abime.net/906).

---

## 📌 Sobre o Projeto

O **Orbium** é um jogo de puzzle onde o jogador guia bolinhas (marbles) por uma grade de trilhos e rotacionadores até encaixá-las nos alvos corretos. O código é JavaScript puro, sem frameworks externos, utilizando **HTML5 Canvas** para renderização.

Este repositório é usado para fins acadêmicos: aplicar técnicas de **manutenção de software** sobre uma base de código legada, incluindo refatoração, correção de bugs, melhoria de performance e documentação.

🎮 **Jogar online:** https://bni.github.io/orbium/

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| JavaScript (vanilla) | Lógica do jogo, física, menus |
| HTML5 Canvas | Renderização gráfica |
| Node.js | Servidor multiplayer (parcial) |
| WebSockets | Comunicação multiplayer |

---

## 📁 Estrutura do Projeto

```
orbium/
├── index.html        # Ponto de entrada do jogo
├── css/              # Estilos visuais
├── js/               # Módulos JavaScript do jogo
│   ├── init.js       # Inicialização
│   ├── machine.js    # Máquina de estados principal
│   ├── marble.js     # Lógica das bolinhas
│   ├── tile.js       # Lógica dos tiles do grid
│   ├── menu.js       # Sistema de menus
│   ├── levels.js     # Definição dos níveis
│   └── ...           # Demais módulos
├── gfx/              # Recursos gráficos
├── snd/              # Recursos de som
├── ico/              # Ícones da aplicação
└── README.md
```

---

## 🚀 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/SamuelRamosSantos/MS16SW-orbium.git
   cd MS16SW-orbium
   ```

2. Abra o arquivo `index.html` diretamente no navegador  
   *(não requer servidor — funciona como arquivo estático)*

3. Ou use uma extensão como **Live Server** no VS Code para uma experiência melhor.

---

## 🌿 Fluxo de Trabalho — Git

> ⚠️ **NUNCA** faça commit ou push diretamente na branch `main`!

```
main ──────────────────────────────────────────────► produção
       ↑ PR aprovado
feature/MS16SW-123-descricao-da-tarefa ──────────► suas alterações
```

### Passo a passo:

1. Crie a branch pelo **Jira** (botão "Create branch" na tarefa)
2. Atualize a main localmente:
   ```bash
   git checkout main
   git pull origin main
   ```
3. Vá para a sua branch:
   ```bash
   git checkout nome-da-branch
   ```
4. Faça suas alterações, commit e push:
   ```bash
   git add .
   git commit -m "feat: descrição do que foi feito"
   git push origin nome-da-branch
   ```
5. Abra um **Pull Request** no GitHub e aguarde revisão

---

## ✍️ Padrão de Commits

| Prefixo | Quando usar |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `refactor:` | Refatoração sem mudar comportamento |
| `test:` | Testes |
| `chore:` | Tarefas de manutenção (configs, etc.) |

---

## 🔗 Links do Projeto

| Ferramenta | Link |
|---|---|
| 📦 Repositório | https://github.com/SamuelRamosSantos/MS16SW-orbium |
| 📋 Jira | https://samuel-utfpr.atlassian.net/jira/software/projects/MSO |
| 📝 Notion | https://app.notion.com/p/Manuten-o-de-Software-Orbium-3cbc2369918280e69de4f780da55ccb1 |

---

## 👥 Equipe

| Nome | GitHub |
|---|---|
| Samuel Ramos Santos | [@SamuelRamosSantos](https://github.com/SamuelRamosSantos) |
| *(adicione os demais membros)* | |

---

## 📜 Licenças

- **Código-fonte:** GNU General Public License, versão 2
- **Gráficos:** Creative Commons Attribution-NonCommercial 3.0 Unported
- **Autor original:** Björn Nilsson
