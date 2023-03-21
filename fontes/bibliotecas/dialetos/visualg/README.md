# Bibliotecas do VisuAlg

Seguindo a mesma filosofia de Delégua, a implementação da biblioteca global de VisuAlg depende das bibliotecas que fazem parte do ecossistema de Delégua.

[Segundo o site da documentação mais recente do VisuAlg](https://manual.visualg3.com.br/doku.php?id=manual), os seguintes métodos são suportados no VisuAlg:

- `Abs(expressão)` - Retorna o valor absoluto de uma expressão do tipo inteiro ou real. Equivale a | expressão | na álgebra.
- `ArcCos(expressão)` - Retorna o ângulo (em radianos) cujo cosseno é representado por expressão.
- `ArcSen(expressão)` - Retorna o ângulo (em radianos) cujo seno é representado por expressão.
- `ArcTan(expressão)` - Retorna o ângulo (em radianos) cuja tangente é representada por expressão.
- `Cos(expressão)` - Retorna o cosseno do ângulo (em radianos) representado por expressão.
- `CoTan(expressão)` - Retorna a co-tangente do ângulo (em radianos) representado por expressão.
- `Exp(base, expoente)` - Retorna o valor de base elevado a expoente, sendo ambos expressões do tipo real.
- `GraupRad(expressão)` - Retorna o valor em radianos, correspondente ao valor em graus representado por expressão.
- `Int(expressão)` - Retorna a parte inteira do valor representado por expressão.
- `Log(expressão)` - Retorna o logaritmo na base 10 do valor representado por expressão.
- `LogN(expressão)` - Retorna o logaritmo neperiano (base e) do valor representado por expressão.
- `Pi()` - Retorna o valor 3.141592.
- `Quad(expressão)` - Retorna quadrado do valor representado por expressão.
- `RadpGrau(expressão)` - Retorna o valor em graus correspondente ao valor em radianos, representado por expressão.
- `RaizQ(expressão)` - Retorna a raiz quadrada do valor representado por expressão.
- `Rand()` - Retorna um número real gerado aleatoriamente, maior ou igual a zero e menor que um.
- `RandI(limite)` - Retorna um número inteiro gerado aleatoriamente, maior ou igual a zero e menor que limite.
- `Sen(expressão)` - Retorna o seno do ângulo (em radianos) representado por expressão.
- `Tan(expressão)` - Retorna a tangente do ângulo (em radianos) representado por expressão. 

A forma de registrar os nomes das funções é a mesma do dialeto de Égua Clássico no núcleo da linguagem. Verifique o arquivo `index.ts` deste diretório com a implementação.