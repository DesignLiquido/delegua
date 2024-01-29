/* istanbul ignore file */
import { Directive, ModuleDeclaration, Statement } from 'estree';
import { Construto, FuncaoConstruto } from '../../construtos';
import {
    Enquanto,
    Escreva,
    Expressao,
    Leia,
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

    consumir(tipo: any, mensagemDeErro: string) {
        throw new Error('Método não implementado.');
    }

    erro(simbolo: Statement | Directive | ModuleDeclaration, mensagemDeErro: string): ErroAvaliadorSintatico {
        throw new Error('Método não implementado.');
    }

    verificarTipoSimboloAtual(tipo: string): boolean {
        throw new Error('Método não implementado.');
    }

    verificarTipoProximoSimbolo(tipo: string): boolean {
        throw new Error('Método não implementado.');
    }

    estaNoFinal(): boolean {
        throw new Error('Método não implementado.');
    }

    avancarEDevolverAnterior() {
        throw new Error('Método não implementado.');
    }

    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean {
        throw new Error('Método não implementado.');
    }

    primario() {
        throw new Error('Método não implementado.');
    }

    finalizarChamada(entidadeChamada: Construto): Construto {
        throw new Error('Método não implementado.');
    }

    chamar(): Construto {
        throw new Error('Método não implementado.');
    }

    unario(): Construto {
        throw new Error('Método não implementado.');
    }

    exponenciacao(): Construto {
        throw new Error('Método não implementado.');
    }

    multiplicar(): Construto {
        throw new Error('Método não implementado.');
    }

    adicaoOuSubtracao(): Construto {
        throw new Error('Método não implementado.');
    }

    bitShift(): Construto {
        throw new Error('Método não implementado.');
    }

    bitE(): Construto {
        throw new Error('Método não implementado.');
    }

    bitOu(): Construto {
        throw new Error('Método não implementado.');
    }

    comparar(): Construto {
        throw new Error('Método não implementado.');
    }

    comparacaoIgualdade(): Construto {
        throw new Error('Método não implementado.');
    }

    em(): Construto {
        throw new Error('Método não implementado.');
    }

    e(): Construto {
        throw new Error('Método não implementado.');
    }

    ou(): Construto {
        throw new Error('Método não implementado.');
    }

    atribuir(): Construto {
        throw new Error('Método não implementado.');
    }

    blocoEscopo(): any[] {
        throw new Error('Método não implementado.');
    }

    expressao(): Construto {
        throw new Error('Método não implementado.');
    }

    declaracaoEnquanto(): Enquanto {
        throw new Error('Método não implementado.');
    }

    declaracaoEscreva(): Escreva {
        throw new Error('Método não implementado.');
    }

    declaracaoExpressao(): Expressao {
        throw new Error('Método não implementado.');
    }

    declaracaoLeia(): Leia {
        throw new Error('Método não implementado.');
    }

    declaracaoPara(): Para | ParaCada {
        throw new Error('Método não implementado.');
    }

    declaracaoSe(): Se {
        throw new Error('Método não implementado.');
    }

    declaracaoSustar(): Sustar {
        throw new Error('Método não implementado.');
    }

    declaracaoContinua(): Continua {
        throw new Error('Método não implementado.');
    }

    declaracaoRetorna(): Retorna {
        throw new Error('Método não implementado.');
    }

    declaracaoEscolha(): Escolha {
        throw new Error('Método não implementado.');
    }

    declaracaoImportar(): Importar {
        throw new Error('Método não implementado.');
    }

    declaracaoTente(): Tente {
        throw new Error('Método não implementado.');
    }

    declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
    }

    resolverDeclaracao() {
        throw new Error('Método não implementado.');
    }

    declaracaoDeConstantes(): Const[] {
        throw new Error('Método não implementado.');
    }

    declaracaoDeVariaveis(): Var[] {
        throw new Error('Método não implementado.');
    }

    declaracaoDeVariavel(): Var {
        throw new Error('Método não implementado.');
    }

    funcao(tipo: string): FuncaoDeclaracao {
        throw new Error('Método não implementado.');
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error('Método não implementado.');
    }

    declaracaoDeClasse(): Classe {
        throw new Error('Método não implementado.');
    }

    resolverDeclaracaoForaDeBloco() {
        throw new Error('Método não implementado.');
    }

    analisar(
        retornoLexador: RetornoLexador<Statement | Directive | ModuleDeclaration>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Statement | Directive | ModuleDeclaration> {
        return {
            declaracoes: retornoLexador.simbolos,
            erros: [],
        };
    }
}
