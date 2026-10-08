# Lançamento — {{name}}

<!-- Template for docs/09-launch.md, written by the launch phase (factory/playbooks/09-launch.md) and kept alive as the runbook + status page until go-live. Language: pt-PT. Never write secrets: variable NAMES only. DNS record values and public URLs are fine. Tick boxes as steps are verified (with date). Delete guidance comments and {{...}} when done. -->

> **Slug:** `{{slug}}` · **Estado:** `{{preparação | pré-visualização pronta | à espera de aprovação | no ar}}` · **Go-live:** `{{aprovação do fundador | automático (go_live: auto)}}` · **Pré-visualização:** {{URL}} · **Produção:** {{URL}} · **Atualizado em:** {{date}}

## 1. Resumo para o fundador

<!-- 5 lines: what is ready, what is waiting for the founder, cost per month, the date you can go live. -->

- **Pronto:** {{}}
- **À espera de ti:** {{HT-xx, HT-yy}} (≈ {{n}} min no total)
- **Custo mensal novo:** {{€}} ({{alojamento, domínio, email, monitorização}})
- **Data possível de lançamento:** {{}}

## 2. Portão G2 e pré-requisitos

- [ ] `docs/06-qa-report.md` sem P0/P1 abertos · [ ] `factory/checklists/launch-readiness.md` com tudo «pass» ou «N/A»
- [ ] Páginas legais ativas em todos os idiomas · [ ] Pagamentos testados em modo de teste ou caminho de monetização configurado

## 3. Ambientes e alojamento

<!-- Vercel Hobby is non-commercial: a product that sells needs Pro (or Cloudflare). Record the decision (ADR). -->

| Ambiente | Plataforma | URL | Dados/chaves | Notas |
|---|---|---|---|---|
| Local | | | `.env.local` (teste) | |
| Pré-visualização | {{}} | {{}} | pagamentos em modo de teste, BD separada | |
| Produção | {{}} | {{}} | chaves reais só após §9 | |

**Plano de alojamento e custo:** {{plano, preço, licença comercial confirmada ✔/✖}}

## 4. Variáveis de ambiente (apenas nomes)

| Nome | Pública/segredo | Onde é usada | Pré-visualização | Produção | Quem fornece |
|---|---|---|---|---|---|
| {{`NEXT_PUBLIC_SITE_URL`}} | pública | | | | Claude |
| {{`STRIPE_SECRET_KEY`}} | segredo | | teste | real | fundador |

## 5. Domínio e DNS

<!-- Use the values shown by the platform (vercel domains inspect/verify). Canonical = apex; www redirects 308. -->

- **Domínio:** `{{}}` · **Registador:** {{}} (renovação {{€/ano}}) · **DNS em:** {{Cloudflare | registador}} · **Canónico:** {{apex | www}}
- [ ] Registos A/CNAME verificados · [ ] HTTPS válido e redirecionamentos (`http→https`, `www→apex`) · [ ] `SITE_URL`, hreflang, OG e sitemap atualizados

## 6. Email

- **Envio (Resend):** subdomínio `{{}}` · [ ] SPF · [ ] DKIM · [ ] MX de retorno · [ ] DMARC `p=none` desde {{data}} (subir para `quarantine` após 2–4 semanas limpas)
- **Receção (Cloudflare Email Routing):** `hello@` `support@` `privacy@` `legal@` `press@` → {{destino verificado ✔/✖}}
- [ ] Teste Gmail/Outlook: `spf=pass dkim=pass dmarc=pass`, sem spam

## 7. Analítica, pesquisa e erros

- [ ] Eventos reais recebidos (`page_view`, `waitlist_joined`/`signup`, `checkout_started`, `purchase`) · [ ] consentimento respeitado
- [ ] Search Console (domínio) + sitemap submetido · [ ] Bing Webmaster
- [ ] Sentry: erro de teste recebido, alerta por email, PII desativada

## 8. Monitorização e cópias de segurança

- **Disponibilidade:** {{Better Stack | outra}} · monitores: início, `/api/health`, checkout, webhook, SSL, domínio · alertas para {{}}
- **Cópias:** {{método}}, frequência {{}}, RPO {{24 h}}, RTO {{4 h}} · [ ] teste de restauro em {{data}} ({{n}} min)

## 9. Pagamentos — lista de go-live

<!-- Order matters; stop at the first failure. See factory/playbooks/monetization.md. -->

- [ ] Compra → webhook → acesso → recibo → reembolso → cancelamento, em modo de teste (2×)
- [ ] Conta de pagamentos verificada (HT-{{}}) · [ ] termos do MoR/Managed Payments aceites (HT-{{}})
- [ ] Produtos/preços reais criados (preços com IVA incluído, códigos fiscais) · [ ] webhook real registado, segredo em `{{NOME_VARIÁVEL}}`
- [ ] Chaves reais só em produção; nenhuma `sk_live` no bundle · [ ] compra real mínima e reembolso (HT-{{}})
- [ ] Notas fiscais: {{MoR | Stripe direto + OSS}} — **confirmar com um contabilista certificado**

## 10. Lojas (apps e extensões)

| Loja | Conta | Estado | Notas |
|---|---|---|---|
| App Store | {{HT}} | {{}} | etiquetas de privacidade, conta de demonstração |
| Google Play | {{HT}} | {{}} | teste fechado: 12 testadores × 14 dias (iniciar em T-21) |
| Chrome Web Store / Edge / Firefox | {{HT}} | {{}} | permissões justificadas |

## 11. Runbook T-7 → T+7

| Quando | Ação | Quem | Verificação | Feito |
|---|---|---|---|---|
| T-7 | Congelar âmbito; lojas em revisão; DNS/email/monitores ativos | Claude | checklist | ☐ |
| T-5 | Lote A do fundador concluído | Fundador | HT 🔴 fechadas | ☐ |
| T-3 | Ensaio geral em pré-visualização | Claude | e2e + Lighthouse | ☐ |
| T-2 | Kits de lançamento finais; caixa de suporte testada | Claude | ligações/UTM | ☐ |
| T-1 | Deploy de produção sem anunciar; teste de fumo | Claude | §13 | ☐ |
| T0 | Aprovação → modo de pagamento → publicações às horas marcadas | Fundador+Claude | erros, checkout | ☐ |
| T0 +1 h/+4 h/+24 h | Teste de fumo e métricas | Claude | §15 | ☐ |
| T+1 / T+3 / T+7 | Agradecimentos e correções; rever testes de canais; retrospetiva | Claude | LEARNINGS | ☐ |

## 12. Plano de reversão

- **Gatilhos:** checkout em baixo > 5 min · erros > 2× o normal durante 10 min · corrupção de dados · problema legal/segurança
- **Passos:** 1) `vercel rollback <deploy anterior>` (ou equivalente) 2) interruptor `{{CHECKOUT_ENABLED=false}}` → lista de espera 3) migrações compatíveis (sem «down») 4) pausar anúncios 5) avisar o fundador 6) lição em `LEARNINGS.md`
- **Deploy bom conhecido:** {{id/URL}}

## 13. Teste de fumo em produção

- [ ] Início em todos os idiomas · [ ] CTA e lista de espera · [ ] preços com IVA · [ ] redireciona para o checkout (sem pagar) · [ ] legais · [ ] `robots`/`sitemap`/404 · [ ] cabeçalhos de segurança · [ ] evento de analítica · [ ] `/api/health` · [ ] Lighthouse móvel ≥ 90 (desempenho) e ≥ 95 (acessibilidade/SEO)

## 14. Tarefas do fundador em lote

| Lote | Tarefas | Tempo |
|---|---|---|
| A · T-14 contas e dinheiro 🔴 | {{HT-..}} | |
| B · T-5 verificar e aprovar 🟡 | {{HT-..}} | |
| C · T0 ações públicas 🟡/🟢 | {{HT-..}} | |

## 15. Métricas das primeiras 24 horas

| Métrica | Valor | Nota |
|---|---|---|
| Visitantes · inscrições · compras · erros Sentry · tempo de atividade | {{}} | |

## 16. Registo de deploys

| Data | Ambiente | ID/URL | Resultado |
|---|---|---|---|
| {{}} | | | |

## 17. Lições

<!-- One dated line each; also copy to factory/LEARNINGS.md if they generalise. -->
