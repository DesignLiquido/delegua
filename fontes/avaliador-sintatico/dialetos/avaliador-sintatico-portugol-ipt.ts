import { AcessoIndiceVariavel, AtribuicaoSobrescrita, Atribuir, Construto, FormatacaoEscrita, FuncaoConstruto, Literal, Variavel } from "../../construtos";
import { Escreva, Declaracao, Se, Enquanto, Para, Escolha, Fazer, EscrevaMesmaLinha } from "../../declaracoes";
import { RetornoLexador, RetornoAvaliadorSintatico } from "../../interfaces/retornos";
import { AvaliadorSintaticoBase } from "../avaliador-sintatico-base";

import tiposDeSimbolos from '../../tipos-de-simbolos/portugol-ipt';
import { SimboloInterface } from "../../interfaces";

export class AvaliadorSintaticoPortugolIpt extends AvaliadorSintaticoBase {
    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NUMERO, tiposDeSimbolos.TEXTO)) {
            const simboloAnterior: SimboloInterface = this.simbolos[this.atual - 1];
            return new Literal(this.hashArquivo, Number(simboloAnterior.linha), simboloAnterior.literal);
        }
    }

    /**
     * Aparentemente, o Portugol IPT não suporta chamadas de função.
     * @returns O retorno da chamada de `primario()`.
     */
    chamar(): Construto {
        return this.primario();
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA_ATRIBUICAO)) {
            const setaAtribuicao = this.simbolos[this.atual - 1];
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoSobrescrita(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }

            this.erro(setaAtribuicao, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    /**
     * A declaração escreva (ou escrever) do Portugol IPT é sempre na mesma linha.
     */
    declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        // const argumentos = this.logicaComumEscreva();
        const argumentos: FormatacaoEscrita[] = [];
        do {
            const valor = this.declaracao();

            argumentos.push(
                new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), this.hashArquivo, argumentos);
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
            case tiposDeSimbolos.ESCREVER:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            default:
                return this.expressao();
        }
    }

    private validarSegmentoInicio(): void {
        this.consumir(
            tiposDeSimbolos.INICIO,
            `Esperada expressão 'inicio' para marcar escopo do algoritmo.`
        );
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
            this.avancarEDevolverAnterior();
        }

        let declaracoes = [];
        this.validarSegmentoInicio();

        while (!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM) {
            declaracoes.push(this.declaracao());
        }

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}