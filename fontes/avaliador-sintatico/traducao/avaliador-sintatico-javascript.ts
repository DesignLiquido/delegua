/* istanbul ignore file */
import { Directive, ModuleDeclaration, Statement } from 'estree';

import { AvaliadorSintaticoInterface } from '../../interfaces';
import { RetornoLexadorInterface, RetornoAvaliadorSintaticoInterface } from '../../interfaces/retornos';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';

export class AvaliadorSintaticoJavaScript implements AvaliadorSintaticoInterface<
    Statement | Directive | ModuleDeclaration,
    Statement | Directive | ModuleDeclaration
> {
    simbolos: (Statement | Directive | ModuleDeclaration)[];
    erros: ErroAvaliadorSintatico[];
    atual: number;
    blocos: number;

    erro(_: any, __: string): ErroAvaliadorSintatico {
        throw new Error('Método não implementado.');
    }

    async analisar(
        retornoLexador: RetornoLexadorInterface<Statement | Directive | ModuleDeclaration>,
        _: number
    ): Promise<RetornoAvaliadorSintaticoInterface<Statement | Directive | ModuleDeclaration>> {
        return Promise.resolve({
            declaracoes: retornoLexador.simbolos,
            erros: [],
        });
    }
}
