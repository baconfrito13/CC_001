# Show HN — veredicto: não elegível, não fazer

**Teste de elegibilidade** (regras lidas em https://news.ycombinator.com/showhn.html em 2026-11-28): Show HN é para algo que «outras pessoas podem experimentar», «idealmente sem barreiras como registo ou e-mail»; proíbe «landing pages», páginas de registo e projetos que ainda não estão prontos para experimentar; pede para não pedir votos a amigos. **O Rastoplan exige criar conta com e-mail e um PDF vetorial de CAD** para ser experimentado, e o público de HN não é o público-alvo. **Registo: «no Show HN».**

**Reavaliar só se** (a) existir um projeto de exemplo que se experimenta **sem registo** (US-11 com acesso anónimo, hoje fora do âmbito) e (b) houver uma história técnica própria que valha a pena contar (por exemplo, ler geometria vetorial de PDF no navegador e no servidor com `pdfjs-dist`, medidas de desempenho reais). Nesse caso, uma só submissão por versão grande, nunca por funcionalidade.

**Regras para o caso de avançar** (https://news.ycombinator.com/newsguidelines.html): título «Show HN: Rastoplan – quantity takeoff from vector PDF plans»; sem maiúsculas, exclamações ou superlativos; ligação para o produto em si; **o texto do envio e dos comentários tem de ser escrito pelo próprio fundador** (HN proíbe texto gerado ou editado por IA e automatização): este ficheiro é só uma folha de factos.

## Folha de factos para o fundador (não é texto final)
- Problema: orçamentistas medem plantas em PDF à mão e têm dificuldade em defender os números.
- Como funciona: lê operadores de desenho do PDF vetorial (`pdfjs-dist` 6.x no servidor), aplica a matriz de transformação, converte para a escala da folha, amostra curvas, agrupa por estilo (cor/espessura/traço), mostra no navegador para aceitar/rejeitar; exporta Excel com folha «Rasto». (`docs/04-architecture.md`, spike S1/S2.)
- Limites: só PDF vetorial; sem DWG; sem digitalizados; sem volumes por perfis; agrupamento por estilo **não validado em plantas reais** (G-GEO inconclusivo, ADR 0006): dizê-lo.
- Desempenho medido no spike sintético: 50 000 elementos em 0,55 s, 249 MB (`docs/lessons.md`, 2026-11-28); **não é medida em folhas reais**.
- O que o fundador quer saber: onde a leitura de geometria falha em PDF de CAD reais.
