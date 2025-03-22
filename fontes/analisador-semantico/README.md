# Analisador Semântico

Analisadores Semânticos não exatamente executam código. A ideia é visitar as declarações geradas pelo Avaliador Sintático elemento a elemento, anotando sequencialmente algumas informações, e conferindo outras. Se em algum momento algo não faz sentido, o Analisador Semântico anota uma observação no retorno.

Seu uso mais conhecido é em editores de código, como Delégua Web, e a extensão da Design Líquido para o Visual Studio Code.