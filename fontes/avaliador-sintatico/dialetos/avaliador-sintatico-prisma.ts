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
    Vetor,
    Leia
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
    Sustar
} from '../../declaracoes';

import { ParametroInterface, SimboloInterface } from '../../interfaces';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { RetornoLexador } from '../../interfaces/retornos/retorno-lexador';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from '../../interfaces/retornos/retorno-avaliador-sintatico';

import {
    inferirTipoVariavel,
    TipoInferencia,
    tipoInferenciaParaTipoDadosElementar,
} from '../../inferenciador';

import { PilhaEscopos } from '../pilha-escopos';
import { InformacaoEscopo } from '../informacao-escopo';
import {
    registrarPrimitiva,
} from '../comum';
import { InformacaoElementoSintatico } from '../../informacao-elemento-sintatico';

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
            switch (this.simboloAtual().tipo) {
                case tiposDeSimbolos.CLASSE:
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                case tiposDeSimbolos.LOCAL:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.IMPRIMA:
                case tiposDeSimbolos.RETORNA:
                    return;
            }

            this.avancarEDevolverAnterior();
        }
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        this.erros.push(excecao);
        return excecao;
    }

    consumir(tipo: string, mensagemDeErro: string) {
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

    verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simboloAtual().tipo === tipo;
    }

    verificarTipoProximoSimbolo(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual + 1].tipo === tipo;
    }

    simboloAtual(): SimboloInterface {
        return this.simbolos[this.atual];
    }

    simboloAnterior(): SimboloInterface {
        return this.simbolos[this.atual - 1];
    }

    simboloNaPosicao(posicao: number): SimboloInterface {
        return this.simbolos[this.atual + posicao];
    }

    estaNoFinal(): boolean {
        return this.atual >= this.simbolos.length;
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

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];
        let valores = [];
        
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                switch (this.simboloAtual().tipo) {
                    case tiposDeSimbolos.COLCHETE_ESQUERDO: // Texto multilinhas
                        return this.construtoTextoMultilinhas();
                    default:
                        throw this.erro(simboloAtual, 'Terminar.');
                }
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                this.avancarEDevolverAnterior();
                const chaves = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    return new Dicionario(this.hashArquivo, simboloAtual.linha, [], []);
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    const chave = this.atribuir();
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' entre chave e valor.");
                    const valor = this.atribuir();

                    chaves.push(chave);
                    valores.push(valor);

                    if (this.simboloAtual().tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                        this.consumir(
                            tiposDeSimbolos.VIRGULA,
                            'Esperado vírgula antes da próxima expressão.'
                        );
                    }
                }

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
                const corpoDaFuncao = this.corpoDaFuncao(simboloFuncao.lexema);
                this.pilhaEscopos.definirInformacoesVariavel(
                    simboloFuncao.lexema,
                    new InformacaoElementoSintatico(simboloFuncao.lexema, 'função')
                );
                return corpoDaFuncao;
            case tiposDeSimbolos.IMPORTAR:
                return this.declaracaoImportar();
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
                const tipoDadosElementar = tipoInferenciaParaTipoDadosElementar(
                    tipoInferido as TipoInferencia
                );
                return new Literal(
                    this.hashArquivo,
                    Number(simboloLiteral.linha),
                    simboloLiteral.literal,
                    tipoDadosElementar
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
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, simboloAtual.linha, expressao);
            case tiposDeSimbolos.SUPER:
                const simboloSuper = this.avancarEDevolverAnterior();
                return new Super(this.hashArquivo, simboloSuper, this.superclasseAtual);
        }

        throw this.erro(this.simboloAtual(), 'Esperado expressão.');
    }

    /**
     * Construto para texto multilinhas.
     * @returns 
     */
    construtoTextoMultilinhas(): Construto {
        const segundoColchete = this.consumir(tiposDeSimbolos.COLCHETE_ESQUERDO, "Esperado '[' antes do texto multilinhas.");
        let texto = "";
        let linha = segundoColchete.linha;
        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
            texto += this.simbolos[this.atual].lexema + " ";
            if (this.simbolos[this.atual].linha !== linha) {
                texto += "\n";
                linha = this.simbolos[this.atual].linha;
            }
            this.avancarEDevolverAnterior();
        }
        this.consumir(tiposDeSimbolos.COLCHETE_DIREITO, "Esperado ']' após o texto multilinhas.");
        return new Literal(this.hashArquivo, segundoColchete.linha, texto);
    }

    expressaoLeia(): Leia {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em leia."
        );

        const argumentos: Construto[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                argumentos.push(this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em leia.");

        return new Leia(simboloLeia, argumentos);
    }

    protected finalizarChamada(entidadeChamada: Construto): Chamada {
        const argumentos = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (argumentos.length >= 255) {
                    throw this.erro(this.simboloAtual(), 'Não pode haver mais de 255 argumentos.');
                }
                argumentos.push(this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");

        return new Chamada(this.hashArquivo, entidadeChamada, argumentos);
    }

    chamar(): Construto {
        let expressao: Construto = this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do método após '.'."
                );

                expressao = new AcessoMetodoOuPropriedade(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = this.expressao();
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

    unario(): Construto {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.BIT_NOT
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.unario();
            return new Unario(this.hashArquivo, operador, direito);
        }

        return this.chamar();
    }

    exponenciacao(): Construto {
        let expressao = this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simboloAnterior();
            const direito = this.unario();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    multiplicar(): Construto {
        let expressao = this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MODULO
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    adicaoOuSubtracao(): Construto {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)
        ) {
            const operador = this.simboloAnterior();
            const direito = this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitShift(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.adicaoOuSubtracao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitE(): Construto {
        let expressao = this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simboloAnterior();
            const direito = this.bitShift();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitOu(): Construto {
        let expressao = this.bitE();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)
        ) {
            const operador = this.simboloAnterior();
            const direito = this.bitE();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
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
            const operador = this.simboloAnterior();
            const direito = this.bitOu();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    em(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simboloAnterior();
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    e(): Construto {
        let expressao = this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simboloAnterior();
            const direito = this.em();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simboloAnterior();
            const direito = this.e();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL) ||
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)
        ) {
            const igual = this.simboloAnterior();
            const valor = this.atribuir();

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

    expressao(): Construto {
        return this.atribuir();
    }

    declaracaoEscreva(): Escreva {
        const simboloEscreva = this.simboloAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: Array<Construto> = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                argumentos.push(this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        return new Escreva(Number(simboloEscreva.linha), simboloEscreva.hashArquivo, argumentos);
    }

    declaracaoExpressao() {
        const expressao = this.expressao();
        return new Expressao(expressao);
    }

    protected blocoEscopo(): any[] {
        this.pilhaEscopos.empilhar(new InformacaoEscopo());
        
        let declaracoes: Array<Declaracao> = [];
        
        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.FIM) && !this.estaNoFinal()) {
            const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
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

    declaracaoDeLocal(): Var {
        const identificador = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de variável.');
        
        let inicializador = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            inicializador = this.expressao();
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

    declaracaoEnquanto(): Enquanto {
        try {
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'enquanto'.");
            const condicao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do enquanto.");

            const bloco = this.resolverDeclaracao();

            return new Enquanto(condicao, bloco);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoSe(): Se {
        const simboloSe: SimboloInterface = this.simbolos[this.atual];
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'.");
        const condicao = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do se.");

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ENTAO)) {
            this.consumir(
                this.simbolos[this.atual].tipo,
                "Esperado palavra reservada 'entao' ou 'então' após condição em declaração 'se'."
            );
        }

        const declaracoes = [];
        do {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        } while (
            !this.estaNoFinal() &&
            ![tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO, tiposDeSimbolos.FIM].includes(
                this.simbolos[this.atual].tipo
            )
        );

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            const simboloSenao = this.simbolos[this.atual - 1];
            const declaracoesSenao = [];

            do {
                declaracoesSenao.push(this.resolverDeclaracaoForaDeBloco());
            } while (![tiposDeSimbolos.FIM].includes(this.simbolos[this.atual].tipo));

            caminhoSenao = new Bloco(
                this.hashArquivo,
                Number(simboloSenao.linha),
                declaracoesSenao.filter((d) => d)
            );
        }

        this.consumir(tiposDeSimbolos.FIM, "Esperado palavra-chave 'fimse' para fechamento de declaração 'se'.");

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

    declaracaoQuebre() {
        if (this.blocos < 1) {
            throw this.erro(
                this.simboloAnterior(),
                "'quebre' deve estar dentro de um laço de repetição."
            );
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após 'quebre'.");
        return new Sustar(this.simboloAtual());
    }

    declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            throw this.erro(
                this.simboloAnterior(),
                "'continua' precisa estar em um laço de repetição."
            );
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após 'continua'.");
        return new Continua(this.simboloAtual());
    }

    declaracaoRetorna(): Retorna {
        const palavraChave = this.simboloAnterior();
        let valor = null;

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            valor = this.expressao();
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após valor de retorno.");
        return new Retorna(palavraChave, valor);
    }

    declaracaoImportar(): Importar {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");
        const caminho = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new Importar(caminho as Literal);
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        const parenteseEsquerdo = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        let tipoRetorno: string = 'qualquer';
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA)) {
            tipoRetorno = 'qualquer'; // Simplificado por enquanto
        }

        const corpo = this.blocoEscopo();
        
        return new FuncaoConstruto(
            this.hashArquivo,
            0,
            parametros,
            corpo,
            tipoRetorno,
            false
        );
    }

    protected logicaComumParametros(): ParametroInterface[] {
        const parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                throw this.erro(this.simboloAtual(), 'Função não pode ter mais de 255 parâmetros.');
            }

            const parametro: Partial<ParametroInterface> = {};
            parametro.abrangencia = 'padrao';

            parametro.nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do parâmetro.'
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
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

    funcao(tipo: string): FuncaoDeclaracao {
        const simbolo: SimboloInterface = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`);

        this.pilhaEscopos.definirInformacoesVariavel(
            simbolo.lexema,
            new InformacaoElementoSintatico(simbolo.lexema, 'qualquer')
        );

        const corpoDaFuncao = this.corpoDaFuncao(tipo);
        const tipoDaFuncao = `função<${corpoDaFuncao.tipo}>`;
        this.pilhaEscopos.definirInformacoesVariavel(
            simbolo.lexema,
            new InformacaoElementoSintatico(simbolo.lexema, tipoDaFuncao)
        );
        const funcaoDeclaracao = new FuncaoDeclaracao(simbolo, corpoDaFuncao, tipoDaFuncao);
        this.pilhaEscopos.registrarReferenciaFuncao(simbolo.lexema, funcaoDeclaracao);
        return funcaoDeclaracao;
    }

    resolverDeclaracao(): any {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.PONTO_E_VIRGULA:
                // Ignora ponto e vírgula supérfluo
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.ENTAO:
                const simboloInicioBloco: SimboloInterface = this.simboloAtual();
                return new Bloco(
                    simboloInicioBloco.hashArquivo,
                    Number(simboloInicioBloco.linha),
                    this.blocoEscopo()
                );
            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.IMPRIMA:
                this.avancarEDevolverAnterior();
                return this.declaracaoEscreva();
            case tiposDeSimbolos.PARA:
                this.avancarEDevolverAnterior();
                return this.declaracaoPara();
            case tiposDeSimbolos.QUEBRE:
                this.avancarEDevolverAnterior();
                return this.declaracaoQuebre();
            case tiposDeSimbolos.SE:
                this.avancarEDevolverAnterior();
                return this.declaracaoSe();
            case tiposDeSimbolos.RETORNA:
                this.avancarEDevolverAnterior();
                return this.declaracaoRetorna();
            case tiposDeSimbolos.LOCAL:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeLocal();
        }

        return this.declaracaoExpressao();
    }

    declaracaoPara(): Para {
        try {
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'para'.");
            
            let inicializador: Var | Expressao;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                inicializador = null;
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.LOCAL)) {
                inicializador = this.declaracaoDeLocal();
            } else {
                inicializador = this.declaracaoExpressao();
                this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após inicializador do para.");
            }

            let condicao = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                condicao = this.expressao();
            }
            this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após condição do para.");

            let incrementar = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                incrementar = this.expressao();
            }
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após incremento do para.");

            const corpo = this.resolverDeclaracao();

            return new Para(
                this.hashArquivo,
                Number(this.simboloAnterior().linha),
                inicializador,
                condicao,
                incrementar,
                corpo
            );
        } finally {
            this.blocos -= 1;
        }
    }

    resolverDeclaracaoForaDeBloco(): Declaracao | null {
        try {
            if (
                (this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.avancarEDevolverAnterior();
                return this.funcao('funcao');
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE))
                return this.declaracaoDeClasse();

            return this.resolverDeclaracao();
        } catch (erro) {
            this.sincronizar();
            return null;
        }
    }

    declaracaoDeClasse(): Classe {
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
            metodos.push(this.funcao('método'));
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após métodos da classe.");

        this.superclasseAtual = undefined;
        const definicaoClasse = new Classe(simbolo, superClasse, metodos);
        this.tiposDefinidosEmCodigo[definicaoClasse.simbolo.lexema] = definicaoClasse;
        return definicaoClasse;
    }

    protected inicializarPilhaEscopos() {
        this.pilhaEscopos = new PilhaEscopos();
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        // Funções nativas básicas
        this.pilhaEscopos.definirInformacoesVariavel(
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
        );
    }

    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
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
            const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
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
