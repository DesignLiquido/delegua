import { ErroAvaliadorSintatico } from '../../avaliador-sintatico/erro-avaliador-sintatico';

export interface RetornoAvaliadorSintaticoInterface<T> {
    declaracoes: T[];
    erros: ErroAvaliadorSintatico[];
}
