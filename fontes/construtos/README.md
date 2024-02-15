# Construtos

Construtos são estruturas da linguagem que não executam por si só. Normalmente requerem estar dentro de uma declaração. Por padrão, `Expressao` pode ser usada para avaliar um ou mais construtos.

Alguns construtos nunca vão para a interpretação, tradução ou avaliação semântica. Por exemplo, `ConstanteOuVariavel`, emitido pela avaliação primária do avaliador sintático quando não é possível determinar se o símbolo resolve como uma constante, variável, declaração ou chamada de função ou chamada de construtor de tipo (dialeto Portugol). Outro exemplo é `Decorador`, que não é usado pela interpretação mas por outros componentes, como avaliadores semânticos, formatadores e bibliotecas específicas.