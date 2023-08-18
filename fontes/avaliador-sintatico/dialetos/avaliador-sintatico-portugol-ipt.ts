import { AcessoIndiceVariavel, AtribuicaoPorIndice, Atribuir, Construto, FormatacaoEscrita, FuncaoConstruto, Literal, Variavel } from "../../construtos";
import { Escreva, Declaracao, Se, Enquanto, Para, Escolha, Fazer, EscrevaMesmaLinha, Var, Leia } from "../../declaracoes";
import { RetornoLexador, RetornoAvaliadorSintatico } from "../../interfaces/retornos";
import { AvaliadorSintaticoBase } from "../avaliador-sintatico-base";

import tiposDeSimbolos from '../../tipos-de-simbolos/portugol-ipt';
import { SimboloInterface } from "../../interfaces";

export class AvaliadorSintaticoPortugolIpt extends AvaliadorSintaticoBase {
    primario(): Construto {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();

                return new Variavel(this.hashArquivo, simboloIdentificador);
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.TEXTO:
                const simboloAnterior: SimboloInterface = this.avancarEDevolverAnterior();
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
                return new AtribuicaoPorIndice(
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
        this.avancarEDevolverAnterior();
        const condicao = this.expressao();
        this.consumir(tiposDeSimbolos.ENTAO, "Esperado 'então' ou 'entao' após condição do se.");
        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após palavra reservada 'então' ou 'entao' em condição se.");

        const caminhoEntao = this.declaracao();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA));

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após palavra reservada 'senão' ou 'senao' em instrução se.");
            caminhoSenao = this.declaracao();
        }

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após palavra reservada 'então' ou 'entao' em condição se.");
        this.consumir(tiposDeSimbolos.FIMSE, "Esperado 'fimse' para finalização de uma instrução se.");

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
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

    declaracaoInteiros(): Var[] {
        const simboloInteiro = this.consumir(tiposDeSimbolos.INTEIRO, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'inteiro'."
            );

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = 0;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const literalInicializacao = this.consumir(tiposDeSimbolos.INTEIRO,
                    'Esperado literal inteiro após símbolo de igual em declaração de variável.');
                valorInicializacao = Number(literalInicializacao.literal);
            }

            inicializacoes.push(new Var(identificador, new Literal(this.hashArquivo, Number(simboloInteiro.linha), valorInicializacao)));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    /**
     * Análise de uma declaração `leia()`. No VisuAlg, `leia()` aceita 1..N argumentos.
     * @returns Uma declaração `Leia`.
     */
    declaracaoLeia(): Leia {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos = [];
        do {
            argumentos.push(this.declaracao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new Leia(simboloAtual.hashArquivo, Number(simboloAtual.linha), argumentos);
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error("Método não implementado.");
    }

    declaracao(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVER:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.INTEIRO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.LER:
                return this.declaracaoLeia();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.SE:
                return this.declaracaoSe();
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

    analisar(retornoLexador: RetornoLexador<SimboloInterface>, hashArquivo: number): RetornoAvaliadorSintatico<Declaracao> {
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
            const resolucaoDeclaracao = this.declaracao();
            if (Array.isArray(resolucaoDeclaracao)) {
                declaracoes = declaracoes.concat(resolucaoDeclaracao);
            } else {
                declaracoes.push(resolucaoDeclaracao);
            }
        }

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
