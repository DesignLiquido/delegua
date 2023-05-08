# Analisador Semântico

Analisadores Semânticos não exatamente executam código. A ideia é visitar as declarações geradas pelo Avaliador Sintático elemento a elemento, anotndo sequencialmente algumas informações, e conferindo outras. Se em algum momento algo não faz sentido, o Analisador Semântico anota uma observação no retorno.