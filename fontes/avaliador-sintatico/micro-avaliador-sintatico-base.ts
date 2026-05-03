import { Unario, Binario, Logico } from '../construtos';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { Declaracao } from '../declaracoes';
import { SimboloInterface } from '../interfaces';
import { RetornoAvaliadorSintaticoInterface, RetornoLexadorInterface } from '../interfaces/retornos';
import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';

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

    erro(
        simbolo: SimboloInterface,
        mensagemDeErro: string,
        codigoDiagnostico?: string,
        simboloRelacionado?: SimboloInterface
    ): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(
            simbolo,
            mensagemDeErro,
            codigoDiagnostico,
            simboloRelacionado
        );
        this.erros.push(excecao);
        return excecao;
    }

    consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        throw this.erro(this.simbolos[this.atual], mensagemDeErro);
    }

    abstract chamar(): ConstrutoInterface;

    unario(): ConstrutoInterface {
        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NEGACAO, tiposDeSimbolos.SUBTRACAO)
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            return new Unario(-1, operador, direito, 'ANTES');
        }

        return this.chamar();
    }

    exponenciacao(): ConstrutoInterface {
        let expressao = this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.exponenciacao();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    multiplicar(): ConstrutoInterface {
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

    adicaoOuSubtracao(): ConstrutoInterface {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.multiplicar();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    comparar(): ConstrutoInterface {
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

    comparacaoIgualdade(): ConstrutoInterface {
        let expressao = this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    e(): ConstrutoInterface {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(-1, expressao, operador, direito);
        }

        return expressao;
    }

    ou(): ConstrutoInterface {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.e();
            expressao = new Logico(-1, expressao, operador, direito);
        }

        return expressao;
    }

    declaracao(): Declaracao | ConstrutoInterface {
        return this.ou();
    }

    abstract analisar(
        retornoLexador: RetornoLexadorInterface<SimboloInterface>,
        linha: number
    ): RetornoAvaliadorSintaticoInterface<Declaracao>;
}


