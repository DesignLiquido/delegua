import { Construto, FuncaoConstruto, Leia, Literal } from '../../construtos';
import { Escreva, Declaracao, Se, Enquanto, Para, Escolha, Fazer, Expressao } from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { SimboloInterface } from '../../interfaces';

import tiposDeSimbolos from '../../tipos-de-simbolos/guarani';

/**
 * Este avaliador sintático é produto de uma reunião entre pessoas da
 * Design Líquido e representantes de comunidades indígenas da América do Sul.
 * Um dia pode ser terminado para virar um dialeto completo.
 */
export class AvaliadorSintaticoGuarani extends AvaliadorSintaticoBase {
    protected expressaoLeia(): Promise<Leia> {
        throw new Error('Método não implementado.');
    }

    primario(): Promise<Construto> {
        const simboloAtual = this.simbolos[this.atual];
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NUMERO, tiposDeSimbolos.TEXTO)) {
            const simboloAnterior: SimboloInterface = this.simbolos[this.atual - 1];
            return Promise.resolve(new Literal(
                this.hashArquivo,
                Number(simboloAnterior.linha),
                simboloAnterior.literal
            ));
        }

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    async chamar(): Promise<Construto> {
        let expressao = await this.primario();

        /* while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome do método após '.'.");
                expressao = new AcessoMetodo(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = this.expressao();
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(this.hashArquivo, expressao, indice, simboloFechamento);
            } else {
                break;
            }
        } */

        return expressao;
    }

    async atribuir(): Promise<Construto> {
        const expressao = await this.ou();

        /* if (
            expressao instanceof Binario &&
            [
                tiposDeSimbolos.MAIS_IGUAL,
                tiposDeSimbolos.MENOS_IGUAL,
                tiposDeSimbolos.MULTIPLICACAO_IGUAL,
                tiposDeSimbolos.DIVISAO_IGUAL,
                tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL,
                tiposDeSimbolos.MODULO_IGUAL,
            ].includes(expressao.operador.tipo)
        ) {
            return new Atribuir(this.hashArquivo, (expressao.esquerda as Variavel).simbolo, expressao);
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const igual = this.simbolos[this.atual - 1];
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoMetodo) {
                const get = expressao;
                // return new Conjunto(this.hashArquivo, 0, get.objeto, get.simbolo, valor);
                return new DefinirValor(this.hashArquivo, 0, get.objeto, get.simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    0,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }
            throw this.erro(igual, 'Tarefa de atribuição inválida');
        } */

        return expressao;
    }

    async declaracaoEscreva(): Promise<Escreva> {
        const simboloAtual = this.consumir(tiposDeSimbolos.HAI, '');

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Oñeha'arõ '(' valores mboyve jehaipyrépe."
        );

        const argumentos: Construto[] = [];

        do {
            argumentos.push(await this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Oñeha'arõ ')' valores rire jehaipyrépe.");

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    blocoEscopo(): Promise<Declaracao[]> {
        throw new Error('Método não implementado.');
    }

    declaracaoSe(): Promise<Se> {
        throw new Error('Método não implementado.');
    }

    declaracaoEnquanto(): Promise<Enquanto> {
        throw new Error('Método não implementado.');
    }

    declaracaoPara(): Promise<Para> {
        throw new Error('Método não implementado.');
    }

    declaracaoEscolha(): Escolha {
        throw new Error('Método não implementado.');
    }

    declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
    }

    async corpoDaFuncao(tipo: string): Promise<FuncaoConstruto> {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de pragma.
        const parenteseEsquerdo = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = await this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, `Esperado '{' antes do escopo do ${tipo}.`);

        const corpo = await this.blocoEscopo();

        return new FuncaoConstruto(
            this.hashArquivo,
            Number(parenteseEsquerdo.linha),
            parametros,
            corpo
        );
    }

    async expressao(): Promise<Construto> {
        return await this.atribuir();
    }

    async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]> {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.HAI:
                return await this.declaracaoEscreva();
            default:
                return new Expressao(await this.expressao());
        }
    }

    async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            declaracoes.push(await this.resolverDeclaracaoForaDeBloco() as Declaracao);
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
