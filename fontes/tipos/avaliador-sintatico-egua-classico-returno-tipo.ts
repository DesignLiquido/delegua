import {
    AcessoIndiceVariavel,
    Agrupamento,
    Chamada,
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
    | AcessoIndiceVariavel
    | Chamada;
