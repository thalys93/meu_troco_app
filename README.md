# PROD Branch## Meu Troco - Branch de Produção

> O Meu Troco é um aplicativo de finanças pessoais criado para ajudar pessoas a organizarem sua vida financeira de forma prática, visual e objetiva.  
Sem planilhas caóticas. Sem complicação. Só controle real do seu dinheiro.

> ✅ Esta é a branch de produção.
> Código estável, validado e pronto para deploy.

---

Esta branch contém:
- Código validado e revisado
- Features finalizadas e testadas
- Correções aprovadas
- Versão preparada para ambiente produtivo

Não realizar desenvolvimento direto nesta branch.

---

## 🎯 Objetivo da Branch `prod`

A branch `prod` representa a versão estável e publicada do sistema.

Fluxo padrão:

- prod → versão estável (produção)
- dev → integração de features
- feature/* → novas funcionalidades
- fix/* → correções emergenciais

Merge permitido apenas via PR aprovado a partir da `dev` ou `fix/*`.

---

## 🚀 Deploy

O deploy deve ser realizado exclusivamente a partir desta branch.

Checklist obrigatório antes de merge:

- [ ] Build sem erros
- [ ] Testes passando
- [ ] Revisão de código concluída
- [ ] Changelog atualizado
- [ ] Versionamento ajustado (SemVer)

---

## 🔒 Regras Importantes

- ❌ Não commitar diretamente na `prod`
- ❌ Não testar features experimentais
- ❌ Não alterar configurações críticas sem revisão

- ✅ Apenas código estável
- ✅ PR obrigatório
- ✅ Histórico limpo e rastreável

---

## 🏷 Versionamento

Seguir padrão **SemVer**:

MAJOR.MINOR.PATCH

Exemplo:
- 1.0.0 → primeira versão estável
- 1.1.0 → nova feature compatível
- 1.1.1 → correção de bug

---

## 👨‍💻 Manutenção

Responsável: thalys93  
Ambiente produtivo. Mudanças exigem responsabilidade.
