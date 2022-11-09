import {
    Bloco,
    Continua,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    Para,
    Retorna,
    Se,
    Sustar,
    Tente,
} from '../../declaracoes';

export type RetornoResolverDeclaracao =
    Escreva
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
