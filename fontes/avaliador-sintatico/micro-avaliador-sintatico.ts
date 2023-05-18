import { AcessoIndiceVariavel, AcessoMetodo, Agrupamento, Binario, Chamada, Construto, Dicionario, Isto, Literal, Logico, Super, Unario, Variavel, Vetor } from "../construtos";
import { Declaracao } from "../declaracoes";
import { SimboloInterface } from "../interfaces";
import { RetornoAvaliadorSintatico, RetornoLexador } from "../interfaces/retornos";
import { ErroAvaliadorSintatico } from "./erro-avaliador-sintatico";

import tiposDeSimbolos from "../tipos-de-simbolos/microgramaticas/delegua";

/**
 * O MicroAvaliadorSintatico funciona apenas dentro de interpolações de texto. 
 */
export class MicroAvaliadorSintatico {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    atual: number;

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

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];
        let valores = [];
        switch (simboloAtual.tipo) {
            // TODO: Verificar se vamos usar isso.
            /* case tiposDeSimbolos.CHAVE_ESQUERDA:
                this.avancarEDevolverAnterior();
                const chaves = [];
                valores = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    return new Dicionario(-1, Number(simboloAtual.linha), [], []);
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    const chave = this.atribuir();
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' entre chave e valor.");
                    const valor = this.atribuir();

                    chaves.push(chave);
                    valores.push(valor);

                    if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                        this.consumir(tiposDeSimbolos.VIRGULA, 'Esperado vírgula antes da próxima expressão.');
                    }
                }

                return new Dicionario(-1, Number(simboloAtual.linha), chaves, valores); */

            // TODO: Verificar se vamos usar isso.
            /* case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                valores = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    return new Vetor(-1, Number(simboloAtual.linha), []);
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    const valor = this.atribuir();
                    valores.push(valor);
                    if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.COLCHETE_DIREITO) {
                        this.consumir(tiposDeSimbolos.VIRGULA, 'Esperado vírgula antes da próxima expressão.');
                    }
                }

                return new Vetor(-1, Number(simboloAtual.linha), valores);
            */

            case tiposDeSimbolos.FALSO:
                this.avancarEDevolverAnterior();
                return new Literal(-1, Number(simboloAtual.linha), false);

            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                // Se o próximo símbolo é um incremento ou um decremento,
                // aqui deve retornar um unário correspondente.
                // Caso contrário, apenas retornar um construto de variável.
                if (
                    this.simbolos[this.atual] &&
                    [tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR].includes(this.simbolos[this.atual].tipo)
                ) {
                    const simboloIncrementoDecremento: SimboloInterface = this.avancarEDevolverAnterior();
                    return new Unario(
                        -1,
                        simboloIncrementoDecremento,
                        new Variavel(-1, simboloIdentificador),
                        'DEPOIS'
                    );
                }

                return new Variavel(-1, simboloIdentificador);

            case tiposDeSimbolos.NULO:
                this.avancarEDevolverAnterior();
                return new Literal(-1, Number(simboloAtual.linha), null);

            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
                const simboloNumeroTexto: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(-1, Number(simboloNumeroTexto.linha), simboloNumeroTexto.literal);

            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.ou();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(-1, Number(simboloAtual.linha), expressao);

            case tiposDeSimbolos.VERDADEIRO:
                this.avancarEDevolverAnterior();
                return new Literal(-1, Number(simboloAtual.linha), true);
        }

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    finalizarChamada(entidadeChamada: Construto): Construto {
        const argumentos: Array<Construto> = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (argumentos.length >= 255) {
                    throw this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 argumentos.');
                }
                argumentos.push(this.ou());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        const parenteseDireito = this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");

        return new Chamada(-1, entidadeChamada, parenteseDireito, argumentos);
    }

    chamar(): Construto {
        let expressao = this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome do método após '.'.");
                expressao = new AcessoMetodo(-1, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = this.ou();
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(-1, expressao, indice, simboloFechamento);
            } else {
                break;
            }
        }

        return expressao;
    }

    unario(): Construto {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.BIT_NOT,
                tiposDeSimbolos.INCREMENTAR,
                tiposDeSimbolos.DECREMENTAR
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

    bitShift(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MENOR_MENOR, tiposDeSimbolos.MAIOR_MAIOR)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.adicaoOuSubtracao();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    bitE(): Construto {
        let expressao = this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.bitShift();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    bitOu(): Construto {
        let expressao = this.bitE();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.bitE();
            expressao = new Binario(-1, expressao, operador, direito);
        }

        return expressao;
    }

    comparar(): Construto {
        let expressao = this.bitOu();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.bitOu();
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

    em(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(-1, expressao, operador, direito);
        }

        return expressao;
    }

    e(): Construto {
        let expressao = this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.em();
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
        /* switch (this.simbolos[this.atual].tipo) {

        } */

        return this.ou();
    }

    analisar(retornoLexador: RetornoLexador): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;

        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes: Declaracao[] = [];
        while (this.atual < this.simbolos.length) {
            declaracoes.push(this.declaracao() as Declaracao);
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}