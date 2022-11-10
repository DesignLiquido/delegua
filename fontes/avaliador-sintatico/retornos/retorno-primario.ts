import {
    AcessoIndiceVariavel,
    Agrupamento,
    Chamada,
    Dicionario,
    Funcao,
    Isto,
    Literal,
    Super,
    Variavel,
    Vetor,
} from '../../construtos';
import { Importar } from '../../declaracoes';

export type RetornoPrimario =
    | Super
    | Vetor
    | Dicionario
    | Literal
    | Isto
    | Agrupamento
    | Variavel
    | AcessoIndiceVariavel
    | Chamada
    | Importar
    | Funcao;
