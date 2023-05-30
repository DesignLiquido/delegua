import { Construto, Unario, Binario, Logico } from "../construtos";
import { Declaracao } from "../declaracoes";
import { SimboloInterface } from "../interfaces";
import { RetornoAvaliadorSintatico, RetornoLexador } from "../interfaces/retornos";
import { ErroAvaliadorSintatico } from "./erro-avaliador-sintatico";

import tiposDeSimbolos from '../tipos-de-simbolos/comum';

export abstract class MicroAvaliadorSintaticoBase {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    atual: number;
    linha: number;

    avancarEDevolverAnterior(): SimboloInterface {
        if (this.atual < this.simbolos.length) this.atual += 1;
        return this.simbolos[this.atual - 1];
    }

    verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.atual === this.simbolos.length) return false;
        return this.simbolos[this.atual].tipo === tipo;
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

    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        this.erros.push(excecao);
        return excecao;
    }

    consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        throw this.erro(this.simbolos[this.atual], mensagemDeErro);
    }

    abstract chamar(): Construto;

    unario(): Construto {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.SUBTRACAO
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            return new Unario(-1, operador, direito, 'ANTES');
        }

        return this.chamar();
    }

    exponenciacao(): Construto {
        let expressao = this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    multiplicar(): Construto {
        let expressao = this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.MODULO,
                tiposDeSimbolos.MULTIPLICACAO
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.exponenciacao();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    adicaoOuSubtracao(): Construto {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.ADICAO
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.multiplicar();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
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

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
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

    declaracao(): Declaracao | Construto {
        return this.ou();
    }

    abstract analisar(retornoLexador: RetornoLexador, linha: number): RetornoAvaliadorSintatico;
}