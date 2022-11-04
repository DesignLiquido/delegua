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
} from '../../declaracoes';

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
