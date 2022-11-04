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
} from '../construtos';
import {
    Bloco,
    Classe,
    Continua,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    Importar,
    Para,
    Retorna,
    Se,
    Sustar,
    Tente,
    Var,
} from '../declaracoes';

export type RetornaPrimario =
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

export type RetornoResolverDeclaracao =
    | Escreva
    | Expressao
    | Se
    | Enquanto
    | Para
    | Sustar
    | Continua
    | Retorna
    | Escolha
    | Tente
    | Fazer
    | Bloco;

export type RetornoDeclaracao =
    | Var
    | Funcao
    | Classe
    | RetornoResolverDeclaracao;
