# ADR 0003 — Autenticação e base de dados: Supabase Auth (código + página de confirmação) e Postgres com RLS

> **Estado:** accepted · **Data:** 2026-11-28 · **Produto:** `civil-pt` · **Fase:** architecture · **Decisor:** solution-architect (agente) · **Relacionado:** ADR-0001, ADR-0004, US-01, US-02, `docs/04-architecture.md` §5 e §7

## Contexto

US-01 exige entrada só com email, sem palavra-passe, e **resistente a filtros de email empresariais** que abrem as ligações antes do utilizador e consomem o *token* de uso único (relatado para o Supabase Auth em supabase/discussions#41618): código de 6 dígitos válido 10 min **e** ligação que só mostra uma página de confirmação; 5 códigos errados bloqueiam durante 15 min e invalidam o código. Os dados (projetos de concursos) são confidenciais: o isolamento entre contas tem de ser imposto na BD. O Supabase Auth documenta `signInWithOtp` com as variáveis de modelo `.Token` (código) e `.TokenHash` (ligação PKCE), validade configurável (defeito 1 h) e 1 pedido/60 s por utilizador.

## Fatores de decisão

1. Cumpre US-01 (incluindo *scanners* e bloqueio) e o isolamento entre contas.
2. Custo a 10 000 contas (MAU).
3. Tempo de construção.
4. *Lock-in*/saída.
5. Residência UE.

## Opções consideradas

| Opção | Resumo | Prós | Contras | Custo mensal a 0 / 100 / 10k | Lock-in / saída | Fonte |
|---|---|---|---|---|---|---|
| A — Supabase Auth + RLS (receita) | OTP por email, `verifyOtp` por código ou `token_hash`; Postgres com RLS | Isolamento imposto na BD; 50 000 MAU gratuitos (100 000 no Pro) | Bloqueio por tentativas e invalidação do código exigem lógica própria (contador + rotação); as chaves mudaram de nome (confirmar) | €22,78 / €22,78 / €22,78 + extras (MAU abaixo de 100 000) | Médio (Postgres padrão; Auth exportável) | [Supabase passwordless](https://supabase.com/docs/guides/auth/auth-email-passwordless), [preços](https://supabase.com/pricing) |
| B — Better Auth + Drizzle + Neon | Auth própria no Next.js | Controlo total (tentativas, códigos) | Sem RLS: a tenancy fica no código; menos maduro para o fundador operar; Storage e URLs assinados à parte | ≈ €0 / €20 / ≈ €50 | Baixo | `web-saas.md` |

Pontuação 1–5 (US-01+isolamento · custo a 10k · tempo · *lock-in* · UE): **A = 4·5·5·3·5 = 22 · B = 5·4·2·5·4 = 20** → A (também por defeito da receita).

## Decisão

**Escolhemos A.** Fluxo: `POST /api/auth/otp` envia o email (SMTP do Supabase → Resend) com código e ligação; `POST /api/auth/verify` valida o código e aplica a nossa **contagem de falhas** (`auth_attempts`; 5 falhas → bloqueio 15 min e **rotação** do código ativo por `auth.admin.generateLink` sem envio, a confirmar no spike S7); `GET /auth/confirm` só mostra o botão e `POST /api/auth/confirm` chama `verifyOtp({ token_hash, type: 'email' })`, o único passo que consome o *token*. Validade `otp_expiry = 600 s`. RLS em todas as tabelas com `(select auth.uid()) = user_id`; o servidor usa `getUser()`.

## Consequências

- **Positivas:** isolamento forte na BD (testado A↛B por tabela); nenhuma palavra-passe a guardar; mesmo fornecedor para Auth, BD e Storage.
- **Negativas / custos aceites:** lógica própria de bloqueio e rotação (≈ 1 unidade dentro de US-01); dependência de comportamento do Supabase (S7); o SMTP do Supabase tem de apontar para o Resend antes de testar escala.
- **Riscos e mitigação:** se a rotação por `generateLink` não invalidar o código, plano B: contador próprio + novo envio forçado antes de aceitar nova tentativa; nenhum caminho consome o *token* num GET.
- **Impacto noutras fases:** legal: Supabase e Resend subcontratantes · qa: teste de *scanner* simulado, de bloqueio e de IDOR · launch: tarefas E e G (conta Supabase, DNS do Resend).

## Como verificamos

e2e de US-01 (7 critérios) com o adaptador `mock` e *scanner* simulado; testes SQL de RLS (utilizador A não lê B; `anon` não vê nada); spike S7 antes de fechar WP-02.

## Revisitar quando

> 50 000 MAU, ou o Supabase mudar o fluxo OTP/`verifyOtp`, ou o spike S7 falhar (passar à opção B só se o plano B também falhar).

## Referências

- https://supabase.com/docs/guides/auth/auth-email-passwordless — acedido em 2026-11-28
- https://github.com/orgs/supabase/discussions/41618 — acedido em 2026-11-27 (PRD OB-9)
- https://supabase.com/pricing — acedido em 2026-11-28
