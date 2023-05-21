import { Agrupamento, Atribuir, Construto, FuncaoConstruto, Literal, Variavel } from "../../construtos";
import { Escreva, Declaracao, Se, Enquanto, Para, Escolha, Fazer, EscrevaMesmaLinha } from "../../declaracoes";
import { RetornoLexador, RetornoAvaliadorSintatico } from "../../interfaces/retornos";
import { AvaliadorSintaticoBase } from "../avaliador-sintatico-base";

import tiposDeSimbolos from "../../tipos-de-simbolos/potigol";
import { SimboloInterface } from "../../interfaces";

export class AvaliadorSintaticoPotigol extends AvaliadorSintaticoBase {
    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);
            case tiposDeSimbolos.CARACTERE:
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.LOGICO:
            case tiposDeSimbolos.REAL:
            case tiposDeSimbolos.TEXTO:
                const simboloVariavel: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloVariavel.linha), simboloVariavel.literal);
            default:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                return new Variavel(this.hashArquivo, simboloIdentificador);
        }
    }

    chamar(): Construto {
        return this.primario();
    }
    

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    declaracaoImprima(): EscrevaMesmaLinha {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    blocoEscopo(): Declaracao[] {
        throw new Error("Método não implementado.");
    }
    declaracaoSe(): Se {
        throw new Error("Método não implementado.");
    }
    declaracaoEnquanto(): Enquanto {
        throw new Error("Método não implementado.");
    }
    declaracaoPara(): Para {
        throw new Error("Método não implementado.");
    }
    declaracaoEscolha(): Escolha {
        throw new Error("Método não implementado.");
    }
    declaracaoFazer(): Fazer {
        throw new Error("Método não implementado.");
    }
    corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error("Método não implementado.");
    }

    declaracao(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.IMPRIMA:
                return this.declaracaoImprima();
            default:
                return this.expressao();
        }
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (expressao instanceof Variavel) {
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.DOIS_PONTOS:
                    this.avancarEDevolverAnterior();
                    if (![
                        tiposDeSimbolos.CARACTERE,
                        tiposDeSimbolos.INTEIRO,
                        tiposDeSimbolos.LOGICO,
                        tiposDeSimbolos.REAL,
                        tiposDeSimbolos.TEXTO
                    ].includes(this.simbolos[this.atual].tipo)) {
                        throw this.erro(
                            this.simbolos[this.atual], 
                            "Esperado tipo após dois-pontos e nome de identificador."
                        );
                    }

                    const tipoVariavel = this.avancarEDevolverAnterior();
                    this.consumir(tiposDeSimbolos.IGUAL, 
                        "Esperado sinal de igual após tipo de variável.");

                    const valorAtribuicao = this.ou();
                    return new Atribuir(this.hashArquivo, (expressao as Variavel).simbolo, valorAtribuicao);
            }
        }

        return expressao;
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao() as Declaracao);
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}