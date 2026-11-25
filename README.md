# Meu Troco

> O Meu Troco é um aplicativo de finanças pessoais criado para ajudar pessoas a organizarem sua vida financeira de forma prática, visual e objetiva.  
Sem planilhas caóticas. Sem complicação. Só controle real do seu dinheiro.

---

## 🌳 Estrutura de Branches

O projeto utiliza um fluxo Git com branches bem definidos para garantir estabilidade e organização.

### Branches Principais

| Branch | Propósito | Status |
|--------|-----------|--------|
| `master` | **Produção** - Código estável, validado e pronto para deploy | ✅ Estável |
| `dev` | **Desenvolvimento** - Integração de features e correções | 🔄 Ativo |
| `prod` | **Legado** - Não utilizada atualmente | ⚠️ Descontinuada |

### Fluxo de Trabalho

```
feature/* ou fix/*  →  dev  →  master (via PR)
   (desenvolvimento)   (integração)   (produção)
```

**Como funciona:**

1. **Desenvolvimento** (`feature/*` ou `fix/*`)
   - Criar uma branch a partir de `dev` para novas features ou correções
   - Exemplo: `feature/dashboard-overhaul`, `fix/login-bug`
   - Desenvolver e testar localmente

2. **Integração** (`dev`)
   - Merge da branch de feature para `dev` via Pull Request
   - Validar que as features funcionam em conjunto
   - Código pode ser instável durante integração

3. **Produção** (`master`)
   - Merge de `dev` para `master` via Pull Request
   - **OBRIGATÓRIO:** Adicionar prefixo `[Deploy]` no título da PR para acionar o deploy automático
   - Apenas código validado e testado deve chegar aqui

---

## 🚀 Deploy Automático

O deploy é realizado automaticamente pelo Firebase CI/CD quando:

- **Preview:** Ao abrir uma Pull Request, um link de preview é gerado para testar
- **Produção:** Ao fazer merge na branch `master`, o deploy automático é feito para o canal `live`
- **Nota:** O deploy automático só é acionado quando o título da PR contém o prefixo `[Deploy]`

**Workflow de deploy:**
1. Abre PR de `dev` → `master`
2. Firebase CI gera preview link automaticamente
3. Teste as mudanças no preview
4. Ao mergear na `master`, deploy automático para produção

---

## 📋 Checklist para Deploy

Antes de abrir PR para `master`:

- [ ] Build local sem erros (`npm run build`)
- [ ] Features testadas manualmente
- [ ] Revisão de código concluída
- [ ] Sem conflitos de merge

---

## 🔒 Regras Importantes

### Branch `master` (Produção)
- ❌ **NUNCA** commitar diretamente
- ❌ **NUNCA** fazer merge direto (sem PR)
- ✅ Apenas via PR aprovada de `dev`
- ✅ Apenas código estável e testado

### Branch `dev` (Desenvolvimento)
- ✅ Pode receber merges de features e fixes
- ✅ Código pode ser instável durante integração
- ✅ Ideal para testar novas features em conjunto

### Branches de Feature (`feature/*`, `fix/*`)
- ✅ Criar a partir de `dev`
- ✅ Focar em uma funcionalidade ou correção específica
- ✅ Merge de volta para `dev` via PR

---

## 🏷 Versionamento

Seguir padrão **SemVer** no package.json:

`MAJOR.MINOR.PATCH`

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Novas features compatíveis
- **PATCH** (0.0.X): Correções de bugs

Exemplos:
- `4.0.0` → versão estável atual
- `4.1.0` → nova feature (orçamento, dashboard melhorado)
- `4.1.1` → correção de bug (fix no login)

---

## 👨‍💻 Manutenção

Responsável: thalys93  
Ambiente produtivo. Mudanças exigem responsabilidade e revisão.

