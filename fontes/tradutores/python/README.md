# Tradutor Python

Neste diretório temos um lexador e um avaliador sintático gerados a partir de uma gramática do ANTLR. A primeira gramática tentada foi https://github.com/bkiers/grammars-v4/tree/master/python/python3, mas algumas coisas tiveram que ser implementadas na mão, e o resultado tem alguns problemas. Por exemplo, não detecta quebras de linha corretamente.

A gramática atual está em https://github.com/bkiers/grammars-v4/tree/master/python/python3-ts.

## Atualização da gramática

Normalmente feita com o comando:

```sh
yarn antlr4ts -visitor /caminho/completo/para/gramática/Python3.g4
```