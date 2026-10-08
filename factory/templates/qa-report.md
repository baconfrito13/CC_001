# Relatório de QA e segurança — {{name}}

<!--
Template for docs/06-qa-report.md, written by qa-engineer + security-auditor (factory/playbooks/06-qa.md, Steps 1-12). Language: pt-PT (commands, ids and identifiers stay in English). Every statement is backed by evidence: a command and its result, a test file, a screenshot name or a Lighthouse JSON name (artifacts stay in the scratchpad, not in git). Severity scale P0-P3 is defined in the playbook (Step 9); never downgrade to pass. Be explicit about what was NOT verified (devices, Safari/Firefox, live payments, real email deliverability). Never paste secrets or real personal data. Delete guidance comments and double-brace placeholders when done.
-->

> **Produto:** `{{slug}}` · **Data:** {{AAAA-MM-DD}} · **Commit testado:** `{{sha}}` · **Profundidade:** {{lean/standard/deep}} · **Rondas:** {{n}}/{{máx}} · **Auditores:** {{qa-engineer, security-auditor}} (independentes do construtor) · **Depende de:** `05-build.md`, `04-architecture.md` §11

## 1. Veredicto

**{{APROVADO | REPROVADO}}** para o portão G2 (parte de QA).

<!-- One paragraph: what was tested, the headline numbers, open defects by severity, the top residual risk, what the founder must still verify. -->

| P0 abertos | P1 abertos | P2 abertos | P3 abertos | Axe graves/críticas | Lighthouse mínimo (mediana de 3) | `npm audit` high/critical | Segredos no repo |
|---|---|---|---|---|---|---|---|
| {{0}} | {{0}} | {{n}} | {{n}} | {{0}} | {{n}} | {{0}} | {{0}} |

## 2. Ambiente e linha de base (ronda 0)

| Item | Valor |
|---|---|
| Node / npm | {{}} |
| Versões (next, react, typescript, vitest, playwright) | {{}} |
| Sistema de teste | {{sandbox cloud}}; Chromium `/opt/pw-browsers/chromium` {{versão}} |
| Flags e adaptadores ativos | {{payments.live=off, EMAIL_ADAPTER=console, AUTH_ADAPTER=mock, AI_PROVIDER=mock}} |
| Dados | {{seed / fixtures; nenhum dado pessoal real}} |
| Terceiros | {{todos simulados ou em modo de teste}} |

Linha de base: `npm run check` {{✅/❌}} · `npm run test:e2e` {{✅/❌}} · build de produção {{✅/❌}}

## 3. Resultados por camada (pirâmide)

| Camada | Nº de testes | Passam | Falham | Saltados | Notas |
|---|---|---|---|---|---|
| Unitários | {{}} | {{}} | {{}} | 0 | cobertura em `src/lib`: {{%}} (informativa) |
| Integração / API | {{}} | {{}} | {{}} | 0 | {{rotas com 200/400/401/403/404/429}} |
| e2e | {{}} | {{}} | {{}} | 0 | `--repeat-each=3`: {{0 flaky}} |

Proporção real ≈ {{70/20/10}}. Verificação de força dos testes (partir 3 funções de propósito): {{3/3 detetadas}}.

## 4. Rastreabilidade história → testes

| História | Prioridade | Teste(s) | Idiomas | Viewports | Resultado |
|---|---|---|---|---|---|
| {{US-01}} | must | `tests/e2e/{{}}.spec.ts` | en, pt | 390, 1280 | {{✅}} |

Histórias must sem teste automatizado de ponta a ponta: {{nenhuma}} (cada uma seria P1).

## 5. Acessibilidade (WCAG 2.2 AA)

| Rota | Idioma | Viewport | Axe graves/críticas | Axe moderadas/menores | Teclado | Notas |
|---|---|---|---|---|---|---|
| `/` | en / pt | 390 / 1280 | {{0}} | {{0 / 0}} | {{✅}} | |

Manual (checklist `accessibility.md`): zoom 200 % e reflow 320 px {{✅}} · foco visível {{✅}} · diálogos e banner de consentimento {{✅}} · formulários e erros anunciados {{✅}} · `prefers-reduced-motion` {{✅}} · modo escuro/contraste forçado {{✅}} · Lighthouse a11y {{100}}
Itens `fail`: {{D-nnn}}

## 6. Desempenho

Comando: `CHROME_PATH=/opt/pw-browsers/chromium npx lighthouse@latest <url> --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox"` (3 execuções, mediana; `--preset=desktop` para desktop). `benchmarkIndex` do anfitrião: {{}}; página trivial de calibração: {{perf n}}.

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/en` | móvel | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} |
| `/pt` | móvel | | | | | | | |
| `/en` | desktop | | | | | | | |
| {{pricing, legal, app}} | | | | | | | | |

- JS da landing (gzip): {{KB}} · peso total do 1.º carregamento: {{KB}} · p95 da API a 20 utilizadores simultâneos: {{ms}} ({{autocannon}})
- Notas de ruído do ambiente e decisões: {{}}

## 7. SEO e consentimento (técnico)

| Verificação | Resultado | Evidência |
|---|---|---|
| `robots.txt`, `sitemap.xml` (todos os idiomas + páginas legais) | {{✅}} | {{curl}} |
| Título/descrição únicos e dentro dos limites; um `h1` | {{✅}} | {{teste}} |
| `canonical` e `hreflang` recíprocos | {{✅}} | {{}} |
| OG/Twitter, JSON-LD válido | {{✅}} | {{}} |
| 404 real; redireções de um salto; pré-visualizações com `noindex` | {{✅}} | {{}} |
| **Zero pedidos a analítica/cookies antes do consentimento**; aceitar → carrega; recusar → nada | {{✅}} | {{teste e2e}} |
| Política de cookies = trackers observados | {{✅}} | {{}} |
| Páginas legais em todos os idiomas, ligadas no rodapé | {{✅}} | {{}} |

## 8. Segurança (OWASP ASVS nível 1)

Checklist: `factory/checklists/security.md` · Revisões automáticas: `/security-review` {{n achados, m confirmados}} · `/code-review` {{n / m}}

| Área (ASVS) | Verificações | Resultado | Defeitos |
|---|---|---|---|
| Segredos e configuração | S-01…S-07 (secretlint/gitleaks, histórico, bundle) | {{}} | {{}} |
| Dependências | D-01…D-06 (`npm audit --omit=dev`: {{0 high/critical}}; licenças) | {{}} | {{}} |
| Autenticação e sessões | A-01…A-07 | {{}} | {{}} |
| Autorização / RLS / IDOR | Z-01…Z-07 (query RLS: {{0 linhas}}; teste de dois utilizadores) | {{}} | {{}} |
| Entrada, saída e injeção | I-01…I-07 (corpus de payloads, XSS, SSRF, redireção aberta, CSRF) | {{}} | {{}} |
| API, webhooks e abuso | W-01…W-06 (assinatura, repetição, limites 429, quotas) | {{}} | {{}} |
| Cabeçalhos e transporte | H-01…H-05 | {{}} | {{}} |
| Proteção de dados e logs | P-01…P-05 (exportar/apagar conta) | {{}} | {{}} |
| Específico do tipo ({{mobile/extensão/API/bot}}) | §9 da checklist | {{}} | {{}} |

Ameaças do modelo (`04-architecture.md` §11) exercitadas: {{T-01 ✅, T-02 ✅ …}} · Não coberto: {{}}

## 9. Teste exploratório

Capturas em `$SCRATCH/shots/` ({{n}} imagens: idiomas {{en, pt}} × larguras {{360, 768, 1440}} × rotas {{n}}) — todas revistas visualmente. Verificações automáticas por rota: sem scroll horizontal, sem erros na consola, sem pedidos falhados, sem marcadores de substituição por resolver, lorem, TODO ou «A PREENCHER», sem cadeias longas iguais entre idiomas.

| Charter (10 min) | Resultado | Defeitos |
|---|---|---|
| Visitante pela 1.ª vez (teste dos 5 segundos) | {{}} | {{}} |
| Entradas hostis em todos os formulários | | |
| Interromper o checkout (voltar, atualizar, duplo clique) | | |
| Rede lenta / offline / respostas 500 | | |
| Conteúdo muito longo / vazio | | |
| Só teclado · zoom do navegador | | |
| Trocar de idioma a meio do fluxo · sessão expirada · dois separadores | | |
| Emulação de dispositivos (iPhone 13, Pixel 7) | | |

## 10. Registo de defeitos

<!-- One row per root cause. Severity per the playbook scale. Status: aberto · corrigido · verificado · adiado (with rationale) · não corrigir (with rationale). A defect is "verificado" only after someone other than the fixer re-ran the check that found it. -->

| ID | Sev | Área | Título | Passos / esperado / obtido | Evidência | Ronda | Estado | Correção (commit) | Teste de regressão |
|---|---|---|---|---|---|---|---|---|---|
| D-001 | {{P1}} | {{a11y}} | {{}} | {{}} | {{ficheiro de teste / captura / comando}} | 1 | {{verificado}} | `{{sha}}` | `tests/{{}}` |

## 11. Rondas de correção

| Ronda | Âmbito testado | Novos P0 / P1 / P2 / P3 | Corrigidos | Abertos no fim (P0 / P1 / P2 / P3) | Ronda limpa? |
|---|---|---|---|---|---|
| 0 | linha de base | | | | |
| 1 | completo | | | | |

Critério de saída ({{lean: 1 ronda sem P0/P1 abertos | standard: ≤ 3 rondas, 0 P0/P1, ≤ 5 P2 justificados | deep: duas rondas limpas consecutivas}}): {{cumprido em AAAA-MM-DD}}

## 12. Lacunas e riscos residuais

<!-- What could not be verified in a cloud session. Each becomes a launch task or a founder task. Never mark pass without evidence. -->

| # | Não verificado / risco | Porquê | Quem e quando verifica | Tarefa |
|---|---|---|---|---|
| 1 | {{Safari/Firefox; dispositivos iOS/Android reais}} | só Chromium na sandbox | fundador antes do lançamento | HT-{{xx}} |
| 2 | {{pagamento real, entregabilidade de email, DNS}} | exige contas/domínio reais | `09-launch` | HT-{{xx}} |

Defeitos P2/P3 adiados (backlog para `10-growth`): {{D-0xx …}}

## 13. Checklist G2 (parte de QA)

- [ ] Zero P0/P1 abertos · [ ] Axe sem graves/críticas · [ ] Lighthouse ≥ 90 nas 4 categorias na landing (ou exceção calibrada documentada em §6)
- [ ] Páginas legais ativas em todos os idiomas · [ ] Consentimento antes de analítica verificado
- [ ] Analítica e monitorização de erros ligadas por variáveis de ambiente e inertes sem elas
- [ ] Pagamentos de ponta a ponta em modo de teste (ou caminho de monetização configurado)
- [ ] `factory/checklists/launch-readiness.md`: linhas de QA marcadas pass/N/A com evidência
- [ ] `docs/09-launch.md` (runbook) em rascunho — {{existe / pedido ao `devops-engineer`}}
- [ ] Sem `[A PREENCHER PELO FUNDADOR]`, `(placeholder)` ou `acme.example` no build de produção, exceto tarefas do fundador listadas
