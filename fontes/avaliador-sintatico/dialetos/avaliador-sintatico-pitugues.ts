import hrtime from 'browser-process-hrtime';
import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';

import {
    AcessoIndiceVariavel,
    AcessoIntervaloVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    Decorador,
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
    TipoDe,
    Trio,
    TuplaN,
    Morsa,
    Bote,
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
    Para,
    Importar,
} from '../../declaracoes';

import {
    AvaliadorSintaticoInterface,
    ParametroInterface,
    SimboloInterface,
} from '../../interfaces';
import { Localizacao } from '../../lexador/dialetos/localizacao';
import { RetornoLexadorInterface } from '../../interfaces/retornos/retorno-lexador-interface';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';
import { RetornoAvaliadorSintaticoInterface } from '../../interfaces/retornos/retorno-avaliador-sintatico-interface';

import { Simbolo } from '../../lexador';
import { inferirTipoVariavel, TipoInferencia } from '../../inferenciador';

import { PilhaEscopos } from '../pilha-escopos';
import { InformacaoEscopo } from '../informacao-escopo';
import { InformacaoElementoSintatico } from '../../informacao-elemento-sintatico';
import { MicroLexadorPitugues } from '../../lexador/micro-lexador-pitugues';
import { MicroAvaliadorSintaticoPitugues } from './micro-avaliador-sintatico-pitugues';
import { ClasseDeModulo } from '../../interpretador/estruturas';
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
import primitivasTupla from '../../bibliotecas/dialetos/pitugues/primitivas-tupla';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 *
 * A grande diferença entre este avaliador e os demais é a forma como são entendidos os blocos de escopo.
 * Este avaliador espera uma estrutura de pragmas, que explica quantos espaços há na frente de cada linha.
 */
export class AvaliadorSintaticoPitugues implements AvaliadorSintaticoInterface<
    SimboloInterface,
    Declaracao
> {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    localizacoes: { [linha: number]: Localizacao };

    tiposDefinidosEmCodigo: { [nomeTipo: string]: Declaracao };
    tiposDefinidosPorBibliotecas: {
        [nomeTipo: string]: ClasseDeModulo;
    };
    pilhaEscopos: PilhaEscopos;
    tiposDeFerramentasExternas: { [nomeFerramenta: string]: { [nomeTipo: string]: string } };
    primitivasConhecidas: {
        [nomeModuloOuClasse: string]: { [nomePrimitiva: string]: InformacaoElementoSintatico };
    };

    hashArquivo: number;
    atual: number;
    blocos: number;
    escopos: number[];
    performance: boolean;
    superclasseAtual: string | undefined;
    intuirTipoQualquerParaIdentificadores: boolean;
    pilhaDecoradores: Decorador[];

    constructor(performance = false) {
        this.atual = 0;
        this.blocos = 0;
        this.performance = performance;
        this.intuirTipoQualquerParaIdentificadores = false;
        this.escopos = [];
        this.pilhaDecoradores = [];
        this.pilhaEscopos = new PilhaEscopos();
        this.primitivasConhecidas = {};
        this.tiposDefinidosEmCodigo = {};
        this.tiposDefinidosPorBibliotecas = {};

        registrarPrimitiva(this.primitivasConhecidas, 'dicionário', primitivasDicionario);
        registrarPrimitiva(this.primitivasConhecidas, 'número', primitivasNumero);
        registrarPrimitiva(this.primitivasConhecidas, 'texto', primitivasTexto);
        registrarPrimitiva(this.primitivasConhecidas, 'vetor', primitivasVetor);
        registrarPrimitiva(this.primitivasConhecidas, 'tupla', primitivasTupla);
    }

    protected logicaComumInferenciaTiposAcessoMetodoOuPropriedade(
        entidadeChamada: AcessoMetodoOuPropriedade
    ): string {
        // Algumas coisas podem acontecer aqui.
        // Uma delas é a variável/constante ser uma classe padrão.
        // Isso ocorre quando a importação é feita de uma biblioteca Node.js.
        // Nesse caso, o tipo de `entidadeChamada.objeto` começa com uma letra maiúscula.
        if (entidadeChamada.objeto.tipo && entidadeChamada.objeto.tipo.match(/^[A-Z]/)) {
            const tipoCorrespondente =
                this.tiposDefinidosPorBibliotecas[entidadeChamada.objeto.tipo];
            if (!tipoCorrespondente) {
                throw new ErroAvaliadorSintatico(
                    entidadeChamada.simbolo,
                    `Tipo '${entidadeChamada.objeto.tipo}' não foi encontrado entre os tipos definidos por bibliotecas.`
                );
            }

            if (
                !(entidadeChamada.simbolo.lexema in tipoCorrespondente.metodos) &&
                !(entidadeChamada.simbolo.lexema in tipoCorrespondente.propriedades)
            ) {
                throw new ErroAvaliadorSintatico(
                    entidadeChamada.simbolo,
                    `Membro '${entidadeChamada.simbolo.lexema}' não existe no tipo '${entidadeChamada.objeto.tipo}'.`
                );
            }

            if (entidadeChamada.simbolo.lexema in tipoCorrespondente.metodos) {
                const metodoCorrespondente =
                    tipoCorrespondente.metodos[entidadeChamada.simbolo.lexema];
                return metodoCorrespondente.tipoRetorno || 'qualquer';
            }

            const propriedadeCorrespondente =
                tipoCorrespondente.propriedades[entidadeChamada.simbolo.lexema];
            return propriedadeCorrespondente.tipo;
        }

        // Este caso ocorre quando a variável/constante é do tipo 'qualquer',
        // e a chamada normalmente é feita para uma primitiva.
        // A inferência, portanto, ocorre pelo uso da primitiva.
        for (const primitiva in this.primitivasConhecidas) {
            if (
                this.primitivasConhecidas[primitiva].hasOwnProperty(entidadeChamada.simbolo.lexema)
            ) {
                return this.primitivasConhecidas[primitiva][entidadeChamada.simbolo.lexema].tipo;
            }
        }

        throw new ErroAvaliadorSintatico(
            entidadeChamada.simbolo,
            `Primitiva '${entidadeChamada.simbolo.lexema}' não existe.`
        );
    }

    protected logicaComumInferenciaTiposVariaveisEConstantes(
        inicializador: ConstrutoInterface,
        tipoPrevio: string
    ): string {
        if (tipoPrevio !== 'qualquer') {
            return tipoPrevio;
        }

        switch (inicializador.constructor) {
            case AcessoIndiceVariavel:
                const entidadeChamadaAcessoIndiceVariavel = (inicializador as AcessoIndiceVariavel)
                    .entidadeChamada;

                // Este condicional ocorre com chamadas aninhadas. Por exemplo, `vetor[1][2]`.
                if (entidadeChamadaAcessoIndiceVariavel.constructor === AcessoIndiceVariavel) {
                    return this.logicaComumInferenciaTiposVariaveisEConstantes(
                        entidadeChamadaAcessoIndiceVariavel,
                        tipoPrevio
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
                        return this.logicaComumInferenciaTiposAcessoMetodoOuPropriedade(
                            entidadeChamadaChamada as AcessoMetodoOuPropriedade
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

    async expressaoLeia(): Promise<Leia> {
        const simboloOriginal = this.avancarEDevolverAnterior();

        const simboloLeia = new Simbolo(
            tiposDeSimbolos.LEIA,
            simboloOriginal.lexema,
            simboloOriginal.literal,
            simboloOriginal.linha,
            simboloOriginal.hashArquivo
        );

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em leia."
        );

        const argumentos: ConstrutoInterface[] = [];

        do {
            argumentos.push(await this.atribuir());
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

    private async declaracaoImplicitaVariaveis(): Promise<Var> {
        const identificador = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome de variável.'
        );

        let tipo: string = 'qualquer';
        let tipoExplicito: boolean = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            tipo = this.verificarDefinicaoTipoAtual();
            tipoExplicito = true;
            this.avancarEDevolverAnterior();
        }

        this.consumir(tiposDeSimbolos.IGUAL, "Esperado '=' após identificador.");

        if (this.estaNoFinal()) {
            throw this.erro(this.simboloAnterior(), 'Esperado valor após o símbolo de igual.');
        }

        const valor = await this.atribuir();
        if (!tipoExplicito) {
            tipo = this.logicaComumInferenciaTiposVariaveisEConstantes(valor, 'qualquer');
        }

        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, tipo)
        );

        return new Var(identificador, valor, tipo, tipoExplicito);
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
            if (
                pos >= this.simbolos.length ||
                this.simbolos[pos].tipo !== tiposDeSimbolos.IDENTIFICADOR
            ) {
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

        if (this.simbolos[this.atual].lexema !== 'var') {
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
            if (tipo !== tiposDeSimbolos.IDENTIFICADOR && tipo !== tiposDeSimbolos.VIRGULA)
                return false;

            pos++;
        }

        return false;
    }

    private consumirIdentificadores(): { simbolos: SimboloInterface[]; indexResto: number } {
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
                ehRestoAtual
                    ? 'Esperado nome de variável após operador *.'
                    : 'Esperado nome de variável.'
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

    private async consumirInicializadores(): Promise<ConstrutoInterface[]> {
        const inicializadores: ConstrutoInterface[] = [];
        do {
            if (this.estaNoFinal()) {
                throw this.erro(this.simboloAtual(), 'Esperado inicializador após vírgula.');
            }
            inicializadores.push(await this.atribuir());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializadores;
    }

    private construirValidacaoDesempacotamento(
        identificador: SimboloInterface,
        origem: ConstrutoInterface,
        qtdEsperada: number
    ): Declaracao {
        const linha = identificador.linha;

        const chamadaTamanho = new Chamada(
            this.hashArquivo,
            new Variavel(
                this.hashArquivo,
                new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'tamanho', null, linha, -1)
            ),
            [origem]
        );

        const condicaoErro = new Binario(
            this.hashArquivo,
            chamadaTamanho,
            new Simbolo(tiposDeSimbolos.DIFERENTE, '!=', null, linha, -1),
            new Literal(this.hashArquivo, linha, qtdEsperada, 'número')
        );

        const mensagem = `Erro de execução: Você tentou desempacotar em ${qtdEsperada} variáveis, mas o vetor possui tamanho diferente.`;
        const falha = new Falhar(
            new Simbolo(tiposDeSimbolos.FALHAR, 'falhar', null, linha, -1),
            new Literal(this.hashArquivo, linha, mensagem, 'texto')
        );

        return new Se(condicaoErro, new Bloco(this.hashArquivo, linha, [falha]), [], null);
    }

    async declaracaoDeVariaveis(): Promise<any> {
        const { simbolos: identificadores, indexResto } = this.consumirIdentificadores();

        this.consumir(tiposDeSimbolos.IGUAL, 'Esperado o símbolo igual(=) após identificador.');

        const inicializadores = await this.consumirInicializadores();

        const qtdIdentificadores = identificadores.length;
        const qtdValores = inicializadores.length;
        const ehDesempacotamento = qtdIdentificadores > 1 && qtdValores === 1;

        if (indexResto > -1) {
            if (qtdValores < qtdIdentificadores - 1) {
                if (
                    !ehDesempacotamento ||
                    (ehDesempacotamento && inicializadores[0] instanceof Literal)
                ) {
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
            const simboloVarTemp = new Simbolo(
                tiposDeSimbolos.IDENTIFICADOR,
                nomeVarTemp,
                null,
                linha,
                -1
            );

            retorno.push(new Var(simboloVarTemp, inicializadores[0], 'qualquer[]'));
            origemParaAtribuicao = new Variavel(this.hashArquivo, simboloVarTemp);

            // Injeta validação de tamanho se não houver operador de resto
            if (indexResto === -1) {
                retorno.push(
                    this.construirValidacaoDesempacotamento(
                        identificadores[0],
                        origemParaAtribuicao,
                        qtdIdentificadores
                    )
                );
            }
        }

        let cursorValores = 0;
        const qtdParaResto = qtdValores - (qtdIdentificadores - 1);

        for (let i = 0; i < identificadores.length; i++) {
            const identificador = identificadores[i];
            let inicializador: ConstrutoInterface;
            let tipo = 'qualquer';

            if (i === indexResto) {
                const valoresResto = inicializadores.slice(
                    cursorValores,
                    cursorValores + qtdParaResto
                );
                let tipoInferido = inferirTipoVariavel(valoresResto) as string;
                if (!tipoInferido.endsWith('[]')) tipoInferido = `${tipoInferido}[]`;

                inicializador = new Vetor(
                    identificador.hashArquivo,
                    identificador.linha,
                    valoresResto,
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
                        new Simbolo(
                            tiposDeSimbolos.COLCHETE_DIREITO,
                            ']',
                            null,
                            identificador.linha,
                            -1
                        )
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

    erro(
        simbolo: SimboloInterface,
        mensagemDeErro: string,
        codigoDiagnostico?: string,
        simboloRelacionado?: SimboloInterface
    ): ErroAvaliadorSintatico {
        const simboloParaErro = simbolo || this.simboloAnterior();
        const excecao = new ErroAvaliadorSintatico(
            simboloParaErro,
            mensagemDeErro,
            codigoDiagnostico,
            simboloRelacionado
        );
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
        if (this.atual + 1 >= this.simbolos.length) return false;
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

    /**
     * Transforma uma string com interpolações (f-string) em código equivalente usando o método formatar.
     * Exemplo: f"Olá {nome}, você tem {idade} anos" -> "Olá " + nome + " você tem " + idade + " anos"
     * Com formatadores: f"{valor:.2f}" -> "" + "{:.2f}".formatar(valor) + ""
     * Com depuração: f"{usuario=}" -> "" + "{usuario=}".formatar(usuario) + ""
     */
    private transformarInterpolacaoEmFormatacao(conteudoOriginal: string): string {
        const ehDepuracao = (mioloLimpo: string): boolean => {
            return mioloLimpo.endsWith('=') && !/^(?:[!=<>]=|[<>])$/.test(mioloLimpo.slice(-2));
        };

        const processarParte = (_: string, miolo: string): string => {
            const mioloLimpo = miolo.trimEnd();

            // Modo depuração: {expressao=}
            if (ehDepuracao(mioloLimpo)) {
                const expressao = mioloLimpo.slice(0, -1).trim();

                return `" + "{${miolo}}".formatar(${expressao}) + "`;
            }

            // Modo formatação: {expressao:formato}
            if (mioloLimpo.includes(':')) {
                const [variavel, formato] = mioloLimpo.split(':').map((s) => s.trim());

                if (variavel) {
                    return `" + "{:${formato}}".formatar(${variavel}) + "`;
                }
            }

            // Interpolação simples: {expressao}
            return `" + (${miolo}) + "`;
        };

        return '"' + conteudoOriginal.replace(/\{(.*?)\}/g, processarParte) + '"';
    }

    private ignorarComentarios(): void {
        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.COMENTARIO)) {
            this.avancarEDevolverAnterior();
        }
    }

    async primario(): Promise<ConstrutoInterface> {
        const simboloAtual = this.simbolos[this.atual];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                this.avancarEDevolverAnterior();
                const chaves = [];
                const valoresDicionario = [];
                const esSpread = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    return new Dicionario(this.hashArquivo, simboloAtual.linha, [], [], []);
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    // Verificar se é spread (**expressao)
                    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
                        const expressaoDicionario = await this.atribuir();

                        chaves.push(null);
                        valoresDicionario.push(expressaoDicionario);
                        esSpread.push(true);
                    } else {
                        const chave = await this.atribuir();
                        this.consumir(
                            tiposDeSimbolos.DOIS_PONTOS,
                            "Esperado ':' entre chave e valor."
                        );
                        const valor = await this.atribuir();

                        chaves.push(chave);
                        valoresDicionario.push(valor);
                        esSpread.push(false);
                    }

                    if (this.simboloAtual().tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                        this.consumir(
                            tiposDeSimbolos.VIRGULA,
                            'Esperado vírgula antes da próxima expressão.'
                        );
                    }
                }

                return new Dicionario(
                    this.hashArquivo,
                    simboloAtual.linha,
                    chaves,
                    valoresDicionario,
                    esSpread
                );

            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                this.ignorarComentarios();

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    return new Vetor(
                        this.hashArquivo,
                        simboloAtual.linha,
                        [],
                        'qualquer[]'
                    );
                }

                // Ao resolver a expressão aqui, identificadores dentro da expressão de compreensão
                // de lista serão tratados como 'qualquer', para evitar erros de tipo.
                this.intuirTipoQualquerParaIdentificadores = true;
                const retornoExpressaoOuPrimeiroValor = await this.seTernario();
                this.intuirTipoQualquerParaIdentificadores = false;

                if (this.simbolos[this.atual].tipo === tiposDeSimbolos.PARA) {
                    return await this.resolverCompreensaoDeLista(
                        retornoExpressaoOuPrimeiroValor
                    );
                }

                // Aqui já sabemos que não é uma compreensão de lista.
                const valoresVetor = [retornoExpressaoOuPrimeiroValor];
                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    this.consumir(
                        tiposDeSimbolos.VIRGULA,
                        'Esperado vírgula antes da próxima expressão.'
                    );
                    this.ignorarComentarios();
                    valoresVetor.push(await this.atribuir());
                    this.ignorarComentarios();
                }

                const tipoVetor = inferirTipoVariavel(valoresVetor);

                return new Vetor(
                    this.hashArquivo,
                    simboloAtual.linha,
                    valoresVetor,
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
                const corpoDaFuncao = await this.corpoDaFuncao(simboloFuncao.lexema);
                this.pilhaEscopos.definirInformacoesVariavel(
                    simboloFuncao.lexema,
                    new InformacaoElementoSintatico(simboloFuncao.lexema, 'função')
                );
                return corpoDaFuncao;
            case tiposDeSimbolos.IMPORTAR:
                return await this.construtoImportar();
            case tiposDeSimbolos.NULO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, simboloAtual.linha, null);
            case tiposDeSimbolos.ISTO:
                const simboloIsto = this.avancarEDevolverAnterior();
                return new Isto(this.hashArquivo, simboloAtual.linha, simboloIsto);
            case tiposDeSimbolos.LEIA:
                return await this.expressaoLeia();
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
            case tiposDeSimbolos.TIPO:
                const simboloTipo = this.avancarEDevolverAnterior();

                this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'tipo'.");

                const expressaoAvaliar = await this.atribuir();

                this.consumir(
                    tiposDeSimbolos.PARENTESE_DIREITO,
                    "Esperado ')' após expressão em 'tipo'."
                );

                return new TipoDe(simboloTipo.hashArquivo, simboloTipo, expressaoAvaliar);
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador = this.avancarEDevolverAnterior();
                let tipoOperando: string;

                if (this.verificarTipoSimboloAtual(tiposDeSimbolos.MORSA)) {
                    this.pilhaEscopos.definirInformacoesVariavel(
                        simboloIdentificador.lexema,
                        new InformacaoElementoSintatico(
                            simboloIdentificador.lexema,
                            'qualquer'
                        )
                    );
                }

                if (this.intuirTipoQualquerParaIdentificadores) {
                    // Esta indicação é utilizada para compreensões de lista, onde o
                    // tipo do identificador de iteração é 'qualquer' por definição.
                    tipoOperando = 'qualquer';
                    this.pilhaEscopos.definirInformacoesVariavel(
                        simboloIdentificador.lexema,
                        new InformacaoElementoSintatico(
                            simboloIdentificador.lexema,
                            'qualquer'
                        )
                    );
                } else if (
                    simboloIdentificador.lexema in this.tiposDefinidosEmCodigo
                ) {
                    tipoOperando = simboloIdentificador.lexema;
                } else {
                    try {
                        tipoOperando = this
                            .pilhaEscopos
                            .obterTipoVariavelPorNome(
                                simboloIdentificador.lexema
                            );
                    } catch (erro: any) {
                        throw this.erro(simboloIdentificador, erro.message);
                    }
                }

                return new Variavel(
                    this.hashArquivo,
                    simboloIdentificador,
                    tipoOperando
                );
            case tiposDeSimbolos.INTERPOLACAO:
                const simboloInterpolacao = this.avancarEDevolverAnterior();
                const conteudoOriginal = simboloInterpolacao.literal as string;

                const codigoTransformado =
                    this.transformarInterpolacaoEmFormatacao(conteudoOriginal);

                const microLexador = new MicroLexadorPitugues();
                const retornoMicroLexador = microLexador.mapear(codigoTransformado);
                const microAvaliadorSintatico = new MicroAvaliadorSintaticoPitugues();

                let retornoMicroAvaliador: RetornoAvaliadorSintaticoInterface<Declaracao>;
                try {
                    retornoMicroAvaliador = microAvaliadorSintatico.analisar(
                        retornoMicroLexador,
                        this.hashArquivo
                    );

                    if (retornoMicroAvaliador.erros.length > 0) {
                        this.erros.push(...retornoMicroAvaliador.erros);
                    }
                } catch (erro: any) {
                    this.erros.push(erro);

                    return new Literal(this.hashArquivo, simboloInterpolacao.linha, '');
                }

                const declaracao = retornoMicroAvaliador.declaracoes[0] as Expressao;

                return declaracao.expressao;
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();

                // Verifica se é tupla vazia
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_DIREITO)) {
                    return new TuplaN(this.hashArquivo, simboloAtual.linha, []);
                }

                const expressao = await this.tupla();

                // Se a expressão já é uma tupla (com vírgulas), retorna ela
                if (expressao instanceof TuplaN) {
                    this.consumir(
                        tiposDeSimbolos.PARENTESE_DIREITO,
                        "Esperado ')' após itens da tupla."
                    );
                    return expressao;
                }

                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
                return new Agrupamento(this.hashArquivo, simboloAtual.linha, expressao);
            case tiposDeSimbolos.SUPER:
                const simboloSuper = this.avancarEDevolverAnterior();
                return new Super(this.hashArquivo, simboloSuper, this.superclasseAtual);
        }

        throw this.erro(this.simboloAtual(), 'Esperado expressão.');
    }

    async finalizarChamada(entidadeChamada: ConstrutoInterface): Promise<ConstrutoInterface> {
        const argumentos = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (argumentos.length >= 255) {
                    throw this.erro(this.simboloAtual(), 'Não pode haver mais de 255 argumentos.');
                }
                argumentos.push(await this.atribuir());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");

        const chamada = new Chamada(this.hashArquivo, entidadeChamada, argumentos);
        chamada.tipo = entidadeChamada.tipo;
        return chamada;
    }

    async chamar(): Promise<ConstrutoInterface> {
        let expressao: ConstrutoInterface = await this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = await this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do método ou propriedade após o '.'"
                );

                expressao = new AcessoMetodoOuPropriedade(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const inicio = !this.verificarTipoSimboloAtual(tiposDeSimbolos.DOIS_PONTOS)
                    ? await this.atribuir()
                    : null;

                let ehFatiamento = false;
                let fim: ConstrutoInterface | null = null;
                let passo: ConstrutoInterface | null = null;

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
                    ehFatiamento = true;

                    if (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.DOIS_PONTOS) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.COLCHETE_DIREITO)
                    )
                        fim = await this.atribuir();

                    if (
                        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.COLCHETE_DIREITO)
                    )
                        passo = await this.atribuir();
                }

                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );

                if (ehFatiamento) {
                    expressao = new AcessoIntervaloVariavel(
                        this.hashArquivo,
                        expressao,
                        inicio,
                        fim,
                        passo,
                        simboloFechamento
                    );
                } else {
                    expressao = new AcessoIndiceVariavel(
                        this.hashArquivo,
                        expressao,
                        inicio,
                        simboloFechamento
                    );
                }
            } else {
                break;
            }
        }

        return expressao;
    }

    async unario(): Promise<ConstrutoInterface> {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.INTERROGACAO)) {
            const operador = this.simboloAnterior();
            const direito = await this.unario();
            this.erro(operador, "O símbolo '?' não é um operador válido em Pituguês.");
            return direito;
        }

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

    async exponenciacao(): Promise<ConstrutoInterface> {
        let expressao = await this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simboloAnterior();
            const direito = await this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async multiplicar(): Promise<ConstrutoInterface> {
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

    async adicaoOuSubtracao(): Promise<ConstrutoInterface> {
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

    async bitShift(): Promise<ConstrutoInterface> {
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

    async bitE(): Promise<ConstrutoInterface> {
        let expressao = await this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simboloAnterior();
            const direito = await this.bitShift();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async bitOu(): Promise<ConstrutoInterface> {
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

    async comparar(): Promise<ConstrutoInterface> {
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

    async comparacaoIgualdade(): Promise<ConstrutoInterface> {
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

    async em(): Promise<ConstrutoInterface> {
        let expressao = await this.comparacaoIgualdade();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.EM,
                tiposDeSimbolos.CONTEM,
                tiposDeSimbolos.NAO
            )
        ) {
            let operador = this.simboloAnterior();
            let negado = false;
            if (operador.tipo === tiposDeSimbolos.NAO) {
                operador = this.consumir(
                    tiposDeSimbolos.CONTEM,
                    `Esperado palavra reservada 'contém' ou 'contem' após palavra reservada ${operador.lexema}.`
                );
                negado = true;
            }

            const direito = await this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
            (expressao as Logico).negado = negado;
        }

        return expressao;
    }

    async e(): Promise<ConstrutoInterface> {
        let expressao = await this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simboloAnterior();
            const direito = await this.em();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async ou(): Promise<ConstrutoInterface> {
        let expressao = await this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simboloAnterior();
            const direito = await this.e();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected async seTernario(): Promise<ConstrutoInterface> {
        let expressaoEntao = await this.ou();

        if (
            this.simbolos[this.atual] &&
            this.simbolos[this.atual].tipo === tiposDeSimbolos.SE &&
            expressaoEntao.linha === this.simbolos[this.atual].linha
        ) {
            while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) {
                const operador = this.simbolos[this.atual - 1];
                const expressaoOuCondicao = await this.seTernario();
                this.consumir(
                    tiposDeSimbolos.SENAO,
                    `Esperado 'senão' ou 'senao' após caminho positivo em se ternário. Atual:
                    ${this.simbolos[this.atual].lexema}.`
                );
                const expressaoSenao = await this.seTernario();
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

    async tupla(): Promise<ConstrutoInterface> {
        let expressao = await this.atribuir();

        // Se não há vírgula, retorna a expressão simples
        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA)) {
            return expressao;
        }

        // Se há vírgula, então é uma tupla
        const elementos = [expressao];

        do {
            if (
                this.verificarTipoSimboloAtual(
                    tiposDeSimbolos.PARENTESE_DIREITO
                )
            ) {
                break;
            }

            elementos.push(await this.atribuir());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new TuplaN(this.hashArquivo, expressao.linha, elementos);
    }

    async bote(): Promise<ConstrutoInterface> {
        let expressao = await this.seTernario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BOTE)) {
            const operadorBote = this.simboloAnterior();
            const direita = await this.seTernario();

            expressao = new Bote(
                this.hashArquivo,
                Number(operadorBote.linha),
                expressao,
                direita
            );
        }

        return expressao;
    }

    async atribuir(): Promise<ConstrutoInterface> {
        const expressao = await this.bote();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MORSA)) {
            const operadorMorsa = this.simboloAnterior();
            const valor = await this.atribuir();

            if (expressao instanceof Variavel) {
                return new Morsa(this.hashArquivo, expressao, valor);
            }

            throw this.erro(
                operadorMorsa,
                'Operador Morsa (:=) só pode ser usado para atribuir a variáveis.'
            );
        }

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.IGUAL,
                tiposDeSimbolos.MAIS_IGUAL,
                tiposDeSimbolos.MENOS_IGUAL,
                tiposDeSimbolos.MULTIPLICACAO_IGUAL,
                tiposDeSimbolos.DIVISAO_IGUAL
            )
        ) {
            const operadorAtribuicao = this.simboloAnterior();
            const valor = await this.atribuir();

            // Se for apenas '=', é uma atribuição padrão
            if (operadorAtribuicao.tipo === tiposDeSimbolos.IGUAL) {
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

                throw this.erro(
                    operadorAtribuicao,
                    'Tarefa de atribuição inválida'
                );
            }

            // Se for +=, -=, *=, /=
            // Transforma 'a += 1' em 'a = a + 1'
            let tipoOperadorMatematico: string;
            switch (operadorAtribuicao.tipo) {
                case tiposDeSimbolos.MAIS_IGUAL:
                    tipoOperadorMatematico = tiposDeSimbolos.ADICAO;
                    break;
                case tiposDeSimbolos.MENOS_IGUAL:
                    tipoOperadorMatematico = tiposDeSimbolos.SUBTRACAO;
                    break;
                case tiposDeSimbolos.MULTIPLICACAO_IGUAL:
                    tipoOperadorMatematico = tiposDeSimbolos.MULTIPLICACAO;
                    break;
                case tiposDeSimbolos.DIVISAO_IGUAL:
                    tipoOperadorMatematico = tiposDeSimbolos.DIVISAO;
                    break;
            }

            const simboloOperador = new Simbolo(
                tipoOperadorMatematico,
                operadorAtribuicao.lexema.charAt(0),
                null,
                operadorAtribuicao.linha,
                operadorAtribuicao.hashArquivo
            );

            const operacaoBinaria = new Binario(
                this.hashArquivo,
                expressao,
                simboloOperador,
                valor
            );

            if (expressao instanceof Variavel) {
                return new Atribuir(
                    this.hashArquivo,
                    expressao,
                    operacaoBinaria
                );
            }

            if (expressao instanceof AcessoMetodoOuPropriedade) {
                return new DefinirValor(
                    this.hashArquivo,
                    0,
                    expressao.objeto,
                    expressao.simbolo,
                    operacaoBinaria
                );
            }

            if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    0,
                    expressao.entidadeChamada,
                    expressao.indice,
                    operacaoBinaria
                );
            }

            throw this.erro(
                operadorAtribuicao,
                'Tarefa de atribuição inválida'
            );
        }

        return expressao;
    }

    async declaracaoEscreva(simboloEscreva: SimboloInterface): Promise<Escreva> {
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: Array<ConstrutoInterface> = [];

        do {
            argumentos.push(await this.atribuir());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        const declaracaoEscreva = new Escreva(
            Number(simboloEscreva.linha),
            simboloEscreva.hashArquivo,
            argumentos
        );
        declaracaoEscreva.simboloEscreva = simboloEscreva;
        return declaracaoEscreva;
    }

    async declaracaoExpressao() {
        const expressao = await this.atribuir();
        return new Expressao(expressao);
    }

    async blocoEscopo(): Promise<any[]> {
        this.pilhaEscopos.empilhar(new InformacaoEscopo());
        let declaracoes: Array<Declaracao> = [];
        let simboloAtual = this.simboloAtual();
        const simboloAnterior = this.simboloAnterior();

        if (!simboloAtual) {
            throw this.erro(simboloAnterior, 'Esperado corpo do escopo após a declaração.');
        }

        // Declaração na mesma linha (ex: 'se verdadeiro: escreva("Oi")')
        if (simboloAtual.linha === simboloAnterior.linha) {
            const retorno = await this.resolverDeclaracaoForaDeBloco();
            if (retorno !== null) declaracoes = declaracoes.concat(retorno);
        } else {
            // Bloco de múltiplas linhas baseado em indentação
            let espacosAtual = this.localizacoes[simboloAtual.linha].espacosIndentacao;
            const espacosAnterior = this.localizacoes[simboloAnterior.linha].espacosIndentacao;

            if (espacosAtual <= espacosAnterior) {
                throw this.erro(
                    simboloAtual,
                    `Indentação inconsistente na linha ${simboloAtual.linha}. ` +
                        `Esperado: >= ${espacosAnterior}. ` +
                        `Atual: ${espacosAtual}`
                );
            }

            const indentacaoBloco = espacosAtual;

            // Consome as declarações enquanto a indentação for estritamente igual à do bloco
            while (simboloAtual && espacosAtual === indentacaoBloco) {
                const retorno = await this.resolverDeclaracaoForaDeBloco();
                if (retorno !== null) declaracoes = declaracoes.concat(retorno);

                simboloAtual = this.simboloAtual();
                if (simboloAtual) {
                    espacosAtual = this.localizacoes[simboloAtual.linha].espacosIndentacao;
                }
            }
        }

        this.pilhaEscopos.removerUltimo();
        return declaracoes;
    }

    async declaracaoEnquanto(): Promise<Enquanto> {
        try {
            this.blocos += 1;

            const condicao = await this.atribuir();
            const bloco = (await this.resolverDeclaracao()) as Bloco;

            return new Enquanto(condicao, bloco);
        } finally {
            this.blocos -= 1;
        }
    }

    async declaracaoEscolha(): Promise<Escolha> {
        try {
            this.blocos += 1;

            const condicao = await this.atribuir();

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
                    const caminhoCondicoes = [await this.atribuir()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(await this.atribuir());
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
                    const declaracoes = await this.blocoEscopo();

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
                    const declaracoes = await this.blocoEscopo();

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

    protected async declaracaoParaCada(simboloPara: SimboloInterface): Promise<ParaCada> {
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

        const vetor = await this.atribuir();
        if (!vetor.hasOwnProperty('tipo')) {
            throw this.erro(
                simboloPara,
                `Variável ou constante em 'para cada' não parece possuir um tipo iterável.`
            );
        }

        const tipoVetor = (vetor as any).tipo as string;
        if (!tipoVetor.endsWith('[]') && !['qualquer', 'vetor'].includes(tipoVetor)) {
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
        const corpo: Bloco = (await this.resolverDeclaracao()) as Bloco;

        return new ParaCada(
            this.hashArquivo,
            Number(simboloPara.linha),
            new Variavel(this.hashArquivo, nomeVariavelIteracao),
            vetor,
            corpo
        );
    }

    async declaracaoPara(): Promise<ParaCada> {
        const simboloPara: SimboloInterface = this.simboloAnterior();
        this.blocos += 1;

        try {
            this.consumir(
                tiposDeSimbolos.CADA,
                `Esperado palavra reservada 'cada' após 'para'. Atual: ${this.simbolos[this.atual].lexema}.`
            );

            const primeiraVariavel = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador de variável de iteração para instrução 'para cada'."
            );

            let simboloSegundaVariavel: SimboloInterface = null;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA)) {
                simboloSegundaVariavel = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    'Esperado identificador após a vírgula.'
                );
            }

            let variavelIteracao: Variavel<string> | Dupla;
            const v1 = new Variavel(this.hashArquivo, primeiraVariavel, 'qualquer');

            if (simboloSegundaVariavel) {
                const v2 = new Variavel(this.hashArquivo, simboloSegundaVariavel, 'qualquer');

                variavelIteracao = new Dupla(v1, v2);
            } else {
                variavelIteracao = v1;
            }

            if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
                throw this.erro(
                    this.simbolos[this.atual],
                    "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução 'para cada'."
                );
            }

            const alvoIteracao = await this.atribuir();

            this.validarSeAlvoEIteravel(simboloPara, alvoIteracao, !!simboloSegundaVariavel);

            this.pilhaEscopos.definirInformacoesVariavel(
                primeiraVariavel.lexema,
                new InformacaoElementoSintatico(primeiraVariavel.lexema, 'qualquer')
            );

            if (simboloSegundaVariavel) {
                this.pilhaEscopos.definirInformacoesVariavel(
                    simboloSegundaVariavel.lexema,
                    new InformacaoElementoSintatico(simboloSegundaVariavel.lexema, 'qualquer')
                );
            }

            // TODO: Talvez não seja uma ideia melhor chamar o método de `Bloco` aqui?
            const corpo: Bloco = (await this.resolverDeclaracao()) as Bloco;

            return new ParaCada(
                this.hashArquivo,
                Number(simboloPara.linha),
                variavelIteracao,
                alvoIteracao,
                corpo
            );
        } finally {
            this.blocos -= 1;
        }
    }

    /**
     * Função auxiliar para validar se o alvo pode ser iterado.
     */
    private validarSeAlvoEIteravel(
        simboloPara: SimboloInterface,
        alvo: any,
        temDuasVariaveis: boolean
    ): void {
        if (!alvo || !alvo.tipo) return;

        const tipo = alvo.tipo;
        const tiposValidos = ['qualquer', 'vetor', 'dicionário', 'texto'];
        const eVetor = tipo.endsWith('[]') || tipo === 'vetor';

        if (temDuasVariaveis) {
            if (!eVetor && tipo !== 'dicionário' && tipo !== 'qualquer') {
                throw this.erro(
                    simboloPara,
                    `Para iterar com duas variáveis, o objeto deve ser um dicionário ou lista. Tipo atual: ${tipo}.`
                );
            }
        } else {
            if (!eVetor && !tiposValidos.includes(tipo)) {
                throw this.erro(simboloPara, `O objeto do tipo '${tipo}' não é iterável.`);
            }
        }
    }

    async declaracaoSe(): Promise<Se> {
        const condicao = await this.atribuir();

        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após condição do 'se'.");
        const simboloColonEntao = this.simboloAnterior();
        const caminhoEntao = new Bloco(
            simboloColonEntao.hashArquivo,
            Number(simboloColonEntao.linha),
            await this.blocoEscopo()
        );

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.SE)) {
                // 'senao se' - encadeamento de condicionais, sem dois-pontos
                caminhoSenao = await this.resolverDeclaracao();
            } else {
                this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após 'senao'.");
                const simboloColonSenao = this.simboloAnterior();
                caminhoSenao = new Bloco(
                    simboloColonSenao.hashArquivo,
                    Number(simboloColonSenao.linha),
                    await this.blocoEscopo()
                );
            }
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

    protected async resolverDecoradores(): Promise<void> {
        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.ARROBA)) {
            this.avancarEDevolverAnterior();
            let nomeDecorador = '@';
            let linha: number;
            let parametros: Array<Partial<ParametroInterface>> = [];
            const atributos: { [key: string]: any } = {};

            const primeiraParteNomeDecorador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome de decorador após "@".'
            );
            linha = Number(primeiraParteNomeDecorador.linha);
            nomeDecorador += primeiraParteNomeDecorador.lexema;

            while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const parteNomeDecorador = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    'Esperado nome de decorador após "."'
                );
                nomeDecorador += '.' + parteNomeDecorador.lexema;
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                    parametros = await this.logicaComumParametros();
                }

                for (const parametro of parametros) {
                    if (parametro.nome.lexema in atributos) {
                        throw this.erro(
                            parametro.nome,
                            `Atributo de decorador declarado duas ou mais vezes: ${parametro.nome.lexema}`
                        );
                    }
                    atributos[parametro.nome.lexema] = parametro.valorPadrao;
                }

                this.consumir(
                    tiposDeSimbolos.PARENTESE_DIREITO,
                    'Esperado ")" após argumentos do decorador.'
                );
            }

            this.pilhaDecoradores.push(
                new Decorador(this.hashArquivo, linha, nomeDecorador, atributos)
            );
        }
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

    async declaracaoRetorna(): Promise<Retorna> {
        const palavraChave = this.simboloAnterior();
        let valor = null;

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            valor = await this.atribuir();
        }

        return new Retorna(palavraChave, valor);
    }

    async construtoImportar(): Promise<ImportarComoConstruto> {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");
        const caminho = await this.atribuir();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new ImportarComoConstruto(caminho as Literal);
    }

    async declaracaoImportar(): Promise<Importar> {
        const nomeModulo = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado nome do módulo após 'importar'."
        );
        const caminho = new Literal(
            nomeModulo.hashArquivo,
            Number(nomeModulo.linha),
            nomeModulo.lexema
        );
        const declaracao = new Importar(caminho);

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COMO)) {
            const alias = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após 'como' em declaração de importação."
            );
            declaracao.simboloTudo = alias;
        } else {
            declaracao.simboloTudo = nomeModulo;
        }

        return Promise.resolve(declaracao);
    }

    async declaracaoImportarDe(): Promise<Importar> {
        const nomeModulo = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado nome do módulo após 'de'."
        );
        const caminho = new Literal(
            nomeModulo.hashArquivo,
            Number(nomeModulo.linha),
            nomeModulo.lexema
        );

        this.consumir(
            tiposDeSimbolos.IMPORTAR,
            "Esperado 'importar' após nome do módulo em declaração 'de ... importar'."
        );

        const elementosImportacao: SimboloInterface[] = [];
        do {
            const elemento = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado identificador de elemento a ser importado.'
            );
            elementosImportacao.push(elemento);
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        const declaracao = new Importar(caminho);
        declaracao.elementosImportacao = elementosImportacao;
        return Promise.resolve(declaracao);
    }

    async declaracaoTente(): Promise<Tente> {
        const simboloTente: SimboloInterface = this.simboloAnterior();
        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'tente'.");

        const blocoTente = await this.blocoEscopo();

        let blocoPegue = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.COMO)) {
                this.avancarEDevolverAnterior();
                const variavelExcecao = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    `Esperado identificador após palavra reservada 'como' em bloco tente. Atual: ${this.simbolos[this.atual].lexema}.`
                );
                // Caso 1: com parâmetro de erro.
                // `pegue` recebe um `FuncaoConstruto`.
                this.consumir(
                    tiposDeSimbolos.DOIS_PONTOS,
                    `Esperado ':' antes do escopo do bloco 'pegue'.`
                );

                this.pilhaEscopos.definirInformacoesVariavel(
                    variavelExcecao.lexema,
                    new InformacaoElementoSintatico(variavelExcecao.lexema, 'qualquer')
                );

                const corpo = await this.blocoEscopo();

                blocoPegue = new FuncaoConstruto(
                    this.hashArquivo,
                    simboloTente.linha,
                    [
                        {
                            abrangencia: 'padrao',
                            nome: variavelExcecao,
                            tipoDado: 'qualquer',
                        } as ParametroInterface,
                    ],
                    corpo,
                    'vazio',
                    false
                );
            } else {
                // Caso 2: sem parâmetro de erro.
                // `pegue` recebe um bloco.
                this.consumir(
                    tiposDeSimbolos.DOIS_PONTOS,
                    "Esperado ':' após a declaração 'pegue'."
                );

                blocoPegue = await this.blocoEscopo();
            }
        }

        let blocoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'senão'.");

            blocoSenao = await this.blocoEscopo();
        }

        let blocoFinalmente = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'pegue'.");

            blocoFinalmente = await this.blocoEscopo();
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

    async declaracaoFazer(): Promise<Fazer> {
        const simboloFazer: SimboloInterface = this.simboloAnterior();

        try {
            this.blocos += 1;

            const declaracaoOuBlocoFazer = (await this.resolverDeclaracao()) as Bloco;

            this.consumir(
                tiposDeSimbolos.ENQUANTO,
                "Esperado declaração do 'enquanto' após o escopo da declaração 'fazer'."
            );

            const condicaoEnquanto = await this.atribuir();

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

    async funcao(tipo: string, construtor?: boolean): Promise<FuncaoDeclaracao> {
        const simbolo: SimboloInterface = !construtor
            ? this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`)
            : new Simbolo(tiposDeSimbolos.CONSTRUTOR, 'construtor', null, -1, -1);

        const decoradores = Array.from(this.pilhaDecoradores);
        this.pilhaDecoradores = [];

        // Se houver chamadas recursivas à função, precisamos definir um tipo
        // para ela. Vai ser atualizado após avaliação do corpo da função.
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
        const funcaoDeclaracao = new FuncaoDeclaracao(
            simbolo,
            corpoDaFuncao,
            tipoDaFuncao,
            decoradores
        );
        this.pilhaEscopos.registrarReferenciaFuncao(simbolo.lexema, funcaoDeclaracao);

        return funcaoDeclaracao;
    }

    async logicaComumParametros(): Promise<Array<Partial<ParametroInterface>>> {
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
                parametro.valorPadrao = await this.primario();
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
     * @param retornoExpressao A expressão já resolvida que representa o valor a ser retornado.
     * @returns {ListaCompreensao} A lista de compreensão resolvida.
     */
    protected async resolverCompreensaoDeLista(
        retornoExpressao: ConstrutoInterface
    ): Promise<ListaCompreensao> {
        this.consumir(tiposDeSimbolos.PARA, "Esperado instrução 'para' após identificador.");
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
        const vetor = await this.ou();

        this.consumir(tiposDeSimbolos.SE, "Esperado condição 'se' após vetor.");

        const condicao = await this.atribuir();

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
            (retornoExpressao as any).tipo ? `${(retornoExpressao as any).tipo}[]` : 'qualquer[]'
        );
    }

    protected verificarDefinicaoTipoAtual(): string {
        if (
            this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
            this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)
        ) {
            if (this.verificarTipoProximoSimbolo(tiposDeSimbolos.MENOR)) {
                this.avancarEDevolverAnterior();
                this.avancarEDevolverAnterior();

                const tipoRetorno = this.simboloAtual().lexema;

                this.avancarEDevolverAnterior();

                return `função<${tipoRetorno}>`;
            }

            return 'função<qualquer>';
        }

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
            return tipoVetor as TipoInferencia;
        }

        return tipoElementarResolvido as TipoInferencia;
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

    async corpoDaFuncao(tipo: string): Promise<FuncaoConstruto> {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de localização.
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
        let definicaoExplicitaDeTipo: boolean = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA)) {
            tipoRetorno = this.verificarDefinicaoTipoAtual();
            this.avancarEDevolverAnterior();
            definicaoExplicitaDeTipo = true;
        }

        this.consumir(tiposDeSimbolos.DOIS_PONTOS, `Esperado ':' antes do escopo do ${tipo}.`);

        const documentacao = this.declaracaoTextoDeDocumentacao();
        const corpo = await this.blocoEscopo();

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

    private async resolverDecoradorDeAcesso(metodos: any[]): Promise<void> {
        const simboloDecorador = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado nome do decorador após '@'."
        );

        const eObtenedor = simboloDecorador.lexema === 'propriedade';

        if (!eObtenedor) {
            this.consumir(
                tiposDeSimbolos.PONTO,
                "Esperado '.' no decorador de definidor."
            );
            const simboloDefinidor = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado 'definidor'.")
            ;

            if (simboloDefinidor.lexema !== 'definidor') {
                throw this.erro(
                    simboloDefinidor,
                    "Decorador inválido. Esperado 'definidor'."
                );
            }
        }

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FUNCAO, tiposDeSimbolos.FUNÇÃO)) {
            throw this.erro(
                this.simboloAtual(),
                "Esperado declaração de 'função' logo após o decorador."
            );
        }

        const metodoResolvido = await this.funcao('método', false);

        if (eObtenedor) metodoResolvido.eObtenedor = true;
        else metodoResolvido.eDefinidor = true;

        metodos.push(metodoResolvido);
    }

    private async resolverPropriedadeDeClasse(
        simboloAnterior: SimboloInterface<string>,
        propriedadesDeClasse: PropriedadeClasse[]
    ): Promise<void> {
        let tipoLexema: string | null = null;
        let valorPropriedade: ConstrutoInterface | null = null;
        let possuiValorInicial = false;

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            const simboloTipo = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado tipo da propriedade após os dois pontos.'
            );
            tipoLexema = simboloTipo.lexema;
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            valorPropriedade = await this.atribuir();
            possuiValorInicial = true;
        } else {
            throw this.erro(
                this.simboloAtual(),
                "Esperado ':' (para tipo) ou '=' (para valor) após o nome da propriedade."
            );
        }

        propriedadesDeClasse.push(
            new PropriedadeClasse(
                simboloAnterior,
                tipoLexema,
                [],
                'publico',
                possuiValorInicial,
                valorPropriedade
            )
        );
    }

    private async resolverMetodoOuConstrutor(
        simboloAnterior: SimboloInterface<string>,
        metodos: any[]
    ): Promise<void> {
        const ehConstrutor = simboloAnterior.tipo === tiposDeSimbolos.CONSTRUTOR;
        const metodoResolvido = await this.funcao('método', ehConstrutor);
        metodos.push(metodoResolvido);
    }

    protected async resolverMembroDeClasse(
        metodos: any[],
        propriedadesDeClasse: PropriedadeClasse[]
    ): Promise<void> {
        const simboloAnterior = this.simbolos[this.atual - 1];

        if (simboloAnterior.tipo === tiposDeSimbolos.ARROBA) {
            await this.resolverDecoradorDeAcesso(metodos);
        } else if (simboloAnterior.tipo === tiposDeSimbolos.IDENTIFICADOR) {
            await this.resolverPropriedadeDeClasse(
                simboloAnterior,
                propriedadesDeClasse
            );
        } else {
            await this.resolverMetodoOuConstrutor(simboloAnterior, metodos);
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

            superClasse = new Variavel(
                this.hashArquivo,
                this.simboloAnterior()
            );

            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após declaração."
            );
        }

        this.consumir(
            tiposDeSimbolos.DOIS_PONTOS,
            "Esperado ':' antes do escopo da classe."
        );

        const possivelDocumentacao = this.declaracaoTextoDeDocumentacao();
        const metodos = [];
        const propriedadesDeClasse: PropriedadeClasse[] = [];
        const indentacaoLinha = this
            .localizacoes[this.simboloAtual().linha]
            .espacosIndentacao;

        while (
            !this.estaNoFinal() &&
            this.localizacoes[this.simboloAtual().linha].espacosIndentacao === indentacaoLinha &&
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.ARROBA,
                tiposDeSimbolos.CONSTRUTOR,
                tiposDeSimbolos.FUNCAO,
                tiposDeSimbolos.FUNÇÃO,
                tiposDeSimbolos.IDENTIFICADOR
            )
        ) {
            await this.resolverMembroDeClasse(metodos, propriedadesDeClasse);
        }

        this.superclasseAtual = undefined;

        const definicaoClasse = new Classe(
            simbolo,
            superClasse ? [superClasse] : [],
            metodos,
            propriedadesDeClasse
        );

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
    async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]> {
        try {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.ARROBA)) {
                await this.resolverDecoradores();
            }

            if (
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)
            ) {
                this.avancarEDevolverAnterior();

                if (
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.DE) &&
                    this.simboloNaPosicao(1)?.lexema === 'decorador'
                ) {
                    this.avancarEDevolverAnterior();
                    this.avancarEDevolverAnterior();
                }

                return await this.funcao('da função');
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE))
                return await this.declaracaoDeClasse();

            return await this.resolverDeclaracao();
        } catch (erro: any) {
            this.sincronizar();
            return null;
        }
    }

    async resolverDeclaracao(): Promise<Declaracao | Declaracao[]> {
        // Detecção de declaração implícita ou múltipla atribuição (pode começar com * ou identificador)
        const simboloAtual = this.simbolos[this.atual];

        // Bloqueio explícito do uso de "var"
        if (this.temPadraoVarComoPalavraChave()) {
            throw this.erro(
                simboloAtual,
                'Palavra "var" não pode ser usada como palavra-chave para declaração. Use declarações implícitas: "x = 10" em vez de "var x = 10".'
            );
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
                if (!this.variavelJaDeclarada(simboloAtual.lexema))
                    return this.declaracaoImplicitaVariaveis();
            }

            if (proximoSimbolo && proximoSimbolo.tipo === tiposDeSimbolos.DOIS_PONTOS) {
                return this.declaracaoImplicitaVariaveis();
            }
        }

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.COMENTARIO:
                return this.declaracaoComentario();
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.NADA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.DOIS_PONTOS:
                this.avancarEDevolverAnterior();
                const simboloInicioBloco: SimboloInterface = this.simboloAnterior();
                return new Bloco(
                    simboloInicioBloco.hashArquivo,
                    Number(simboloInicioBloco.linha),
                    await this.blocoEscopo()
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
                return await this.declaracaoRetorna();
            case tiposDeSimbolos.TENTE:
                this.avancarEDevolverAnterior();
                return this.declaracaoTente();
            case tiposDeSimbolos.TEXTO_MULTILINHAS:
                return this.declaracaoTextoDeDocumentacao();
            case tiposDeSimbolos.IMPORTAR: {
                const proximo = this.simbolos[this.atual + 1];
                if (proximo && proximo.tipo === tiposDeSimbolos.PARENTESE_ESQUERDO) {
                    break;
                }
                this.avancarEDevolverAnterior();
                return this.declaracaoImportar();
            }
            case tiposDeSimbolos.DE: {
                const proximo = this.simbolos[this.atual + 1];
                const aposProximo = this.simbolos[this.atual + 2];
                if (
                    proximo &&
                    proximo.tipo === tiposDeSimbolos.IDENTIFICADOR &&
                    aposProximo &&
                    aposProximo.tipo === tiposDeSimbolos.IMPORTAR
                ) {
                    this.avancarEDevolverAnterior();
                    return this.declaracaoImportarDe();
                }
                break;
            }
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
            'aleatorio_entre',
            new InformacaoElementoSintatico('aleatorio_entre', 'número', true, [
                new InformacaoElementoSintatico('minimo', 'número'),
                new InformacaoElementoSintatico('maximo', 'número'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'algum',
            new InformacaoElementoSintatico('algum', 'lógico', true, [
                new InformacaoElementoSintatico('iterável', 'qualquer'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'combinar',
            new InformacaoElementoSintatico('combinar', 'qualquer', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'contar',
            new InformacaoElementoSintatico('contar', 'qualquer', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('elemento', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrar',
            new InformacaoElementoSintatico('encontrar', 'qualquer', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrar_indice',
            new InformacaoElementoSintatico(
                'encontrar_indice',
                'inteiro',
                true,
                [
                    new InformacaoElementoSintatico('iteravel', 'qualquer'),
                    new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
                ]
            )
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrar_ultimo',
            new InformacaoElementoSintatico(
                'encontrar_ultimo',
                'inteiro',
                true,
                [
                    new InformacaoElementoSintatico('iteravel', 'qualquer'),
                    new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
                ]
            )
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrar_ultimo_indice',
            new InformacaoElementoSintatico(
                'encontrar_ultimo_indice',
                'inteiro',
                true,
                [
                    new InformacaoElementoSintatico('iteravel', 'qualquer'),
                    new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
                ]
            )
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'enumerar',
            new InformacaoElementoSintatico('intervalo', 'dicionario', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('inicio', 'numero', false),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'filtrar_por',
            new InformacaoElementoSintatico('filtrar_por', 'qualquer[]', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('funcaoFiltragem', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'incluido',
            new InformacaoElementoSintatico('incluido', 'lógico', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer]'),
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
                new InformacaoElementoSintatico('valorInicial', 'qualquer'),
                new InformacaoElementoSintatico(
                    'valorFinal',
                    'qualquer',
                    false
                ),
                new InformacaoElementoSintatico(
                    'valorPasso',
                    'qualquer',
                    false
                ),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'inverter',
            new InformacaoElementoSintatico('inverter', 'qualquer', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'longo',
            new InformacaoElementoSintatico('longo', 'longo', true, [
                new InformacaoElementoSintatico('valor', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'mapear',
            new InformacaoElementoSintatico('mapear', 'qualquer[]', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('funcaoMapeamento', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'maximo',
            new InformacaoElementoSintatico('maximo', 'número', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'minimo',
            new InformacaoElementoSintatico('minimo', 'número', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'ordenar',
            new InformacaoElementoSintatico('ordenar', 'qualquer[]', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('funcaoOrdenacao', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'para_cada',
            new InformacaoElementoSintatico('para_cada', 'qualquer[]', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('funcaoFiltragem', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'real',
            new InformacaoElementoSintatico('real', 'número', true, [
                new InformacaoElementoSintatico(
                    'valorParaConverter',
                    'qualquer'
                ),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'reduzir',
            new InformacaoElementoSintatico('reduzir', 'qualquer', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('funcaoReducao', 'função'),
                new InformacaoElementoSintatico('valorInicial', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'somar',
            new InformacaoElementoSintatico('somar', 'número', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
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
                new InformacaoElementoSintatico(
                    'valorParaConverter',
                    'qualquer'
                ),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'tipo',
            new InformacaoElementoSintatico('tipo', 'qualquer', true, [
                new InformacaoElementoSintatico('elemento', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'todos',
            new InformacaoElementoSintatico('todos', 'lógico', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('funcaoCondicional', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'tupla',
            new InformacaoElementoSintatico('tupla', 'tupla', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'unico',
            new InformacaoElementoSintatico('unico', 'qualquer[]', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'vetor',
            new InformacaoElementoSintatico('vetor', 'vetor', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
            ])
        );
    }

    async analisar(
        retornoLexador: RetornoLexadorInterface<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintaticoInterface<Declaracao>> {
        const inicioAnalise: [number, number] = hrtime();
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.escopos = [];
        this.pilhaDecoradores = [];
        this.inicializarPilhaEscopos();
        this.tiposDefinidosEmCodigo = {};

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.localizacoes = retornoLexador?.pragmas || {};

        this.verificarPontosEVirgulasInvalidos();

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            const retornoDeclaracao = await this.resolverDeclaracaoForaDeBloco();

            if (retornoDeclaracao === null) {
                continue;
            }

            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }

            if (
                !this.estaNoFinal() &&
                this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)
            ) {
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
        } as RetornoAvaliadorSintaticoInterface<Declaracao>;
    }
}


