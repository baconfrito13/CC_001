# Sequência «Conversão» (avaliação → compra) — pt-PT

> **Gatilho:** conta com avaliação ativa (5 folhas, válidas 14 dias, sem cartão; Termos §3). **Regras:** o prazo é real (14 dias após a criação da conta); **sem desconto, sem preço riscado, sem contagem decrescente**. O preço de fundador (79 €/mês, primeiras 10 empresas) só se menciona se `FOUNDER_PRICE_SLOTS` > 0 e sem referência de «desconto». Preços sem IVA; reembolso nos termos de Termos §4. Mensagens de marketing a clientes só se tiverem optado por elas ou se aplicar a exceção para produtos similares (Lei n.º 41/2004; `legal-counsel` confirma antes do envio). UTM: `utm_source=email&utm_medium=email&utm_campaign=202702-conversion&utm_content=<id>`.

## E1 · avaliação termina em 3 dias
- id: C1
- trigger: criação da conta + 11 dias
- delay: 11 dias
- exit_condition: `purchase_completed`, conta apagada, cancelamento
- subject: A avaliação termina daqui a 3 dias
- preview: Tem {{folhas_restantes}} folhas por usar; depois deixam de estar disponíveis.
- body:

Olá,

A avaliação do Rastoplan termina em 3 dias e ainda tem {{folhas_restantes}} folhas por usar. Depois dessa data, as folhas por usar expiram.

Se o próximo concurso está à porta, um Passe junta as folhas de que precisa, válidas 90 dias, sem subscrição: 20 folhas por 59 €, 60 por 129 € ou 150 por 249 € (preços sem IVA).

{{fundador_nome}}
- CTA: ver preços (`{{domain}}/pt/precos`)

## E2 · avaliação termina amanhã
- id: C2
- trigger: criação da conta + 13 dias
- delay: 13 dias
- exit_condition: `purchase_completed`, cancelamento
- subject: A avaliação termina amanhã
- preview: Uma folha devolvida por «não funcionou» volta ao saldo.
- body:

Olá,

A avaliação termina amanhã. Se alguma folha não funcionou, marque-a como «não funcionou»: volta ao saldo e não se perde.

Se o Rastoplan serve, o Passe 60 (129 € + IVA) dá 60 folhas durante 90 dias. Na primeira compra, reembolsamos a pedido em 14 dias: por inteiro se nenhuma folha foi usada, ou proporcionalmente às que sobrarem.

Se não serve, diga-me porquê: aprende-se mais com um «não».

{{fundador_nome}}
- CTA: ver preços (`{{domain}}/pt/precos`)

## E3 · avaliação terminada
- id: C3
- trigger: criação da conta + 14 dias
- delay: 14 dias
- exit_condition: `purchase_completed`, cancelamento
- subject: A avaliação terminou
- preview: Os seus projetos continuam guardados; faltam folhas para novas medições.
- body:

Olá,

A avaliação terminou e as folhas por usar expiraram. Os projetos e mapas já exportados mantêm-se na conta; para processar novas folhas é preciso um Passe ou uma subscrição.

Se precisar de mais uma tentativa com uma folha de um concurso real, responda a este e-mail e vemos o que é possível.

{{fundador_nome}}
- CTA: ver preços ou responder ao e-mail

## E4 · último lembrete
- id: C4
- trigger: criação da conta + 17 dias
- delay: 17 dias
- exit_condition: `purchase_completed`, resposta, cancelamento
- subject: Posso ajudar com o próximo concurso?
- preview: Um último e-mail: uma pergunta sobre o que faltou.
- body:

Olá,

Este é o último e-mail desta série. Uma pergunta: o que faltou para o Rastoplan servir no seu próximo concurso? Respondo a todas as mensagens e uso as respostas para decidir o que melhorar.

Se mais tarde precisar, a conta e os projetos ficam cá.

{{fundador_nome}}
- CTA: responder ao e-mail
