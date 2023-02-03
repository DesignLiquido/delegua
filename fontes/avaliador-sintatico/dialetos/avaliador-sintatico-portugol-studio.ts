import { AcessoIndiceVariavel, AtribuicaoSobrescrita, Atribuir, Construto, FuncaoConstruto, Literal, Variavel } from "../../construtos";
import { Escreva, Declaracao, Se, Enquanto, Para, Escolha, Fazer } from "../../declaracoes";
import { RetornoLexador, RetornoAvaliadorSintatico } from "../../interfaces/retornos";
import { AvaliadorSintaticoBase } from "../avaliador-sintatico-base";

import tiposDeSimbolos from '../../tipos-de-simbolos/portugol-studio';
import { SimboloInterface } from "../../interfaces";

export class AvaliadorSintaticoPortugolStudio extends AvaliadorSintaticoBase {
    private validarEscopoPrograma(declaracoes: Declaracao[]): void {
        this.consumir(tiposDeSimbolos.PROGRAMA, "Esperada expressão 'programa' para inicializar programa.");

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperada chave esquerda após expressão 'programa' para inicializar programa.");

        /* this.consumir(tiposDeSimbolos.FUNCAO, "Esperada declaração de função após expressão 'programa' para inicializar programa.");
        const funcaoInicio = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperada declaração de função 'inicio()' após expressão 'programa' para inicializar programa.");

        if (funcaoInicio.lexema !== 'inicio') {
            throw this.erro(funcaoInicio, "Esperada declaração de função 'inicio()' após expressão 'programa' para inicializar programa.");
        }

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado parêntese esquerdo após identificador de função 'inicio()' para inicializar programa.");
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado parêntese direito após identificador de função 'inicio()' para inicializar programa."); */

        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao() as Declaracao);
        }

        if (this.simbolos[this.atual - 1].tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
            throw this.erro(this.simbolos[this.atual - 1], "Esperado chave direita final para término do programa.");
        }
    }

    primario(): Construto {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.REAL, tiposDeSimbolos.CADEIA)) {
            const simboloAnterior: SimboloInterface = this.simbolos[this.atual - 1];
            return new Literal(this.hashArquivo, Number(simboloAnterior.linha), simboloAnterior.literal);
        }
    }

    chamar(): Construto {
        let expressao = this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indices = [];
                do {
                    indices.push(this.expressao());
                } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

                const indice = indices[0];
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(this.hashArquivo, expressao, indice, simboloFechamento);
            } else {
                break;
            }
        }

        return expressao;
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
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

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.simbolos[this.atual];

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
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

    expressao(): Construto {
        // if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.LEIA)) return this.declaracaoLeia();
        return this.atribuir();
    }

    declaracao(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.FUNCAO:
                return this.funcao('funcao');
            case tiposDeSimbolos.PROGRAMA:
            case tiposDeSimbolos.CHAVE_DIREITA:
                this.avancarEDevolverAnterior();
                return null;
            default:
                return this.expressao();
        }
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes: Declaracao[] = [];
        this.validarEscopoPrograma(declaracoes);

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}