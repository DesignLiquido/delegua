import hrtime from 'browser-process-hrtime';

import {
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    Construto,
    Dicionario,
    FuncaoConstruto,
    Isto,
    Literal,
    Logico,
    Super,
    Unario,
    Variavel,
    Leia,
    FimPara,
    ImportarComoConstruto,
} from '../../construtos';
import {
    Escreva,
    Se,
    Enquanto,
    Para,
    Continua,
    Retorna,
    Importar,
    Var,
    FuncaoDeclaracao,
    Classe,
    Declaracao,
    Expressao,
    Bloco,
    Sustar,
} from '../../declaracoes';

import { ParametroInterface, SimboloInterface } from '../../interfaces';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { RetornoLexador } from '../../interfaces/retornos/retorno-lexador';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from '../../interfaces/retornos/retorno-avaliador-sintatico';

import { inferirTipoVariavel, TipoInferencia } from '../../inferenciador';

import { PilhaEscopos } from '../pilha-escopos';
import { InformacaoEscopo } from '../informacao-escopo';
import { registrarPrimitiva } from '../comum';
import { InformacaoElementoSintatico } from '../../informacao-elemento-sintatico';
import { Simbolo } from '../../lexador';

import tiposDeDadosPrisma from '../../tipos-de-dados/dialetos/prisma';
import tiposDeSimbolos from '../../tipos-de-simbolos/prisma';

import primitivasDicionario from '../../bibliotecas/primitivas-dicionario';
import primitivasNumero from '../../bibliotecas/primitivas-numero';
import primitivasTexto from '../../bibliotecas/primitivas-texto';
import primitivasVetor from '../../bibliotecas/primitivas-vetor';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 *
 * Este avaliador sintático é específico para o dialeto Prisma da linguagem Delégua.
 */
export class AvaliadorSintaticoPrisma extends AvaliadorSintaticoBase {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];

    tiposDefinidosEmCodigo: { [nomeTipo: string]: Declaracao };
    pilhaEscopos: PilhaEscopos;
    primitivasConhecidas: {
        [nomeModuloOuClasse: string]: { [nomePrimitiva: string]: InformacaoElementoSintatico };
    };

    hashArquivo: number;
    atual: number;
    blocos: number;
    performance: boolean;
    superclasseAtual: string | undefined;

    constructor(performance = false) {
        super();
        this.atual = 0;
        this.blocos = 0;
        this.performance = performance;
        this.pilhaEscopos = new PilhaEscopos();
        this.primitivasConhecidas = {};
        this.tiposDefinidosEmCodigo = {};

        registrarPrimitiva(this.primitivasConhecidas, 'dicionário', primitivasDicionario);
        registrarPrimitiva(this.primitivasConhecidas, 'número', primitivasNumero);
        registrarPrimitiva(this.primitivasConhecidas, 'texto', primitivasTexto);
        registrarPrimitiva(this.primitivasConhecidas, 'vetor', primitivasVetor);
    }

    sincronizar(): void {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.CLASSE:
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                case tiposDeSimbolos.LOCAL:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.IMPRIMA:
                case tiposDeSimbolos.RETORNE:
                    return;
            }

            this.avancarEDevolverAnterior();
        }
    }

    consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        let simboloErro: SimboloInterface = this.simbolos[this.atual];
        if (this.simbolos.length === 0) {
            simboloErro = {
                hashArquivo: this.hashArquivo,
                linha: 1,
            } as SimboloInterface;
        } else if (this.atual >= this.simbolos.length) {
            simboloErro = this.simbolos[this.simbolos.length - 1];
        }

        throw this.erro(simboloErro, mensagemDeErro);
    }

    simboloNaPosicao(posicao: number): SimboloInterface {
        return this.simbolos[this.atual + posicao];
    }

    avancarEDevolverAnterior() {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simboloAnterior();
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

    async primario(): Promise<Construto> {
        const simboloAtual = this.simbolos[this.atual];
        let valores = [];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                switch (this.simbolos[this.atual].tipo) {
                    case tiposDeSimbolos.COLCHETE_ESQUERDO: // Texto multilinhas
                        return this.construtoTextoMultilinhas();
                    default:
                        throw this.erro(simboloAtual, 'Terminar.');
                }
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                // Prisma tem o conceito de tabela, que não é exatamente um dicionário, mas é próximo.
                // Aqui, vamos tratar como dicionário para simplificar.
                this.avancarEDevolverAnterior();
                const chaves = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    return new Dicionario(this.hashArquivo, simboloAtual.linha, [], []);
                }

                let indice = 1;
                do {
                    let chave: string = String(indice);
                    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                        // Lógica para índice nomeado
                        // TODO: Terminar
                    }

                    const valor = await this.ou();

                    chaves.push(chave);
                    valores.push(valor);
                    indice++;
                } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

                this.consumir(
                    tiposDeSimbolos.CHAVE_DIREITA,
                    `Esperado fechamento de chave em tabela.`
                );

                return new Dicionario(this.hashArquivo, simboloAtual.linha, chaves, valores);
            case tiposDeSimbolos.FALSO:
            case tiposDeSimbolos.VERDADEIRO:
                const simboloLogico = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    simboloAtual.linha,
                    simboloLogico.tipo === tiposDeSimbolos.VERDADEIRO,
                    'lógico'
                );
            case tiposDeSimbolos.FUNCAO:
            case tiposDeSimbolos.FUNÇÃO:
                const simboloFuncao = this.avancarEDevolverAnterior();
                const corpoDaFuncao = await this.corpoDaFuncao(simboloFuncao.lexema);
                this.pilhaEscopos.definirInformacoesVariavel(
                    simboloFuncao.lexema,
                    new InformacaoElementoSintatico(simboloFuncao.lexema, 'função')
                );
                return corpoDaFuncao;
            case tiposDeSimbolos.IMPORTAR:
                return this.expressaoImportar();
            case tiposDeSimbolos.NULO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, simboloAtual.linha, null);
            case tiposDeSimbolos.ISTO:
                const simboloIsto = this.avancarEDevolverAnterior();
                return new Isto(this.hashArquivo, simboloAtual.linha, simboloIsto);
            case tiposDeSimbolos.LEIA:
                return this.expressaoLeia();
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
                const simboloLiteral: SimboloInterface = this.avancarEDevolverAnterior();
                const tipoInferido = inferirTipoVariavel(simboloLiteral.literal);
                return new Literal(
                    this.hashArquivo,
                    Number(simboloLiteral.linha),
                    simboloLiteral.literal,
                    tipoInferido as TipoInferencia
                );
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador = this.avancarEDevolverAnterior();
                let tipoOperando: string;
                if (simboloIdentificador.lexema in this.tiposDefinidosEmCodigo) {
                    tipoOperando = simboloIdentificador.lexema;
                } else {
                    try {
                        tipoOperando = this.pilhaEscopos.obterTipoVariavelPorNome(
                            simboloIdentificador.lexema
                        );
                    } catch (erro: any) {
                        throw this.erro(simboloIdentificador, erro.message);
                    }
                }
                return new Variavel(this.hashArquivo, simboloIdentificador, tipoOperando);
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = await this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, simboloAtual.linha, expressao);
            case tiposDeSimbolos.SUPER:
                const simboloSuper = this.avancarEDevolverAnterior();
                return new Super(this.hashArquivo, simboloSuper, this.superclasseAtual);
        }

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    expressaoImportar(): ImportarComoConstruto {
        throw new Error('Método não implementado.');
    }

    /**
     * Construto para texto multilinhas.
     * @returns
     */
    construtoTextoMultilinhas(): Construto {
        const segundoColchete = this.consumir(
            tiposDeSimbolos.COLCHETE_ESQUERDO,
            "Esperado '[' antes do texto multilinhas."
        );
        let texto = '';
        let linha = segundoColchete.linha;
        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
            texto += this.simbolos[this.atual].lexema + ' ';
            if (this.simbolos[this.atual].linha !== linha) {
                texto += '\n';
                linha = this.simbolos[this.atual].linha;
            }
            this.avancarEDevolverAnterior();
        }
        this.consumir(tiposDeSimbolos.COLCHETE_DIREITO, "Esperado ']' após o texto multilinhas.");
        return new Literal(this.hashArquivo, segundoColchete.linha, texto);
    }

    async expressaoLeia(): Promise<Leia> {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em leia."
        );

        const argumentos: Construto[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em leia.");

        return new Leia(simboloLeia, argumentos);
    }

    protected async finalizarChamada(entidadeChamada: Construto): Promise<Chamada> {
        const argumentos = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (argumentos.length >= 255) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Não pode haver mais de 255 argumentos.'
                    );
                }
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");

        return new Chamada(this.hashArquivo, entidadeChamada, argumentos);
    }

    async chamar(): Promise<Construto> {
        let expressao: Construto = await this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = await this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do método após '.'."
                );

                expressao = new AcessoMetodoOuPropriedade(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = await this.expressao();
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );

                expressao = new AcessoIndiceVariavel(
                    this.hashArquivo,
                    expressao,
                    indice,
                    simboloFechamento
                );
            } else {
                break;
            }
        }

        return expressao;
    }

    async unario(): Promise<Construto> {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.BIT_NOT
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = await this.unario();
            return new Unario(this.hashArquivo, operador, direito);
        }

        return await this.chamar();
    }

    async exponenciacao(): Promise<Construto> {
        let expressao = await this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simboloAnterior();
            const direito = await this.unario();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async multiplicar(): Promise<Construto> {
        let expressao = await this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MODULO
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = await this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async adicaoOuSubtracao(): Promise<Construto> {
        let expressao = await this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)
        ) {
            const operador = this.simboloAnterior();
            const direito = await this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async bitShift(): Promise<Construto> {
        let expressao = await this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = await this.adicaoOuSubtracao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async bitE(): Promise<Construto> {
        let expressao = await this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simboloAnterior();
            const direito = await this.bitShift();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async bitOu(): Promise<Construto> {
        let expressao = await this.bitE();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)
        ) {
            const operador = this.simboloAnterior();
            const direito = await this.bitE();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async comparar(): Promise<Construto> {
        let expressao = await this.bitOu();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = await this.bitOu();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async comparacaoIgualdade(): Promise<Construto> {
        let expressao = await this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = await this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async em(): Promise<Construto> {
        let expressao = await this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simboloAnterior();
            const direito = await this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async e(): Promise<Construto> {
        let expressao = await this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simboloAnterior();
            const direito = await this.em();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async ou(): Promise<Construto> {
        let expressao = await this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simboloAnterior();
            const direito = await this.e();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async atribuir(): Promise<Construto> {
        const expressao = await this.ou();

        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL) ||
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)
        ) {
            const igual = this.simboloAnterior();
            const valor = await this.atribuir();

            if (expressao instanceof Variavel) {
                return new Atribuir(this.hashArquivo, expressao, valor);
            }

            if (expressao instanceof AcessoMetodoOuPropriedade) {
                return new DefinirValor(
                    this.hashArquivo,
                    0,
                    expressao.objeto,
                    expressao.simbolo,
                    valor
                );
            }

            if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    0,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }
            throw this.erro(igual, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    async expressao(): Promise<Construto> {
        return await this.atribuir();
    }

    async declaracaoEscreva(): Promise<Escreva> {
        const simboloEscreva = this.simboloAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em imprima."
        );

        const argumentos: Array<Construto> = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em imprima."
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return new Escreva(Number(simboloEscreva.linha), simboloEscreva.hashArquivo, argumentos);
    }

    async declaracaoExpressao(): Promise<Expressao> {
        const expressao = await this.expressao();
        return new Expressao(expressao);
    }

    protected async blocoEscopo(): Promise<any[]> {
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        let declaracoes: Array<Declaracao> = [];

        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.FIM) && !this.estaNoFinal()) {
            const retornoDeclaracao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        this.consumir(tiposDeSimbolos.FIM, "Esperado 'fim' após o bloco.");

        this.pilhaEscopos.removerUltimo();
        return declaracoes;
    }

    async declaracaoDeLocal(): Promise<Var> {
        const identificador = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome de variável.'
        );

        let inicializador = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            inicializador = await this.expressao();
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após declaração de variável.");

        // Para Prisma, mantemos a tipagem inferida de forma simples por enquanto.
        const tipo = 'qualquer';
        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, tipo)
        );

        return new Var(identificador, inicializador, tipo);
    }

    async declaracaoEnquanto(): Promise<Enquanto> {
        try {
            this.blocos += 1;

            const condicao = await this.expressao();
            const bloco = (await this.resolverDeclaracao()) as Bloco;

            return new Enquanto(condicao, bloco);
        } finally {
            this.blocos -= 1;
        }
    }

    async declaracaoSe(): Promise<Se> {
        const simboloSe: SimboloInterface = this.simbolos[this.atual];
        const condicao = await this.expressao();

        this.consumir(
            tiposDeSimbolos.ENTAO,
            "Esperado palavra reservada 'entao' ou 'então' após condição em declaração 'se'."
        );

        const declaracoes = [];
        do {
            declaracoes.push(await this.resolverDeclaracaoForaDeBloco());
        } while (
            !this.estaNoFinal() &&
            ![tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO, tiposDeSimbolos.FIM].includes(
                this.simbolos[this.atual].tipo
            )
        );

        let caminhoSenao = null;
        let fimConsumidoNoCaminhoSenao = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            const simboloSenao = this.simbolos[this.atual - 1];
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) {
                caminhoSenao = await this.declaracaoSe();
                fimConsumidoNoCaminhoSenao = true;
            } else {
                const declaracoesSenao = [];

                do {
                    declaracoesSenao.push(await this.resolverDeclaracaoForaDeBloco());
                } while (![tiposDeSimbolos.FIM].includes(this.simbolos[this.atual].tipo));

                caminhoSenao = new Bloco(
                    this.hashArquivo,
                    Number(simboloSenao.linha),
                    declaracoesSenao.filter((d) => d)
                );
            }
        }

        if (!fimConsumidoNoCaminhoSenao) {
            this.consumir(
                tiposDeSimbolos.FIM,
                "Esperado palavra-chave 'fimse' para fechamento de declaração 'se'."
            );
        }

        return new Se(
            condicao,
            new Bloco(
                this.hashArquivo,
                Number(simboloSe.linha),
                declaracoes.filter((d) => d)
            ),
            [],
            caminhoSenao
        );
    }

    async declaracaoQuebre(): Promise<Sustar> {
        if (this.blocos < 1) {
            throw this.erro(
                this.simboloAnterior(),
                "'quebre' deve estar dentro de um laço de repetição."
            );
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após 'quebre'.");
        return new Sustar(this.simbolos[this.atual]);
    }

    declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            throw this.erro(
                this.simboloAnterior(),
                "'continua' precisa estar em um laço de repetição."
            );
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após 'continua'.");
        return new Continua(this.simbolos[this.atual]);
    }

    async declaracaoRetorna(): Promise<Retorna> {
        const palavraChave = this.simboloAnterior();
        let valor = null;

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            valor = await this.expressao();
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após valor de retorno.");
        return new Retorna(palavraChave, valor);
    }

    async declaracaoImportar(): Promise<Importar> {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");
        const caminho = await this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new Importar(caminho as Literal);
    }

    async corpoDaFuncao(tipo: string): Promise<FuncaoConstruto> {
        const parenteseEsquerdo = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = await this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        let tipoRetorno: string = 'qualquer';
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA)) {
            tipoRetorno = 'qualquer'; // Simplificado por enquanto
        }

        const corpo = await this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, 0, parametros, corpo, tipoRetorno, false);
    }

    protected async logicaComumParametros(): Promise<ParametroInterface[]> {
        const parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                throw this.erro(
                    this.simbolos[this.atual],
                    'Função não pode ter mais de 255 parâmetros.'
                );
            }

            const parametro: Partial<ParametroInterface> = {};
            parametro.abrangencia = 'padrao';

            parametro.nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do parâmetro.'
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = await this.primario();
            }

            this.pilhaEscopos.definirInformacoesVariavel(
                parametro.nome.lexema,
                new InformacaoElementoSintatico(
                    parametro.nome.lexema,
                    parametro.tipoDado || 'qualquer'
                )
            );

            parametros.push(parametro as ParametroInterface);
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return parametros;
    }

    async funcao(tipo: string): Promise<FuncaoDeclaracao> {
        const simbolo: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            `Esperado nome ${tipo}.`
        );

        this.pilhaEscopos.definirInformacoesVariavel(
            simbolo.lexema,
            new InformacaoElementoSintatico(simbolo.lexema, 'qualquer')
        );

        const corpoDaFuncao = await this.corpoDaFuncao(tipo);
        const tipoDaFuncao = `função<${corpoDaFuncao.tipo}>`;
        this.pilhaEscopos.definirInformacoesVariavel(
            simbolo.lexema,
            new InformacaoElementoSintatico(simbolo.lexema, tipoDaFuncao)
        );
        const funcaoDeclaracao = new FuncaoDeclaracao(simbolo, corpoDaFuncao, tipoDaFuncao);
        this.pilhaEscopos.registrarReferenciaFuncao(simbolo.lexema, funcaoDeclaracao);
        return funcaoDeclaracao;
    }

    async resolverDeclaracao(): Promise<Declaracao> {
        const simboloAtual = this.simbolos[this.atual];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.PONTO_E_VIRGULA:
                // Ignora ponto e vírgula supérfluo
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.ENTAO:
            case tiposDeSimbolos.INICIO:
                const simboloInicioBloco: SimboloInterface = this.avancarEDevolverAnterior();
                return new Bloco(
                    simboloInicioBloco.hashArquivo,
                    Number(simboloInicioBloco.linha),
                    await this.blocoEscopo()
                );
            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return await this.declaracaoEnquanto();
            case tiposDeSimbolos.IDENTIFICADOR:
                const proximoSimbolo = this.simbolos[this.atual + 1];
                if (proximoSimbolo && proximoSimbolo.tipo === tiposDeSimbolos.IGUAL) {
                    return await this.declaracaoOuAtribuicaoVariaveis();
                }

                // Avaliar como expressão normal, sair do `switch`.
                break;
            case tiposDeSimbolos.IMPRIMA:
                this.avancarEDevolverAnterior();
                return await this.declaracaoEscreva();
            case tiposDeSimbolos.PARA:
                return await this.declaracaoPara();
            case tiposDeSimbolos.QUEBRE:
                this.avancarEDevolverAnterior();
                return this.declaracaoQuebre();
            case tiposDeSimbolos.SE:
                this.avancarEDevolverAnterior();
                return await this.declaracaoSe();
            case tiposDeSimbolos.RETORNE:
                this.avancarEDevolverAnterior();
                return await this.declaracaoRetorna();
            case tiposDeSimbolos.LOCAL:
                this.avancarEDevolverAnterior();
                return await this.declaracaoDeLocal();
        }

        return await this.declaracaoExpressao();
    }

    async declaracaoOuAtribuicaoVariaveis(): Promise<Var | Expressao> {
        const identificador = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.IGUAL, "Esperado '=' após identificador.");

        if (this.estaNoFinal()) {
            throw this.erro(this.simboloAnterior(), 'Esperado valor após o símbolo de igual.');
        }

        const valor = await this.expressao();
        const tipo = this.logicaComumInferenciaTiposVariaveisEConstantes(valor, 'qualquer');

        if (this.pilhaEscopos.variavelJaDefinida(identificador.lexema)) {
            return new Expressao(
                new Atribuir(
                    identificador.hashArquivo,
                    new Variavel(identificador.hashArquivo, identificador),
                    valor
                )
            );
        }

        const retornoVar = new Var(identificador, valor, tipo);
        // Pelo manual de Prisma, variáveis implícitas estão sempre no escopo global.
        retornoVar.escopo = 'global';
        return retornoVar;
    }

    /**
     * Segundo o manual de Prisma, os tipos válidos para a linguagem são:
     *  número, string , tabela, funcao , userdata, boolean, nulo.
     * @param inicializador O construto do inicializador.
     * @param tipoPrevio Se há um tipo prévio definido. `qualquer` não é válido em Prisma:
     *                   O tipo sempre resolve para algum outro.
     * @returns O tipo inferido.
     */
    protected logicaComumInferenciaTiposVariaveisEConstantes(
        inicializador: Construto,
        tipoPrevio: string
    ) {
        if (tipoPrevio !== 'qualquer') {
            return tipoPrevio;
        }

        switch (inicializador.constructor) {
            case Literal:
                return (inicializador as Literal).tipo;
            // TODO: Terminar
            default:
                console.log(inicializador.constructor.name);
        }
    }

    async declaracaoPara(): Promise<Para> {
        try {
            this.blocos += 1;
            const simboloPara: SimboloInterface = this.avancarEDevolverAnterior();

            const variavelIteracao = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador de variável após 'para'."
            );

            this.consumir(
                tiposDeSimbolos.IGUAL,
                `'=' or 'em' esperado próximo a '${this.simbolos[this.atual].lexema}'.`
            );

            const literalOuVariavelInicio = await this.adicaoOuSubtracao();

            this.consumir(
                tiposDeSimbolos.VIRGULA,
                `Espera-se '=' próximo a '${this.simbolos[this.atual].lexema}'.`
            );

            const literalOuVariavelFim = await this.adicaoOuSubtracao();

            let operadorCondicao = new Simbolo(
                tiposDeSimbolos.MENOR_IGUAL,
                '<=',
                null,
                Number(simboloPara.linha),
                this.hashArquivo
            );
            let operadorCondicaoIncremento = new Simbolo(
                tiposDeSimbolos.MENOR,
                '<',
                null,
                Number(simboloPara.linha),
                this.hashArquivo
            );

            let passo: Construto = new Literal(this.hashArquivo, Number(simboloPara.linha), 1);
            const resolverIncrementoEmExecucao = false; // Mudar caso seja necessário.

            this.consumir(
                tiposDeSimbolos.INICIO,
                `espera-se 'inicio' proximo a '${this.simbolos[this.atual].lexema}'.`
            );

            // Aqui já é seguro inicializar a variável.
            this.pilhaEscopos.definirInformacoesVariavel(
                variavelIteracao.lexema,
                new InformacaoElementoSintatico(variavelIteracao.lexema, 'inteiro')
            );

            const declaracoesBlocoPara = [];
            let simboloAtualBlocoPara: SimboloInterface = this.simbolos[this.atual];
            while (simboloAtualBlocoPara.tipo !== tiposDeSimbolos.FIM) {
                declaracoesBlocoPara.push(await this.resolverDeclaracaoForaDeBloco());
                simboloAtualBlocoPara = this.simbolos[this.atual];
            }

            this.avancarEDevolverAnterior(); // fim

            const corpo = new Bloco(
                this.hashArquivo,
                Number(simboloPara.linha) + 1,
                declaracoesBlocoPara.filter((d) => d)
            );

            const para = new Para(
                this.hashArquivo,
                Number(simboloPara.linha),
                // Inicialização.
                new Expressao(
                    new Atribuir(
                        this.hashArquivo,
                        new Variavel(this.hashArquivo, variavelIteracao, 'inteiro'),
                        literalOuVariavelInicio
                    )
                ),
                // Condição.
                new Binario(
                    this.hashArquivo,
                    new Variavel(this.hashArquivo, variavelIteracao, 'inteiro'),
                    operadorCondicao,
                    literalOuVariavelFim
                ),
                // Incremento, feito em construto especial `FimPara`.
                new FimPara(
                    this.hashArquivo,
                    Number(simboloPara.linha),
                    new Binario(
                        this.hashArquivo,
                        new Variavel(this.hashArquivo, variavelIteracao, 'inteiro'),
                        operadorCondicaoIncremento,
                        literalOuVariavelFim
                    ),
                    new Expressao(
                        new Atribuir(
                            this.hashArquivo,
                            new Variavel(this.hashArquivo, variavelIteracao, 'inteiro'),
                            new Binario(
                                this.hashArquivo,
                                new Variavel(this.hashArquivo, variavelIteracao, 'inteiro'),
                                new Simbolo(
                                    tiposDeSimbolos.ADICAO,
                                    '+',
                                    null,
                                    Number(simboloPara.linha),
                                    this.hashArquivo
                                ),
                                passo
                            )
                        )
                    )
                ),
                corpo
            );
            para.blocoPosExecucao = corpo;
            para.resolverIncrementoEmExecucao = resolverIncrementoEmExecucao;

            return para;
        } finally {
            this.blocos -= 1;
        }
    }

    async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | null> {
        try {
            if (
                (this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.avancarEDevolverAnterior();
                return await this.funcao('funcao');
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE))
                return await this.declaracaoDeClasse();

            return await this.resolverDeclaracao();
        } catch (erro) {
            this.sincronizar();
            this.erros.push(erro);
            return null;
        }
    }

    async declaracaoDeClasse(): Promise<Classe> {
        const simbolo: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome da classe.'
        );

        let superClasse = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            const simboloSuperclasse = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome da Superclasse.'
            );
            this.superclasseAtual = simboloSuperclasse.lexema;
            superClasse = new Variavel(this.hashArquivo, this.simboloAnterior());

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");
        }

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo da classe.");

        const metodos = [];
        while (
            !this.estaNoFinal() &&
            (this.verificarTipoSimboloAtual(tiposDeSimbolos.CONSTRUTOR) ||
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO))
        ) {
            const ehConstrutor = this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONSTRUTOR);
            metodos.push(await this.funcao('método'));
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após métodos da classe.");

        this.superclasseAtual = undefined;
        const definicaoClasse = new Classe(simbolo, superClasse ? [superClasse] : [], metodos);
        this.tiposDefinidosEmCodigo[definicaoClasse.simbolo.lexema] = definicaoClasse;
        return definicaoClasse;
    }

    protected inicializarPilhaEscopos() {
        this.pilhaEscopos = new PilhaEscopos();
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        // TODO: verificar quais são as funções nativas básicas de Prisma
        /* this.pilhaEscopos.definirInformacoesVariavel(
            'aleatorio',
            new InformacaoElementoSintatico('aleatorio', 'número')
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'inteiro',
            new InformacaoElementoSintatico('inteiro', 'inteiro', true, [
                new InformacaoElementoSintatico('valor', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'numero',
            new InformacaoElementoSintatico('número', 'número', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'texto',
            new InformacaoElementoSintatico('texto', 'texto', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'tamanho',
            new InformacaoElementoSintatico('tamanho', 'inteiro', true, [
                new InformacaoElementoSintatico('objeto', 'qualquer'),
            ])
        ); */
    }

    async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        const inicioAnalise: [number, number] = hrtime();
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.inicializarPilhaEscopos();
        this.tiposDefinidosEmCodigo = {};

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            const retornoDeclaracao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else if (retornoDeclaracao !== null) {
                declaracoes.push(retornoDeclaracao);
            }
        }

        if (this.performance) {
            const deltaAnalise: [number, number] = hrtime(inicioAnalise);
            console.log(
                `[Avaliador Sintático] Tempo para análise: ${deltaAnalise[0] * 1e9 + deltaAnalise[1]}ns`
            );
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
