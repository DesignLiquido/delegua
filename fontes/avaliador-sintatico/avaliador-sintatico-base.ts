import { Binario, Construto, Funcao, Logico, Unario } from '../construtos';
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
    Declaracao,
} from '../declaracoes';
import { AvaliadorSintaticoInterface, SimboloInterface } from '../interfaces';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../interfaces/retornos';
import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';

import tiposDeSimbolos from '../tipos-de-simbolos/comum';

/**
 * O Avaliador Sintático Base é uma tentativa de mapear métodos em comum
 * entre todos os outros Avaliadores Sintáticos. Depende de um dicionário
 * de tipos de símbolos comuns entre todos os dialetos.
 */
export abstract class AvaliadorSintaticoBase implements AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    atual: number;
    blocos: number;

    consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        throw this.erro(this.simbolos[this.atual], mensagemDeErro);
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico {
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

    avancarEDevolverAnterior(): SimboloInterface {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simbolos[this.atual - 1];
    }

    verificarSeSimboloAtualEIgualA(...argumentos: string[]): boolean {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificarTipoSimboloAtual(tipoAtual)) {
                this.avancarEDevolverAnterior();
                return true;
            }
        }

        return false;
    }

    abstract primario(): Construto;

    finalizarChamada(entidadeChamada: Construto): Construto {
        throw new Error('Método não implementado.');
    }

    abstract chamar(): Construto;

    unario(): Construto {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NEGACAO, tiposDeSimbolos.SUBTRACAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            return new Unario(-1, operador, direito);
        }

        return this.chamar();
    }

    exponenciacao(): Construto {
        throw new Error('Método não implementado.');
    }

    multiplicar(): Construto {
        let expressao = this.unario();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MODULO
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    adicaoOuSubtracao(): Construto {
        let expressao = this.multiplicar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.multiplicar();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    bitFill(): Construto {
        throw new Error('Método não implementado.');
    }

    bitE(): Construto {
        throw new Error('Método não implementado.');
    }

    bitOu(): Construto {
        throw new Error('Método não implementado.');
    }

    comparar(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.adicaoOuSubtracao();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    em(): Construto {
        throw new Error('Método não implementado.');
    }

    e(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(-1, expressao, operador, direito);
        }

        return expressao;
    }

    ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.e();
            expressao = new Logico(-1, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * `atribuir()` deve chamar `ou()` na implementação.
     */
    abstract atribuir(): Construto;

    expressao(): Construto {
        return this.atribuir();
    }

    abstract declaracaoEscreva(): Escreva;

    declaracaoExpressao(): Expressao {
        throw new Error('Método não implementado.');
    }

    abstract blocoEscopo(): Declaracao[];

    declaracaoSe(): Se {
        throw new Error('Método não implementado.');
    }

    abstract declaracaoEnquanto(): Enquanto;

    abstract declaracaoPara(): Para;

    declaracaoSustar(): Sustar {
        throw new Error('Método não implementado.');
    }

    declaracaoContinua(): Continua {
        throw new Error('Método não implementado.');
    }

    declaracaoRetorna(): Retorna {
        throw new Error('Método não implementado.');
    }

    abstract declaracaoEscolha(): Escolha;

    declaracaoImportar(): Importar {
        throw new Error('Método não implementado.');
    }

    declaracaoTente(): Tente {
        throw new Error('Método não implementado.');
    }

    abstract declaracaoFazer(): Fazer;

    resolverDeclaracao() {
        throw new Error('Método não implementado.');
    }

    declaracaoDeVariavel(): Var {
        throw new Error('Método não implementado.');
    }

    funcao(tipo: string): FuncaoDeclaracao {
        const simboloFuncao: SimboloInterface = this.avancarEDevolverAnterior();

        const nomeFuncao: SimboloInterface = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`);
        return new FuncaoDeclaracao(nomeFuncao, this.corpoDaFuncao(tipo));
    }

    abstract corpoDaFuncao(tipo: string): Funcao;

    declaracaoDeClasse(): Classe {
        throw new Error('Método não implementado.');
    }

    abstract declaracao(): Declaracao;

    abstract analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico;
}
