# Produtos

Cada produto tem uma pasta `products/<slug>/` (estrutura em `factory/PIPELINE.md`) que vive
no **seu próprio branch** (`produto/<slug>` ou o branch da sessão que o criou) com um **PR em
rascunho** que funciona como a "casa" do produto: estado atualizado, ligações e o sítio onde
dás feedback com comentários.

Quando fazes merge do PR de um produto para `main`, estás a dizer "aceito este produto": o
código passa a viver aqui e, se o deploy automático estiver ativo, vai para produção.

Ver todos os produtos, em todos os branches:

```bash
python3 factory/scripts/factory.py portfolio --fetch
```

ou, numa sessão do Claude, `/portfolio`.
