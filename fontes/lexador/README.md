# Lexador

O Lexador, ou analisador léxico, transforma um código fonte em uma lista de símbolos. A ordem dos símbolos gerados é relevante para a próxima etapa: a avaliação sintática.

Um símbolo é equivalente a um lexema. Um lexema é uma unidade básica do léxico de qualquer linguagem, sendo formada por um ou mais caracteres. Como Delégua e dialetos são implementados seguindo a língua portuguesa, o alfabeto usado por padrão é o latino, com caracteres acentuados. 

Caracteres que não são alfanuméricos normalmente possuem funções de estruturação e cadência nas linguagens implementadas. Por exemplo, os símbolos de abre e fecha chaves - `{` e `}`, respectivamente, podem representar tanto a definição de um escopo em Delégua quanto a definição de um dicionário. Cada um desses símbolos é traduzido pelo lexador para `tiposDeSimbolos.CHAVE_ESQUERDA` e `tiposDeSimbolos.CHAVE_DIREITA`, respectivamente.

Todos os tipos de símbolos para Delégua e dialetos [estão definidos aqui](https://github.com/DesignLiquido/delegua/tree/principal/fontes/tipos-de-simbolos). 

## Micro Lexador

Delégua possui um micro lexador implementado. O micro lexador é utilizado em situações em que precisamos trabalhar com um número reduzido de símbolos. Um caso clássico é o de interpolação de texto, em que não faz sentido aceitar quebras de linha, ponto-e-vígula, ou abertura e fechamento de chaves - esses últimos usados justamente para cercar o escopo da interpolação. 