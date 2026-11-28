[//]: # "Rascunho preparado por um agente da fábrica a partir de docs/02-product.md e docs/02-business.md. Não constitui aconselhamento jurídico. Produto só para empresas e profissionais: as secções para consumidores foram removidas de propósito (legal.sellsToConsumers = false). Os preços não estão escritos aqui, para não divergirem da página de preços. A promessa de reembolso da secção 4 tem de ser igual à da página de preços e à do checkout."

# Termos e Condições

**Data de entrada em vigor:** {{legal.effectiveDate}} · **Última atualização:** {{legal.lastUpdated}}

Estes Termos regulam a utilização do {{site.name}} ([{{site.url}}]({{site.url}})), prestado por **{{company.legalName}}** (NIF {{company.taxId}}; n.º de IVA {{company.vatId}}; registo {{company.registration}}), com morada em {{company.address}}, {{company.country}} («nós»). O {{site.name}} destina-se a empresas e profissionais. Ao criar uma conta, comprar ou utilizar o serviço, aceita estes Termos; «o utilizador» designa a entidade que usa o serviço e a pessoa que aceita em seu nome. Leia-os em conjunto com a nossa Política de Privacidade e a nossa Política de Cookies.

## 1. O serviço

O {{site.name}} é uma aplicação web para quem orça obras (empreiteiros, subempreiteiros, medidores e gabinetes): lê a geometria de peças desenhadas em PDF e ajuda a preparar o mapa de quantidades.

- **Como funciona.** Carrega um PDF vetorial exportado de um programa de desenho (CAD), com um máximo de 50 MB e 40 páginas por ficheiro. Define a escala de cada folha. O serviço lê, nos nossos servidores, a geometria exata (linhas, polígonos e curvas) e agrupa os elementos pelo estilo gráfico. Revê cada grupo sobre o desenho, confirma-o ou rejeita-o e atribui-o a um artigo e capítulo do seu mapa. Por fim, exporta um ficheiro Excel com o mapa de quantidades e uma folha «Rasto» que liga cada quantidade ao desenho.
- **Folhas.** Uma folha é uma página de PDF processada. Só consome uma folha a primeira vez que é processada com sucesso. Não consomem folhas: as falhas técnicas, as páginas sem geometria vetorial legível (imagens e documentos digitalizados) e as páginas em que os estilos gráficos não permitem separar os elementos. Voltar a processar uma folha já processada no mesmo projeto não consome outra folha. Se nenhum grupo de uma folha chegar a ser confirmado, pode devolvê-la como «não funcionou» (até 3 devoluções por lote de folhas).
- **O que mede.** Em planta, áreas, perímetros e comprimentos; com uma espessura uniforme que introduza, volumes simples. **Não** lê imagens nem documentos digitalizados, nem ficheiros DWG, DXF ou IFC, e não mede volumes que dependam de perfis ou cotas (por exemplo, escavação e aterro), nem declives.
- **Sem inteligência artificial.** O serviço não utiliza inteligência artificial para tratar as suas peças: as quantidades resultam de cálculo geométrico.
- **Requisitos.** Navegador de secretária recente, com JavaScript ativado, e ligação à Internet. Não existe aplicação para telemóvel.
- **Beta.** Funcionalidades novas podem estar em fase beta e ser assinaladas como tal.

## 2. Elegibilidade e conta

O {{site.name}} destina-se exclusivamente a utilização profissional. Ao criar uma conta ou comprar, declara que atua no âmbito de uma atividade comercial, industrial, artesanal ou profissional (e não como consumidor) e que tem pelo menos 18 anos. Não vendemos a consumidores. Nada nestes Termos reduz os direitos imperativos que a lei confira a quem, apesar desta declaração, seja consumidor.

- Forneça informação verdadeira e mantenha-a atualizada. O acesso faz-se por um código de 6 dígitos ou por uma ligação enviados para o seu e-mail: mantenha a sua caixa de correio segura e avise-nos em [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}) se suspeitar de utilização não autorizada. É responsável pelo que acontece na sua conta.
- Cada conta tem um só utilizador e não pode ser partilhada. A avaliação gratuita é limitada a uma por endereço de e-mail e não pode ser contornada com várias contas.
- Confirma que tem poderes para vincular a sua organização.

## 3. Planos, preços e pagamento

- **Avaliação gratuita.** Cada conta nova recebe 5 folhas, válidas durante 14 dias, sem necessidade de cartão. As folhas por usar expiram no fim desse prazo.
- **Passes.** Pagamento único de um lote de 20, 60 ou 150 folhas, válido durante 90 dias a contar da compra. Não se renovam.
- **Subscrições mensais** (Independente: 15 folhas por mês; Empresa: 50; Gabinete: 120). Cada pagamento mensal cria um lote de folhas válido durante 90 dias, pelo que as folhas por usar acumulam-se durante 3 meses e expiram depois. A subscrição renova-se todos os meses, ao preço então em vigor, até ser cancelada.
- **Como se gastam as folhas.** Cada folha processada sai do lote que expira primeiro. As folhas não têm valor em dinheiro, não são transmissíveis e as que expiram perdem-se. Em caso de reembolso, as folhas por usar são revogadas.
- **Preços.** O preço de cada oferta é o indicado na página de preços no momento da compra, em euros e sem IVA, e é confirmado no pagamento antes de pagar. As ofertas de lançamento anunciadas (por exemplo, um preço especial para as primeiras empresas a subscrever) mantêm-se, nos termos da oferta, enquanto a subscrição se mantiver ativa e sem interrupção.
- **Quem vende e como se paga.** O contrato de compra é celebrado com {{company.legalName}}. Os pagamentos por cartão (e outros meios que o checkout oferecer) são processados pelo Stripe. Não vemos nem guardamos o número do seu cartão.
- **Impostos e faturas.** Os preços não incluem IVA. O IVA, ou a autoliquidação nas vendas a empresas de outros países da UE com número de IVA válido, é aplicado nos termos da lei e da informação fiscal que indicar no pagamento; o total é mostrado antes de pagar. Indique o NIF-IVA e os dados de faturação corretos: emitimos a fatura em nome da entidade que indicar e não a podemos alterar depois de emitida, salvo nos casos que a lei permitir.
- **Cancelar.** Pode cancelar uma subscrição em qualquer momento no portal de cliente (em dois cliques); o cancelamento produz efeitos no fim do período já pago, o acesso e as folhas mantêm-se até lá e à sua validade, e não são feitos novos débitos.
- **Alterações de preço.** Podemos alterar os preços para períodos futuros. Informá-lo-emos com, pelo menos, 30 dias de antecedência e pode cancelar antes de a alteração produzir efeitos. Os Passes e as folhas já pagos não são afetados.
- **Pagamentos falhados.** Se o pagamento de uma subscrição falhar, mantemos o acesso e o saldo durante 7 dias para o regularizar. Passado esse prazo sem pagamento, a subscrição cessa e não é criado novo lote de folhas; as folhas já pagas continuam utilizáveis até à sua validade.
- **Disputas de pagamento.** Se o seu banco abrir uma disputa sobre um pagamento, o saldo de folhas fica suspenso até à decisão final.

## 4. Reembolsos

Como cortesia comercial, reembolsamos a pedido, até 14 dias depois do pagamento da primeira compra de uma conta (um Passe ou a primeira mensalidade de uma subscrição):

- **Reembolso integral** (incluindo o IVA correspondente), se não tiver usado nenhuma folha ou se as folhas usadas tiverem sido devolvidas como «não funcionou»;
- **Reembolso proporcional** às folhas por usar, nos outros casos: preço pago ÷ folhas do lote × folhas por usar (por exemplo, num Passe de 60 folhas com 10 usadas, devolvemos 50/60 do preço pago).

Para pedir o reembolso, escreva para [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}). Reembolsamos pelo mesmo meio de pagamento, sem custos para si, no prazo de 14 dias a contar do pedido. Esta cortesia não é o direito de livre resolução dos consumidores (que não se aplica a contratos entre profissionais) e não afeta os direitos que a lei lhe confira. As mensalidades seguintes de uma subscrição não são reembolsáveis: cancele antes da renovação. O reembolso revoga as folhas por usar.

## 5. Utilização aceitável

Compromete-se a não: violar a lei ou os direitos de terceiros; carregar ficheiros que não tenha direito a tratar ou software malicioso; tentar perturbar, sondar ou contornar a segurança ou os limites do serviço (incluindo criar várias contas para obter mais avaliações gratuitas); aceder-lhe por meios automatizados para além do que o serviço permite (extração em massa, engenharia inversa, carga excessiva), salvo quando a lei o permitir; partilhar a conta; revender o acesso ao serviço; usar o serviço para enganar pessoas ou para criar ou distribuir conteúdos ilícitos. Podemos suspender o acesso para pôr termo a abusos (ver secção 12).

## 6. Os seus conteúdos

Mantém todos os direitos sobre os ficheiros, projetos e mapas que carrega ou cria. Concede-nos uma licença não exclusiva e mundial para alojar, tratar, apresentar e copiar esses conteúdos apenas na medida necessária para prestar e proteger o serviço. Declara que tem o direito de carregar e tratar as peças desenhadas (incluindo, quando for o caso, a autorização do dono de obra ou do projetista e o cumprimento de deveres de confidencialidade e de direitos de autor dos documentos de um concurso) e que estas não violam a lei. Não utilizamos os seus conteúdos para lhe fazer publicidade a si nem a terceiros.

**Conteúdos ilícitos.** Os seus conteúdos são privados da sua conta e não os difundimos ao público. Ainda assim, qualquer pessoa pode denunciar conteúdos que considere ilícitos escrevendo para [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}), com os motivos e a localização exata. Analisamos as denúncias com diligência e objetividade. Se removermos ou restringirmos conteúdos, ou suspendermos ou encerrarmos uma conta, por serem ilícitos ou violarem estes Termos, enviamos-lhe uma exposição de motivos com a decisão, os factos e fundamentos, a eventual utilização de meios automatizados e a forma de contestar (responda a essa mensagem no prazo de 6 meses; reapreciamos com intervenção humana). Podemos comunicar às autoridades situações que façam suspeitar de ameaça à vida ou à segurança ou de crime grave.

## 7. A nossa propriedade intelectual

O serviço, o respetivo software, design, marcas e documentação pertencem-nos ou aos nossos licenciantes. Concedemos-lhe um direito limitado, não exclusivo e intransmissível de utilizar o serviço durante a vigência do seu plano e para os fins a que se destina. Os componentes de código aberto regem-se pelas respetivas licenças. Se nos enviar sugestões, podemos usá-las livremente, sem obrigação para connosco.

## 8. Disponibilidade, apoio e alterações ao serviço

Esforçamo-nos por manter o serviço disponível e seguro, mas não garantimos um funcionamento ininterrupto: manutenções, falhas de terceiros ou eventos fora do nosso controlo podem afetá-lo. O tempo que uma folha demora a processar varia com o ficheiro e a carga do serviço e não é garantido. Salvo acordo separado que fixe um nível de serviço, não existe compromisso de disponibilidade. O apoio está disponível por e-mail em [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}); procuramos responder em poucos dias úteis, sem compromisso de prazo.

Podemos atualizar e melhorar o serviço. Se uma alteração reduzir de forma relevante as funcionalidades que contratou, informá-lo-emos com 30 dias de antecedência, por e-mail, e pode cessar o contrato nesse prazo, com reembolso da parte não utilizada de qualquer período pré-pago.

## 9. Resultados e responsabilidade pela revisão

O {{site.name}} é um assistente de medição. Apresenta as quantidades calculadas a partir da geometria dos PDF para as rever; não certifica nem assina medições, não substitui o orçamentista e não garante um nível de exatidão. Não indicamos percentagens de precisão.

- A revisão pelo utilizador é obrigatória antes de exportar. É responsável por confirmar a escala de cada folha, por verificar cada quantidade contra as peças originais (a folha «Rasto» do ficheiro Excel ajuda a fazê-lo) e por decidir como usa o resultado.
- O serviço pode não detetar todos os elementos de um desenho e os agrupamentos por estilo gráfico podem juntar elementos diferentes ou separar elementos iguais. Os resultados dependem da qualidade do PDF.
- Não prestamos aconselhamento técnico nem jurídico (por exemplo, sobre erros e omissões em procedimentos de contratação pública).
- Se encontrar um erro do serviço, avise-nos; corrigimo-lo com diligência. Uma folha processada com um erro técnico pode ser devolvida (secção 1).

## 10. Responsabilidade

Nada nestes Termos exclui ou limita a responsabilidade que não possa ser excluída ou limitada por lei, incluindo a responsabilidade por dolo ou negligência grosseira, ou por morte ou ofensas à integridade física.

Na medida em que a lei o permita, não respondemos por danos indiretos ou consequenciais, lucros cessantes, perda de receitas, de oportunidades de negócio ou de dados, nem por decisões de orçamentação, propostas, preços ou perdas em concursos baseadas nas quantidades, que são da sua responsabilidade (secção 9). A nossa responsabilidade total por qualquer reclamação decorrente do serviço fica limitada ao montante que nos pagou nos 12 meses anteriores ao facto que deu origem à reclamação.

## 11. Dados pessoais e confidencialidade

Tratamos dados pessoais conforme descrito na Política de Privacidade. Se as peças que carregar contiverem dados pessoais de outras pessoas, atuamos como seu subcontratante ao abrigo de um acordo de subcontratação de dados, que faz parte destes Termos e está disponível, em inglês, mediante pedido para [{{contact.privacyEmail}}](mailto:{{contact.privacyEmail}}). Prevê, entre outras matérias, a lista de subcontratantes ulteriores (com aviso de 30 dias antes de acrescentar um) e o aviso de violações de dados em 48 horas.

Tratamos os seus ficheiros e mapas como informação confidencial. Não os lemos nem os partilhamos com ninguém, exceto: (a) com a sua autorização, para lhe prestar apoio; (b) na medida necessária para garantir a segurança e o funcionamento do serviço; (c) aos prestadores que o alojam, como subcontratantes; e (d) quando a lei o exigir. Não os usamos para treinar modelos de inteligência artificial, e as peças não são enviadas a nenhum fornecedor de inteligência artificial.

## 12. Duração, cancelamento, suspensão, exportação e mudança de fornecedor

Pode cancelar a qualquer momento (secção 3) ou pedir o encerramento da conta em [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}) (ou na aplicação, quando a opção existir). Salvo o previsto na secção 4 e na lei, não é devido reembolso pelo restante período já pago. Podemos suspender ou fazer cessar o seu acesso se violar gravemente estes Termos e não corrigir a situação num prazo razoável após o nosso aviso, ou de imediato em caso de abuso grave, atividade ilícita ou risco para o serviço ou para terceiros. Se fizermos cessar o contrato sem culpa sua, reembolsamos a parte não utilizada de qualquer período pré-pago.

**Exportar os seus dados e mudar de fornecedor.** Enquanto a conta estiver ativa, pode exportar os seus mapas de quantidades para Excel quando quiser. Se quiser mudar para outro fornecedor ou passar a tratar os dados por si:

- avise-nos por escrito em [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}); o contrato cessa no fim do período já pago e nunca mais de 2 meses depois do aviso;
- a transição demora, no máximo, 30 dias;
- depois de o contrato cessar, tem 30 dias para recuperar os seus dados; eliminamo-los a seguir (ver Política de Privacidade);
- pode recuperar os ficheiros PDF que carregou, os seus projetos, escalas, grupos e quantidades e os mapas de quantidades, num formato estruturado e de uso corrente (Excel e, a pedido, JSON);
- não cobramos taxas pela exportação nem pela mudança de fornecedor.

## 13. Alterações a estes Termos

Podemos alterar estes Termos por motivos válidos (por exemplo, alterações legais, novas funcionalidades, segurança). Informá-lo-emos com, pelo menos, 30 dias de antecedência sobre alterações relevantes, por e-mail ou no serviço. Se não concordar, pode cancelar antes de a alteração produzir efeitos; se continuar a utilizar o serviço depois dessa data, aplicam-se os novos Termos. As alterações a condições essenciais (preço, âmbito) de um período já pago só se aplicam a partir da renovação seguinte.

## 14. Lei aplicável, tribunais e reclamações

Aplica-se a estes Termos {{legal.governingLaw}}. São exclusivamente competentes {{legal.jurisdiction}}, sem prejuízo dos direitos imperativos que a lei confira a quem seja consumidor.

**Reclamações.** Contacte-nos primeiro em [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}). Pode também usar o Livro de Reclamações Eletrónico: [{{legal.complaintsBookUrl}}]({{legal.complaintsBookUrl}}).

## 15. Disposições gerais

Estes Termos e os documentos a que remetem constituem o acordo integral entre nós quanto ao serviço. Declara ter lido e aceite estes Termos antes de criar a conta ou de pagar. Se uma disposição for inválida, as restantes mantêm-se em vigor. A demora no exercício de um direito não implica renúncia. Podemos transmitir os nossos direitos e obrigações a um sucessor do negócio; o utilizador não pode transmitir os seus sem o nosso consentimento. Estes Termos são disponibilizados em português e em inglês; em caso de divergência, prevalece a versão portuguesa.

## 16. Contacto

{{company.legalName}} · {{company.address}}, {{company.country}} · [{{contact.email}}](mailto:{{contact.email}}) · Apoio: [{{contact.supportEmail}}](mailto:{{contact.supportEmail}}).
