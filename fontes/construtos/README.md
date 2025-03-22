# Construtos

Construtos são estruturas da linguagem que não executam por si só. Normalmente requerem estar dentro de uma declaração. Por padrão, `Expressao` pode ser usada para avaliar um ou mais construtos.

Construtos podem ser intermediários ou definitivos. A maioria dos construtos é definitiva. Construtos intermediários são emitidos durante a avaliação sintática e resolvidos a posteriori como outros construtos. Por exemplo, `ConstanteOuVariavel` é emitido pela avaliação primária do avaliador sintático quando não é possível determinar se o símbolo resolve como uma constante, variável, declaração ou chamada de função ou chamada de construtor de tipo (dialeto Potigol). Outro exemplo é `AcessoMetodoOuPropriedade`, que em Delégua é resolvido em outros dois construtos: `AcessoMetodo` ou `AcessoPropriedade`. 

Todo construto é uma classe em TypeScript que deriva de `Construto`, uma interface, e que obriga a implementação de um método chamado `visitar()`. O método `visitar()` possui o argumento `visitante`, que pode ser um interpretador, um tradutor, um formatador, etc. Ele indica qual método do visitante deve ser chamado. 

## Pragmas

Todo construto carrega a referência do código original de onde veio. Essa referência é chamada de pragma. Em Delégua, pragmas são representados por duas informações: o _hash_ do arquivo (gerado a partir do caminho completo do arquivo de código), e a linha onde o construto é mencionado. Essas informações são fundamentais para geração de relatórios de erros, depuração interna, e orientações para ferramentas automatizadas.