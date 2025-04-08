# Avaliador Sintático

O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível. Essas estruturas de alto nível são as partes chamadas resolvidas do código, e que podem conter lógica de programação de fato, ou que contêm informações importantes a serem consideradas em etapas posteriores. É a funcionalidade mais importante de Delégua, já que seu resultado é utilizado para:

- Interpretar o código e executá-lo;
- Formatar o código;
- Compilar o código em binário;
- Preparar o código para outras análises, como a análise semântica.

Há dois grupos de estruturas de alto nível: Construtos e Declarações. 

- Um Construto não executa por si só;
- Uma combinação de Construtos precisa estar contida em uma Expressão para ser válida;
- Uma Expressão é um tipo de Declaração;
- Uma Declaração é um elemento que
    - Pode ser executado pelo Interpretador;
    - Pode ser traduzido pelo Tradutor;
    - Pode ser analisado pelo Analisador Semântico;
    - Pode ser compilado em instruções binárias.

## Micro Avaliador Sintático

Há algumas situações em que a avaliação sintática de uma linguagem precisa ser feita num âmbito reduzido, como por exemplo em interpolações de texto (como no analisador sintático de Delégua), ou em verificação preguiçosa de parâmetros de funções (ver [avaliador sintático de Potigol](https://github.com/DesignLiquido/potigol/tree/principal/fontes/avaliador-sintatico) para um exemplo). Por exemplo, não faz sentido em uma interpolação de texto termos funcionalidades totais de Delégua, como uma declaração de classe, de tipo ou de função, mas faz sentido avaliarmos expressões menores, como operações matemáticas ou de texto. 

Micro avaliadores sintáticos cumprem essa função. Tendo a implementação da sintaxe da linguagem reduzida para alguns casos, não apenas o processamento é mais rápido como é também mais seguro, tendo a limitação de escopo como uma vantagem para detecção de erros.