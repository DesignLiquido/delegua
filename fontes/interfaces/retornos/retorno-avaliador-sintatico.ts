import { ErroAvaliadorSintatico } from '../../avaliador-sintatico/erro-avaliador-sintatico';

export interface RetornoAvaliadorSintatico<T> {
    // declaracoes: (Declaracao | Statement | Directive | ModuleDeclaration)[];
    declaracoes: T[];
    erros: ErroAvaliadorSintatico[];
}
