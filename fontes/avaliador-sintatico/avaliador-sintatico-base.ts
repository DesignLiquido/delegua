import { Construto, Funcao } from '../construtos';
import {
    Escreva,
    Expressao,
    Se,
    Enquanto,
    Para,
    Sustar,
    Continua,
    Retorna,
    Escolha,
    Importar,
    Tente,
    Fazer,
    Var,
    Funcao as FuncaoDeclaracao,
    Classe,
} from '../declaracoes';
import { AvaliadorSintaticoInterface, SimboloInterface } from '../interfaces';
import {
    RetornoLexador,
    RetornoAvaliadorSintatico,
} from '../interfaces/retornos';
import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';

export abstract class AvaliadorSintaticoBase
    implements AvaliadorSintaticoInterface
{
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    atual: number;
    ciclos: number;

    consumir(tipo: any, mensagemDeErro: string) {
        if (this.verificarTipoSimboloAtual(tipo))
            return this.avancarEDevolverAnterior();
        throw this.erro(this.simbolos[this.atual], mensagemDeErro);
    }

    erro(
        simbolo: SimboloInterface,
        mensagemDeErro: string
    ): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        this.erros.push(excecao);
        return excecao;
    }

    verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual].tipo === tipo;
    }

    verificarTipoProximoSimbolo(tipo: string): boolean {
        return this.simbolos[this.atual + 1].tipo === tipo;
    }

    estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    avancarEDevolverAnterior() {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simbolos[this.atual - 1];
    }

    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificarTipoSimboloAtual(tipoAtual)) {
                this.avancarEDevolverAnterior();
                return true;
            }
        }

        return false;
    }

    primario(): Construto {
        throw new Error('Method not implemented.');
    }

    finalizarChamada(entidadeChamada: Construto): Construto {
        throw new Error('Method not implemented.');
    }

    chamar() {
        throw new Error('Method not implemented.');
    }

    unario(): Construto {
        throw new Error('Method not implemented.');
    }

    exponenciacao(): Construto {
        throw new Error('Method not implemented.');
    }

    multiplicar(): Construto {
        throw new Error('Method not implemented.');
    }

    adicaoOuSubtracao(): Construto {
        throw new Error('Method not implemented.');
    }

    bitFill(): Construto {
        throw new Error('Method not implemented.');
    }

    bitE(): Construto {
        throw new Error('Method not implemented.');
    }

    bitOu(): Construto {
        throw new Error('Method not implemented.');
    }

    comparar(): Construto {
        throw new Error('Method not implemented.');
    }

    comparacaoIgualdade(): Construto {
        throw new Error('Method not implemented.');
    }

    em(): Construto {
        throw new Error('Method not implemented.');
    }

    e(): Construto {
        throw new Error('Method not implemented.');
    }

    ou(): Construto {
        throw new Error('Method not implemented.');
    }

    abstract atribuir(): Construto;

    expressao(): Construto {
        return this.atribuir();
    }

    abstract declaracaoEscreva(): Escreva;

    declaracaoExpressao(): Expressao {
        throw new Error('Method not implemented.');
    }

    blocoEscopo(): any[] {
        throw new Error('Method not implemented.');
    }

    declaracaoSe(): Se {
        throw new Error('Method not implemented.');
    }

    declaracaoEnquanto(): Enquanto {
        throw new Error('Method not implemented.');
    }

    abstract declaracaoPara(): Para;

    declaracaoSustar(): Sustar {
        throw new Error('Method not implemented.');
    }

    declaracaoContinua(): Continua {
        throw new Error('Method not implemented.');
    }

    declaracaoRetorna(): Retorna {
        throw new Error('Method not implemented.');
    }

    declaracaoEscolha(): Escolha {
        throw new Error('Method not implemented.');
    }

    declaracaoImportar(): Importar {
        throw new Error('Method not implemented.');
    }

    declaracaoTente(): Tente {
        throw new Error('Method not implemented.');
    }

    declaracaoFazer(): Fazer {
        throw new Error('Method not implemented.');
    }

    resolverDeclaracao() {
        throw new Error('Method not implemented.');
    }

    declaracaoDeVariavel(): Var {
        throw new Error('Method not implemented.');
    }

    funcao(tipo: any): FuncaoDeclaracao {
        throw new Error('Method not implemented.');
    }

    corpoDaFuncao(tipo: any): Funcao {
        throw new Error('Method not implemented.');
    }

    declaracaoDeClasse(): Classe {
        throw new Error('Method not implemented.');
    }

    abstract declaracao(): any;

    abstract analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico;
}