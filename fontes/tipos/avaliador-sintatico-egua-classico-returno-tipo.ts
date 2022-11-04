import {
    AcessoIndiceVariavel,
    Agrupamento,
    Dicionario,
    Isto,
    Literal,
    Super,
    Variavel,
    Vetor,
} from '../construtos';

export type RetornaPrimario =
    | Super
    | Vetor
    | Dicionario
    | Literal
    | Isto
    | Agrupamento
    | Variavel
    | AcessoIndiceVariavel;
