# Produtos

Cada produto tem uma pasta `products/<slug>/` (estrutura em `factory/PIPELINE.md`) que vive
no **seu próprio branch** (`produto/<slug>` ou o branch da sessão que o criou) com um **PR em
rascunho** que funciona como a "casa" do produto: estado atualizado, ligações e o sítio onde
dás feedback com comentários.

Quando o produto é lançado, a fábrica faz merge do PR para `main` (com `merges: claude` em
`FOUNDER.md`; com `merges: fundador`, fazes tu): o código passa a viver aqui e, se o deploy
automático estiver ativo, gera uma pré-visualização. Pôr em produção é sempre um passo
explícito: `/lancar <produto>`. Os ciclos de crescimento seguintes usam um branch e um PR
novos, que entram no `main` quando cada ciclo termina.

Ver todos os produtos, em todos os branches:

```bash
python3 factory/scripts/factory.py portfolio --fetch
```

ou, numa sessão do Claude, `/portfolio`.
