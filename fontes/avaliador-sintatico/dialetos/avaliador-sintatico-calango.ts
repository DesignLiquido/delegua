import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Construto,
    FormatacaoEscrita,
    FuncaoConstruto,
    Leia,
    Literal,
    Variavel,
} from '../../construtos';
import {
    Bloco,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Fazer,
    Para,
    ParaCada,
    Se,
    Var,
} from '../../declaracoes';
import { RetornoLexador, SimboloInterface, RetornoAvaliadorSintatico } from '../../interfaces';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { PilhaEscopos } from '../pilha-escopos';
import { InformacaoEscopo } from '../informacao-escopo';
import { InformacaoElementoSintatico } from '../../informacao-elemento-sintatico';
import { TipoInferencia } from '../../inferenciador';

import tiposDeSimbolos from '../../tipos-de-simbolos/calango';

export class AvaliadorSintaticoCalango extends AvaliadorSintaticoBase {
    pilhaEscopos: PilhaEscopos;

    constructor() {
        super();

        this.pilhaEscopos = new PilhaEscopos();
    }

    protected async atribuir(): Promise<Construto> {
        const expressao = await this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL_ATRIBUICAO)) {
            const setaAtribuicao = this.simbolos[this.atual - 1];
            const valor = await this.atribuir();

            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

            if (expressao instanceof Variavel) {
                return new Atribuir(this.hashArquivo, expressao, valor);
            }

            if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }

            throw this.erro(setaAtribuicao, 'Tarefa de atribuição inválida');
        }
        return expressao;
    }

    protected blocoEscopo(): Promise<Declaracao[]> {
        throw new Error('Método não implementado.');
    }

    protected async chamar(): Promise<Construto> {
        return await this.primario();
    }

    protected declaracaoEnquanto(): Promise<Enquanto> {
        throw new Error('Método não implementado.');
    }

    protected declaracaoEscolha(): Escolha {
        throw new Error('Método não implementado.');
    }

    // Em Calango, método "escreval"
    protected async declaracaoEscreva(): Promise<Escreva> {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: FormatacaoEscrita[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                const valor = await this.resolverDeclaracaoForaDeBloco();

                argumentos.push(
                    new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
                );
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        return new Escreva(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    /**
     * Em Calango, este é o método `escreva()`.
     * @returns {EscrevaMesmaLinha} Uma declaracao de escrita na mesma linha.
     */
    protected async declaracaoEscrevaMesmaLinha(): Promise<EscrevaMesmaLinha> {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: FormatacaoEscrita[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                const valor = await this.resolverDeclaracaoForaDeBloco();

                argumentos.push(
                    new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
                );
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    private declaracaoVariaveis(tipoToken: string, tipoDelégua: TipoInferencia, valorPadrao: any): Var[] {
        const simboloTipo = this.avancarEDevolverAnterior();

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após palavra reservada '${simboloTipo.lexema}'.`
            );

            inicializacoes.push(
                new Var(
                    identificador,
                    new Literal(this.hashArquivo, Number(simboloTipo.linha), valorPadrao, tipoDelégua)
                )
            );

            this.pilhaEscopos.definirInformacoesVariavel(
                identificador.lexema,
                new InformacaoElementoSintatico(identificador.lexema, tipoDelégua)
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            'Esperado ponto e vírgula após declaração de variáveis.'
        );

        return inicializacoes;
    }

    protected declaracaoInteiros(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.INTEIRO, 'inteiro', 0);
    }

    protected declaracaoReais(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.REAL, 'real', 0.0);
    }

    protected declaracaoLogicos(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.LOGICO, 'lógico', false);
    }

    protected declaracaoCaracteres(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.CARACTER, 'caracter', '');
    }

    protected declaracaoTextos(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.TIPO_TEXTO, 'texto', '');
    }

    protected declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
    }

    protected declaracaoPara(): Promise<Para | ParaCada> {
        throw new Error('Método não implementado.');
    }

    protected async resolverBloco(simbolosParada: string[]): Promise<Bloco> {
        const declaracoes = [];
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        const primeiroSimbolo = this.simbolos[this.atual];

        while (!this.estaNoFinal() && !simbolosParada.includes(this.simbolos[this.atual].lexema)) {
            declaracoes.push(await this.resolverDeclaracaoForaDeBloco());
        }

        this.pilhaEscopos.removerUltimo();
        return new Bloco(
            this.hashArquivo,
            primeiroSimbolo.linha,
            declaracoes.filter((d) => d)
        );
    }

    protected async declaracaoSe(): Promise<Se> {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'");
        const condicao = await this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do 'se'");
        this.consumir(tiposDeSimbolos.ENTAO, "Esperado 'entao' após condição");

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        const caminhoEntao = await this.resolverBloco(['senao', 'fimSe']);

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA));

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);
            caminhoSenao = await this.resolverBloco(['senao', 'fimSe']);
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        this.consumir(
            tiposDeSimbolos.FIM_SE,
            "Esperado 'fimSe' para finalização de uma instrução se."
        );

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    protected async expressaoLeia(): Promise<Leia> {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' depois da declaração 'leia'"
        );

        const argumentos = [];

        do {
            argumentos.push(await this.resolverDeclaracaoForaDeBloco());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração 'leia'");

        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            'Esperado ponto e vírgula após declaração leia'
        );

        return new Leia(simboloAtual, argumentos);
    }

    protected async primario(): Promise<Construto> {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                let tipoOperando: string;

                try {
                    tipoOperando = this.pilhaEscopos.obterTipoVariavelPorNome(
                        simboloIdentificador.lexema
                    );
                } catch (erro: any) {
                    throw this.erro(simboloIdentificador, erro.message);
                }

                return new Variavel(this.hashArquivo, simboloIdentificador, tipoOperando);
            case tiposDeSimbolos.NUMERO:
                const simboloNumero: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloNumero.linha),
                    simboloNumero.literal,
                    Number.isInteger(simboloNumero.literal) ? 'inteiro' : 'real'
                );
            case tiposDeSimbolos.TEXTO:
                const simboloTexto: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloTexto.linha), simboloTexto.literal, 'texto');
            case tiposDeSimbolos.LITERAL_CARACTER:
                const simboloCaracter: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloCaracter.linha), simboloCaracter.literal, 'caracter');
            case tiposDeSimbolos.VERDADEIRO:
                const simboloVerdadeiro: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloVerdadeiro.linha), true, 'lógico');
            case tiposDeSimbolos.FALSO:
                const simboloFalso: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloFalso.linha), false, 'lógico');
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = await this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(
                    this.hashArquivo,
                    this.simbolos[this.atual].linha,
                    expressao
                );
        }
    }

    override async resolverDeclaracaoForaDeBloco(): Promise<
        Declaracao | Declaracao[] | Construto | Construto[] | any
    > {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVA:
                return await this.declaracaoEscrevaMesmaLinha();
            case tiposDeSimbolos.ESCREVAL:
                return await this.declaracaoEscreva();
            case tiposDeSimbolos.LEIA:
                return await this.expressaoLeia();
            case tiposDeSimbolos.INTEIRO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.REAL:
                return this.declaracaoReais();
            case tiposDeSimbolos.LOGICO:
                return this.declaracaoLogicos();
            case tiposDeSimbolos.CARACTER:
                return this.declaracaoCaracteres();
            case tiposDeSimbolos.TIPO_TEXTO:
                return this.declaracaoTextos();
            case tiposDeSimbolos.SE:
                return await this.declaracaoSe();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            default:
                return await this.expressao();
        }
    }

    protected corpoDaFuncao(tipo: string): Promise<FuncaoConstruto> {
        throw new Error('Método não implementado.');
    }

    private validarSegmentoAlgoritmo(): void {
        this.consumir(tiposDeSimbolos.ALGORITMO, `Expressão 'algoritmo' não declarada`);

        this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado identificador após 'algoritmo'.`);

        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            `Esperado ponto e vírgula após identificador do algoritmo.`
        );
    }

    private validarSegmentoPrincipal(algoritmoOuFuncao: string): void {
        this.consumir(tiposDeSimbolos.PRINCIPAL, `Expressão 'principal' não declarada`);
    }

    async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.pilhaEscopos = new PilhaEscopos();
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
            this.avancarEDevolverAnterior();
        }

        let declaracoes = [];

        this.validarSegmentoAlgoritmo();
        this.validarSegmentoPrincipal('principal');

        while (
            !this.estaNoFinal() &&
            this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM_PRINCIPAL
        ) {
            const resolucaoDeclaracao = await this.resolverDeclaracaoForaDeBloco();

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
