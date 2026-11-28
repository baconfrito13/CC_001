[//]: # "Rascunho preparado por um agente da fábrica. Não constitui aconselhamento jurídico. Inventário feito a partir de docs/04-architecture.md §14 (a aplicação ainda não existia): repetir a análise do código na integração e acrescentar aqui qualquer cookie ou chave de armazenamento nova. A validade do consentimento (180 dias) tem de ser igual a CONSENT_MAX_AGE_SECONDS e a duração do cookie de sessão (30 dias) igual à configuração da aplicação."

# Política de Cookies

**Data de entrada em vigor:** {{legal.effectiveDate}} · **Última atualização:** {{legal.lastUpdated}}

Esta política explica que cookies e tecnologias semelhantes o {{site.name}} ([{{site.url}}]({{site.url}})) utiliza, porquê e como os pode controlar. É disponibilizada por **{{company.legalName}}** ({{company.address}}, {{company.country}}). Leia-a em conjunto com a nossa Política de Privacidade, que explica como tratamos os dados pessoais.

## 1. O que são cookies e tecnologias semelhantes

Os cookies são pequenos ficheiros de texto que um sítio web guarda no seu dispositivo. Tecnologias semelhantes, como o armazenamento local, o armazenamento de sessão, os identificadores de software em aplicações e os píxeis de rastreio, funcionam de forma comparável. Nesta política designamo-los todos por «cookies».

Os cookies podem ser:

- **Cookies de sessão**, que desaparecem quando fecha o navegador, ou **cookies persistentes**, que permanecem durante um período determinado.
- **Cookies próprios**, colocados por nós, ou **cookies de terceiros**, colocados por outra empresa cujo serviço utilizamos.

## 2. As regras e a nossa abordagem

Em Portugal e na União Europeia, guardar informação no seu dispositivo, ou aceder a informação já aí guardada, exige o seu **consentimento prévio**, exceto quando for **estritamente necessário** para prestar um serviço que expressamente solicitou ou para efetuar uma comunicação (Lei n.º 41/2004, artigo 5.º, que transpõe a Diretiva ePrivacy).

Quando precisamos do seu consentimento:

- pedimo-lo antes de guardar ou ler o que quer que seja;
- recusar é tão fácil como aceitar e nenhuma opção vem pré-selecionada;
- não fazemos o serviço depender da aceitação de cookies que não sejam necessários para ele;
- pode mudar de ideias em qualquer momento.

Quando os cookies envolvem dados pessoais, aplica-se também o Regulamento Geral sobre a Proteção de Dados (RGPD); consulte a nossa Política de Privacidade.

## 3. Tipos de cookies

- **Estritamente necessários:** indispensáveis para prestar o serviço que pediu, por exemplo manter a sessão iniciada, proteger formulários contra falsificação, distribuir a carga dos servidores ou lembrar a sua escolha sobre cookies. Não precisam do seu consentimento.
- **Preferências:** lembram definições como o idioma ou a apresentação quando não são estritamente necessárias para prestar o serviço. Precisam do seu consentimento.
- **Estatísticas:** ajudam-nos a perceber como o serviço é utilizado. Precisam do seu consentimento quando guardam ou leem informação no seu dispositivo.
- **Marketing:** criam perfis ou apresentam e medem publicidade. Precisam sempre do seu consentimento.
- **Conteúdos incorporados:** vídeos, mapas ou publicações de redes sociais fornecidos por outras empresas, que podem colocar os seus próprios cookies. Precisam do seu consentimento.

## 4. O que utilizamos

Além dos cookies estritamente necessários, só utilizamos cookies se os aceitar no nosso banner de cookies. Não utilizamos cookies de preferências, de marketing nem de conteúdos incorporados.

**Estritamente necessários (não precisam de consentimento)**

| Nome | Fornecedor | Finalidade | Duração | Próprio ou de terceiro |
|---|---|---|---|---|
| `sb-<referência>-auth-token` (e, se for grande, partes numeradas como `.0` e `.1`) | {{site.name}} (autenticação fornecida pelo Supabase) | Manter a sessão iniciada depois de introduzir o código de acesso | Até 30 dias | Próprio |
| `consent` (cookie) e `consent` (armazenamento local do navegador) | {{site.name}} | Guardar a sua escolha sobre cookies (aceitar ou recusar) e a data em que a fez, para não voltar a perguntar | 180 dias | Próprio |
| `__stripe_mid` e `__stripe_sid` | Stripe | Prevenção de fraude e segurança do pagamento que pediu. Só são colocados quando abre a página de pagamento do Stripe, no domínio do Stripe | 1 ano e 30 minutos, respetivamente | Terceiro |

Não podem ser desativados nos nossos sistemas; pode bloqueá-los no navegador, mas partes do serviço deixarão de funcionar (por exemplo, não conseguirá manter a sessão iniciada nem pagar).

**Estatísticas (só se aceitar)**

| Nome | Fornecedor | Finalidade | Duração | Próprio ou de terceiro |
|---|---|---|---|---|
| `ph_<chave>_posthog` (cookie e entrada equivalente no armazenamento local) | PostHog (nuvem da UE, Frankfurt) | Reconhecer o navegador entre visitas com um identificador pseudónimo e contar páginas e ações (por exemplo, criar um projeto), para percebermos como o serviço é usado. Não guarda o seu endereço IP | 1 ano | Próprio (colocado no nosso domínio pelo script do PostHog) |

O consentimento é válido por 180 dias, após os quais voltamos a perguntar, ou antes se alterarmos as finalidades. Para provar que deu ou recusou o consentimento, guardamos um registo da sua escolha (decisão e data) no cookie e no armazenamento local `consent` acima. Se recusar, o script do PostHog não é carregado e nada é guardado para estatísticas.

Medimos também, nos nossos servidores e sem identificar ninguém, acontecimentos como compras e falhas de processamento. Isso não guarda nem lê nada no seu dispositivo.

## 5. As suas escolhas

Na primeira visita, o nosso banner permite aceitar ou rejeitar as estatísticas; rejeitar é tão fácil como aceitar. Pode alterar ou retirar a sua escolha em qualquer momento através de «Definições de cookies», no rodapé de todas as páginas. Retirar o consentimento não afeta a licitude do tratamento efetuado antes. Pode também eliminar ou bloquear cookies nas definições do navegador.

## 6. Conteúdos de terceiros e ligações

O {{site.name}} não incorpora conteúdos de terceiros que coloquem cookies e não carrega tipos de letra nem scripts de serviços externos, além do PostHog (só com o seu consentimento). Quando avança para o pagamento, é levado para a página de pagamento do Stripe, que coloca os cookies indicados acima no domínio do Stripe; a política do Stripe está disponível no sítio do Stripe. As ligações a outros sítios web regem-se pelas políticas desses sítios.

## 7. Os seus direitos

Se os cookies envolverem dados pessoais, tem os direitos descritos na nossa Política de Privacidade: acesso, retificação, apagamento, limitação, portabilidade e oposição, bem como o direito de retirar o consentimento em qualquer momento. Para os exercer, escreva para [{{contact.privacyEmail}}](mailto:{{contact.privacyEmail}}).

## 8. Alterações a esta política

Podemos atualizar esta política quando a nossa utilização de cookies ou a lei mudarem. Publicaremos aqui a nova versão com uma nova data de «Última atualização» e, se as alterações exigirem o seu consentimento, voltaremos a pedi-lo.

## 9. Contacto e reclamações

Questões sobre cookies: [{{contact.privacyEmail}}](mailto:{{contact.privacyEmail}}) · {{company.legalName}}, {{company.address}}, {{company.country}}.

Pode reclamar à autoridade de controlo, {{legal.supervisoryAuthority}} ([{{legal.supervisoryAuthorityUrl}}]({{legal.supervisoryAuthorityUrl}})).
