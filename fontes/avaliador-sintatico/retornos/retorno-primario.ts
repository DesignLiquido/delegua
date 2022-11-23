import {
    AcessoIndiceVariavel,
    Agrupamento,
    Chamada,
    Dicionario,
    FuncaoConstruto,
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
    | FuncaoConstruto;
