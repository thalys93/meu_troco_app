## Meu Troco - Branch de Desenvolvimento
> O Meu Troco é um aplicativo de finanças pessoais criado para ajudar pessoas a organizarem sua vida financeira de forma prática, visual e objetiva.
Sem planilhas caóticas. Sem complicação. Só controle real do seu dinheiro.

> ⚠️ Esta é a branch de desenvolvimento.
> Pode conter features incompletas, refatorações em andamento e breaking changes.

----

Esta branch concentra:
- Novas features
- Refatorações estruturais
- Melhorias de arquitetura
- Ajustes de performance
- Testes de UI/UX

Não é uma versão estável para produção.

---

## 🧠 Objetivo da Branch `dev`

A branch `dev` é o ambiente de evolução contínua do projeto.

Fluxo padrão:

- prod → versão estável (produtiva)
- dev → integração de features  
- feature/* → novas funcionalidades  
- fix/* → correções emergenciais  

---

## 🚀 Como Rodar em Desenvolvimento

```bash
# Clonar repositório
git clone <repo-url>

# Acessar projeto
cd meu-troco

# Instalar dependências
npm install / bun install

# Rodar ambiente de desenvolvimento
npm run dev / bun dev

```

## 🧪 Padrões de Desenvolvimento

- Nome de branch: feature/nome-da-feature
- Commits semânticos
- PR obrigatório antes de merge
- Código deve passar por revisão
- Evitar lógica de negócio na camada de UI

## 👨‍💻 Manutenção

Responsável: thalys93
Projeto em evolução ativa.