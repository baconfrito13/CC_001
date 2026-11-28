# Sequência «Boas-vindas» (pedido de demonstração) — pt-PT

> **Gatilho:** envio do formulário «Pedir demonstração» (evento `demo_requested`). **Base legal:** consentimento dado no formulário (texto e data guardados com o pedido: `consentAt`); a E1 é resposta ao pedido, as E2 e E3 são marketing e só saem a quem consentiu. Cada e-mail: remetente com nome de pessoa (o fundador), **ligação de cancelamento visível**, identificação da empresa no rodapé (dados legais em `legal/public/legal-notice.pt.md`), `reply-to` numa caixa monitorizada (`ola@rastoplan.com`: **ainda não existe**, depende de HT-01 e do e-mail com domínio próprio). Tratamento de dados: `legal/ropa.md`. Envio: Resend, programado no passo de integração/crescimento (backlog); até lá, o fundador envia a E1 à mão com este texto.
> **Texto simples (fallback):** o corpo abaixo, sem formatação, com a ligação escrita por extenso. Marcadores `{{…}}` preenchem-se na integração. UTM: `utm_source=email&utm_medium=email&utm_campaign=202702-welcome&utm_content=<id>`.

## E1 · imediato
- id: W1
- trigger: `demo_requested`
- delay: 0
- exit_condition: nenhuma (confirmação única)
- subject: Recebemos o seu pedido de demonstração
- preview: Respondo para combinar 15 minutos, com uma folha sua se preferir.
- body:

Olá,

Recebemos o seu pedido de demonstração do Rastoplan. Sou {{fundador_nome}} e vou responder pessoalmente.

O que acontece a seguir: combinamos 15 minutos por videochamada. Posso mostrar a medição numa folha de exemplo ou, se preferir, numa folha de um concurso seu. Se me enviar o PDF, apago o projeto no fim da chamada e confirmo-lho por escrito.

Uma pergunta, para preparar a chamada: que tipo de obra orça mais vezes (pavimentos, arranjos exteriores, redes)? Basta responder a este e-mail.

{{fundador_nome}}
Rastoplan · {{ligação de cancelamento}}
- CTA: responder ao e-mail (sem ligação)

## E2 · +2 dias
- id: W2
- trigger: `demo_requested` + 2 dias
- delay: 2 dias
- exit_condition: demonstração marcada, resposta recebida, cancelamento da subscrição de e-mails, conta criada
- subject: O que o PDF precisa para ser medido
- preview: Um teste de 30 segundos para saber se a sua planta é vetorial.
- body:

Olá,

O Rastoplan só lê PDF vetorial exportado de CAD: se a planta for uma imagem ou um digitalizado, diz-lho e não gasta folhas. Há um teste rápido: abra o PDF, amplie a uma linha até ao máximo e veja se continua nítida. Se ficar em «escada», é uma imagem.

Se a sua folha for uma imagem, peça o PDF ao projetista, exportado diretamente do CAD. Na chamada, vemos o que há.

Responda a este e-mail com o dia e a hora que lhe dão mais jeito.

{{fundador_nome}}
- CTA: responder ao e-mail com dia e hora

## E3 · +5 dias
- id: W3
- trigger: `demo_requested` + 5 dias
- delay: 5 dias
- exit_condition: demonstração marcada, conta criada, resposta recebida, cancelamento
- subject: O que o Rastoplan faz e o que não faz
- preview: Limites, preços e a folha «Rasto», numa leitura de um minuto.
- body:

Olá,

Para decidir se vale 15 minutos, três factos:

1. Mede áreas, perímetros e comprimentos em planta de PDF vetorial. Não mede volumes que dependem de perfis, nem lê DWG ou digitalizados.
2. Cada quantidade confirma-se sobre o desenho antes de sair para Excel, e a folha «Rasto» mostra de onde vem cada número.
3. Paga-se por concurso (Passe 60: 129 € + IVA, 60 folhas, válidas 90 dias) ou ao mês, sem fidelização. Há 5 folhas de avaliação.

Se quiser ver numa folha sua, responda com um dia e uma hora.

{{fundador_nome}}
- CTA: pedir demonstração (resposta ao e-mail ou {{domain}}/pt/#demo)
