# Sequência «Recuperação» (subscrição cancelada ou conta dormente) — pt-PT

> **Verificar antes do envio:** que a frase «a conta e os projetos continuam disponíveis» (R3) respeita a retenção da política de privacidade (`legal/public/privacy.pt.md`), pois o PRD prevê 30 dias após o cancelamento da conta.
> **Gatilho:** `subscription_canceled`, ou 60 dias sem `sheet_uploaded` em conta com saldo expirado. **Regras:** sem promoção inventada: só se menciona o que existe; a E2 só sai se houver novidades reais desde o cancelamento; **a E3 não tem oferta**, a menos que o fundador crie uma real e datada. Opt-out visível. UTM: `utm_source=email&utm_medium=email&utm_campaign=<aaaamm>-winback&utm_content=<id>`.

## E1 · +3 dias
- id: R1
- trigger: `subscription_canceled` + 3 dias
- delay: 3 dias
- exit_condition: resposta, `purchase_completed`, cancelamento
- subject: Uma pergunta sobre o seu cancelamento
- preview: O que faltou? Uma linha basta.
- body:

Olá,

Vi que cancelou a subscrição do Rastoplan. Sem compromisso: o que faltou, ou o que não correspondeu ao esperado? Uma linha basta.

Responder a esta pergunta ajuda-me a decidir o que fazer a seguir. O acesso e as folhas já pagas mantêm-se até ao fim da validade.

{{fundador_nome}}
- CTA: responder ao e-mail

## E2 · +30 dias (só com novidades reais)
- id: R2
- trigger: `subscription_canceled` + 30 dias e registo de novidades
- delay: 30 dias
- exit_condition: resposta, `purchase_completed`, cancelamento
- subject: O que mudou no Rastoplan
- preview: {{novidade_curta}}
- body:

Olá,

Desde que cancelou, o Rastoplan mudou: {{lista_de_novidades_reais}}.

Se isto resolve o que faltou, a conta está como a deixou. Se não, responda e diga-me o que ainda falta.

{{fundador_nome}}
- CTA: abrir `{{domain}}/pt/app`

## E3 · +60 dias
- id: R3
- trigger: `subscription_canceled` + 60 dias
- delay: 60 dias
- exit_condition: resposta, `purchase_completed`
- subject: Fica a porta aberta
- preview: Os seus dados e projetos podem ser apagados quando quiser.
- body:

Olá,

Este é o último e-mail sobre o assunto. A conta e os projetos continuam disponíveis; se preferir que os apague, basta responder «apagar» e fazemo-lo.

Obrigado por ter experimentado o Rastoplan.

{{fundador_nome}}
- CTA: responder ao e-mail
