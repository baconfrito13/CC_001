# Sequência «Onboarding» (conta criada) — pt-PT

> **Gatilho:** `signup_completed`. **Natureza:** e-mails de serviço a quem criou conta, ligados ao uso do produto, sem promoção de terceiros; incluem ligação para deixar de receber dicas. Meta de ativação: ≥ 50 % (`activation_reached`: folha real, ≥ 3 grupos confirmados, resposta «Sim» ou «Quase»; PRD §8). Texto simples: o mesmo corpo sem formatação. UTM: `utm_source=email&utm_medium=email&utm_campaign=202702-onboarding&utm_content=<id>`. Os e-mails de acesso (código de 6 dígitos) são transacionais e **não** são esta sequência.

## E1 · imediato
- id: O1
- trigger: `signup_completed`
- delay: 0
- exit_condition: `sheet_uploaded`
- subject: Carregue a sua primeira folha
- preview: Um PDF vetorial, a escala confirmada e três grupos para rever.
- body:

Olá,

A conta está pronta e tem 5 folhas de avaliação, válidas 14 dias.

O primeiro passo: crie um projeto e carregue uma folha em PDF vetorial exportado de CAD. Confirme a escala, reveja três grupos sobre o desenho e responda à pergunta «As quantidades coincidem com o que mediria à mão?».

Se o PDF for uma imagem, o Rastoplan di-lo e não gasta folhas.

{{fundador_nome}}
- CTA: abrir `{{domain}}/pt/app` (sem UTM em ligações internas)

## E2 · +1 dia (só se não houver folha carregada)
- id: O2
- trigger: `signup_completed` + 1 dia
- delay: 1 dia
- exit_condition: `sheet_uploaded`
- subject: Falta só uma folha para começar
- preview: Se o PDF não for vetorial, há um teste de 30 segundos.
- body:

Olá,

Ainda não carregou nenhuma folha. Se não tem à mão um PDF vetorial, o teste é este: amplie uma linha ao máximo no leitor de PDF; se continuar nítida, é vetorial.

Se tiver dúvidas sobre o formato, responda a este e-mail com uma descrição do que tem e digo-lhe o que fazer.

{{fundador_nome}}
- CTA: responder ao e-mail ou abrir `{{domain}}/pt/app`

## E3 · +3 dias (só se houve folha processada)
- id: O3
- trigger: `sheet_processed` + 3 dias
- delay: 3 dias
- exit_condition: `map_exported`
- subject: Do grupo ao artigo, e ao Excel
- preview: Atribua grupos a artigos e exporte o mapa com a folha «Rasto».
- body:

Olá,

Com os grupos confirmados, atribua cada um a um artigo do mapa (capítulo, designação, unidade) e exporte para Excel. O ficheiro traz uma folha «Rasto» com a origem de cada quantidade: folha, grupo e escala.

Se um grupo não ficar bem, pode rejeitá-lo e voltar atrás sem gastar outra folha.

{{fundador_nome}}
- CTA: abrir o mapa em `{{domain}}/pt/app`

## E4 · +7 dias
- id: O4
- trigger: `signup_completed` + 7 dias
- delay: 7 dias
- exit_condition: resposta recebida, `trust_check_answered`, cancelamento
- subject: Como correu a primeira semana?
- preview: Duas perguntas, para melhorar o que não está bem.
- body:

Olá,

Passou uma semana. Duas perguntas, só para si e para mim:

1. As quantidades coincidiram com o que mediria à mão? Se não, em que folha e porquê?
2. O que faltou para o Rastoplan servir no seu próximo concurso?

Leio e respondo a todas as respostas.

{{fundador_nome}}
- CTA: responder ao e-mail
