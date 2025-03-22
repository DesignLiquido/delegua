# Tradutores

Em Delégua, tradutores são peças de código que traduzem código de uma linguagem de programação em outra. Tradutores reversos especificamente traduzem de alguma linguagem de programação para Delégua. 

Na grande maioria dos tradutores reversos, [ANTLR](https://www.antlr.org/) é usado, mas ANTLR é bastante complexo e caro no processamento. É o método preferido de implementação de um mecanismo de tradução reversa, já que quando uma linguagem tem alguma gramática definida em ANTLR, sua importação para o projeto é bastante simples, ainda que bastante verbosa. 

Em outros casos, como no caso de JavaScript, uma biblioteca dedicada é usada. Nesse exemplo, usamos [Esprima](https://www.npmjs.com/package/esprima), uma bem consolidada biblioteca de análise para JavaScript. Ainda, temos o caso em que nenhum desses recursos está disponível, como por exemplo nos dialetos de Portugol. Para esses casos, usamos tradutores customizados.

## Implementação de tradução reversa com ANTLR

ANTLR normalmente gera quatro elementos de código:

- Um lexador (_lexer_)
- Um avaliador sintático (_parser_)
- Um visitador (_visitor_)
- Um ouvinte (_listener_)

Como no mecanismo natural de Delégua, o lexador mapeia o léxico do código e o avaliador sintático verifica se a cadência léxica faz sentido. Os elementos que são originais de ANTLR são o visitador e o ouvinte.

O visitador é uma espécie de interpretador, só que com uma ideia um pouco mais simples. Sua função é visitar cada elemento de alto nível gerado pelo avaliador sintático e dizer ao ouvinte que elemento é aquele. Já o ouvinte, gerado por ANTLR, é apenas a interface (contrato) do ouvinte que devemos implementar para fazer a lógica que queremos: neste caso, traduzir o código para cada mensagem recebida do visitador. Usando uma analogia humana, o visitante lê a peça no idioma original e o ouvinte traduz a peça para outro idioma. 

A grande diferença entre este padrão e o padrão de tradutor customizado é que o visitador notifica o ouvinte quando inicia a visita a um elemento e quando a finaliza, o que permite um alto nível de customização na lógica de tradução do ouvinte. Já o tradutor customizado visita todos os elementos de alto nível em ordem e os resolve num único passo. 

Um exemplo desse mecanismo funcionando está no tradutor reverso de Python.