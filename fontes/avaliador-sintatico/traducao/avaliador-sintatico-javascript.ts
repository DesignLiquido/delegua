/* istanbul ignore file */
import { Directive, ModuleDeclaration, Statement } from 'estree';
import { Construto, FuncaoConstruto, Leia } from '../../construtos';
import {
    Enquanto,
    Escreva,
    Expressao,
    Para,
    ParaCada,
    Se,
    Sustar,
    Continua,
    Retorna,
    Escolha,
    Importar,
    Tente,
    Fazer,
    Const,
    Var,
    FuncaoDeclaracao,
    Classe,
} from '../../declaracoes';
import { AvaliadorSintaticoInterface } from '../../interfaces';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';

export class AvaliadorSintaticoJavaScript
    implements
        AvaliadorSintaticoInterface<
            Statement | Directive | ModuleDeclaration,
            Statement | Directive | ModuleDeclaration
        >
{
    simbolos: (Statement | Directive | ModuleDeclaration)[];
    erros: ErroAvaliadorSintatico[];
    atual: number;
    blocos: number;

    erro(simbolo: any, mensagemDeErro: string): ErroAvaliadorSintatico {
        throw new Error('Método não implementado.');
    }

    async analisar(
        retornoLexador: RetornoLexador<Statement | Directive | ModuleDeclaration>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Statement | Directive | ModuleDeclaration>> {
        return Promise.resolve({
            declaracoes: retornoLexador.simbolos,
            erros: [],
        });
    }
}
