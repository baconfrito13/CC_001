<!-- TEMPLATE-NOTICE: Modelo gerado para products/<slug>/legal/ai-act-note.md. Não constitui aconselhamento jurídico; recomenda-se revisão por advogado se o sistema puder ser de risco elevado (anexo III), tratar dados sensíveis ou afetar decisões sobre pessoas. Documento INTERNO, apenas para produtos com IA. Substituir todos os <…>, apagar as instruções em itálico e este comentário. -->

# Nota do Regulamento da IA — <Nome do produto>

> Regulamento (UE) 2024/1689 (Regulamento da IA), alterado pelo Regulamento (UE) 2026/1744 (Omnibus Digital da IA; JO de 24-07-2026; em vigor desde 27-07-2026). Estado de aplicação verificado em **<AAAA-MM-DD>** em https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai — reverificar se tiverem passado mais de 90 dias.

**Versão:** <n> · **Data:** <AAAA-MM-DD> · **Baseado em:** `docs/02-product.md`, `docs/04-architecture.md`, `legal/ropa.md`

## 1. Descrição do sistema de IA

| Campo | Valor |
|---|---|
| Funcionalidades de IA | <ex.: chatbot de apoio; geração de texto/imagem; resumos; classificação; recomendações; agentes> |
| Modelos e fornecedores | <fornecedor, modelo/versão, região, termos de API (sem treino com os nossos dados?)> |
| Entradas / saídas | <dados do utilizador enviados; conteúdo gerado; onde é guardado> |
| Quem usa e quem é afetado | <utilizadores, terceiros mencionados nos conteúdos> |
| Papel do fundador | **Fornecedor do sistema de IA** (coloca-o no mercado sob o seu nome) e **responsável pela implantação** de um modelo de terceiros; não é fornecedor do modelo de IA de uso geral (GPAI) <confirmar; se afinar substancialmente ou treinar modelo próprio, reavaliar> |

## 2. Práticas proibidas (art. 5.º; em vigor desde 02-02-2025)

*Marcar «não aplicável» só depois de confirmar. Nova proibição (Omnibus): sistemas que gerem imagens íntimas não consentidas ou material de abuso sexual de crianças — aplica-se a partir de **02-12-2026**.*

| Prática | Aplica-se? | Notas |
|---|---|---|
| Manipulação subliminar/enganadora que cause danos significativos | <não> | |
| Exploração de vulnerabilidades (idade, deficiência, situação social) | <não> | |
| Pontuação social | <não> | |
| Avaliação do risco de crime baseada apenas em perfil | <não> | |
| Recolha não direcionada de imagens faciais (scraping) | <não> | |
| Reconhecimento de emoções no local de trabalho/escolas | <não> | |
| Categorização biométrica para inferir características sensíveis | <não> | |
| Identificação biométrica remota em tempo real em espaços públicos | <não> | |
| Geração de imagens íntimas não consentidas / CSAM (a partir de 02-12-2026) | <não; bloqueios: <termos + filtros>> | |

## 3. Classificação de risco

- **Alto risco (art. 6.º; anexo III)** — categorias: biometria, infraestruturas críticas, educação, emprego/gestão de trabalhadores, serviços essenciais (crédito, seguros), aplicação da lei, migração, justiça/processos democráticos. **Aplicação: 02-12-2027** (anexo III) e **02-08-2028** (produtos do anexo I). Resultado: <não é alto risco — razão> / <possível alto risco ⇒ escalar para advogado>. Derrogação do art. 6.º, n.º 3: <se invocada, documentar e registar>.
- **Risco limitado — obrigações de transparência (art. 50.º; aplicáveis desde 02-08-2026)** — ver §4.
- **Risco mínimo** — sem obrigações específicas para além da literacia (§5) e da legislação geral (RGPD, consumo).

**Classificação final:** <risco mínimo / limitado / possível alto risco> · **Razões:** <…>

## 4. Obrigações de transparência (art. 50.º)

| Obrigação | Quem | Aplica-se? | Implementação (onde na interface/API) | Evidência |
|---|---|---|---|---|
| 50.º/1 — Informar que se interage com um sistema de IA (salvo evidente do contexto) | Fornecedor do sistema | <sim/não> | <etiqueta «Assistente de IA» no chat> | <captura> |
| 50.º/2 — Marcar em formato legível por máquina e detetável os resultados sintéticos (áudio, imagem, vídeo, texto). Moratória até **02-12-2026** apenas para sistemas colocados no mercado antes de 02-08-2026; sistemas novos não têm moratória | Fornecedor do sistema | <sim/não> | <metadados/marca de água/C2PA; para texto, conforme o Código de Práticas> | <nota técnica> |
| 50.º/3 — Informar pessoas expostas a reconhecimento de emoções ou categorização biométrica | Responsável pela implantação | <sim/não> | <…> | |
| 50.º/4 — Divulgar *deepfakes* e texto gerado por IA publicado para informar o público sobre matérias de interesse público (salvo revisão humana com responsabilidade editorial) | Responsável pela implantação | <sim/não> | <rótulo visível no ponto de publicação> | |

*Fontes a consultar na altura da execução: Orientações da Comissão sobre o art. 50.º (20-07-2026) e Código de Práticas sobre marcação e rotulagem de conteúdos gerados por IA (versão final de 10-06-2026) — ambos linkados na página da Comissão acima. O estatuto formal das orientações pode ainda estar a aguardar as versões linguísticas: marcar «verificar».*

## 5. Literacia em IA (art. 4.º)

Em vigor desde 02-02-2025 e suavizado pelo Reg. 2026/1744 (apoiar o desenvolvimento da literacia, em vez de garantir um nível específico). Medidas: <o fundador lê as orientações de utilização dos fornecedores; política interna de revisão de resultados; formação de quem tenha acesso à IA>.

## 6. Interação com RGPD e proteção do consumidor

- [ ] Política de Privacidade descreve a IA, o fornecedor, a localização e a ausência de treino com dados do utilizador (art. 13.º RGPD).
- [ ] Sem decisões exclusivamente automatizadas com efeitos jurídicos (art. 22.º) — ou base e salvaguardas descritas.
- [ ] Contrato (DPA) com o fornecedor de IA; listado em `legal/subprocessors.md`.
- [ ] Termos: precisão, revisão humana, utilização proibida (incl. imagens íntimas não consentidas e *deepfakes* de pessoas reais).
- [ ] Marketing (`docs/08-gtm.md`) não exagera capacidades («100 % preciso», «substitui um advogado/médico») — práticas comerciais desleais.
- [ ] AIPD: ver `legal/dpia-screening.md` (critério 8: tecnologia inovadora).

## 7. Calendário relevante (verificado em <AAAA-MM-DD>)

| Data | Marco |
|---|---|
| 02-02-2025 | Proibições e literacia em IA |
| 02-08-2025 | Governação e obrigações para modelos GPAI |
| 02-08-2026 | Aplicação geral, incluindo transparência (art. 50.º) |
| 02-12-2026 | Fim da moratória do art. 50.º/2 (sistemas anteriores a 02-08-2026); nova proibição de imagens íntimas não consentidas/CSAM |
| 02-12-2027 | Alto risco do anexo III |
| 02-08-2028 | Alto risco do anexo I (produtos regulados) |

## 8. Conclusão e revisão

**Conclusão:** <ex.: o produto é um sistema de IA de risco limitado; obrigações do art. 50.º/1 e /2 implementadas conforme §4; não é alto risco; sem práticas proibidas.> **Rever quando:** nova funcionalidade de IA, mudança de fornecedor/modelo, uso em decisões sobre pessoas (emprego, crédito, educação, saúde), novos mercados, ou 90 dias após a última verificação. **Escalar para advogado se:** possível alto risco, biometria/emoções, menores, ou setor regulado.
