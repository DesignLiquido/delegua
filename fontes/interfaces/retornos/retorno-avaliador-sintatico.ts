import { ErroAvaliadorSintatico } from '../../avaliador-sintatico/erro-avaliador-sintatico';

export interface RetornoAvaliadorSintatico<T> {
    declaracoes: T[];
    erros: ErroAvaliadorSintatico[];
}
