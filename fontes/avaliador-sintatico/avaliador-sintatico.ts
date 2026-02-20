import hrtime from 'browser-process-hrtime';

import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    AjudaComoConstruto,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    ComentarioComoConstruto,
    ComponenteLinguagem,
    Construto,
    Decorador,
    DefinirValor,
    Dicionario,
    Elvis,
    EnquantoComoConstruto,
    ExpressaoRegular,
    FazerComoConstruto,
    FuncaoConstruto,
    ImportarComoConstruto,
    Isto,
    Leia,
    ListaCompreensao,
    Literal,
    Logico,
    ParaCadaComoConstruto,
    ParaComoConstruto,
    ReferenciaFuncao,
    Separador,
    SeTernario,
    Super,
    TipoDe,
    Tupla,
    TuplaN,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import { AvaliadorSintaticoInterface, ParametroInterface, SimboloInterface } from '../interfaces';

import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';

import {
    Deceto,
    Dupla,
    Noneto,
    Octeto,
    Quarteto,
    Quinteto,
    SeletorTuplas,
    Septeto,
    Sexteto,
    Trio,
} from '../construtos/tuplas';
import {
    Ajuda,
    Bloco,
    Classe,
    Comentario,
    Const,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Para,
    ParaCada,
    PropriedadeClasse,
    Retorna,
    Se,
    Sustar,
    TendoComo,
    Tente,
    Var,
} from '../declaracoes';
import { RetornoAvaliadorSintatico } from '../interfaces/retornos/retorno-avaliador-sintatico';
import { RetornoLexador } from '../interfaces/retornos/retorno-lexador';
import { AvaliadorSintaticoBase } from './avaliador-sintatico-base';
import { inferirTipoVariavel, TipoInferencia } from '../inferenciador';
import { PilhaEscopos } from './pilha-escopos';
import { InformacaoEscopo } from './informacao-escopo';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';
import { buscarRetornos, registrarPrimitiva } from './comum';
import { MontaoTipos } from './montao-tipos';
import { ElementoMontaoTipos } from './elemento-montao-tipos';
import { ClasseDeModulo } from '../interpretador/estruturas';

import tipoDeDadosDelegua from '../tipos-de-dados/delegua';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

import primitivasDicionario from '../bibliotecas/primitivas-dicionario';
import primitivasNumero from '../bibliotecas/primitivas-numero';
import primitivasTexto from '../bibliotecas/primitivas-texto';
import primitivasVetor from '../bibliotecas/primitivas-vetor';

// Será usado para forçar tipagem em construtos e em algumas funções internas.
type TipoDeSimboloDelegua = (typeof tiposDeSimbolos)[keyof typeof tiposDeSimbolos];

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 *
 * Construtos não existem por si só: cada construto precisa estar dentro de uma declaração para ser
 * aceito pela próxima etapa, como tradução, interpretação, análise semântica, etc.
 *
 * Este é o avaliador sintático de Delégua que, assim como todos os demais dialetos baseados
 * neste núcleo, são uma derivação do avaliador sintático base. Aqui estão implementadas várias mecânicas
 * a mais relacionadas a tipagem e registros de bibliotecas externas:
 *
 * - `tiposDeFerramentasExternas` é utilizada em [Liquido](https://github.com/DesignLiquido/liquido)
 * para registro de tipos exclusivos de Liquido, como classes de requisição e resposta;
 * - `primitivasConhecidas` é utilizada aqui para registro de métodos relacionados a tipos, e também
 * para as bibliotecas externas de Delégua registrarem suas respectivas resoluções de tipos;
 * - `montaoTipos` é uma implementação de montão muito semelhante ao montão do interpretador, para
 * tipos complexos com N níveis de profundidade, como dicionários e objetos.
 */
export class AvaliadorSintatico
    extends AvaliadorSintaticoBase
    implements AvaliadorSintaticoInterface<SimboloInterface, Declaracao> {
    pilhaDecoradores: Decorador[];
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    tiposDefinidosEmCodigo: { [nomeTipo: string]: Declaracao };
    tiposDefinidosPorBibliotecas: {
        [nomeTipo: string]: ClasseDeModulo;
    };
    pilhaEscopos: PilhaEscopos;
    tiposDeFerramentasExternas: { [nomeFerramenta: string]: { [nomeTipo: string]: string } };
    primitivasConhecidas: {
        [nomeModuloOuClasse: string]: { [nomePrimitiva: string]: InformacaoElementoSintatico };
    };
    montaoTipos: MontaoTipos;

    hashArquivo: number;
    atual: number;
    blocos: number;
    performance: boolean;
    superclasseAtual: string | undefined;
    intuirTipoQualquerParaIdentificadores: boolean;
    emAjuda: boolean;

    constructor(performance = false) {
        super();
        this.hashArquivo = 0;
        this.atual = 0;
        this.blocos = 0;
        this.erros = [];
        this.performance = performance;
        this.tiposDefinidosEmCodigo = {};
        this.tiposDeFerramentasExternas = {};
        this.primitivasConhecidas = {};
        this.pilhaEscopos = new PilhaEscopos();
        this.montaoTipos = new MontaoTipos();
        this.intuirTipoQualquerParaIdentificadores = false;
        this.emAjuda = false;

        registrarPrimitiva(this.primitivasConhecidas, 'dicionário', primitivasDicionario);
        registrarPrimitiva(this.primitivasConhecidas, 'número', primitivasNumero);
        registrarPrimitiva(this.primitivasConhecidas, 'texto', primitivasTexto);
        registrarPrimitiva(this.primitivasConhecidas, 'vetor', primitivasVetor);
    }

    protected verificarDefinicaoTipoAtual(): string {
        const tipos = [...Object.values(tipoDeDadosDelegua)];

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

    protected async construtoAjuda(): Promise<AjudaComoConstruto> {
        const simboloAjuda = this.avancarEDevolverAnterior();

        if (this.estaNoFinal() || this.simbolos[this.atual].tipo !== tiposDeSimbolos.PARENTESE_ESQUERDO) {
            return new AjudaComoConstruto(simboloAjuda.hashArquivo, simboloAjuda.linha, undefined, false);
        }

        this.avancarEDevolverAnterior(); // parêntese esquerdo

        if (this.simbolos[this.atual].tipo === tiposDeSimbolos.PARENTESE_DIREITO) {
            this.avancarEDevolverAnterior();
            return new AjudaComoConstruto(simboloAjuda.hashArquivo, simboloAjuda.linha, undefined, true);
        }

        this.emAjuda = true;
        const expressaoAjuda = await this.expressao();
        this.emAjuda = false;

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            `Esperado parêntese direito após expressão usada como argumento em ajuda(). Atual: ${this.simbolos[this.atual].lexema}.`
        );

        return new AjudaComoConstruto(simboloAjuda.hashArquivo, simboloAjuda.linha, expressaoAjuda);
    }

    protected async obterChaveDicionario(): Promise<Construto> {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
            case tiposDeSimbolos.FALSO:
            case tiposDeSimbolos.VERDADEIRO:
                return await this.primario();
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                let tipoOperando: string;
                if (simboloIdentificador.lexema in this.tiposDefinidosEmCodigo) {
                    tipoOperando = simboloIdentificador.lexema;
                } else {
                    tipoOperando = this.pilhaEscopos.obterTipoVariavelPorNome(
                        simboloIdentificador.lexema
                    );
                }

                if (!['numero', 'número', 'texto', 'lógico'].includes(tipoOperando)) {
                    throw this.erro(
                        simboloIdentificador,
                        `Tipo ${tipoOperando} de identificador ${simboloIdentificador.lexema} não é válido como chave de dicionário.`
                    );
                }

                return new Variavel(this.hashArquivo, simboloIdentificador, tipoOperando);
            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                    return await this.construtoTupla();
                }

                throw this.erro(
                    this.simbolos[this.atual],
                    `Esperado parêntese esquerdo após colchete esquerdo para definição de chave de dicionário. Atual: ${this.simbolos[this.atual].tipo}.`
                );
            default:
                throw this.erro(
                    this.simbolos[this.atual],
                    `Símbolo ${this.simbolos[this.atual].tipo} inesperado ou inválido como chave de dicionário.`
                );
        }
    }

    protected async construtoDicionario(simboloChaveEsquerda: SimboloInterface): Promise<Dicionario> {
        this.avancarEDevolverAnterior();
        const chaves = [];
        const valores = [];

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
            return new Dicionario(this.hashArquivo, Number(simboloChaveEsquerda.linha), [], []);
        }

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
            const chave = await this.obterChaveDicionario();
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' entre chave e valor.");
            const valor = await this.atribuir();

            chaves.push(chave);
            valores.push(valor);

            if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                this.consumir(
                    tiposDeSimbolos.VIRGULA,
                    'Esperado vírgula antes da próxima expressão.'
                );
            }
        }

        return new Dicionario(
            this.hashArquivo,
            Number(simboloChaveEsquerda.linha),
            chaves,
            valores
        );
    }

    /**
     * `delegua-node` e a extensão para VSCode precisam que este método seja assíncrono.
     * @returns
     */
    protected async construtoImportar(): Promise<ImportarComoConstruto> {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");
        const caminho = await this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return Promise.resolve(new ImportarComoConstruto(caminho as Literal));
    }

    protected async construtoTupla(): Promise<Tupla> {
        const expressao = await this.expressao();
        const argumentos = [expressao];
        while (this.simbolos[this.atual].tipo === tiposDeSimbolos.VIRGULA) {
            this.avancarEDevolverAnterior();
            argumentos.push(await this.expressao());
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
        this.consumir(tiposDeSimbolos.COLCHETE_DIREITO, "Esperado ']' após a expressão.");
        return new SeletorTuplas(...argumentos) as Tupla;
    }

    protected async enquantoComoConstruto(): Promise<EnquantoComoConstruto> {
        const { condicao, corpo } = await this.logicaComumEnquanto();

        return new EnquantoComoConstruto(condicao, corpo);
    }

    protected async fazerComoConstruto(simboloFazer: SimboloInterface): Promise<Construto> {
        try {
            this.blocos += 1;

            const { caminhoFazer, condicaoEnquanto } = await this.logicaComumFazer();
            return new FazerComoConstruto(
                simboloFazer.hashArquivo,
                Number(simboloFazer.linha),
                caminhoFazer,
                condicaoEnquanto
            );
        } finally {
            this.blocos -= 1;
        }
    }

    protected async paraCadaComoConstrutoVetor(simboloPara: SimboloInterface) {
        const { variavelIteracao, vetor, corpo } = await this.logicaComumParaCadaVetor(simboloPara);

        return new ParaCadaComoConstruto(
            this.hashArquivo,
            Number(simboloPara.linha),
            variavelIteracao,
            vetor,
            corpo
        );
    }

    protected async paraCadaComoConstrutoDicionario(simboloPara: SimboloInterface) {
        const { nomeVariavelChave, nomeVariavelValor, dicionario, corpo } =
            await this.logicaParaCadaDicionario(simboloPara);

        return new ParaCadaComoConstruto(
            this.hashArquivo,
            Number(simboloPara.linha),
            new Dupla(
                new Literal(this.hashArquivo, Number(simboloPara.linha), nomeVariavelChave.lexema),
                new Literal(this.hashArquivo, Number(simboloPara.linha), nomeVariavelValor.lexema)
            ),
            dicionario,
            corpo
        );
    }

    protected async paraCadaComoConstruto(simboloPara: SimboloInterface): Promise<ParaCadaComoConstruto> {
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR)) {
            return await this.paraCadaComoConstrutoVetor(simboloPara);
        }

        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            return await this.paraCadaComoConstrutoDicionario(simboloPara);
        }

        throw this.erro(
            simboloPara,
            'Identificador de iteração deve ser ou um par chave-valor, ou um nome de variável.'
        );
    }

    protected async paraTradicionalComoConstruto(simboloPara: SimboloInterface) {
        const { inicializador, condicao, incrementar, corpo } = await this.logicaComumPara();

        return new ParaComoConstruto(
            simboloPara.hashArquivo,
            simboloPara.linha,
            inicializador,
            condicao,
            incrementar,
            corpo
        );
    }

    /**
     * Método que resolve `para` ou `para cada` como construto.
     */
    protected async paraComoConstruto(
        simboloPara: SimboloInterface
    ): Promise<ParaCadaComoConstruto | ParaComoConstruto> {
        try {
            this.blocos += 1;

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CADA)) {
                return await this.paraCadaComoConstruto(simboloPara);
            }

            return await this.paraTradicionalComoConstruto(simboloPara);
        } finally {
            this.blocos -= 1;
        }
    }

    /**
     * Resolve uma lista de compreensão.
     * @returns {ListaCompreensao} A lista de compreensão resolvida.
     */
    protected async resolverCompreensaoDeLista(retornoExpressao: Construto): Promise<ListaCompreensao> {
        this.consumir(tiposDeSimbolos.PARA, "Esperado instrução 'para' após identificador.");
        this.consumir(tiposDeSimbolos.CADA, "Esperado instrução 'cada' após 'para'.");

        const simboloVariavelIteracao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável após 'para cada'."
        );

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução em lista de compreensão."
            );
        }

        const localizacaoVetor = this.simboloAnterior();
        const vetor = await this.ou();

        let condicao: Construto | Declaracao | null = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) {
            condicao = await this.expressao();
        } else {
            condicao = new Literal(this.hashArquivo, Number(localizacaoVetor.linha), true);
        }

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

    override async primario(): Promise<Construto> {
        const simboloAtual = this.simbolos[this.atual];
        let valores = [];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.AJUDA:
                return await this.construtoAjuda();

            case tiposDeSimbolos.CHAVE_ESQUERDA:
                return await this.construtoDicionario(simboloAtual);

            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                valores = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    return new Vetor(
                        this.hashArquivo,
                        Number(simboloAtual.linha),
                        [],
                        0,
                        'qualquer[]'
                    );
                }

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                    return this.construtoTupla();
                }

                // Ao resolver a expressão aqui, identificadores dentro da expressão de compreensão
                // de lista serão tratados como 'qualquer', para evitar erros de tipo.
                this.intuirTipoQualquerParaIdentificadores = true;
                const retornoExpressaoOuPrimeiroValor = await this.seTernario();
                this.intuirTipoQualquerParaIdentificadores = false;

                if (this.simbolos[this.atual].tipo === tiposDeSimbolos.PARA) {
                    return await this.resolverCompreensaoDeLista(retornoExpressaoOuPrimeiroValor);
                }

                // Aqui já sabemos que não é uma compreensão de lista.
                valores.push(retornoExpressaoOuPrimeiroValor);

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    switch (this.simbolos[this.atual].tipo) {
                        case tiposDeSimbolos.VIRGULA:
                            const simboloVirgula = this.avancarEDevolverAnterior();
                            valores.push(new Separador(simboloVirgula));
                            break;
                        case tiposDeSimbolos.COMENTARIO:
                            const simboloComentario = this.avancarEDevolverAnterior();
                            valores.push(new ComentarioComoConstruto(simboloComentario));
                            break;
                        default:
                            const valor = await this.seTernario();
                            valores.push(valor);
                            break;
                    }
                }

                // Remover comentários, verificar se vírgulas fazem sentido.
                const valoresSemComentarios: Construto[] = valores.filter(
                    (v) => v.constructor !== ComentarioComoConstruto
                );
                let elementoSeparador = false; // O primeiro elemento não pode ser separador.
                for (const elemento of valoresSemComentarios) {
                    if (elementoSeparador) {
                        if (elemento.constructor !== Separador) {
                            throw this.erro(
                                (elemento as any).simbolo,
                                'Não podem haver duas vírgulas seguidas em uma definição de vetor, ou definição de vetor começando em vírgula.'
                            );
                        }
                        elementoSeparador = false;
                    } else {
                        if (elemento.constructor === Separador) {
                            throw this.erro(
                                (elemento as any).simbolo,
                                'Não podem haver duas vírgulas seguidas em uma definição de vetor, ou definição de vetor começando em vírgula.'
                            );
                        }
                        elementoSeparador = true;
                    }
                }

                const valoresSemSeparadores = valoresSemComentarios.filter(
                    (v) => v.constructor !== Separador
                );
                const tipoVetor = inferirTipoVariavel(valoresSemSeparadores);
                return new Vetor(
                    this.hashArquivo,
                    Number(simboloAtual.linha),
                    valores,
                    valores.length,
                    tipoVetor
                );

            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return await this.enquantoComoConstruto();
            case tiposDeSimbolos.EXPRESSAO_REGULAR:
                let valor: string = '';
                let linhaAtual = this.simbolos[this.atual].linha;
                let eParExpressaoRegular =
                    this.simbolos.filter(
                        (l) =>
                            l.linha === linhaAtual && l.tipo === tiposDeSimbolos.EXPRESSAO_REGULAR
                    ).length %
                    2 ===
                    0;
                if (eParExpressaoRegular) {
                    this.avancarEDevolverAnterior();
                    while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.EXPRESSAO_REGULAR)) {
                        valor += this.simbolos[this.atual].lexema || '';
                        this.avancarEDevolverAnterior();
                    }
                    this.avancarEDevolverAnterior();
                    return new ExpressaoRegular(this.hashArquivo, simboloAtual, valor);
                }

            case tiposDeSimbolos.FALSO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), false, 'lógico');

            case tiposDeSimbolos.FAZER:
                const simboloFazer = this.avancarEDevolverAnterior();
                return await this.fazerComoConstruto(simboloFazer);
            case tiposDeSimbolos.FUNCAO:
            case tiposDeSimbolos.FUNÇÃO:
                const simboloFuncao = this.avancarEDevolverAnterior();
                const corpoDaFuncao = await this.corpoDaFuncao(simboloFuncao.lexema);
                this.pilhaEscopos.definirInformacoesVariavel(
                    simboloFuncao.lexema,
                    new InformacaoElementoSintatico(simboloFuncao.lexema, 'função')
                );
                return corpoDaFuncao;

            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                let tipoOperando: string;

                if (this.intuirTipoQualquerParaIdentificadores) {
                    // Esta indicação é utilizada para compreensões de lista, onde o
                    // tipo do identificador de iteração é 'qualquer' por definição.
                    tipoOperando = 'qualquer';
                    this.pilhaEscopos.definirInformacoesVariavel(
                        simboloIdentificador.lexema,
                        new InformacaoElementoSintatico(simboloIdentificador.lexema, 'qualquer') // TODO: Talvez um dia inferir o tipo aqui.
                    );
                } else if (simboloIdentificador.lexema in this.tiposDefinidosEmCodigo) {
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

                // Se o próximo símbolo é um incremento ou um decremento,
                // aqui deve retornar um unário correspondente.
                // Caso contrário, apenas retornar um construto de variável.
                if (
                    this.simbolos[this.atual] &&
                    [tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR].includes(
                        this.simbolos[this.atual].tipo
                    )
                ) {
                    const simboloIncrementoDecremento: SimboloInterface =
                        this.avancarEDevolverAnterior();
                    return new Unario(
                        this.hashArquivo,
                        simboloIncrementoDecremento,
                        new Variavel(
                            this.hashArquivo,
                            simboloIdentificador,
                            tipoOperando || 'qualquer'
                        ),
                        'DEPOIS'
                    );
                }

                return new Variavel(
                    this.hashArquivo,
                    simboloIdentificador,
                    tipoOperando || 'qualquer'
                );

            case tiposDeSimbolos.IMPORTAR:
                this.avancarEDevolverAnterior();
                return await this.construtoImportar();

            case tiposDeSimbolos.ISTO:
                this.avancarEDevolverAnterior();
                return new Isto(this.hashArquivo, Number(simboloAtual.linha), simboloAtual);

            case tiposDeSimbolos.LEIA:
                return await this.expressaoLeia();

            case tiposDeSimbolos.NULO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), null, 'nulo');

            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.NÚMERO:
            case tiposDeSimbolos.TEXTO:
                const simboloNumeroTexto: SimboloInterface = this.avancarEDevolverAnterior();
                const tipoInferido = inferirTipoVariavel(simboloNumeroTexto.literal);
                return new Literal(
                    this.hashArquivo,
                    Number(simboloNumeroTexto.linha),
                    simboloNumeroTexto.literal,
                    tipoInferido as TipoInferencia
                );

            case tiposDeSimbolos.PARA:
                const simboloPara = this.avancarEDevolverAnterior();
                return await this.paraComoConstruto(simboloPara);
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_DIREITO)) {
                    return new TuplaN(this.hashArquivo, Number(simboloAtual.linha), []);
                }
                const expressao = await this.tupla();
                if (expressao instanceof TuplaN) {
                    this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após itens da tupla.");
                    return expressao;
                }
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);

            case tiposDeSimbolos.SUPER:
                const simboloSuper = this.avancarEDevolverAnterior();
                if (!this.superclasseAtual) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        "'Super' usado fora de declaração de classe com herança."
                    );
                }

                return new Super(this.hashArquivo, simboloSuper, this.superclasseAtual);

            case tiposDeSimbolos.VERDADEIRO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), true, 'lógico');

            case tiposDeSimbolos.TIPO:
                this.avancarEDevolverAnterior();
                this.consumir(tiposDeSimbolos.DE, "Esperado 'de' após 'tipo'.");
                let construto: Construto;
                if (
                    this.verificarSeSimboloAtualEIgualA(
                        tiposDeSimbolos.ESCREVA,
                        tiposDeSimbolos.LEIA,
                        tiposDeSimbolos.FUNCAO,
                        tiposDeSimbolos.FUNÇÃO,
                        tiposDeSimbolos.SE,
                        tiposDeSimbolos.ENQUANTO,
                        tiposDeSimbolos.PARA,
                        tiposDeSimbolos.RETORNA,
                        tipoDeDadosDelegua.INTEIRO,
                        tipoDeDadosDelegua.TEXTO,
                        tipoDeDadosDelegua.VETOR,
                        tipoDeDadosDelegua.LOGICO,
                        tipoDeDadosDelegua.LÓGICO,
                        tipoDeDadosDelegua.VAZIO
                    )
                ) {
                    construto = new ComponenteLinguagem(this.hashArquivo, this.simboloAnterior());
                } else {
                    construto = await this.expressao();
                }

                if (construto.constructor === AcessoMetodoOuPropriedade) {
                    const construtoTipado = construto as AcessoMetodoOuPropriedade;
                    switch (construtoTipado.tipo) {
                        case tipoDeDadosDelegua.DICIONARIO:
                        case tipoDeDadosDelegua.DICIONÁRIO:
                            if (!(construtoTipado.simbolo.lexema in primitivasDicionario)) {
                                throw this.erro(
                                    construtoTipado.simbolo,
                                    `${construtoTipado.simbolo.lexema} não é uma primitiva de dicionário.`
                                );
                            }

                            const primitivaDicionarioSelecionada =
                                primitivasDicionario[construtoTipado.simbolo.lexema];
                            construto = new AcessoMetodo(
                                construtoTipado.hashArquivo,
                                construtoTipado.objeto,
                                construtoTipado.simbolo.lexema,
                                primitivaDicionarioSelecionada.tipoRetorno
                            );
                            break;
                        case tipoDeDadosDelegua.INTEIRO:
                        case tipoDeDadosDelegua.NUMERO:
                        case tipoDeDadosDelegua.NÚMERO:
                            if (!(construtoTipado.simbolo.lexema in primitivasNumero)) {
                                throw this.erro(
                                    construtoTipado.simbolo,
                                    `${construtoTipado.simbolo.lexema} não é uma primitiva de número.`
                                );
                            }

                            const primitivaNumeroSelecionada =
                                primitivasNumero[construtoTipado.simbolo.lexema];
                            construto = new AcessoMetodo(
                                construtoTipado.hashArquivo,
                                construtoTipado.objeto,
                                construtoTipado.simbolo.lexema,
                                primitivaNumeroSelecionada.tipoRetorno
                            );
                            break;
                        case tipoDeDadosDelegua.TEXTO:
                            if (!(construtoTipado.simbolo.lexema in primitivasTexto)) {
                                throw this.erro(
                                    construtoTipado.simbolo,
                                    `${construtoTipado.simbolo.lexema} não é uma primitiva de texto.`
                                );
                            }

                            const primitivaTextoSelecionada =
                                primitivasTexto[construtoTipado.simbolo.lexema];
                            construto = new AcessoMetodo(
                                construtoTipado.hashArquivo,
                                construtoTipado.objeto,
                                construtoTipado.simbolo.lexema,
                                primitivaTextoSelecionada.tipoRetorno
                            );
                            break;
                        case tipoDeDadosDelegua.VETOR:
                        case tipoDeDadosDelegua.VETOR_NUMERO:
                        case tipoDeDadosDelegua.VETOR_NÚMERO:
                        case tipoDeDadosDelegua.VETOR_TEXTO:
                            if (!(construtoTipado.simbolo.lexema in primitivasVetor)) {
                                throw this.erro(
                                    construtoTipado.simbolo,
                                    `${construtoTipado.simbolo.lexema} não é uma primitiva de vetor.`
                                );
                            }

                            const primitivaVetorSelecionada =
                                primitivasVetor[construtoTipado.simbolo.lexema];
                            construto = new AcessoMetodo(
                                construtoTipado.hashArquivo,
                                construtoTipado.objeto,
                                construtoTipado.simbolo.lexema,
                                primitivaVetorSelecionada.tipoRetorno
                            );
                            break;
                        default:
                            if (construtoTipado.tipo in this.tiposDefinidosEmCodigo) {
                                const tipoCorrespondente = this.tiposDefinidosEmCodigo[
                                    construtoTipado.tipo
                                ] as Classe;

                                const possivelMetodo = tipoCorrespondente.metodos.filter(
                                    (m) => m.simbolo.lexema === construtoTipado.simbolo.lexema
                                );
                                if (possivelMetodo.length > 0) {
                                    construto = new AcessoMetodo(
                                        construtoTipado.hashArquivo,
                                        construtoTipado.objeto,
                                        construtoTipado.simbolo.lexema,
                                        possivelMetodo[0].tipo
                                    );
                                    break;
                                }

                                const possivelPropriedade = tipoCorrespondente.propriedades.filter(
                                    (p) => p.nome.lexema === construtoTipado.simbolo.lexema
                                );
                                if (possivelPropriedade.length > 0) {
                                    construto = new AcessoPropriedade(
                                        construtoTipado.hashArquivo,
                                        construtoTipado.objeto,
                                        construtoTipado.simbolo.lexema,
                                        possivelPropriedade[0].tipo
                                    );
                                    break;
                                }
                            }
                    }
                }

                return new TipoDe(this.hashArquivo, simboloAtual, construto);
        }

        // TODO: O correto seria emitir algum aviso aqui que este avaliador sintático não consegue
        // lidar com tópicos de ajuda neste ponto.
        if (this.emAjuda) {
            console.log(this.simbolos[this.atual]);
        }

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    protected resolverTipoAcessoIndiceVariavel(expressaoAnterior: Construto): string {
        let identificadorAcessado: string = '';
        switch (expressaoAnterior.constructor) {
            case Variavel:
                identificadorAcessado = (expressaoAnterior as Variavel).simbolo.lexema;
                break;
            default:
                return 'qualquer';
        }

        // Primeiro verificar se é acesso a índice de vetor.
        let tipoIdentificadorCorrespondente: string;
        try {
            tipoIdentificadorCorrespondente = this.pilhaEscopos.obterTipoVariavelPorNome(
                (expressaoAnterior as Variavel).simbolo.lexema
            );
        } catch (erro: any) {
            // Referência a identificador ainda não declarado; assumimos 'qualquer' e deixamos
            // o analisador semântico emitir o diagnóstico quando apropriado.
            tipoIdentificadorCorrespondente = 'qualquer';
        }

        if (!tipoIdentificadorCorrespondente.endsWith('[]') && !['dicionário', 'qualquer', 'texto', 'tupla', 'vetor'].includes(tipoIdentificadorCorrespondente)) {
            throw this.erro(
                this.simbolos[this.atual],
                `Tipo ${tipoIdentificadorCorrespondente} não suporta acesso por índice.`
            );
        }

        let tipoAcesso: string = 'qualquer';
        if (tipoIdentificadorCorrespondente.endsWith('[]')) {
            tipoAcesso = tipoIdentificadorCorrespondente.replace('[]', '');
        } else {
            tipoAcesso = 'qualquer';
        }

        return tipoAcesso;
    }

    /**
     * Resolve um construto do tipo `Variavel`, `AcessoMetodoOuPropriedade` ou `AcessoIndiceVariavel` 
     * para um `ElementoMontaoTipos` correspondente, caso exista.
     * @param construto O construto.
     * @returns O `ElementoMontaoTipos` correspondente ou `null` se não existir.
     */
    protected resolverElementoMontao(
        construto: Construto
    ): ElementoMontaoTipos | null {
        switch (construto.constructor) {
            case Variavel:
                try {
                    const nomeVariavel = (construto as Variavel).simbolo.lexema;
                    const elementoMontao = this.pilhaEscopos.obterElementoMontaoTipos(nomeVariavel);
                    if (elementoMontao.endereco) {
                        const referenciaMontaoTipos = this.montaoTipos.obterReferencia(
                            construto.hashArquivo,
                            construto.linha,
                            elementoMontao.endereco
                        );

                        if (referenciaMontaoTipos instanceof ElementoMontaoTipos) {
                            return referenciaMontaoTipos;
                        }

                        return null;
                    }

                    return elementoMontao;
                } catch {
                    return null;
                }
            case AcessoMetodoOuPropriedade: {
                const acesso = construto as AcessoMetodoOuPropriedade;
                const elementoObjeto = this.resolverElementoMontao(acesso.objeto);
                if (!elementoObjeto) {
                    return null;
                }

                return elementoObjeto.subElementos[acesso.simbolo.lexema] || null;
            }
            case AcessoIndiceVariavel: {
                const acessoIndice = construto as AcessoIndiceVariavel;
                const elementoObjeto = this.resolverElementoMontao(
                    acessoIndice.entidadeChamada
                );
                if (!elementoObjeto || !(acessoIndice.indice instanceof Literal)) {
                    return null;
                }

                return elementoObjeto.subElementos[String(acessoIndice.indice.valor)] || null;
            }
            default:
                return null;
        }
    }

    protected async resolverCadeiaChamadas(
        expressaoAnterior: Construto,
        tipoAnterior: string = 'qualquer'
    ) {
        if (!this.simbolos[this.atual]) {
            return expressaoAnterior;
        }

        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const chamada = await this.finalizarChamada(expressaoAnterior, tipoAnterior);
                return await this.resolverCadeiaChamadas(chamada);
            case tiposDeSimbolos.PONTO:
                this.avancarEDevolverAnterior();
                this.verificarSeSimboloAtualEIgualA()
                const nome = this.avancarEDevolverAnterior();

                let tipoInferido = expressaoAnterior.tipo;
                // Se não for um dicionário anônimo (ou seja, ser variável ou constante com nome)
                if (
                    expressaoAnterior.tipo === 'dicionário' &&
                    expressaoAnterior.constructor !== Dicionario
                ) {
                    const elementoMontaoTipos =
                        this.resolverElementoMontao(expressaoAnterior);
                    if (
                        elementoMontaoTipos &&
                        nome.lexema in elementoMontaoTipos.subElementos
                    ) {
                        tipoInferido = elementoMontaoTipos.subElementos[nome.lexema].tipo;
                    }
                }

                const acesso = new AcessoMetodoOuPropriedade(
                    this.hashArquivo,
                    expressaoAnterior,
                    nome,
                    tipoInferido
                );
                return await this.resolverCadeiaChamadas(acesso, tipoInferido);
            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                const tipoAcesso = this.resolverTipoAcessoIndiceVariavel(
                    expressaoAnterior
                );

                this.avancarEDevolverAnterior();
                const indice = await this.expressao();
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );

                const acessoVariavel = new AcessoIndiceVariavel(
                    this.hashArquivo,
                    expressaoAnterior,
                    indice,
                    simboloFechamento,
                    tipoAcesso
                );

                return await this.resolverCadeiaChamadas(acessoVariavel);
            default:
                return expressaoAnterior;
        }
    }

    override async chamar(): Promise<Construto> {
        let expressao = await this.primario();
        return await this.resolverCadeiaChamadas(expressao);
    }

    /**
     * `AcessoMetodoOuPropriedade` é um construto intermediário em Delégua, e deve ser resolvido como outro
     * construto antes de qualquer outra próxima etapa. Algumas validações adicionais também ocorrem aqui.
     * @param {AcessoMetodoOuPropriedade} entidadeChamadaResolvida O construto original.
     * @returns {Construto} O construto resolvido como um tipo mais específico.
     * @see finalizarChamada
     */
    protected resolverEntidadeChamadaAcessoMetodoOuPropriedade(
        entidadeChamadaResolvida: AcessoMetodoOuPropriedade
    ): Construto {
        const construtoTipado: AcessoMetodoOuPropriedade = entidadeChamadaResolvida;
        switch (entidadeChamadaResolvida.tipo) {
            case tipoDeDadosDelegua.DICIONARIO:
            case tipoDeDadosDelegua.DICIONÁRIO:
                if (!(construtoTipado.simbolo.lexema in primitivasDicionario)) {
                    throw this.erro(
                        construtoTipado.simbolo,
                        `${construtoTipado.simbolo.lexema} não é uma primitiva de dicionário.`
                    );
                }

                const primitivaDicionarioSelecionada =
                    primitivasDicionario[construtoTipado.simbolo.lexema];
                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema,
                    primitivaDicionarioSelecionada.tipoRetorno
                );

            case tipoDeDadosDelegua.INTEIRO:
            case tipoDeDadosDelegua.NUMERO:
            case tipoDeDadosDelegua.NÚMERO:
                if (!(construtoTipado.simbolo.lexema in primitivasNumero)) {
                    throw this.erro(
                        construtoTipado.simbolo,
                        `${construtoTipado.simbolo.lexema} não é uma primitiva de número.`
                    );
                }

                const primitivaNumeroSelecionada = primitivasNumero[construtoTipado.simbolo.lexema];
                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema,
                    primitivaNumeroSelecionada.tipoRetorno
                );

            case tipoDeDadosDelegua.MODULO:
            case tipoDeDadosDelegua.MÓDULO:
                // Há dois casos para resolução de módulo:
                // Um quando o módulo é definido no próprio código (por exemplo, em um outro arquivo `.delegua`).
                // Outro quando é importado de uma biblioteca externa.

                // Este é o caso quando o módulo vem de outro arquivo `.delegua`.
                if (construtoTipado.simbolo.lexema in this.tiposDefinidosEmCodigo) {
                    // Construtor de classe.
                    return new Variavel(
                        construtoTipado.hashArquivo,
                        construtoTipado.simbolo,
                        construtoTipado.objeto.tipo
                    );
                }

                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema
                );

            case tipoDeDadosDelegua.TEXTO:
                if (!(construtoTipado.simbolo.lexema in primitivasTexto)) {
                    throw this.erro(
                        construtoTipado.simbolo,
                        `${construtoTipado.simbolo.lexema} não é uma primitiva de texto.`
                    );
                }

                const primitivaTextoSelecionada = primitivasTexto[construtoTipado.simbolo.lexema];
                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema,
                    primitivaTextoSelecionada.tipoRetorno
                );
            case tipoDeDadosDelegua.VETOR:
            case tipoDeDadosDelegua.VETOR_NUMERO:
            case tipoDeDadosDelegua.VETOR_NÚMERO:
            case tipoDeDadosDelegua.VETOR_TEXTO:
                if (!(construtoTipado.simbolo.lexema in primitivasVetor)) {
                    throw this.erro(
                        construtoTipado.simbolo,
                        `${construtoTipado.simbolo.lexema} não é uma primitiva de vetor.`
                    );
                }

                const primitivaVetorSelecionada = primitivasVetor[construtoTipado.simbolo.lexema];
                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema,
                    primitivaVetorSelecionada.tipoRetorno
                );
        }

        return entidadeChamadaResolvida;
    }

    protected validarArgumentosEntidadeChamada(
        argumentosEntidadeChamada: InformacaoElementoSintatico[],
        argumentosUtilizados: Construto[]
    ): string[] {
        if (argumentosEntidadeChamada.length === 0) {
            return [];
        }

        const possiveisErros = [];
        for (const [indice, argumentoEntidadeChamada] of argumentosEntidadeChamada.entries()) {
            const argumentoUtilizado = argumentosUtilizados[indice];

            if (!argumentoUtilizado) {
                if (argumentoEntidadeChamada.obrigatorio) {
                    possiveisErros.push(
                        `Argumento ${argumentoEntidadeChamada.nome} é obrigatório, mas não foi fornecido.`
                    );
                }
                continue;
            }

            if (argumentoUtilizado.tipo === null || argumentoUtilizado.tipo === undefined) {
                continue;
            }

            const argumentoEntidadeChamadaQualquer =
                argumentoEntidadeChamada.tipo.startsWith('qualquer');
            const argumentoUtilizadoQualquer = argumentoUtilizado.tipo.startsWith('qualquer');

            // Este caso é tarefa do analisador semântico apontar.
            if (argumentoEntidadeChamadaQualquer || argumentoUtilizadoQualquer) {
                continue;
            }

            const argumentoEntidadeChamadaVetor = argumentoEntidadeChamada.tipo.endsWith('[]');
            const argumentoUtilizadoVetor = argumentoUtilizado.tipo.endsWith('[]');

            if (argumentoEntidadeChamadaVetor !== argumentoUtilizadoVetor) {
                possiveisErros.push(
                    `Argumento: ${argumentoEntidadeChamada.nome}. Tipo esperado: ${argumentoEntidadeChamada.tipo}; Tipo utilizado: ${argumentoUtilizado.tipo}`
                );
                continue;
            }

            const tipoArgumentoUtilizado =
                argumentoUtilizado.tipo.startsWith('funcao') ||
                    argumentoUtilizado.tipo.startsWith('função') ||
                    argumentoUtilizado instanceof FuncaoConstruto
                    ? 'função'
                    : argumentoUtilizado.tipo;
            const tipoArgumentoEntidadeChamada =
                argumentoEntidadeChamada.tipo.startsWith('funcao') ||
                    argumentoEntidadeChamada.tipo.startsWith('função')
                    ? 'função'
                    : argumentoEntidadeChamada.tipo;

            if (tipoArgumentoUtilizado !== tipoArgumentoEntidadeChamada) {
                possiveisErros.push(
                    `Argumento: ${argumentoEntidadeChamada.nome}. Tipo esperado: ${argumentoEntidadeChamada.tipo}; Tipo utilizado: ${argumentoUtilizado.tipo}`
                );
            }
        }

        return possiveisErros;
    }

    /**
     * Diversas verificações de resolução de entidade chamada, como resolver chamada da pilha ou usar referência, argumentos, etc.
     * @param entidadeChamada O construto da entidade chamada.
     * @param argumentos Os argumentos utilizados na chamada.
     * @param tipoPrimitiva Se for uma primitiva, o tipo dela. Senão, `undefined`.
     * @returns A entidade chamada resolvida, se as validações passarem.
     */
    protected resolverEntidadeChamada(
        entidadeChamada: Construto,
        argumentos: Construto[],
        tipoPrimitiva: string | undefined = undefined
    ): Construto {
        if (entidadeChamada.constructor === AcessoMetodoOuPropriedade) {
            return this.resolverEntidadeChamadaAcessoMetodoOuPropriedade(
                entidadeChamada as AcessoMetodoOuPropriedade
            );
        }

        if (entidadeChamada.constructor === Variavel) {
            const entidadeChamadaResolvidaVariavel = entidadeChamada as Variavel;

            if (tipoPrimitiva === 'qualquer') {
                // Provavelmente uma chamada a alguma função da biblioteca global.
                // Até então, é sempre do tipo `InformacaoElementoSintatico`.
                const informacoesPossivelFuncaoBibliotecaGlobal: InformacaoElementoSintatico =
                    this.pilhaEscopos.obterBibliotecaGlobal(
                        entidadeChamadaResolvidaVariavel.simbolo.lexema
                    ) as InformacaoElementoSintatico;

                if (informacoesPossivelFuncaoBibliotecaGlobal) {
                    const erros = this.validarArgumentosEntidadeChamada(
                        informacoesPossivelFuncaoBibliotecaGlobal.subElementos as InformacaoElementoSintatico[],
                        argumentos
                    );
                    if (erros.length > 0) {
                        throw new ErroAvaliadorSintatico(
                            entidadeChamadaResolvidaVariavel.simbolo,
                            `Erros ao resolver argumentos de chamada a ${entidadeChamadaResolvidaVariavel.simbolo.lexema}: \n${erros.reduce((mensagem, erro) => (mensagem += `${erro}\n`), '')}`
                        );
                    }

                    return entidadeChamadaResolvidaVariavel;
                }
            }

            if (
                tipoPrimitiva !== 'qualquer' &&
                this.primitivasConhecidas[tipoPrimitiva].hasOwnProperty(
                    entidadeChamadaResolvidaVariavel.simbolo.lexema
                )
            ) {
                var informacoesPrimitiva =
                    this.primitivasConhecidas[tipoPrimitiva][
                    entidadeChamadaResolvidaVariavel.simbolo.lexema
                    ];
                const erros = this.validarArgumentosEntidadeChamada(
                    informacoesPrimitiva.subElementos as InformacaoElementoSintatico[],
                    argumentos
                );
                if (erros.length > 0) {
                    throw new ErroAvaliadorSintatico(
                        entidadeChamadaResolvidaVariavel.simbolo,
                        `Erros ao resolver argumentos de chamada a ${entidadeChamadaResolvidaVariavel.simbolo.lexema}: \n${erros.reduce((mensagem, erro) => (mensagem += `${erro}\n`), '')}`
                    );
                }

                return entidadeChamadaResolvidaVariavel;
            }

            if (entidadeChamadaResolvidaVariavel.simbolo.lexema in this.tiposDefinidosEmCodigo) {
                return entidadeChamadaResolvidaVariavel;
            }

            const possivelReferencia = this.pilhaEscopos.obterReferenciaFuncao(
                entidadeChamadaResolvidaVariavel.simbolo.lexema
            );

            if (possivelReferencia !== null) {
                return new ReferenciaFuncao(
                    entidadeChamadaResolvidaVariavel.hashArquivo,
                    entidadeChamadaResolvidaVariavel.linha,
                    entidadeChamadaResolvidaVariavel.simbolo,
                    entidadeChamadaResolvidaVariavel.tipo,
                    possivelReferencia.id
                );
            }

            return new ArgumentoReferenciaFuncao(
                entidadeChamadaResolvidaVariavel.hashArquivo,
                entidadeChamadaResolvidaVariavel.linha,
                entidadeChamadaResolvidaVariavel.simbolo
            );
        }

        return entidadeChamada;
    }

    override async finalizarChamada(
        entidadeChamada: Construto,
        tipoPrimitiva: string | undefined = undefined
    ): Promise<Chamada> {
        const argumentos: Array<Construto> = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                // `apply()` em JavaScript aceita até 255 parâmetros.
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

        // Toda chamada precisa saber de antemão qual o tipo resolvido.
        const entidadeChamadaResolvida = this.resolverEntidadeChamada(
            entidadeChamada,
            argumentos,
            tipoPrimitiva
        );

        const construtoChamada = new Chamada(
            this.hashArquivo,
            entidadeChamadaResolvida,
            argumentos
        );

        // A validação de tipos dos argumentos da entidade chamada existe em
        // avaliadores sintáticos derivados deste, como em `delegua-node`.
        // Pode ser que esta lógica seja trazida para cá no futuro.
        construtoChamada.tipo = 'qualquer';
        return construtoChamada;
    }

    override async unario(): Promise<Construto> {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NAO,
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.BIT_NOT,
                tiposDeSimbolos.INCREMENTAR,
                tiposDeSimbolos.DECREMENTAR
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.unario();
            return new Unario(this.hashArquivo, operador, direito, 'ANTES');
        }

        return await this.chamar();
    }

    /**
     * A exponenciacão é uma exceção na ordem de avaliação (resolve primeiro à direita).
     * Por isso `direito` chama `exponenciacao()`, e não `unario()`.
     * @returns {Binario} A expressão binária na forma do construto `Binario`.
     */
    override async exponenciacao(): Promise<Construto> {
        let expressao = await this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Verifica recursivamente se um construto é ou contém uma operação unária em um vetor.
     * Isso bloqueia padrões de ofuscação como !![] usado em operações aritméticas.
     */
    private verificarOperacaoUnariaEmVetor(construto: Construto): boolean {
        if (construto instanceof Unario) {
            const operando = construto.operando;
            // Verifica se o operando é um vetor
            if (operando instanceof Vetor || operando.tipo === 'vetor' || operando.tipo.endsWith('[]')) {
                return true;
            }
            // Verifica recursivamente para casos como !![]
            if (operando instanceof Unario) {
                return this.verificarOperacaoUnariaEmVetor(operando);
            }
        }
        return false;
    }

    protected verificacaoOperacoesBinariasIlegais(esquerdo: Construto, direito: Construto, operador: SimboloInterface) {
        // Bloquear operações aritméticas com operações unárias em vetores (padrão de ofuscação tipo !![] * 1)
        if (this.verificarOperacaoUnariaEmVetor(esquerdo)) {
            throw this.erro(
                operador,
                `Operação inválida: não é possível realizar operação ${operador.lexema} com expressão unária aplicada a vetor.`
            );
        }

        if (this.verificarOperacaoUnariaEmVetor(direito)) {
            throw this.erro(
                operador,
                `Operação inválida: não é possível realizar operação ${operador.lexema} com expressão unária aplicada a vetor.`
            );
        }

        if (esquerdo.tipo === 'vetor' || esquerdo.tipo.endsWith('[]')) {
            if (['dicionario', 'dicionário', 'nulo'].includes(direito.tipo)) {
                throw this.erro(
                    operador,
                    `Operação inválida: não é possível realizar operação ${operador.lexema} entre vetor e ${direito.tipo}.`
                );
            }
        }

        if (direito.tipo === 'vetor' || direito.tipo.endsWith('[]')) {
            if (['dicionario', 'dicionário', 'nulo'].includes(esquerdo.tipo)) {
                throw this.erro(
                    operador,
                    `Operação inválida: não é possível realizar operação ${operador.lexema} entre vetor e ${esquerdo.tipo}.`
                );
            }
        }

        if (esquerdo.tipo === 'dicionario' || esquerdo.tipo === 'dicionário') {
            if (['vetor', 'nulo'].includes(direito.tipo)) {
                throw this.erro(
                    operador,
                    `Operação inválida: não é possível realizar operação ${operador.lexema} entre dicionário e ${direito.tipo}.`
                );
            }
        }

        if (direito.tipo === 'dicionario' || direito.tipo === 'dicionário') {
            if (['vetor', 'nulo'].includes(esquerdo.tipo)) {
                throw this.erro(
                    operador,
                    `Operação inválida: não é possível realizar operação ${operador.lexema} entre dicionário e ${esquerdo.tipo}.`
                );
            }
        }
    }

    override async multiplicar(): Promise<Construto> {
        let expressao = await this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.DIVISAO_IGUAL,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL,
                tiposDeSimbolos.MODULO,
                tiposDeSimbolos.MODULO_IGUAL,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MULTIPLICACAO_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.exponenciacao();
            this.verificacaoOperacoesBinariasIlegais(expressao, direito, operador);
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    /**
     * Se símbolo de operação é `+`, `-`, `+=` ou `-=`, monta objeto `Binario` para
     * ser avaliado pelo Interpretador.
     * @returns Um Construto, normalmente um `Binario`, ou `Unario` se houver alguma operação unária para ser avaliada.
     */
    override async adicaoOuSubtracao(): Promise<Construto> {
        let expressao = await this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.MENOS_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];

            const direito = await this.multiplicar();
            this.verificacaoOperacoesBinariasIlegais(expressao, direito, operador);

            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)) {
            const operador = this.simbolos[this.atual - 1];

            const direito = await this.ou();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async bitShift(): Promise<Construto> {
        let expressao = await this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.adicaoOuSubtracao();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async bitE(): Promise<Construto> {
        let expressao = await this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.bitShift();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async bitOu(): Promise<Construto> {
        let expressao = await this.bitE();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.CIRCUMFLEXO)
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.bitE();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async comparar(): Promise<Construto> {
        let expressao = await this.bitOu();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.bitOu();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async comparacaoIgualdade(): Promise<Construto> {
        let expressao = await this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.comparar();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async em(): Promise<Construto> {
        let expressao = await this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM, tiposDeSimbolos.CONTEM, tiposDeSimbolos.NAO)) {
            let operador = this.simbolos[this.atual - 1];
            let negado = false;
            if (operador.tipo === tiposDeSimbolos.NAO) {
                operador = this.consumir(tiposDeSimbolos.CONTEM, `Esperado palavra reservada 'contém' ou 'contem' após palavra reservada ${operador.lexema}.`);
                negado = true;
            }

            const direito = await this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
            (expressao as Logico).negado = negado;
        }

        return expressao;
    }

    override async e(): Promise<Construto> {
        let expressao = await this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.em();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected async elvis(): Promise<Construto> {
        let expressao = await this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ELVIS)) {
            const direito = await this.ou();
            return new Elvis(this.hashArquivo, expressao, direito);
        }

        return expressao;
    }

    protected async seTernario(): Promise<Construto> {
        let expressaoOuCondicao = await this.elvis();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.INTERROGACAO)) {
            const operador = this.simbolos[this.atual - 1];
            const expressaoEntao = await this.seTernario();
            this.consumir(
                tiposDeSimbolos.DOIS_PONTOS,
                `Esperado dois-pontos após caminho positivo em se ternário. Atual: ${this.simbolos[this.atual].lexema}.`
            );
            const expressaoSenao = await this.seTernario();
            expressaoOuCondicao = new SeTernario(
                this.hashArquivo,
                expressaoOuCondicao,
                expressaoEntao,
                operador,
                expressaoSenao
            );
        }

        return expressaoOuCondicao;
    }

    /**
     * Método que resolve atribuições.
     * @returns Um construto do tipo `Atribuir`, `Conjunto` ou `AtribuicaoPorIndice`.
     */
    /**
     * Processa tuplas, que são expressões separadas por vírgula entre parênteses.
     * Se não houver vírgula, retorna apenas a expressão simples.
     * Sobrescreve o método da base para usar seTernario() em vez de ou().
     */
    override async tupla(): Promise<Construto> {
        let expressao = await this.seTernario();

        // Se não há vírgula, retorna a expressão simples
        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA)) {
            return expressao;
        }

        // Se há vírgula, então é uma tupla
        const elementos = [expressao];

        do {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                break;
            }
            elementos.push(await this.seTernario());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new TuplaN(this.hashArquivo, expressao.linha, elementos);
    }

    /**
     * Método que resolve atribuições.
     * @returns Um construto do tipo `Atribuir`, `Conjunto` ou `AtribuicaoPorIndice`.
     */
    override async atribuir(): Promise<Construto> {
        const expressao = await this.seTernario();

        if (
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
            if (expressao.esquerda instanceof AcessoIndiceVariavel) {
                const entidade = expressao.esquerda as AcessoIndiceVariavel;
                return new Atribuir(
                    this.hashArquivo,
                    entidade.entidadeChamada,
                    expressao,
                    entidade.indice,
                    expressao.operador
                );
            }

            return new Atribuir(
                this.hashArquivo,
                expressao.esquerda,
                expressao,
                undefined,
                expressao.operador
            );
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL, tiposDeSimbolos.SETA_ESQUERDA)) {
            const igual = this.simbolos[this.atual - 1];
            const valor = await this.seTernario();

            switch (expressao.constructor) {
                case Variavel:
                    return new Atribuir(this.hashArquivo, expressao, valor);
                case AcessoMetodoOuPropriedade:
                    const expressaoAcessoMetodoOuPropriedade =
                        expressao as AcessoMetodoOuPropriedade;
                    return new DefinirValor(
                        this.hashArquivo,
                        igual.linha,
                        expressaoAcessoMetodoOuPropriedade.objeto,
                        expressaoAcessoMetodoOuPropriedade.simbolo,
                        valor
                    );
                case AcessoIndiceVariavel:
                    const expressaoAcessoIndiceVariavel = expressao as AcessoIndiceVariavel;
                    return new AtribuicaoPorIndice(
                        this.hashArquivo,
                        expressaoAcessoIndiceVariavel.linha,
                        expressaoAcessoIndiceVariavel.entidadeChamada,
                        expressaoAcessoIndiceVariavel.indice,
                        valor
                    );
            }

            throw this.erro(igual, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    /**
     * Declaração para comando `leia`, para ler dados de entrada do usuário.
     * @returns Um objeto da classe `Leia`.
     */
    override async expressaoLeia(): Promise<Leia> {
        const simboloLeia = this.avancarEDevolverAnterior();

        if (this.emAjuda && this.simbolos[this.atual].tipo !== tiposDeSimbolos.PARENTESE_ESQUERDO) {
            return new Leia(simboloLeia, []);
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos argumentos em instrução `leia`."
        );

        const argumentos: Construto[] = [];

        if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.PARENTESE_DIREITO) {
            do {
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os argumentos em instrução `leia`."
        );

        return new Leia(simboloLeia, argumentos);
    }

    // TODO: Depreciar.
    override async expressao(): Promise<Construto> {
        return await this.atribuir();
    }

    override async blocoEscopo(): Promise<Array<Declaracao>> {
        this.pilhaEscopos.empilhar(new InformacaoEscopo());
        let declaracoes: Array<Declaracao> = [];

        while (
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) &&
            !this.estaNoFinal()
        ) {
            const retornoDeclaracao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else if (retornoDeclaracao !== null) {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o bloco.");

        this.pilhaEscopos.removerUltimo();
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return declaracoes;
    }

    protected declaracaoComentarioMultilinha(): Comentario {
        let simboloComentario: SimboloInterface;
        const conteudos: string[] = [];
        do {
            simboloComentario = this.avancarEDevolverAnterior();
            conteudos.push(simboloComentario.literal);
        } while (this.verificarTipoSimboloAtual(tiposDeSimbolos.LINHA_COMENTARIO));

        return new Comentario(
            simboloComentario.hashArquivo,
            simboloComentario.linha,
            conteudos,
            true
        );
    }

    protected declaracaoComentarioUmaLinha(): Comentario {
        const simboloComentario = this.avancarEDevolverAnterior();
        return new Comentario(
            simboloComentario.hashArquivo,
            simboloComentario.linha,
            simboloComentario.literal,
            false
        );
    }

    override declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            throw this.erro(
                this.simbolos[this.atual - 1],
                "'continua' precisa estar em um laço de repetição."
            );
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Continua(this.simbolos[this.atual - 1]);
    }

    protected async logicaComumEnquanto() {
        const condicao = await this.expressao();
        const corpo: Bloco = await this.declaracaoBloco();

        return {
            condicao,
            corpo,
        };
    }

    override async declaracaoEnquanto(): Promise<Enquanto> {
        try {
            this.blocos += 1;

            const { condicao, corpo } = await this.logicaComumEnquanto();

            return new Enquanto(condicao, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    protected async declaracaoEscolha(): Promise<Escolha> {
        try {
            this.blocos += 1;

            const condicao = await this.expressao();
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' antes do escopo do 'escolha'."
            );

            const caminhos = [];
            let caminhoPadrao = null;
            while (
                !this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA) &&
                !this.estaNoFinal()
            ) {
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                    const caminhoCondicoes = [await this.expressao()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(await this.expressao());
                        this.consumir(
                            tiposDeSimbolos.DOIS_PONTOS,
                            "Esperado ':' após declaração do 'caso'."
                        );
                    }

                    let declaracoes = [];
                    do {
                        const retornoDeclaracao = await this.resolverDeclaracao();
                        if (Array.isArray(retornoDeclaracao)) {
                            declaracoes = declaracoes.concat(retornoDeclaracao);
                        } else {
                            declaracoes.push(retornoDeclaracao as Declaracao);
                        }
                    } while (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.PADRAO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                    );

                    caminhos.push({
                        condicoes: caminhoCondicoes,
                        declaracoes,
                    });
                } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PADRAO)) {
                    if (caminhoPadrao !== null) {
                        const excecao = new ErroAvaliadorSintatico(
                            this.simbolos[this.atual],
                            "Você só pode ter um 'padrao' em cada declaração de 'escolha'."
                        );
                        this.erros.push(excecao);
                        throw excecao;
                    }

                    this.consumir(
                        tiposDeSimbolos.DOIS_PONTOS,
                        "Esperado ':' após declaração do 'padrao'."
                    );

                    const declaracoes = [];
                    do {
                        declaracoes.push(await this.resolverDeclaracao());
                    } while (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.PADRAO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                    );

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

    override async declaracaoEscreva(): Promise<Escreva> {
        const simboloAtual = this.simbolos[this.atual];

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: Construto[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    protected async declaracaoExpressao(): Promise<Expressao> {
        // Se há decoradores a serem adicionados aqui, obtemo-los agora,
        // para evitar que outros passos recursivos peguem-los antes.
        const decoradores = Array.from(this.pilhaDecoradores);
        this.pilhaDecoradores = [];

        const expressao = await this.expressao();
        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Expressao(expressao, decoradores);
    }

    protected async declaracaoFalhar(): Promise<Falhar> {
        const simboloFalha: SimboloInterface = this.simbolos[this.atual - 1];
        const expressaoFalha = await this.expressao();
        return new Falhar(simboloFalha, expressaoFalha);
    }

    protected async logicaComumFazer() {
        const caminhoFazer: Bloco = await this.declaracaoBloco();
        this.consumir(
            tiposDeSimbolos.ENQUANTO,
            "Esperado declaração do 'enquanto' após o escopo do 'fazer'."
        );
        const condicaoEnquanto = await this.expressao();

        return {
            caminhoFazer,
            condicaoEnquanto,
        };
    }

    protected async declaracaoFazer(simboloFazer: SimboloInterface): Promise<Fazer> {
        try {
            this.blocos += 1;

            const { caminhoFazer, condicaoEnquanto } = await this.logicaComumFazer();
            return new Fazer(
                simboloFazer.hashArquivo,
                Number(simboloFazer.linha),
                caminhoFazer,
                condicaoEnquanto
            );
        } finally {
            this.blocos -= 1;
        }
    }

    /**
     * O símbolo é emitido aqui para fins de formatação, mas este método é
     * sobrescrito em `delegua-node`.
     * @returns {Importar} Uma declaração `Importar`.
     */
    declaracaoImportar(): Promise<Importar> {
        let identificadorDeTudo: SimboloInterface | null = null;
        const elementosImportacao: SimboloInterface[] = [];

        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.TUDO:
                this.avancarEDevolverAnterior();
                this.consumir(
                    tiposDeSimbolos.COMO,
                    "Esperado 'como' após 'tudo' em declaração de importação."
                );
                identificadorDeTudo = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado identificador após 'como' em declaração de importação de 'tudo'."
                );
                break;
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                this.avancarEDevolverAnterior();

                do {
                    const identificadorImportacao = this.consumir(
                        tiposDeSimbolos.IDENTIFICADOR,
                        'Esperado identificador de elemento a ser importado.'
                    );
                    elementosImportacao.push(identificadorImportacao);
                } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

                this.consumir(
                    tiposDeSimbolos.CHAVE_DIREITA,
                    "Esperado '}' após lista de elementos a serem importados."
                );
                break;
            default:
                throw this.erro(
                    this.simbolos[this.atual],
                    "Esperado ou palavra reservada 'tudo' ou abertura de chaves após palavra reservada 'importar'."
                );
        }

        this.consumir(
            tiposDeSimbolos.DE,
            "Esperado 'de' após identificador em declaração de importação de 'tudo'."
        );
        let construtoCaminhoModulo: Construto;
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.TEXTO:
                const simboloCaminhoModulo = this.avancarEDevolverAnterior();
                construtoCaminhoModulo = new Literal(
                    simboloCaminhoModulo.hashArquivo,
                    Number(simboloCaminhoModulo.linha),
                    simboloCaminhoModulo.literal
                );
                break;
            case tiposDeSimbolos.IDENTIFICADOR:
                const identificadorModulo = this.avancarEDevolverAnterior();
                construtoCaminhoModulo = new Literal(
                    identificadorModulo.hashArquivo,
                    Number(identificadorModulo.linha),
                    identificadorModulo.lexema
                );

                break;
        }

        const importar = new Importar(construtoCaminhoModulo);
        if (identificadorDeTudo !== null) {
            importar.simboloTudo = identificadorDeTudo;
        } else {
            importar.elementosImportacao = elementosImportacao;
        }

        return Promise.resolve(importar);
    }

    override async declaracaoPara(): Promise<Para | ParaCada> {
        try {
            const simboloPara: SimboloInterface = this.simbolos[this.atual - 1];
            this.blocos += 1;

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CADA)) {
                return await this.declaracaoParaCada(simboloPara);
            }

            return await this.declaracaoParaTradicional(simboloPara);
        } finally {
            this.blocos -= 1;
        }
    }

    protected async logicaParaCadaDicionario(simboloPara: SimboloInterface) {
        this.avancarEDevolverAnterior(); // chave esquerda
        const nomeVariavelChave = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável para chave de iteração, em instrução 'para cada'."
        );
        this.consumir(
            tiposDeSimbolos.VIRGULA,
            "Esperado vírgula após nome de variável para chave de iteração, em instrução 'para cada'."
        );
        const nomeVariavelValor = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável para valor de iteração, em instrução 'para cada'."
        );
        this.consumir(
            tiposDeSimbolos.CHAVE_DIREITA,
            "Esperado chave direita após nome de variável para valor de iteração, em instrução 'para cada'."
        );

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução 'para cada'."
            );
        }

        const dicionario = await this.expressao();
        if (!dicionario.hasOwnProperty('tipo')) {
            throw this.erro(
                simboloPara,
                `Variável ou constante em 'para cada' não parece ser um dicionário.`
            );
        }

        const tipoDicionario = (dicionario as any).tipo as string;
        if (tipoDicionario !== 'dicionário') {
            throw this.erro(
                simboloPara,
                `Variável ou constante em 'para cada' não é um dicionário. Tipo resolvido: ${tipoDicionario}.`
            );
        }

        this.pilhaEscopos.definirInformacoesVariavel(
            nomeVariavelChave.lexema,
            new InformacaoElementoSintatico(nomeVariavelChave.lexema, 'qualquer')
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            nomeVariavelValor.lexema,
            new InformacaoElementoSintatico(nomeVariavelValor.lexema, 'qualquer')
        );
        const corpo: Bloco = await this.declaracaoBloco();

        return {
            nomeVariavelChave,
            nomeVariavelValor,
            dicionario,
            corpo,
        };
    }

    protected async declaracaoParaCadaDicionario(simboloPara: SimboloInterface) {
        const { nomeVariavelChave, nomeVariavelValor, dicionario, corpo } =
            await this.logicaParaCadaDicionario(simboloPara);

        return new ParaCada(
            this.hashArquivo,
            Number(simboloPara.linha),
            new Dupla(
                new Literal(this.hashArquivo, Number(simboloPara.linha), nomeVariavelChave.lexema),
                new Literal(this.hashArquivo, Number(simboloPara.linha), nomeVariavelValor.lexema)
            ),
            dicionario,
            corpo
        );
    }

    protected async logicaComumParaCadaVetor(simboloPara: SimboloInterface) {
        const nomeVariavelIteracao = this.avancarEDevolverAnterior();
        const variavelIteracao = new Variavel(this.hashArquivo, nomeVariavelIteracao);

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução 'para cada'."
            );
        }

        let vetorOuDicionario = await this.expressao();

        if (vetorOuDicionario.constructor === AcessoIndiceVariavel) {
            const construtoAcessoIndiceVariavel = vetorOuDicionario as AcessoIndiceVariavel;
            if (construtoAcessoIndiceVariavel.entidadeChamada.tipo === 'dicionário') {
                // A avaliação sintática não deve verificar valores de dicionários.
                // Aqui se supõe que o programador sabe o que está fazendo.
                // TODO: Talvez pensar numa forma melhor de fazer isso.
                (vetorOuDicionario as any).tipo = 'vetor';
            }
        }

        const tipoVetor = (vetorOuDicionario as any).tipo as string;

        if (
            !tipoVetor.endsWith('[]') &&
            !['dicionário', 'qualquer', 'texto', 'vetor'].includes(tipoVetor)
        ) {
            throw this.erro(
                simboloPara,
                `Variável ou constante em 'para cada' não é iterável. Tipo resolvido: ${tipoVetor}.`
            );
        }

        let tipoVariavelIteracao = 'qualquer';
        if (tipoVetor.endsWith('[]')) {
            tipoVariavelIteracao = tipoVetor.slice(0, -2);
        }

        this.pilhaEscopos.definirInformacoesVariavel(
            nomeVariavelIteracao.lexema,
            new InformacaoElementoSintatico(nomeVariavelIteracao.lexema, tipoVariavelIteracao)
        );
        const corpo: Bloco = await this.declaracaoBloco();

        return {
            variavelIteracao,
            vetor: vetorOuDicionario,
            corpo,
        };
    }

    protected async declaracaoParaCadaVetor(simboloPara: SimboloInterface) {
        const { variavelIteracao, vetor, corpo } = await this.logicaComumParaCadaVetor(simboloPara);

        return new ParaCada(
            this.hashArquivo,
            Number(simboloPara.linha),
            variavelIteracao,
            vetor,
            corpo
        );
    }

    protected async declaracaoParaCada(simboloPara: SimboloInterface): Promise<ParaCada> {
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR)) {
            return await this.declaracaoParaCadaVetor(simboloPara);
        }

        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            return await this.declaracaoParaCadaDicionario(simboloPara);
        }

        throw this.erro(
            simboloPara,
            'Identificador de iteração deve ser ou um par chave-valor, ou um nome de variável.'
        );
    }

    protected async logicaComumPara() {
        const comParenteses = this.verificarSeSimboloAtualEIgualA(
            tiposDeSimbolos.PARENTESE_ESQUERDO
        );

        let inicializador: Var | Expressao | Const[];
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            inicializador = null;
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL)) {
            inicializador = await this.declaracaoDeVariaveis();
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONSTANTE)) {
            inicializador = await this.declaracaoDeConstantes();
        } else {
            inicializador = await this.declaracaoExpressao();
        }

        let condicao = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            condicao = await this.expressao();
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        let incrementar = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            incrementar = await this.expressao();
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.INCREMENTAR,
                tiposDeSimbolos.DECREMENTAR
            );
        }

        if (comParenteses) {
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após cláusulas de inicialização, condição e incremento."
            );
        }

        const corpo: Bloco = await this.declaracaoBloco();

        return {
            inicializador,
            condicao,
            incrementar,
            corpo,
        };
    }

    protected async declaracaoParaTradicional(simboloPara: SimboloInterface): Promise<Para> {
        const { inicializador, condicao, incrementar, corpo } = await this.logicaComumPara();

        return new Para(
            this.hashArquivo,
            Number(simboloPara.linha),
            inicializador,
            condicao,
            incrementar,
            corpo
        );
    }

    override async declaracaoRetorna(): Promise<Retorna> {
        const simboloChave = this.simbolos[this.atual - 1];
        let valor = null;

        if (
            [
                tiposDeSimbolos.CHAVE_ESQUERDA,
                tiposDeSimbolos.COLCHETE_ESQUERDO,
                tiposDeSimbolos.FALSO,
                tiposDeSimbolos.FUNCAO,
                tiposDeSimbolos.FUNÇÃO,
                tiposDeSimbolos.IDENTIFICADOR,
                tiposDeSimbolos.ISTO,
                tiposDeSimbolos.NAO,
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.NULO,
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                tiposDeSimbolos.SUPER,
                tiposDeSimbolos.TEXTO,
                tiposDeSimbolos.VERDADEIRO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            valor = await this.expressao();
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Retorna(simboloChave, valor);
    }

    override async declaracaoSe(): Promise<Se> {
        const condicao = await this.expressao();

        const caminhoEntao: Declaracao = await this.resolverDeclaracao() as Declaracao;

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            caminhoSenao = await this.resolverDeclaracao();
        }

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    override declaracaoSustar(): Sustar {
        if (this.blocos < 1) {
            throw this.erro(
                this.simbolos[this.atual - 1],
                "'sustar' ou 'pausa' deve estar dentro de um laço de repetição."
            );
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Sustar(this.simbolos[this.atual - 1]);
    }

    override async declaracaoTente(): Promise<Tente> {
        const simboloTente: SimboloInterface = this.simbolos[this.atual - 1];
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'tente'.");

        const blocoTente: any[] = await this.blocoEscopo();

        let blocoPegue: FuncaoConstruto | Declaracao[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                // Caso 1: com parâmetro de erro.
                // `pegue` recebe um `FuncaoConstruto`.
                blocoPegue = await this.corpoDaFuncao('bloco `pegue`');
            } else {
                // Caso 2: sem parâmetro de erro.
                // `pegue` recebe um bloco.
                this.consumir(
                    tiposDeSimbolos.CHAVE_ESQUERDA,
                    "Esperado '{' após a declaração 'pegue'."
                );
                blocoPegue = await this.blocoEscopo();
            }
        }

        let blocoSenao: any[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'senão'."
            );

            blocoSenao = await this.blocoEscopo();
        }

        let blocoFinalmente: any[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'finalmente'."
            );

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

    protected async resolverDecoradores(): Promise<void> {
        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.ARROBA)) {
            this.avancarEDevolverAnterior(); // Arroba
            let nomeDecorador: string = '@';
            let linha: number;
            let parametros: ParametroInterface[] = [];
            const atributos: { [key: string]: any } = {};

            const primeiraParteNomeDecorador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado nome de decorador após '@'."
            );
            linha = Number(primeiraParteNomeDecorador.linha);
            nomeDecorador += primeiraParteNomeDecorador.lexema;

            while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const parteNomeDecorador = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome de decorador após '.'."
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

                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após nome de decorador.");
            }

            this.pilhaDecoradores.push(
                new Decorador(this.hashArquivo, linha, nomeDecorador, atributos)
            );
        }
    }

    protected async declaracaoTendoComo(): Promise<TendoComo> {
        const simboloTendo = this.simbolos[this.atual - 1];
        const expressaoInicializacao = await this.expressao();
        this.consumir(
            tiposDeSimbolos.COMO,
            "Esperado palavra reservada 'como' após expressão de inicialização de variável, em declaração 'tendo'."
        );
        const simboloNomeVariavel = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado nome do identificador em declaração 'tendo'."
        );
        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            "Esperado chave esquerda para abertura de bloco em declaração 'tendo'."
        );

        let tipoInicializacao: string = 'qualquer';
        switch (expressaoInicializacao.constructor) {
            case Chamada:
                const construtoChamada = expressaoInicializacao as Chamada;
                switch (construtoChamada.entidadeChamada.constructor) {
                    case AcessoMetodo:
                        const entidadeChamadaAcessoMetodo =
                            construtoChamada.entidadeChamada as AcessoMetodo;
                        tipoInicializacao = entidadeChamadaAcessoMetodo.tipoRetornoMetodo.replace(
                            '<T>',
                            entidadeChamadaAcessoMetodo.objeto.tipo
                        );
                        break;
                    case Variavel:
                        const entidadeChamadaVariavel =
                            construtoChamada.entidadeChamada as Variavel;
                        tipoInicializacao = entidadeChamadaVariavel.tipo;
                        break;
                    // TODO: Demais casos
                    default:
                        break;
                }
                break;
            // TODO: Demais casos
            default:
                break;
        }

        this.pilhaEscopos.definirInformacoesVariavel(
            simboloNomeVariavel.lexema,
            new InformacaoElementoSintatico(simboloNomeVariavel.lexema, tipoInicializacao)
        );

        const blocoCorpo = await this.blocoEscopo();
        return new TendoComo(
            simboloTendo.linha,
            simboloTendo.hashArquivo,
            simboloNomeVariavel,
            expressaoInicializacao,
            new Bloco(simboloTendo.linha, simboloTendo.hashArquivo, blocoCorpo)
        );
    }

    protected async declaracaoDesestruturacaoVariavel(): Promise<Var[]> {
        const identificadores: SimboloInterface[] = [];

        do {
            identificadores.push(
                this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da variável.')
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.CHAVE_DIREITA,
            'Esperado chave direita para concluir relação de variáveis a serem desestruturadas.'
        );

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL, tiposDeSimbolos.SETA_ESQUERDA)) {
            throw this.erro(
                this.simbolos[this.atual],
                'Esperado igual ou seta esquerda após relação de propriedades da desestruturação.'
            );
        }

        const inicializador = await this.expressao();
        const retornos = [];
        for (let identificador of identificadores) {
            this.pilhaEscopos.definirInformacoesVariavel(
                identificador.lexema,
                new InformacaoElementoSintatico(
                    identificador.lexema,
                    this.logicaComumInferenciaTiposVariaveisEConstantes(inicializador, 'qualquer')
                )
            );
            const declaracaoVar = new Var(
                identificador,
                new AcessoMetodoOuPropriedade(this.hashArquivo, inicializador, identificador)
            );
            declaracaoVar.decoradores = Array.from(this.pilhaDecoradores);
            retornos.push(declaracaoVar);
        }

        this.pilhaDecoradores = [];
        return retornos;
    }

    protected logicaComumInferenciaTiposAcessoMetodoOuPropriedade(entidadeChamada: AcessoMetodoOuPropriedade): string {
        // Algumas coisas podem acontecer aqui.
        // Uma delas é a variável/constante ser uma classe padrão.
        // Isso ocorre quando a importação é feita de uma biblioteca Node.js.
        // Nesse caso, o tipo de `entidadeChamada.objeto` começa com uma letra maiúscula.
        if (
            entidadeChamada.objeto.tipo &&
            entidadeChamada.objeto.tipo.match(/^[A-Z]/)
        ) {
            const tipoCorrespondente =
                this.tiposDefinidosPorBibliotecas[
                entidadeChamada.objeto.tipo
                ];
            if (!tipoCorrespondente) {
                throw new ErroAvaliadorSintatico(
                    entidadeChamada.simbolo,
                    `Tipo '${entidadeChamada.objeto.tipo}' não foi encontrado entre os tipos definidos por bibliotecas.`
                );
            }

            if (
                !(
                    entidadeChamada.simbolo.lexema in
                    tipoCorrespondente.metodos
                ) &&
                !(
                    entidadeChamada.simbolo.lexema in
                    tipoCorrespondente.propriedades
                )
            ) {
                throw new ErroAvaliadorSintatico(
                    entidadeChamada.simbolo,
                    `Membro '${entidadeChamada.simbolo.lexema}' não existe no tipo '${entidadeChamada.objeto.tipo}'.`
                );
            }

            if (
                entidadeChamada.simbolo.lexema in
                tipoCorrespondente.metodos
            ) {
                const metodoCorrespondente = tipoCorrespondente.metodos[
                    entidadeChamada.simbolo.lexema
                ];
                return metodoCorrespondente.tipoRetorno || 'qualquer';
            }

            const propriedadeCorrespondente = tipoCorrespondente.propriedades[
                entidadeChamada.simbolo.lexema
            ];
            return propriedadeCorrespondente.tipo;
        }

        // Este caso ocorre quando a variável/constante é do tipo 'qualquer',
        // e a chamada normalmente é feita para uma primitiva.
        // A inferência, portanto, ocorre pelo uso da primitiva.
        for (const primitiva in this.primitivasConhecidas) {
            if (
                this.primitivasConhecidas[primitiva].hasOwnProperty(
                    entidadeChamada.simbolo.lexema
                )
            ) {
                return this.primitivasConhecidas[primitiva][
                    entidadeChamada.simbolo.lexema
                ].tipo;
            }
        }

        throw new ErroAvaliadorSintatico(
            entidadeChamada.simbolo,
            `Primitiva '${entidadeChamada.simbolo.lexema}' não existe.`
        );
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
                if (entidadeChamadaAcessoIndiceVariavel.constructor === AcessoIndiceVariavel) {
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
                        const tipoRetornoAcessoMetodoResolvido =
                            entidadeChamadaAcessoMetodo.tipoRetornoMetodo.replace(
                                '<T>',
                                entidadeChamadaAcessoMetodo.objeto.tipo
                            );
                        return tipoRetornoAcessoMetodoResolvido;
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
                return tipoDeDadosDelegua.TUPLA;

            default:
                // Construtos mapeados em `delegua-node`.
                switch (inicializador.constructor.name) {
                    case 'ImportarBiblioteca':
                    case 'ModuloDeclaracoes':
                        return 'módulo';
                }

                return inicializador.tipo;
        }
    }

    protected resolverValorConstruto(construto: Construto): string {
        if (construto instanceof Literal) {
            return String(construto.valor);
        }

        throw this.erro(
            { hashArquivo: construto.hashArquivo, linha: construto.linha } as SimboloInterface,
            `Construto do tipo ${construto.constructor} não possui um mapeamento de valor.`
        );
    }

    protected resolverInformacaoElementoSintaticoDeDicionario(
        construto: Construto
    ): ElementoMontaoTipos {
        let retorno: ElementoMontaoTipos;
        if (construto instanceof Dicionario) {
            retorno = new ElementoMontaoTipos('dicionário');
            const subElementos = {};
            for (var i = 0; i < construto.valores.length; i++) {
                const chaveCorrespondente = this.resolverValorConstruto(construto.chaves[i]);
                const valorCorrespondente = construto.valores[i];
                subElementos[chaveCorrespondente] =
                    this.resolverInformacaoElementoSintaticoDeDicionario(valorCorrespondente);
            }

            retorno.subElementos = subElementos;
        } else {
            retorno = new ElementoMontaoTipos(construto.tipo);
        }

        const endereco = this.montaoTipos.adicionarReferencia(retorno);
        retorno.endereco = endereco;
        return retorno;
    }

    /**
     * Caso símbolo atual seja `var`, devolve uma declaração de variável.
     * @returns Um Construto do tipo Var.
     */
    protected async declaracaoDeVariaveis(): Promise<Var[]> {
        const simboloVariavel = this.simboloAnterior();
        const identificadores: SimboloInterface[] = [];
        const retorno: Var[] = [];
        let tipo: string = 'qualquer';

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            return await this.declaracaoDesestruturacaoVariavel();
        }

        do {
            identificadores.push(
                this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da variável.')
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        let tipoExplicito: boolean = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            tipo = this.verificarDefinicaoTipoAtual();
            tipoExplicito = true;
            this.avancarEDevolverAnterior();
        }

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL, tiposDeSimbolos.SETA_ESQUERDA)) {
            // Inicialização de variáveis sem valor.
            for (let identificador of identificadores.values()) {
                this.pilhaEscopos.definirInformacoesVariavel(
                    identificador.lexema,
                    new InformacaoElementoSintatico(identificador.lexema, tipo)
                );
                retorno.push(
                    new Var(
                        identificador,
                        null,
                        tipo,
                        tipoExplicito,
                        Array.from(this.pilhaDecoradores)
                    )
                );
            }

            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
            this.pilhaDecoradores = [];
            return retorno;
        }

        const inicializadores = [];
        do {
            inicializadores.push(await this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (identificadores.length !== inicializadores.length) {
            throw this.erro(
                simboloVariavel,
                'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
            );
        }

        for (let [indice, identificador] of identificadores.entries()) {
            const tipoOriginal = tipo; // Preserva o tipo antes da inferência
            tipo = this.logicaComumInferenciaTiposVariaveisEConstantes(
                inicializadores[indice],
                tipo
            );

            if (tipo !== 'dicionário') {
                this.pilhaEscopos.definirInformacoesVariavel(
                    identificador.lexema,
                    new InformacaoElementoSintatico(identificador.lexema, tipo)
                );
            } else {
                const inicializadorDicionario = inicializadores[indice] as Dicionario;
                this.pilhaEscopos.definirInformacoesVariavel(
                    identificador.lexema,
                    this.resolverInformacaoElementoSintaticoDeDicionario(inicializadorDicionario)
                );
            }

            retorno.push(
                new Var(
                    identificador,
                    inicializadores[indice],
                    tipo,
                    tipoExplicito,
                    Array.from(this.pilhaDecoradores),
                    tipoOriginal // Passa o tipo original para o construtor
                )
            );
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        this.pilhaDecoradores = [];
        return retorno;
    }

    protected async declaracaoDesestruturacaoConstante(): Promise<Const[]> {
        const identificadores: SimboloInterface[] = [];

        do {
            identificadores.push(
                this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da variável.')
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.CHAVE_DIREITA,
            'Esperado chave direita para concluir relação de variáveis a serem desestruturadas.'
        );

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL, tiposDeSimbolos.SETA_ESQUERDA)) {
            throw this.erro(
                this.simbolos[this.atual],
                'Esperado igual ou seta esquerda após relação de propriedades da desestruturação.'
            );
        }

        const inicializador = await this.expressao();
        const retornos: Const[] = [];
        for (let identificador of identificadores) {
            // TODO: Melhorar dicionário para intuir o tipo de cada propriedade.
            this.pilhaEscopos.definirInformacoesVariavel(
                identificador.lexema,
                new InformacaoElementoSintatico(identificador.lexema, 'qualquer')
            );
            const declaracaoConst = new Const(
                identificador,
                new AcessoMetodoOuPropriedade(this.hashArquivo, inicializador, identificador)
            );

            declaracaoConst.decoradores = Array.from(this.pilhaDecoradores);
            retornos.push(declaracaoConst);
        }

        return retornos;
    }

    /**
     * Caso símbolo atual seja `const, constante ou fixo`, devolve uma declaração de const.
     * @returns Um Construto do tipo Const.
     */
    async declaracaoDeConstantes(): Promise<Const[]> {
        const simboloConstante = this.simboloAnterior();
        const identificadores: SimboloInterface[] = [];
        let tipo: string = 'qualquer';

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            return await this.declaracaoDesestruturacaoConstante();
        }

        do {
            identificadores.push(
                this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da constante.')
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        let tipoExplicito: boolean = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            tipo = this.verificarDefinicaoTipoAtual();
            tipoExplicito = true;
            this.avancarEDevolverAnterior();
        }

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL, tiposDeSimbolos.SETA_ESQUERDA)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado '=' ou '<-' após identificador em instrução 'constante'."
            );
        }

        const inicializadores = [];
        do {
            inicializadores.push(await this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (identificadores.length !== inicializadores.length) {
            throw this.erro(
                simboloConstante,
                'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
            );
        }

        let retorno: Const[] = [];
        for (let [indice, identificador] of identificadores.entries()) {
            // Se tipo ainda não foi definido, infere.
            tipo = this.logicaComumInferenciaTiposVariaveisEConstantes(
                inicializadores[indice],
                tipo
            );

            if (tipo !== 'dicionário') {
                this.pilhaEscopos.definirInformacoesVariavel(
                    identificador.lexema,
                    new InformacaoElementoSintatico(identificador.lexema, tipo)
                );
            } else {
                const inicializadorDicionario = inicializadores[indice] as Dicionario;
                this.pilhaEscopos.definirInformacoesVariavel(
                    identificador.lexema,
                    this.resolverInformacaoElementoSintaticoDeDicionario(inicializadorDicionario)
                );
            }

            retorno.push(
                new Const(
                    identificador,
                    inicializadores[indice],
                    tipo,
                    tipoExplicito,
                    Array.from(this.pilhaDecoradores)
                )
            );
        }

        this.pilhaDecoradores = [];
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return retorno;
    }

    protected async funcao(tipo: string): Promise<FuncaoDeclaracao> {
        let simbolo: SimboloInterface;
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.CONSTRUTOR:
                simbolo = this.avancarEDevolverAnterior();
                break;
            default:
                simbolo = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome de ${tipo}.`);
                break;
        }

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

    protected async logicaComumParametros(): Promise<ParametroInterface[]> {
        const parametros: ParametroInterface[] = [];

        do {
            const parametro: Partial<ParametroInterface> = {};

            if (this.simbolos[this.atual].tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro.abrangencia = 'multiplo';
            } else {
                parametro.abrangencia = 'padrao';
            }

            parametro.nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do parâmetro.'
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                try {
                    const valorPadrao = await this.primario();
                    parametro.valorPadrao = valorPadrao;
                } catch (erro) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        `Valor padrão do parâmetro '${parametro.nome.lexema}' é inválido.`
                    );
                }
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
                let tipoDadoParametro = this.verificarDefinicaoTipoAtual();
                parametro.tipoDado = tipoDadoParametro;
                this.avancarEDevolverAnterior();
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const valorPadrao = await this.primario();
                parametro.valorPadrao = valorPadrao;
            }

            this.pilhaEscopos.definirInformacoesVariavel(
                parametro.nome.lexema,
                new InformacaoElementoSintatico(
                    parametro.nome.lexema,
                    parametro.tipoDado || 'qualquer'
                )
            );

            parametros.push(parametro as ParametroInterface);
            if (parametro.abrangencia === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    override async corpoDaFuncao(tipo: string): Promise<FuncaoConstruto> {
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
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            tipoRetorno = this.verificarDefinicaoTipoAtual();
            this.avancarEDevolverAnterior();
            definicaoExplicitaDeTipo = true;
        }

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, `Esperado '{' antes do escopo do ${tipo}.`);

        const corpo = await this.blocoEscopo();
        let expressoesRetorna: Retorna[] = [];
        for (const declaracao of corpo) {
            expressoesRetorna = expressoesRetorna.concat(buscarRetornos(declaracao));
        }

        if (tipoRetorno === 'vazio' && expressoesRetorna.length > 0) {
            // Filtra retornos que têm tipo conhecido e diferente de 'vazio'.
            // 'qualquer' é excluído pois o tipo não pode ser determinado em tempo de análise sintática.
            const retornosNaoVazios = expressoesRetorna.filter((e) => e.tipo !== 'vazio' && e.tipo !== 'qualquer');
            if (retornosNaoVazios.length > 0) {
                throw this.erro(
                    retornosNaoVazios[0].simboloChave,
                    `Função declara explicitamente 'vazio', mas usa expressão 'retorna' com tipo de retorno diferente de vazio.`
                );
            }
        }

        const tiposRetornos = new Set(
            expressoesRetorna.filter((e) => e.tipo !== 'qualquer').map((e) => e.tipo)
        );
        let retornaChamadoExplicitamente = tiposRetornos.size > 0;
        if (tiposRetornos.size > 1 && tipoRetorno !== 'qualquer') {
            let tiposEncontrados = Array.from(tiposRetornos).reduce(
                (acumulador, valor) => (acumulador += valor + ', '),
                ''
            );
            tiposEncontrados = tiposEncontrados.slice(0, -2);
            throw this.erro(
                parenteseEsquerdo,
                `Função retorna valores com mais de um tipo. Tipo esperado: ${tipoRetorno}. Tipos encontrados: ${tiposEncontrados}.`
            );
        }

        tiposRetornos.delete('qualquer');

        if (tipoRetorno === 'qualquer') {
            if (tiposRetornos.size > 0) {
                // Se o tipo de retorno é 'qualquer', seja implícito ou explícito,
                // este avaliador sintático pode restringir o tipo baseado nos construtos
                // de retornos encontrados nos blocos internos da função.
                const tipoRetornoDeduzido = tiposRetornos.values().next().value;
                tipoRetorno = tipoRetornoDeduzido;
            } else if (!retornaChamadoExplicitamente && !definicaoExplicitaDeTipo) {
                // Ou, se esses retornos sequer existem, e o tipo explícito não é
                // 'qualquer', o tipo inferido é 'vazio'.
                tipoRetorno = 'vazio';
            }
        }

        return new FuncaoConstruto(
            this.hashArquivo,
            Number(parenteseEsquerdo.linha),
            parametros,
            corpo,
            tipoRetorno,
            definicaoExplicitaDeTipo
        );
    }

    override async declaracaoDeClasse(): Promise<Classe> {
        const simbolo: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome da classe.'
        );
        const pilhaDecoradoresClasse = Array.from(this.pilhaDecoradores);

        let superClasse = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.HERDA)) {
            const simboloSuperclasse = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome da Superclasse.'
            );
            this.superclasseAtual = simboloSuperclasse.lexema;
            superClasse = new Variavel(
                this.hashArquivo,
                this.simbolos[this.atual - 1],
                simboloSuperclasse.lexema
            );
        }

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo da classe.");

        this.pilhaDecoradores = [];
        const metodos = [];
        const propriedades = [];
        while (
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) &&
            !this.estaNoFinal()
        ) {
            // Se o símbolo atual é arroba, é um decorador.
            // Caso contrário, verificamos o próximo símbolo.
            if (this.simbolos[this.atual].tipo === tiposDeSimbolos.ARROBA) {
                await this.resolverDecoradores();
                continue;
            }

            // Se o próximo símbolo ao atual for um parênteses, é um método.
            // Caso contrário, é uma propriedade.
            const proximoSimbolo = this.simbolos[this.atual + 1];
            switch (proximoSimbolo.tipo) {
                case tiposDeSimbolos.PARENTESE_ESQUERDO:
                    metodos.push(await this.funcao('método'));
                    break;
                case tiposDeSimbolos.DOIS_PONTOS:
                    const nomePropriedade = this.consumir(
                        tiposDeSimbolos.IDENTIFICADOR,
                        'Esperado identificador para nome de propriedade.'
                    );
                    this.consumir(
                        tiposDeSimbolos.DOIS_PONTOS,
                        'Esperado dois-pontos após nome de propriedade.'
                    );
                    const tipoPropriedade = this.avancarEDevolverAnterior();
                    this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
                    propriedades.push(
                        new PropriedadeClasse(
                            nomePropriedade,
                            tipoPropriedade.lexema,
                            Array.from(this.pilhaDecoradores)
                        )
                    );
                    this.pilhaDecoradores = [];
                    break;
                default:
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Esperado definição de método ou propriedade.'
                    );
            }
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o escopo da classe.");
        const definicaoClasse = new Classe(
            simbolo,
            superClasse,
            metodos,
            propriedades,
            pilhaDecoradoresClasse
        );
        this.tiposDefinidosEmCodigo[definicaoClasse.simbolo.lexema] = definicaoClasse;
        this.superclasseAtual = undefined;
        return definicaoClasse;
    }

    /**
     * Declarações fora de bloco precisam ser verificadas primeiro por
     * uma série de motivos, como, por exemplo:
     *
     * - Não é possível declarar uma classe/função dentro de um bloco `enquanto`,
     *   `fazer ... enquanto`, `para`, `escolha`, etc;
     * - Qualquer declaração pode ter um decorador.
     * @returns Uma função ou classe se o símbolo atual resolver aqui.
     *          O retorno de `resolverDeclaracao()` em caso contrário.
     * @see resolverDeclaracao
     * @see resolverDecoradores
     */
    override async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]> {
        try {
            while (this.verificarTipoSimboloAtual(tiposDeSimbolos.ARROBA)) {
                await this.resolverDecoradores();
            }

            if (
                (this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.avancarEDevolverAnterior();
                return await this.funcao('funcao');
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE)) {
                return await this.declaracaoDeClasse();
            }

            return await this.resolverDeclaracao();
        } catch (erro: any) {
            this.sincronizar();
            this.erros.push(erro);
            return null;
        }
    }

    /**
     * Usado quando há erros na avaliação sintática.
     * Garante que o código não entre em _loop_ infinito.
     * @returns Sempre retorna `void`.
     */
    protected sincronizar(): void {
        this.avancarEDevolverAnterior(); // avança além do token com erro

        while (!this.estaNoFinal()) {
            // Um ponto-e-vírgula já consumido indica fronteira limpa entre declarações.
            if (this.simbolos[this.atual - 1].tipo === tiposDeSimbolos.PONTO_E_VIRGULA) return;

            // Uma palavra-chave de início de declaração ou fecha-chave à frente:
            // retorna SEM consumir o token, para que o chamador o analise normalmente.
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.CHAVE_DIREITA:
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

    /**
     * Todas as resoluções triviais da linguagem, ou seja, todas as
     * resoluções que podem ocorrer dentro ou fora de um bloco.
     * @returns Normalmente uma `Declaracao`, mas há casos em que
     * outros objetos podem ser retornados.
     * @see resolverDeclaracaoForaDeBloco para as declarações que não podem
     * ocorrer em blocos de escopo elementares.
     */
    protected async resolverDeclaracao(): Promise<Declaracao | Declaracao[]> {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.AJUDA:
                return await this.declaracaoAjuda();
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                return await this.declaracaoBloco();
            case tiposDeSimbolos.COMENTARIO:
                return this.declaracaoComentarioUmaLinha();
            case tiposDeSimbolos.CONSTANTE:
                this.avancarEDevolverAnterior();
                return await this.declaracaoDeConstantes();
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return await this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                this.avancarEDevolverAnterior();
                return await this.declaracaoEscolha();
            case tiposDeSimbolos.ESCREVA:
                this.avancarEDevolverAnterior();
                return await this.declaracaoEscreva();
            case tiposDeSimbolos.FALHAR:
                this.avancarEDevolverAnterior();
                return await this.declaracaoFalhar();
            case tiposDeSimbolos.FAZER:
                const simboloFazer = this.avancarEDevolverAnterior();
                return await this.declaracaoFazer(simboloFazer);
            case tiposDeSimbolos.IMPORTAR:
                this.avancarEDevolverAnterior();
                return await this.declaracaoImportar();
            case tiposDeSimbolos.LINHA_COMENTARIO:
                return this.declaracaoComentarioMultilinha();
            case tiposDeSimbolos.PARA:
                this.avancarEDevolverAnterior();
                return await this.declaracaoPara();
            case tiposDeSimbolos.SUSTAR:
                this.avancarEDevolverAnterior();
                return this.declaracaoSustar();
            case tiposDeSimbolos.SE:
                this.avancarEDevolverAnterior();
                return await this.declaracaoSe();
            case tiposDeSimbolos.RETORNA:
                this.avancarEDevolverAnterior();
                return await this.declaracaoRetorna();
            case tiposDeSimbolos.TENDO:
                this.avancarEDevolverAnterior();
                return await this.declaracaoTendoComo();
            case tiposDeSimbolos.TENTE:
                this.avancarEDevolverAnterior();
                return await this.declaracaoTente();
            case tiposDeSimbolos.VARIAVEL:
                this.avancarEDevolverAnterior();
                return await this.declaracaoDeVariaveis();
        }

        const simboloAtual = this.simbolos[this.atual];
        if (simboloAtual.tipo === tiposDeSimbolos.IDENTIFICADOR) {
            // Pela gramática, a seguinte situação não pode ocorrer:
            // 1. O símbolo anterior ser um identificador; e
            // 2. O símbolo anterior estar na mesma linha do identificador atual.

            const simboloAnterior = this.simbolos[this.atual - 1];
            if (
                !!simboloAnterior &&
                simboloAnterior.tipo === tiposDeSimbolos.IDENTIFICADOR &&
                simboloAnterior.linha === simboloAtual.linha
            ) {
                throw this.erro(
                    this.simbolos[this.atual],
                    'Não é permitido ter dois identificadores seguidos na mesma linha.'
                );
            }
        }

        return await this.declaracaoExpressao();
    }

    async declaracaoAjuda(): Promise<Ajuda> {
        const simboloAjuda = this.avancarEDevolverAnterior();

        if (this.estaNoFinal() || this.simbolos[this.atual].tipo !== tiposDeSimbolos.PARENTESE_ESQUERDO) {
            return new Ajuda(simboloAjuda.hashArquivo, simboloAjuda.linha, undefined, false);
        }

        this.avancarEDevolverAnterior(); // parêntese esquerdo

        if (this.simbolos[this.atual].tipo === tiposDeSimbolos.PARENTESE_DIREITO) {
            this.avancarEDevolverAnterior();
            return new Ajuda(simboloAjuda.hashArquivo, simboloAjuda.linha, undefined, true);
        }

        const expressaoAjuda = await this.expressao();
        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            `Esperado parêntese direito após expressão usada como argumento em ajuda(). Atual: ${this.simbolos[this.atual].lexema}.`
        );

        return new Ajuda(simboloAjuda.hashArquivo, simboloAjuda.linha, expressaoAjuda);
    }

    /**
     * Inicializa o primeiro nível da pilha de escopos, normalmente com ítens da biblioteca global.
     * É separada da inicialização do avaliador sintático, pois é necessário manipular essa
     * inicialização de outra forma em `delegua-node`.
     */
    protected inicializarPilhaEscopos() {
        this.pilhaEscopos = new PilhaEscopos();
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        // Funções nativas de Delégua
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
            'clonar',
            new InformacaoElementoSintatico('clonar', 'qualquer', true, [
                new InformacaoElementoSintatico('valor', 'qualquer'),
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
            'longo',
            new InformacaoElementoSintatico('longo', 'longo', true, [
                new InformacaoElementoSintatico('valor', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'intervalo',
            new InformacaoElementoSintatico('intervalo', 'inteiro[]', true, [
                new InformacaoElementoSintatico('valorInicial', 'qualquer'),
                new InformacaoElementoSintatico('valorFinal', 'qualquer', false),
                new InformacaoElementoSintatico('valorPasso', 'qualquer', false),
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
                new InformacaoElementoSintatico('funcaoOrdenacao', 'função', false),
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
            'todos',
            new InformacaoElementoSintatico('todos', 'lógico', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer')
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'todosEmCondicao',
            new InformacaoElementoSintatico('todosEmCondicao', 'lógico', true, [
                new InformacaoElementoSintatico('iteravel', 'qualquer'),
                new InformacaoElementoSintatico('funcaoCondicional', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'tupla',
            new InformacaoElementoSintatico('tupla', 'tupla', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
            ])
        );

        // TODO: Escrever algum tipo de validação aqui.
        for (const tipos of Object.values(this.tiposDeFerramentasExternas)) {
            for (const [nomeTipo, tipo] of Object.entries(tipos)) {
                this.pilhaEscopos.definirInformacoesVariavel(
                    nomeTipo,
                    new InformacaoElementoSintatico(nomeTipo, tipo)
                );
            }
        }
    }

    async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        const inicioAnalise: [number, number] = hrtime();
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.pilhaDecoradores = [];
        this.tiposDefinidosEmCodigo = {};
        this.montaoTipos = new MontaoTipos();
        this.inicializarPilhaEscopos();

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            await this.resolverDecoradores();
            const retornoDeclaracao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else if (retornoDeclaracao !== null) {
                declaracoes.push(retornoDeclaracao as Declaracao);
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

