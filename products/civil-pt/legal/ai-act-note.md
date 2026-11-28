<!-- TEMPLATE-NOTICE: Modelo gerado para products/civil-pt/legal/ai-act-note.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado se o sistema puder ser de risco elevado (anexo III), tratar dados sensíveis ou afetar decisões sobre pessoas. Documento INTERNO. -->

# Nota do Regulamento da IA — Rastoplan

> Regulamento (UE) 2024/1689 (Regulamento da IA), alterado pelo Regulamento (UE) 2026/1744 (Omnibus Digital da IA; JO de 24-07-2026; em vigor desde 27-07-2026). Estado de aplicação verificado em **2026-11-28** na página da Comissão (https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) e em resumos de escritórios de advogados (EUR-Lex não abre por WebFetch: fonte secundária). Reverificar se tiverem passado mais de 90 dias (**2027-02-26**) ou se US-07 avançar.

**Versão:** 1 · **Data:** 2026-11-28 · **Baseado em:** `docs/02-product.md` (§5.4, §7, US-07), `docs/04-architecture.md` (§1, §8), `docs/adr/0008-ai-policy.md`, `legal/ropa.md`

## 1. Descrição do sistema

| Campo | Valor |
|---|---|
| Funcionalidades de IA | **Nenhuma no MVP.** O motor lê a geometria vetorial do PDF com `pdfjs-dist` e calcula áreas e comprimentos; o agrupamento é por estilo gráfico (hash de traço, preenchimento, espessura, tracejado). Sem modelo aprendido, sem inferência estatística. US-07 (sugestão de designações a partir do texto da legenda) está **dormente**, com *kill-switch* (`AI_ENABLED=false`) e adaptador `mock` |
| Modelos e fornecedores | Nenhum ativo. Se US-07 avançar (ADR 0008): API da Anthropic (Haiku/Sonnet), só texto da legenda e rótulos, nunca o PDF nem a geometria nem nomes de projeto/ficheiro; inferência `global` ou `us` (não só UE) |
| Entradas / saídas | Hoje: PDF → quantidades determinísticas. Com US-07: texto da legenda → designação e unidade sugeridas, com confiança, rotuladas «Sugestão de IA»; **a IA nunca altera quantidades** |
| Quem usa e quem é afetado | Orçamentistas (profissionais). Nenhuma decisão é tomada sobre pessoas singulares |
| Papel do fundador | Hoje: fornecedor de software sem componente de IA. Com US-07: **fornecedor do sistema de IA** e responsável pela implantação de um modelo de terceiros; não é fornecedor do modelo GPAI |

## 2. O MVP é um «sistema de IA»? (art. 3.º, ponto 1)

Não. A definição exige um sistema que, para objetivos explícitos ou implícitos, **infere** a partir das entradas como gerar saídas (previsões, conteúdos, recomendações, decisões). O Rastoplan limita-se a extrair elementos gráficos de um ficheiro com regras fixas e a somar áreas e comprimentos: processamento de dados com regras definidas por humanos, sem inferência nem aprendizagem. A Comissão publicou orientações sobre a definição de sistema de IA (6 fev. 2025, C(2025) 924; o Serviço de Apoio ao Regulamento da IA da Comissão aloja uma versão em PDF), não vinculativas, que excluem do âmbito os sistemas baseados apenas em regras e em processamento básico de dados (fonte: https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application, 2026-11-28; a leitura do texto sobre os sistemas excluídos é por resumo de terceiros: **secundária**). **Conclusão: o MVP está fora do âmbito do Regulamento da IA.** Isto significa também que a Política de Privacidade e os Termos podem dizer, com verdade, que o serviço não usa IA.

## 3. Se US-07 (IA) for ativada: pré-classificação

### 3.1 Práticas proibidas (art. 5.º; em vigor desde 02-02-2025; imagens íntimas/CSAM desde 02-12-2026)

| Prática | Aplica-se? | Notas |
|---|---|---|
| Manipulação subliminar/enganadora, exploração de vulnerabilidades | Não | Sugestão de designações de obra para profissionais |
| Pontuação social, risco de crime por perfil, *scraping* facial, emoções, categorização biométrica, identificação biométrica | Não | Nenhum dado biométrico |
| Imagens íntimas não consentidas / CSAM (desde 02-12-2026) | Não | Só texto de legenda técnica |

### 3.2 Classificação de risco

- **Alto risco (anexo III; aplicação desde 02-12-2027) / anexo I (02-08-2028):** não. O caso de uso (designação de artigos de mapa de quantidades) não consta de nenhuma categoria do anexo III e não afeta o acesso de pessoas a direitos, emprego, crédito, educação ou serviços essenciais.
- **Risco limitado (art. 50.º, aplicável desde 02-08-2026):** a avaliar. A sugestão é texto gerado por um modelo (designação e unidade), apresentado a um profissional que o revê; é um texto de apoio, não conteúdo publicado ao público. A obrigação de marcação legível por máquina do art. 50.º, n.º 2 pode ser afastada para funções de assistência à edição padrão que não alterem substancialmente os dados de entrada, mas a Comissão publicou Orientações sobre o art. 50.º (20-07-2026) e um Código de Práticas (final em 10-06-2026) que **têm de ser lidos antes de ativar** (não foi possível abri-los nesta sessão).
- **Risco mínimo:** hipótese de partida, a confirmar com a leitura das orientações do art. 50.º.

**Classificação provisória (só se US-07 avançar):** risco mínimo a limitado · **Razões:** texto técnico para profissionais, sem efeitos sobre pessoas, quantidades sempre do motor.

## 4. Obrigações de transparência (art. 50.º) — matriz para a implementação futura

| Obrigação | Quem | Aplica-se hoje? | Implementação prevista | Evidência |
|---|---|---|---|---|
| 50.º/1 — informar que se interage com IA | Fornecedor | Não (não é chatbot) | n/a | — |
| 50.º/2 — marcar resultados sintéticos | Fornecedor | Não hoje; **a avaliar com US-07** | Rótulo «Sugestão de IA» e campo `ai_suggested` na BD; avaliar marcação legível por máquina para texto conforme as orientações | US-07 critério 1 |
| 50.º/3 — reconhecimento de emoções / categorização biométrica | Implantador | Não | n/a | — |
| 50.º/4 — *deepfakes* e texto de interesse público | Implantador | Não | n/a | — |

## 5. Literacia em IA (art. 4.º)

Em vigor desde 02-02-2025 e suavizado pelo Reg. 2026/1744. Hoje o produto não inclui sistema de IA; a obrigação não se aplica ao produto. O fundador utiliza assistentes de IA para construir o produto (fora do âmbito do produto). Se US-07 avançar: nota interna de utilização de modelos (revisão de resultados, sem dados pessoais nos prompts, limites de custo).

## 6. Interação com o RGPD e com a proteção do consumidor

- [x] A Política de Privacidade diz que **não há IA** e que as peças não seguem para nenhum fornecedor de IA; os Termos dizem o mesmo (secções 1 e 11). **Estas frases passam a falsas se US-07 for ativada: atualizar as duas páginas, a lista de subcontratantes, o RoPA e o DPA (Anexo III) antes de ativar.**
- [x] Sem decisões exclusivamente automatizadas com efeitos sobre pessoas (art. 22.º).
- [ ] DPA com o fornecedor de IA e retenção da API (com US-07): a verificar na altura; listado em `legal/subprocessors.md` como dormente.
- [x] Marketing: não alegar IA nem «precisão de X %» antes de US-07 e de comparações reais (PRD §7, Alegações 1 e 4); o `gtm` não pode escrever «IA» no site, nos anúncios nem no *outbound*.
- [x] AIPD: `legal/dpia-screening.md` — critério 8 não se aplica hoje.

## 7. Calendário relevante (verificado em 2026-11-28)

| Data | Marco |
|---|---|
| 02-02-2025 | Proibições e literacia em IA |
| 02-08-2025 | Governação e obrigações para modelos GPAI |
| 02-08-2026 | Aplicação geral, incluindo transparência (art. 50.º) |
| 02-12-2026 | Fim da moratória do art. 50.º/2 (sistemas anteriores a 02-08-2026); nova proibição de imagens íntimas não consentidas/CSAM |
| 02-12-2027 | Alto risco do anexo III |
| 02-08-2028 | Alto risco do anexo I (produtos regulados) |

## 8. Conclusão e revisão

**Conclusão:** o Rastoplan MVP não é um sistema de IA e está fora do âmbito do Regulamento da IA; não há obrigações do art. 50.º; sem práticas proibidas. **Rever quando:** US-07 for construída ou ativada, mudar o fornecedor, o produto passar a usar visão computacional ou aprendizagem automática, ou 90 dias após a última verificação (2027-02-26). **Escalar para advogado se:** o sistema puder ser de alto risco, usar biometria, afetar menores ou setor regulado.
