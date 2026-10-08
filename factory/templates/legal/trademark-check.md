<!-- TEMPLATE-NOTICE: Modelo gerado para products/<slug>/legal/trademark-check.md. Não constitui aconselhamento jurídico; uma pesquisa de anterioridades não garante que o nome possa ser usado ou registado. Recomenda-se revisão por advogado ou agente de propriedade industrial antes de investir em marca, se a decisão for amarela ou o produto tiver receita significativa. Documento INTERNO. Substituir todos os <…>, apagar as instruções em itálico e este comentário. -->

# Verificação de marca — <Nome candidato>

**Produto:** `<slug>` · **Data da pesquisa:** <AAAA-MM-DD> · **Executada por:** legal-counsel (agente) · **Nome(s) candidato(s):** <nome principal; variantes> · **Origem:** `docs/03-brand.md`

> Esta verificação formal complementa a triagem feita na fase `brand`. Se o resultado for **vermelho**, parar e devolver o produto à fase `brand` com as marcas conflituantes.

## 1. Âmbito

| Item | Valor |
|---|---|
| Sinal a verificar | <nome em texto; logótipo (se já existir)> |
| Produtos/serviços e classes de Nice | <9 software/apps · 42 SaaS/serviços tecnológicos · 35 comércio/publicidade · 41 educação/entretenimento · 38 telecomunicações · outras> |
| Territórios | UE (EUIPO), Portugal (INPI), internacional (OMPI/Madrid), <EUA — USPTO, se vender lá>, <Reino Unido, se relevante> |
| Linguagens e variantes | <tradução em PT/EN/ES/FR/DE, grafias, fonética, abreviaturas> |

## 2. Fontes consultadas

*Pesquisar em cada uma, com a consulta exata e a data. Registar também «sem resultados».*

| Fonte | URL | Consulta(s) usada(s) | Resultado (n.º de registos relevantes) |
|---|---|---|---|
| TMview (agrega EUIPO, INPI e dezenas de institutos) | https://www.tmdn.org/tmview/ | <exata; com `*`; fonética> | <…> |
| EUIPO eSearch plus | https://euipo.europa.eu/eSearch/ | <…> | <…> |
| INPI Portugal (pesquisa de marcas) | https://inpi.justica.gov.pt | <…> | <…> |
| OMPI Global Brand Database | https://branddb.wipo.int/ | <inclui pesquisa por imagem e fonética> | <…> |
| USPTO (se EUA) | https://tmsearch.uspto.gov/ | <…> | <…> |
| Pesquisa web, lojas de aplicações, GitHub/npm, registo comercial (uso sem registo) | <Google, App Store, Google Play, Product Hunt, racius.com…> | <…> | <…> |
| Domínios e identificadores sociais | <registrador; ferramenta Shopify `generate-domain-names` ou WHOIS> | <.com/.pt/.eu; @handles> | <disponível/ocupado> |

## 3. Resultados relevantes

*Incluir apenas sinais idênticos ou semelhantes (visual, fonético, conceptual) para produtos/serviços idênticos ou afins. Estado: registada / pedido / caducada / revogada.*

| Sinal | Titular | Território | Classes | Estado | Idêntico / semelhante (visual · fonética · conceito) | Produtos afins? | Risco |
|---|---|---|---|---|---|---|---|
| <…> | <…> | <UE> | <9, 42> | <registada> | <semelhante: fonética> | <sim> | <alto/médio/baixo> |

## 4. Regra de decisão

- **Verde:** nenhum sinal idêntico ou semelhante, ativo, em classes idênticas ou afins (9, 35, 38, 41, 42 conforme o produto) na UE, em Portugal e nos restantes territórios-alvo; o nome não é descritivo nem genérico para o produto; domínio principal e identificadores principais disponíveis. ⇒ Avançar.
- **Amarelo:** semelhança em classes não afins, marcas caducadas/inativas, semelhança fraca (elemento comum descritivo), ou conflito apenas num território secundário. ⇒ Avançar apenas com: variante de nome/logótipo, nota no `docs/03-brand.md` e recomendação de revisão por agente de propriedade industrial antes do registo.
- **Vermelho:** sinal idêntico ou muito semelhante, registado e ativo, em classes idênticas ou afins, na UE ou em Portugal (ou nos EUA se vender lá); ou nome descritivo/enganoso para o produto. ⇒ **Bloquear**, devolver à fase `brand`.

**Resultado:** <verde / amarelo / vermelho> · **Razões:** <…>

## 5. Proteção recomendada

| Opção | Quando | Custo e prazos (verificar nas páginas oficiais) | Decisão |
|---|---|---|---|
| Marca da União Europeia (EUIPO) | Produto vendido em vários países da UE | <taxa por classe — verificar em https://euipo.europa.eu> | <pedir/adiar> |
| Marca nacional (INPI Portugal) | Mercado sobretudo português / orçamento limitado | <verificar em https://inpi.justica.gov.pt> | <…> |
| Extensão internacional (Madrid, OMPI) | Após base UE/PT, para EUA/Reino Unido | <…> | <…> |
| Sem registo por agora | MVP sem tração | Risco: terceiros registarem o nome; usar ™ (não ®) | <…> |

*Registar uma marca é um ato público e uma despesa: tarefa do fundador (HT-<xx>), nunca decidida pelo agente.*

## 6. Outras verificações

- [ ] Conflito com marcas de terceiros em nomes de domínio, handles e nomes de apps.
- [ ] Licenças de tipos de letra, ícones e imagens do logótipo (ver `brand/`).
- [ ] O nome não sugere afiliação a entidades ou plataformas (ex.: uso de «GPT», «Google», «Stripe» no nome).
- [ ] Texto de marketing não usa marcas de concorrentes de forma enganosa (publicidade comparativa lícita apenas).

## 7. Aprovação

| Quem | Data | Decisão |
|---|---|---|
| legal-counsel | <data> | <verde/amarelo/vermelho> |
| Fundador (se amarelo) | <data> | <…> |
