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
    Leia,
    AcessoMetodo,
    AcessoPropriedade,
    ReferenciaFuncao,
    ComentarioComoConstruto,
    ParaCadaComoConstruto,
    SeTernario,
    ListaCompreensao,
    ImportarComoConstruto,
    ArgumentoReferenciaFuncao,
    Dupla,
    Deceto,
    Noneto,
    Octeto,
    Quarteto,
    Quinteto,
    Septeto,
    Sexteto,
    Trio,
} from '../../construtos';
import {
    Escreva,
    Se,
    Enquanto,
    Continua,
    Retorna,
    Escolha,
    Tente,
    Fazer,
    Var,
    FuncaoDeclaracao,
    Classe,
    Declaracao,
    Expressao,
    Bloco,
    Sustar,
    Falhar,
    ParaCada,
    Comentario,
    PropriedadeClasse,
    TextoDocumentacao,
} from '../../declaracoes';

import {
    AvaliadorSintaticoInterface,
    ParametroInterface,
    SimboloInterface,
} from '../../interfaces';
import { Localizacao } from '../../lexador/dialetos/localizacao';
import { RetornoLexador } from '../../interfaces/retornos/retorno-lexador';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from '../../interfaces/retornos/retorno-avaliador-sintatico';

import { Simbolo } from '../../lexador';
import {
    inferirTipoVariavel,
    TipoInferencia,
    tipoInferenciaParaTipoDadosElementar,
} from '../../inferenciador';
import { TipoDadosElementar } from '../../tipo-dados-elementar';

import { PilhaEscopos } from '../pilha-escopos';
import { InformacaoEscopo } from '../informacao-escopo';
import { InformacaoElementoSintatico } from '../../informacao-elemento-sintatico';
import {
    logicaDescobertaRetornoFuncao as logicaValidacaoRetornoFuncao,
    registrarPrimitiva,
} from '../comum';

import tiposDeDadosPitugues from '../../tipos-de-dados/dialetos/pitugues';
import tiposDeSimbolos from '../../tipos-de-simbolos/pitugues';

import primitivasDicionario from '../../bibliotecas/primitivas-dicionario';
import primitivasNumero from '../../bibliotecas/primitivas-numero';
import primitivasTexto from '../../bibliotecas/primitivas-texto';
import primitivasVetor from '../../bibliotecas/primitivas-vetor';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 *
 * A grande diferença entre este avaliador e os demais é a forma como são entendidos os blocos de escopo.
 * Este avaliador espera uma estrutura de pragmas, que explica quantos espaços há na frente de cada linha.
 */
export class AvaliadorSintaticoPitugues
    implements AvaliadorSintaticoInterface<SimboloInterface, Declaracao> {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    localizacoes: { [linha: number]: Localizacao };

    tiposDefinidosEmCodigo: { [nomeTipo: string]: Declaracao };
    pilhaEscopos: PilhaEscopos;
    primitivasConhecidas: {
        [nomeModuloOuClasse: string]: { [nomePrimitiva: string]: InformacaoElementoSintatico };
    };

    hashArquivo: number;
    atual: number;
    blocos: number;
    escopos: number[];
    performance: boolean;
    superclasseAtual: string | undefined;

    constructor(performance = false) {
        this.atual = 0;
        this.blocos = 0;
        this.performance = performance;
        this.escopos = [];
        this.pilhaEscopos = new PilhaEscopos();
        this.primitivasConhecidas = {};
        this.tiposDefinidosEmCodigo = {};

        registrarPrimitiva(this.primitivasConhecidas, 'dicionário', primitivasDicionario);
        registrarPrimitiva(this.primitivasConhecidas, 'número', primitivasNumero);
        registrarPrimitiva(this.primitivasConhecidas, 'texto', primitivasTexto);
        registrarPrimitiva(this.primitivasConhecidas, 'vetor', primitivasVetor);
    }

    protected logicaComumInferenciaTiposVariaveisEConstantes(
        inicializador: Construto,
        tipo: string
    ): string {
        if (tipo !== 'qualquer') {
            return tipo;
        }

        switch (inicializador.constructor) {
            case AcessoIndiceVariavel:
                const entidadeChamadaAcessoIndiceVariavel = (inicializador as AcessoIndiceVariavel)
                    .entidadeChamada;

                // Este condicional ocorre com chamadas aninhadas. Por exemplo, `vetor[1][2]`.
                if (
                    entidadeChamadaAcessoIndiceVariavel.constructor === AcessoIndiceVariavel
                ) {
                    return this.logicaComumInferenciaTiposVariaveisEConstantes(
                        entidadeChamadaAcessoIndiceVariavel,
                        tipo
                    );
                }

                if (entidadeChamadaAcessoIndiceVariavel.tipo.endsWith('[]')) {
                    return entidadeChamadaAcessoIndiceVariavel.tipo.slice(0, -2);
                }

                // Normalmente, `entidadeChamadaAcessoIndiceVariavel.tipo` aqui será 'vetor'.
                return 'qualquer';
            case Chamada:
                const entidadeChamadaChamada = (inicializador as Chamada).entidadeChamada;
                switch (entidadeChamadaChamada.constructor) {
                    case AcessoMetodo:
                        const entidadeChamadaAcessoMetodo = entidadeChamadaChamada as AcessoMetodo;
                        return entidadeChamadaAcessoMetodo.tipoRetornoMetodo;
                    case AcessoMetodoOuPropriedade:
                        // Este caso ocorre quando a variável/constante é do tipo 'qualquer',
                        // e a chamada normalmente é feita para uma primitiva.
                        // A inferência, portanto, ocorre pelo uso da primitiva.
                        const entidadeChamadaAcessoMetodoOuPropriedade =
                            entidadeChamadaChamada as AcessoMetodoOuPropriedade;

                        for (const primitiva in this.primitivasConhecidas) {
                            if (
                                this.primitivasConhecidas[primitiva].hasOwnProperty(
                                    entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema
                                )
                            ) {
                                return this.primitivasConhecidas[primitiva][
                                    entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema
                                ].tipo;
                            }
                        }

                        throw new ErroAvaliadorSintatico(
                            entidadeChamadaAcessoMetodoOuPropriedade.simbolo,
                            `Primitiva '${entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema}' não existe.`
                        );
                    case AcessoPropriedade:
                        const entidadeChamadaAcessoPropriedade =
                            entidadeChamadaChamada as AcessoPropriedade;
                        return entidadeChamadaAcessoPropriedade.tipoRetornoPropriedade;
                    case ArgumentoReferenciaFuncao:
                        // TODO: Voltar aqui se necessário.
                        return 'qualquer';
                    case ReferenciaFuncao:
                        const entidadeChamadaReferenciaFuncao =
                            entidadeChamadaChamada as ReferenciaFuncao;
                        return entidadeChamadaReferenciaFuncao.tipo;
                    case Variavel:
                        const entidadeChamadaVariavel = entidadeChamadaChamada as Variavel;
                        return entidadeChamadaVariavel.tipo;
                }

                break;
            case FuncaoConstruto:
                const funcaoConstruto = inicializador as FuncaoConstruto;
                return `função<${funcaoConstruto.tipo}>`;
            case Leia:
                return 'texto';
            case Dupla:
            case Trio:
            case Quarteto:
            case Quinteto:
            case Sexteto:
            case Septeto:
            case Octeto:
            case Noneto:
            case Deceto:
                return 'tupla';
            // TODO: Talvez reabilitar.
            /* case ImportarBiblioteca:
            case ModuloDeclaracoes:
                return 'módulo'; */
            default:
                return inicializador.tipo;
        }
    }

    expressaoLeia(): Leia {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em leia."
        );

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em leia.");

        return new Leia(simboloLeia, argumentos);
    }

    declaracaoDeVariavel(): Var {
        throw new Error('Método não implementado.');
    }

    private variavelJaDeclarada(nome: string): boolean {
        try {
            this.pilhaEscopos.obterTipoVariavelPorNome(nome);
            return true;
        } catch {
            return false;
        }
    }

    private declaracaoImplicita(): Var {
        const identificador = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome de variável.'
        );

        this.consumir(tiposDeSimbolos.IGUAL, "Esperado '=' após identificador.");

        if (this.estaNoFinal()) {
            throw this.erro(
                this.simboloAnterior(),
                'Esperado valor após o símbolo de igual.'
            )
        }

        const valor = this.expressao();
        const tipo = this.logicaComumInferenciaTiposVariaveisEConstantes(valor, 'qualquer');

        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, tipo)
        );

        return new Var(identificador, valor, tipo);
    }

    private temPadraoMultiplaAtribuicao(): boolean {
        // Verifica padrão: IDENTIFICADOR, VIRGULA, IDENTIFICADOR, ..., IGUAL
        // Também aceita * antes de identificador
        let pos = this.atual;
        let identificadores = 0;

        while (pos < this.simbolos.length) {
            // Consome opcionalmente o operador de resto (*)
            if (this.simbolos[pos].tipo === tiposDeSimbolos.MULTIPLICACAO) {
                pos++;
            }

            // Verifica se há um identificador obrigatório
            if (pos >= this.simbolos.length || this.simbolos[pos].tipo !== tiposDeSimbolos.IDENTIFICADOR) {
                return false;
            }
            pos++;
            identificadores++;

            // Verifica o próximo símbolo (deve ser ',' ou '=')
            if (pos >= this.simbolos.length) return false;

            const proximoTipo = this.simbolos[pos].tipo;

            if (proximoTipo === tiposDeSimbolos.IGUAL) {
                return identificadores >= 2;
            }

            if (proximoTipo === tiposDeSimbolos.VIRGULA) {
                pos++;
                continue;
            }

            // Se chegou aqui, não é vírgula nem igual, então o padrão quebrou
            return false;
        }
        return false;
    }

    private temPadraoVarComoPalavraChave(): boolean {
        // Verifica padrão: var identificador = ...

        if (this.simbolos[this.atual].lexema !== "var") {
            return false;
        }

        const proximo = this.simbolos[this.atual + 1];
        if (!proximo) return false;

        if (proximo.tipo === tiposDeSimbolos.MULTIPLICACAO) {
            return false;
        }

        // Busca pelo sinal de igualdade, permitido apenas IDENTIFICADORES e VÍRGULAS no caminho
        let pos = this.atual + 1;
        while (pos < this.simbolos.length) {
            const tipo = this.simbolos[pos].tipo;

            // Encontrou padrão var a, b = ...
            if (tipo === tiposDeSimbolos.IGUAL) return true;

            // Encontrou algo como 'var a + b'
            if (tipo !== tiposDeSimbolos.IDENTIFICADOR && tipo !== tiposDeSimbolos.VIRGULA) return false;

            pos++;
        }

        return false;
    }

    private consumirIdentificadores(): { simbolos: SimboloInterface[], indexResto: number } {
        const identificadores: SimboloInterface[] = [];
        let indexResto = -1;

        do {
            let ehRestoAtual = false;

            // Verifica * como token separado
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.MULTIPLICACAO)) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, '');
                ehRestoAtual = true;
            }

            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                ehRestoAtual ? 'Esperado nome de variável após operador *.' : 'Esperado nome de variável.'
            );

            // Verifica * no nome da variável
            if (identificador.lexema.startsWith('*')) {
                ehRestoAtual = true;
                identificador.lexema = identificador.lexema.slice(1);
            }

            if (ehRestoAtual) {
                if (indexResto > -1) {
                    throw this.erro(
                        this.simboloAtual(),
                        'Sintaxe inválida: apenas um operador de resto é permitido.'
                    );
                }
                indexResto = identificadores.length;
            }
            identificadores.push(identificador);
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return { simbolos: identificadores, indexResto };
    }

    private consumirInicializadores(): Construto[] {
        const inicializadores: Construto[] = [];
        do {
            if (this.estaNoFinal()) {
                throw this.erro(this.simboloAtual(), 'Esperado inicializador após vírgula.');
            }
            inicializadores.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializadores;
    }

    private construirValidacaoDesempacotamento(
        identificador: SimboloInterface,
        origem: Construto,
        qtdEsperada: number
    ): Declaracao {
        const linha = identificador.linha;

        const chamadaTamanho = new Chamada(
            this.hashArquivo,
            new Variavel(this.hashArquivo,
                new Simbolo(tiposDeSimbolos.IDENTIFICADOR, "tamanho", null, linha, -1)
            ),
            [origem]
        );

        const condicaoErro = new Binario(
            this.hashArquivo,
            chamadaTamanho,
            new Simbolo(tiposDeSimbolos.DIFERENTE, "!=", null, linha, -1),
            new Literal(this.hashArquivo, linha, qtdEsperada, 'número')
        );

        const mensagem = `Erro de execução: Você tentou desempacotar em ${qtdEsperada} variáveis, mas o vetor possui tamanho diferente.`;
        const falha = new Falhar(
            new Simbolo(tiposDeSimbolos.FALHAR, "falhar", null, linha, -1),
            new Literal(this.hashArquivo, linha, mensagem, 'texto')
        );

        return new Se(condicaoErro, new Bloco(this.hashArquivo, linha, [falha]), [], null);
    }

    declaracaoDeVariaveis(): any {
        const { simbolos: identificadores, indexResto } = this.consumirIdentificadores();

        this.consumir(tiposDeSimbolos.IGUAL, 'Esperado o símbolo igual(=) após identificador.');

        const inicializadores = this.consumirInicializadores();

        const qtdIdentificadores = identificadores.length;
        const qtdValores = inicializadores.length;
        const ehDesempacotamento = qtdIdentificadores > 1 && qtdValores === 1;

        if (indexResto > -1) {
            if (qtdValores < qtdIdentificadores - 1) {
                if (!ehDesempacotamento || (ehDesempacotamento && inicializadores[0] instanceof Literal)) {
                    throw this.erro(
                        this.simboloAnterior(),
                        'Quantidade insuficiente de valores para desempacotamento com operador de resto.'
                    );
                }
            }
        } else {
            if (!ehDesempacotamento && qtdIdentificadores !== qtdValores) {
                throw this.erro(
                    this.simboloAnterior(),
                    'Quantidade de inicializadores à esquerda do igual é diferente da quantidade de identificadores à direita.'
                );
            }
            if (ehDesempacotamento && inicializadores[0] instanceof Vetor) {
                const vetor = inicializadores[0] as Vetor;
                if (vetor.tamanho !== qtdIdentificadores) {
                    throw this.erro(
                        this.simboloAnterior(),
                        `O vetor possui ${vetor.tamanho} elementos, mas você tentou desempacotar em ${qtdIdentificadores} variáveis.`
                    );
                }
            }
        }

        const retorno: Declaracao[] = [];
        let origemParaAtribuicao = inicializadores[0];

        // Injeção de Código (Runtime Check)
        if (ehDesempacotamento && !(inicializadores[0] instanceof Vetor)) {
            const linha = identificadores[0].linha;

            // Cria variável temporária para evitar reavaliar a expressão original múltiplas vezes
            const nomeVarTemp = `__temp_desempacotamento_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
            const simboloVarTemp = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, nomeVarTemp, null, linha, -1);

            retorno.push(new Var(simboloVarTemp, inicializadores[0], 'qualquer[]'));
            origemParaAtribuicao = new Variavel(this.hashArquivo, simboloVarTemp);

            // Injeta validação de tamanho se não houver operador de resto
            if (indexResto === -1) {
                retorno.push(
                    this.construirValidacaoDesempacotamento(
                        identificadores[0], origemParaAtribuicao, qtdIdentificadores
                    )
                );
            }
        }

        let cursorValores = 0;
        const qtdParaResto = qtdValores - (qtdIdentificadores - 1);

        for (let i = 0; i < identificadores.length; i++) {
            const identificador = identificadores[i];
            let inicializador: Construto;
            let tipo = "qualquer";

            if (i === indexResto) {
                const valoresResto = inicializadores.slice(cursorValores, cursorValores + qtdParaResto);
                let tipoInferido = inferirTipoVariavel(valoresResto) as string;
                if (!tipoInferido.endsWith('[]')) tipoInferido = `${tipoInferido}[]`;

                inicializador = new Vetor(
                    identificador.hashArquivo,
                    identificador.linha,
                    valoresResto,
                    valoresResto.length,
                    tipoInferido
                );
                tipo = tipoInferido;
                cursorValores += qtdParaResto;
            } else if (ehDesempacotamento) {
                if (inicializadores[0] instanceof Vetor) {
                    inicializador = inicializadores[0].valores[i];
                } else {
                    inicializador = new AcessoIndiceVariavel(
                        this.hashArquivo,
                        origemParaAtribuicao,
                        new Literal(this.hashArquivo, identificador.linha, i, 'número'),
                        new Simbolo(tiposDeSimbolos.COLCHETE_DIREITO, ']', null, identificador.linha, -1)
                    );
                }
            } else {
                inicializador = inicializadores[cursorValores];
                cursorValores++;
                tipo = this.logicaComumInferenciaTiposVariaveisEConstantes(inicializador, tipo);
            }

            this.pilhaEscopos.definirInformacoesVariavel(
                identificador.lexema,
                new InformacaoElementoSintatico(identificador.lexema, tipo)
            );
            retorno.push(new Var(identificador, inicializador, tipo));
        }

        return retorno;
    }

    sincronizar(): void {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            switch (this.simboloAtual().tipo) {
                case tiposDeSimbolos.CLASSE:
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                case tiposDeSimbolos.VARIAVEL:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.ESCREVA:
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
        throw this.erro(this.simboloAtual(), mensagemDeErro);
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

            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    return new Vetor(this.hashArquivo, simboloAtual.linha, [], 0, 'qualquer[]');
                }

                if (
                    this.simbolos[this.atual].tipo == 'IDENTIFICADOR' &&
                    !this.verificarTipoProximoSimbolo(tiposDeSimbolos.VIRGULA)
                ) {
                    return this.resolverCompreensaoDeLista();
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    const valor = this.atribuir();
                    valores.push(valor);
                    if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.COLCHETE_DIREITO) {
                        this.consumir(
                            tiposDeSimbolos.VIRGULA,
                            'Esperado vírgula antes da próxima expressão.'
                        );
                    }
                }

                const tipoVetor = inferirTipoVariavel(valores);
                return new Vetor(
                    this.hashArquivo,
                    simboloAtual.linha,
                    valores,
                    valores.length,
                    tipoVetor
                );

            case tiposDeSimbolos.COMENTARIO:
                const simboloComentario = this.avancarEDevolverAnterior();
                return new ComentarioComoConstruto(simboloComentario);
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

    finalizarChamada(entidadeChamada: Construto): Construto {
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

        const chamada = new Chamada(this.hashArquivo, entidadeChamada, argumentos);
        chamada.tipo = entidadeChamada.tipo;
        return chamada;
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
            const direito = this.exponenciacao();
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

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM, tiposDeSimbolos.CONTEM, tiposDeSimbolos.NAO)) {
            let operador = this.simboloAnterior();
            let negado = false;
            if (operador.tipo === tiposDeSimbolos.NAO) {
                operador = this.consumir(tiposDeSimbolos.CONTEM, `Esperado palavra reservada 'contém' ou 'contem' após palavra reservada ${operador.lexema}.`);
                negado = true;
            }

            const direito = this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
            (expressao as Logico).negado = negado;
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

    protected seTernario(): Construto {
        let expressaoEntao = this.ou();

        if (this.simbolos[this.atual] && this.simbolos[this.atual].tipo === tiposDeSimbolos.SE && expressaoEntao.linha === this.simbolos[this.atual].linha) {
            while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) {
                const operador = this.simbolos[this.atual - 1];
                const expressaoOuCondicao = this.seTernario();
                this.consumir(
                    tiposDeSimbolos.SENAO,
                    `Esperado 'senão' ou 'senao' após caminho positivo em se ternário. Atual:
                    ${this.simbolos[this.atual].lexema}.`
                );
                const expressaoSenao = this.seTernario();
                expressaoEntao = new SeTernario(
                    this.hashArquivo,
                    expressaoOuCondicao,
                    expressaoEntao,
                    operador,
                    expressaoSenao
                );
            }
        }

        return expressaoEntao;
    }

    atribuir(): Construto {
        const expressao = this.seTernario();

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

    // TODO: Depreciar.
    expressao(): Construto {
        return this.atribuir();
    }

    declaracaoEscreva(simboloEscreva: SimboloInterface): Escreva {
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: Array<Construto> = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        const declaracaoEscreva = new Escreva(Number(simboloEscreva.linha), simboloEscreva.hashArquivo, argumentos)
        declaracaoEscreva.simboloEscreva = simboloEscreva;
        return declaracaoEscreva;
    }

    declaracaoExpressao() {
        const expressao = this.expressao();
        return new Expressao(expressao);
    }

    blocoEscopo(): any[] {
        this.pilhaEscopos.empilhar(new InformacaoEscopo());
        let declaracoes: Array<Declaracao> = [];
        let simboloAtual = this.simboloAtual();
        const simboloAnterior = this.simboloAnterior();

        // Situação 1: não tem bloco de escopo.
        //
        // Exemplo: `se verdadeiro: escreva('Alguma coisa')`.
        // Neste caso, linha do símbolo atual é igual à linha do símbolo anterior.

        if (simboloAtual.linha === simboloAnterior.linha) {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        } else {
            // Situação 2: símbolo atual fica na próxima linha.
            //
            // Verifica-se o número de espaços à esquerda da linha através dos pragmas.
            // Se número de espaços da linha do símbolo atual é menor ou igual ao número de espaços
            // da linha anterior, e bloco ainda não começou, é uma situação de erro.
            let espacosIndentacaoLinhaAtual = this.localizacoes[simboloAtual.linha].espacosIndentacao;
            const espacosIndentacaoLinhaAnterior =
                this.localizacoes[simboloAnterior.linha].espacosIndentacao;

            if (espacosIndentacaoLinhaAtual <= espacosIndentacaoLinhaAnterior) {
                throw this.erro(
                    simboloAtual,
                    `Indentação inconsistente na linha ${simboloAtual.linha}. ` +
                    `Esperado: >= ${espacosIndentacaoLinhaAnterior}. ` +
                    `Atual: ${espacosIndentacaoLinhaAtual}`
                );
            }

            // Indentação ok, é um bloco de escopo.
            // Inclui todas as declarações cujas linhas tenham o mesmo número de espaços
            // de indentação do bloco.
            // Se `simboloAtual` for definido em algum momento como indefinido,
            // Significa que o código acabou, então o bloco também acabou.
            const espacosIndentacaoBloco = espacosIndentacaoLinhaAtual;
            while (espacosIndentacaoLinhaAtual === espacosIndentacaoBloco) {
                const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
                if (Array.isArray(retornoDeclaracao)) {
                    declaracoes = declaracoes.concat(retornoDeclaracao);
                } else {
                    declaracoes.push(retornoDeclaracao as Declaracao);
                }

                simboloAtual = this.simboloAtual();
                if (!simboloAtual) break;
                espacosIndentacaoLinhaAtual = this.localizacoes[simboloAtual.linha].espacosIndentacao;
            }
        }

        this.pilhaEscopos.removerUltimo();
        return declaracoes;
    }

    declaracaoEnquanto(): Enquanto {
        try {
            this.blocos += 1;

            const condicao = this.expressao();

            const bloco = this.resolverDeclaracao();

            return new Enquanto(condicao, bloco);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoEscolha(): Escolha {
        try {
            this.blocos += 1;

            const condicao = this.expressao();

            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após 'escolha'.");

            const caminhos = [];
            let caminhoPadrao = null;
            while (
                !this.estaNoFinal() &&
                [tiposDeSimbolos.CASO, tiposDeSimbolos.PADRAO].includes(
                    this.simbolos[this.atual].tipo
                )
            ) {
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                    const caminhoCondicoes = [this.expressao()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(this.expressao());
                        this.consumir(
                            tiposDeSimbolos.DOIS_PONTOS,
                            "Esperado ':' após declaração do 'caso'."
                        );
                    }

                    // Como dois-pontos é um símbolo usado para conferir se há um início de bloco,
                    // não podemos simplesmente chamar `this.resolverDeclaracao()` porque o dois-pontos já
                    // foi consumido na verificação.
                    // Outro problema é que, aparentemente, o Interpretador não espera um Bloco, e sim
                    // um vetor de Declaracao, o qual obtemos com `this.blocoEscopo()`.
                    const declaracoes = this.blocoEscopo();

                    caminhos.push({
                        condicoes: caminhoCondicoes,
                        declaracoes,
                    });
                } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PADRAO)) {
                    if (caminhoPadrao !== null) {
                        const excecao = new ErroAvaliadorSintatico(
                            this.simboloAtual(),
                            "Você só pode ter um caminho padrão em cada declaração de 'escolha'."
                        );
                        this.erros.push(excecao);
                        throw excecao;
                    }

                    this.consumir(
                        tiposDeSimbolos.DOIS_PONTOS,
                        "Esperado ':' após declaração do 'padrao'."
                    );

                    // Como dois-pontos é um símbolo usado para conferir se há um início de bloco,
                    // não podemos simplesmente chamar `this.resolverDeclaracao()` porque o dois-pontos já
                    // foi consumido na verificação.
                    // Outro problema é que, aparentemente, o Interpretador não espera um Bloco, e sim
                    // um vetor de Declaracao, o qual obtemos com `this.blocoEscopo()`.
                    const declaracoes = this.blocoEscopo();

                    caminhoPadrao = {
                        declaracoes,
                    };
                }
            }

            return new Escolha(condicao, caminhos, caminhoPadrao);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoPara(): ParaCada {
        try {
            const simboloPara: SimboloInterface = this.simboloAnterior();
            this.blocos += 1;

            this.consumir(
                tiposDeSimbolos.CADA,
                `Esperado palavra reservada 'cada' após 'para'. Atual: ${this.simbolos[this.atual].lexema}.`
            );

            const nomeVariavelIteracao = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador de variável de iteração para instrução 'para cada'."
            );

            if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
                throw this.erro(
                    this.simbolos[this.atual],
                    "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução 'para cada'."
                );
            }

            const vetor = this.expressao();
            if (!vetor.hasOwnProperty('tipo')) {
                throw this.erro(
                    simboloPara,
                    `Variável ou constante em 'para cada' não parece possuir um tipo iterável.`
                );
            }

            const tipoVetor = (vetor as any).tipo as string;
            if (!tipoVetor.endsWith('[]') && !['qualquer', 'texto', 'vetor'].includes(tipoVetor)) {
                throw this.erro(
                    simboloPara,
                    `Variável ou constante em 'para cada' não é iterável. Tipo resolvido: ${tipoVetor}.`
                );
            }

            this.pilhaEscopos.definirInformacoesVariavel(
                nomeVariavelIteracao.lexema,
                new InformacaoElementoSintatico(nomeVariavelIteracao.lexema, tipoVetor.slice(0, -2))
            );
            // TODO: Talvez não seja uma ideia melhor chamar o método de `Bloco` aqui?
            const corpo: Bloco = this.resolverDeclaracao() as Bloco;

            return new ParaCada(
                this.hashArquivo,
                Number(simboloPara.linha),
                new Variavel(this.hashArquivo, nomeVariavelIteracao),
                vetor,
                corpo
            );
        } catch (erro) {
            throw erro;
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoSe(): Se {
        const condicao = this.expressao();

        const caminhoEntao = this.resolverDeclaracao();

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            caminhoSenao = this.resolverDeclaracao();
        }

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    declaracaoSustar() {
        if (this.blocos < 1) {
            throw this.erro(
                this.simboloAnterior(),
                "'sustar' deve estar dentro de um laço de repetição."
            );
        }

        return new Sustar(this.simboloAtual());
    }

    declaracaoComentario(): Comentario {
        const simboloComentario = this.avancarEDevolverAnterior();
        return new Comentario(
            simboloComentario.hashArquivo,
            simboloComentario.linha,
            simboloComentario.literal,
            false
        );
    }

    declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            throw this.erro(
                this.simboloAnterior(),
                "'continua' precisa estar em um laço de repetição."
            );
        }

        return new Continua(this.simboloAtual());
    }

    declaracaoRetorna(): Retorna {
        const palavraChave = this.simboloAnterior();
        let valor = null;

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            valor = this.expressao();
        }

        return new Retorna(palavraChave, valor);
    }

    declaracaoImportar(): ImportarComoConstruto {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");
        const caminho = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new ImportarComoConstruto(caminho as Literal);
    }

    declaracaoTente(): Tente {
        const simboloTente: SimboloInterface = this.simboloAnterior();
        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'tente'.");

        const blocoTente = this.blocoEscopo();

        let blocoPegue = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.COMO)) {
                this.avancarEDevolverAnterior();
                const variavelExcecao = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado identificador após palavra reservada 'como' em bloco tente. Atual: ${this.simbolos[this.atual].lexema}.`);
                // Caso 1: com parâmetro de erro.
                // `pegue` recebe um `FuncaoConstruto`.
                this.consumir(tiposDeSimbolos.DOIS_PONTOS, `Esperado ':' antes do escopo do bloco 'pegue'.`);

                this.pilhaEscopos.definirInformacoesVariavel(
                    variavelExcecao.lexema,
                    new InformacaoElementoSintatico(variavelExcecao.lexema, 'qualquer')
                );

                const corpo = this.blocoEscopo();

                blocoPegue = new FuncaoConstruto(
                    this.hashArquivo,
                    simboloTente.linha,
                    [{
                        abrangencia: "padrao",
                        nome: variavelExcecao,
                        tipoDado: "qualquer",
                    } as ParametroInterface],
                    corpo,
                    "vazio",
                    false
                );
            } else {
                // Caso 2: sem parâmetro de erro.
                // `pegue` recebe um bloco.
                this.consumir(
                    tiposDeSimbolos.DOIS_PONTOS,
                    "Esperado ':' após a declaração 'pegue'."
                );

                blocoPegue = this.blocoEscopo();
            }
        }

        let blocoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'senão'.");

            blocoSenao = this.blocoEscopo();
        }

        let blocoFinalmente = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'pegue'.");

            blocoFinalmente = this.blocoEscopo();
        }

        return new Tente(
            simboloTente.hashArquivo,
            Number(simboloTente.linha),
            blocoTente,
            blocoPegue,
            blocoSenao,
            blocoFinalmente
        );
    }

    declaracaoFazer(): Fazer {
        const simboloFazer: SimboloInterface = this.simboloAnterior();

        try {
            this.blocos += 1;

            const declaracaoOuBlocoFazer = this.resolverDeclaracao();

            this.consumir(
                tiposDeSimbolos.ENQUANTO,
                "Esperado declaração do 'enquanto' após o escopo da declaração 'fazer'."
            );

            const condicaoEnquanto = this.expressao();

            return new Fazer(
                simboloFazer.hashArquivo,
                Number(simboloFazer.linha),
                declaracaoOuBlocoFazer,
                condicaoEnquanto
            );
        } finally {
            this.blocos -= 1;
        }
    }

    funcao(tipo: string, construtor?: boolean): FuncaoDeclaracao {
        const simbolo: SimboloInterface = !construtor
            ? this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`)
            : new Simbolo(tiposDeSimbolos.CONSTRUTOR, 'construtor', null, -1, -1);

        // Se houver chamadas recursivas à função, precisamos definir um tipo
        // para ela. Vai ser atualizado após avaliação do corpo da função.
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

    logicaComumParametros(): Array<Partial<ParametroInterface>> {
        const parametros: Array<Partial<ParametroInterface>> = [];

        do {
            if (parametros.length >= 255) {
                throw this.erro(this.simboloAtual(), 'Função não pode ter mais de 255 parâmetros.');
            }

            const parametro: Partial<ParametroInterface> = {};

            if (this.simboloAtual().tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro.abrangencia = 'multiplo';
            } else {
                parametro.abrangencia = 'padrao';
            }

            parametro.nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do parâmetro.'
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
                let tipoDadoParametro = this.verificarDefinicaoTipoAtual();
                parametro.tipoDado = tipoDadoParametro;
                this.avancarEDevolverAnterior();
            }

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

            parametros.push(parametro);

            if (parametro.abrangencia === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    /**
     * Resolve uma lista de compreensão.
     * @returns {ListaCompreensao} A lista de compreensão resolvida.
     */
    protected resolverCompreensaoDeLista(): ListaCompreensao {
        // TODO: Se expressão não começar com um identificador, por exemplo `3 * x`, como faríamos para
        // aceitar o `x` na avaliação da expressão?
        if (this.simbolos[this.atual].tipo === tiposDeSimbolos.IDENTIFICADOR) {
            // Antes de avaliar a condição, precisamos registrar a variável de iteração.
            const simboloVariavelIteracao = this.simbolos[this.atual];
            this.pilhaEscopos.definirInformacoesVariavel(
                simboloVariavelIteracao.lexema,
                new InformacaoElementoSintatico(simboloVariavelIteracao.lexema, 'qualquer') // TODO: Talvez um dia inferir o tipo aqui.
            );
        }

        // TODO: Reavaliar a precedência do se ternário.
        const retornoExpressao = this.ou();

        this.consumir(tiposDeSimbolos.PARA, "Esperado instrução 'para' após identificado.");
        this.consumir(tiposDeSimbolos.CADA, "Esperado instrução 'cada' após 'para'.");

        const simboloVariavelIteracao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável após 'para cada'."
        );

        // TODO: Manter essa validação aqui? Se sim, como resolver a expressão?
        /* if (identificador.lexema != simboloVariavelIteracao.lexema) {
            throw this.erro(
                this.simbolos[this.atual],
                "Identificadores de variáveis não correspondentes."
            )
        } */

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução em lista de compreensão."
            );
        }

        const localizacaoVetor = this.simboloAnterior();
        // TODO: Reavaliar a precedência do se ternário.
        const vetor = this.ou();

        this.consumir(tiposDeSimbolos.SE, "Esperado condição 'se' após vetor.");

        const condicao = this.expressao();

        this.consumir(
            tiposDeSimbolos.COLCHETE_DIREITO,
            'Espero fechamento de colchetes após condição.'
        );

        const tipoVetor = (vetor as any).tipo as string;
        if (!tipoVetor.endsWith('[]') && !['qualquer', 'vetor'].includes(tipoVetor)) {
            throw this.erro(
                localizacaoVetor,
                `Variável ou constante em 'para cada' não é iterável. Tipo resolvido: ${tipoVetor}.`
            );
        }

        const variavelIteracao = new Variavel(this.hashArquivo, simboloVariavelIteracao);

        return new ListaCompreensao(
            Number(this.simbolos[this.atual]),
            this.hashArquivo,
            retornoExpressao,
            vetor,
            new ParaCadaComoConstruto(
                retornoExpressao.hashArquivo,
                retornoExpressao.linha,
                variavelIteracao,
                vetor,
                new Bloco(retornoExpressao.hashArquivo, retornoExpressao.linha, [
                    new Se(
                        condicao,
                        new Bloco(retornoExpressao.hashArquivo, retornoExpressao.linha, [
                            new Retorna(simboloVariavelIteracao, retornoExpressao),
                        ]),
                        [],
                        null
                    ),
                ])
            ),
            'qualquer[]' // TODO: Talvez um dia inferir o tipo aqui.
        );
    }

    protected verificarDefinicaoTipoAtual(): string {
        const tipos = [...Object.values(tiposDeDadosPitugues)];

        if (this.simbolos[this.atual].lexema in this.tiposDefinidosEmCodigo) {
            return this.simbolos[this.atual].lexema;
        }

        const lexemaElementar = this.simbolos[this.atual].lexema.toLowerCase();
        const tipoElementarResolvido = tipos.find((tipo) => tipo === lexemaElementar);
        if (!tipoElementarResolvido) {
            throw this.erro(
                this.simbolos[this.atual],
                `Tipo de dados desconhecido: '${this.simbolos[this.atual].lexema}'.`
            );
        }

        if (this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
            const tiposVetores = [
                'inteiro[]',
                'numero[]',
                'número[]',
                'qualquer[]',
                'real[]',
                'texto[]',
            ];
            this.avancarEDevolverAnterior();

            if (!this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_DIREITO)) {
                throw this.erro(
                    this.simbolos[this.atual],
                    `Esperado símbolo de fechamento do vetor: ']'. Atual: ${this.simbolos[this.atual].lexema}`
                );
            }

            const tipoVetor = tiposVetores.find((tipo) => tipo === `${lexemaElementar}[]`);
            this.avancarEDevolverAnterior();
            return tipoVetor as TipoDadosElementar;
        }

        return tipoElementarResolvido as TipoDadosElementar;
    }

    declaracaoTextoDeDocumentacao(): TextoDocumentacao | undefined {
        if (this.simbolos[this.atual].tipo === tiposDeSimbolos.TEXTO_MULTILINHAS) {
            const simboloTexto = this.avancarEDevolverAnterior();
            return new TextoDocumentacao(
                this.hashArquivo,
                Number(simboloTexto.linha),
                simboloTexto.lexema
            );
        }
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de localização.
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
        let definicaoExplicitaDeTipo: boolean = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA)) {
            tipoRetorno = this.verificarDefinicaoTipoAtual();
            this.avancarEDevolverAnterior();
            definicaoExplicitaDeTipo = true;
        }

        this.consumir(tiposDeSimbolos.DOIS_PONTOS, `Esperado ':' antes do escopo do ${tipo}.`);
        const documentacao = this.declaracaoTextoDeDocumentacao();
        const corpo = this.blocoEscopo();

        tipoRetorno = logicaValidacaoRetornoFuncao(
            this,
            corpo,
            tipoRetorno,
            definicaoExplicitaDeTipo,
            parenteseEsquerdo
        );

        return new FuncaoConstruto(
            this.hashArquivo,
            0,
            parametros,
            corpo,
            tipoRetorno,
            definicaoExplicitaDeTipo,
            documentacao
        );
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

        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' antes do escopo da classe.");
        const possivelDocumentacao = this.declaracaoTextoDeDocumentacao();

        const metodos = [];
        const propriedades = [];
        const indentacaoLinha = this.localizacoes[this.simboloAtual().linha].espacosIndentacao;
        while (
            !this.estaNoFinal() &&
            this.localizacoes[this.simboloAtual().linha].espacosIndentacao === indentacaoLinha &&
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.CONSTRUTOR,
                tiposDeSimbolos.FUNCAO,
                tiposDeSimbolos.FUNÇÃO,
                tiposDeSimbolos.IDENTIFICADOR
            )
        ) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            if (simboloAnterior.tipo === tiposDeSimbolos.IDENTIFICADOR) {
                this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' antes do escopo da classe.");
                const tipoPropriedade = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado tipo de propriedade após dois-pontos, em declaração de classe.");

                const propriedade = new PropriedadeClasse(
                    simboloAnterior,
                    tipoPropriedade.lexema,
                    []
                );
                propriedades.push(propriedade);
            } else {
                metodos.push(
                    this.funcao(
                        'método',
                        this.simbolos[this.atual - 1].tipo === tiposDeSimbolos.CONSTRUTOR
                    )
                );
            }
        }

        this.superclasseAtual = undefined;
        const definicaoClasse = new Classe(simbolo, superClasse, metodos, propriedades);
        if (possivelDocumentacao) {
            definicaoClasse.documentacao = possivelDocumentacao;
        }

        this.tiposDefinidosEmCodigo[definicaoClasse.simbolo.lexema] = definicaoClasse;
        return definicaoClasse;
    }

    declaracaoFalhar(): Falhar {
        const simboloFalha: SimboloInterface = this.simbolos[this.atual - 1];
        const textoFalha = this.consumir(
            tiposDeSimbolos.TEXTO,
            'Esperado texto para explicar falha.'
        );
        return new Falhar(simboloFalha, textoFalha.literal);
    }

    /**
     * Verifica se há pontos e vírgula no final de sentenças.
     * Em Pituguês, ; só é permitido para separar múltiplos comandos na mesma linha,
     * mas não no final de uma sentença/linha.
     */
    private verificarPontosEVirgulasInvalidos(): void {
        for (let i = 0; i < this.simbolos.length; i++) {
            const simboloAtual = this.simbolos[i];

            if (simboloAtual.tipo === tiposDeSimbolos.PONTO_E_VIRGULA) {
                const proximoSimbolo = this.encontrarProximoSimboloNaoComentario(i + 1);

                if (!proximoSimbolo || proximoSimbolo.linha > simboloAtual.linha) {
                    this.erros.push(
                        new ErroAvaliadorSintatico(
                            simboloAtual,
                            'Ponto e vírgula (;) não é permitido no final da sentença de código.'
                        )
                    );
                }
            }
        }
    }

    /**
     * Encontra o próximo símbolo que não seja comentário.
     * Isso é importante porque comentários não afetam a validade do ponto e vírgula.
     */
    private encontrarProximoSimboloNaoComentario(inicio: number): SimboloInterface | null {
        for (let i = inicio; i < this.simbolos.length; i++) {
            if (this.simbolos[i].tipo !== tiposDeSimbolos.COMENTARIO) {
                return this.simbolos[i];
            }
        }
        return null;
    }

    /**
     * Consome o símbolo atual, verificando se é uma declaração de função, variável, classe
     * ou uma expressão.
     * @returns Objeto do tipo `Declaracao`.
     */
    resolverDeclaracaoForaDeBloco(): Declaracao {
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

    resolverDeclaracao(): any {
        // Detecção de declaração implícita ou múltipla atribuição (pode começar com * ou identificador)
        const simboloAtual = this.simbolos[this.atual];

        // Bloqueio explícito do uso de "var"
        if (this.temPadraoVarComoPalavraChave()) {
            throw this.erro(
                simboloAtual,
                'Palavra "var" não pode ser usada como palavra-chave para declaração. Use declarações implícitas: "x = 10" em vez de "var x = 10".'
            )
        }

        // Se caso começar com o operador resto (*), ex: *a, b = ...
        if (simboloAtual.tipo === tiposDeSimbolos.MULTIPLICACAO) {
            return this.declaracaoDeVariaveis();
        }

        // Se caso começar com um identificador
        if (simboloAtual.tipo === tiposDeSimbolos.IDENTIFICADOR) {
            if (simboloAtual.lexema.startsWith('*')) return this.declaracaoDeVariaveis();

            if (this.temPadraoMultiplaAtribuicao()) return this.declaracaoDeVariaveis();

            const proximoSimbolo = this.simbolos[this.atual + 1];
            if (proximoSimbolo && proximoSimbolo.tipo === tiposDeSimbolos.IGUAL) {
                if (!this.variavelJaDeclarada(simboloAtual.lexema)) return this.declaracaoImplicita();
            }
        }

        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.COMENTARIO:
                return this.declaracaoComentario();
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.DOIS_PONTOS:
                this.avancarEDevolverAnterior();
                const simboloInicioBloco: SimboloInterface = this.simboloAnterior();
                return new Bloco(
                    simboloInicioBloco.hashArquivo,
                    Number(simboloInicioBloco.linha),
                    this.blocoEscopo()
                );
            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                this.avancarEDevolverAnterior();
                return this.declaracaoEscolha();
            case tiposDeSimbolos.IMPRIMA:
            case tiposDeSimbolos.ESCREVA:
                const simboloEscrevaOuImprima = this.avancarEDevolverAnterior();
                return this.declaracaoEscreva(simboloEscrevaOuImprima);
            case tiposDeSimbolos.FALHAR:
                this.avancarEDevolverAnterior();
                return this.declaracaoFalhar();
            case tiposDeSimbolos.FAZER:
                this.avancarEDevolverAnterior();
                return this.declaracaoFazer();
            case tiposDeSimbolos.PARA:
                this.avancarEDevolverAnterior();
                return this.declaracaoPara();
            case tiposDeSimbolos.QUEBRAR:
            case tiposDeSimbolos.SUSTAR:
                this.avancarEDevolverAnterior();
                return this.declaracaoSustar();
            case tiposDeSimbolos.SE:
                this.avancarEDevolverAnterior();
                return this.declaracaoSe();
            case tiposDeSimbolos.RETORNA:
                this.avancarEDevolverAnterior();
                return this.declaracaoRetorna();
            case tiposDeSimbolos.TENTE:
                this.avancarEDevolverAnterior();
                return this.declaracaoTente();
            case tiposDeSimbolos.TEXTO_MULTILINHAS:
                return this.declaracaoTextoDeDocumentacao();
        }

        return this.declaracaoExpressao();
    }

    /**
     * Inicializa o primeiro nível da pilha de escopos, normalmente com ítens da biblioteca global.
     * É separada da inicialização do avaliador sintático, pois é necessário manipular essa
     * inicialização de outra forma em `delegua-node`.
     */
    protected inicializarPilhaEscopos() {
        this.pilhaEscopos = new PilhaEscopos();
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        // Funções nativas de Delégua (e de Pituguês também, por enquanto)
        this.pilhaEscopos.definirInformacoesVariavel(
            'aleatorio',
            new InformacaoElementoSintatico('aleatorio', 'número')
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'aleatorioEntre',
            new InformacaoElementoSintatico('aleatorioEntre', 'número', true, [
                new InformacaoElementoSintatico('minimo', 'número'),
                new InformacaoElementoSintatico('maximo', 'número'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'algum',
            new InformacaoElementoSintatico('algum', 'lógico', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrar',
            new InformacaoElementoSintatico('encontrar', 'qualquer', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrarIndice',
            new InformacaoElementoSintatico('encontrarIndice', 'inteiro', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrarUltimo',
            new InformacaoElementoSintatico('encontrarUltimo', 'inteiro', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrarUltimoIndice',
            new InformacaoElementoSintatico('encontrarUltimoIndice', 'inteiro', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'filtrarPor',
            new InformacaoElementoSintatico('filtrarPor', 'qualquer[]', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoFiltragem', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'incluido',
            new InformacaoElementoSintatico('incluido', 'lógico', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('valor', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'inteiro',
            new InformacaoElementoSintatico('inteiro', 'inteiro', true, [
                new InformacaoElementoSintatico('valor', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'intervalo',
            new InformacaoElementoSintatico('intervalo', 'inteiro[]', true, [
                new InformacaoElementoSintatico('valorInicial', 'inteiro'),
                new InformacaoElementoSintatico('valorFinal', 'inteiro'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'mapear',
            new InformacaoElementoSintatico('mapear', 'qualquer[]', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoMapeamento', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'numero',
            new InformacaoElementoSintatico('número', 'número', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'número',
            new InformacaoElementoSintatico('número', 'número', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'ordenar',
            new InformacaoElementoSintatico('ordenar', 'qualquer[]', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoOrdenacao', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'paraCada',
            new InformacaoElementoSintatico('paraCada', 'qualquer[]', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoFiltragem', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'primeiroEmCondicao',
            new InformacaoElementoSintatico('primeiroEmCondicao', 'qualquer', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoFiltragem', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'real',
            new InformacaoElementoSintatico('real', 'número', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'reduzir',
            new InformacaoElementoSintatico('reduzir', 'qualquer', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoReducao', 'função'),
                new InformacaoElementoSintatico('valorInicial', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'tamanho',
            new InformacaoElementoSintatico('tamanho', 'inteiro', true, [
                new InformacaoElementoSintatico('objeto', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'texto',
            new InformacaoElementoSintatico('texto', 'texto', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'todosEmCondicao',
            new InformacaoElementoSintatico('todosEmCondicao', 'lógico', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoCondicional', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'tupla',
            new InformacaoElementoSintatico('tupla', 'tupla', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
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
        this.escopos = [];
        this.inicializarPilhaEscopos();
        this.tiposDefinidosEmCodigo = {};

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.localizacoes = retornoLexador?.pragmas || {};

        this.verificarPontosEVirgulasInvalidos();

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
            if (retornoDeclaracao === null) {
                continue;
            }

            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }

            if (!this.estaNoFinal() && this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                // Verificar se este ; está na mesma linha da declaração anterior
                const declaracaoAnterior = declaracoes[declaracoes.length - 1];
                const linhaDeclaraoAnterior = declaracaoAnterior.linha || 0;
                const linhaPontoVirgula = this.simboloAtual().linha;

                if (linhaPontoVirgula === linhaDeclaraoAnterior) {
                    // Está na mesma linha, então é um separador válido
                    this.avancarEDevolverAnterior();
                }
            }
        }

        if (this.performance) {
            const deltaAnalise: [number, number] = hrtime(inicioAnalise);
            // eslint-disable-next-line no-undef
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
