import hrtime from 'browser-process-hrtime';

import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
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
    EnquantoComoConstruto,
    ExpressaoRegular,
    FazerComoConstruto,
    FuncaoConstruto,
    Isto,
    Leia,
    Literal,
    Logico,
    ParaCadaComoConstruto,
    ParaComoConstruto,
    ReferenciaFuncao,
    Separador,
    Super,
    TipoDe,
    Tupla,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import { AvaliadorSintaticoInterface, ParametroInterface, SimboloInterface } from '../interfaces';

import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';

import { Deceto, Dupla, Noneto, Octeto, Quarteto, Quinteto, SeletorTuplas, Septeto, Sexteto, Trio } from '../construtos/tuplas';
import {
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
import { TipoDadosElementar } from '../tipo-dados-elementar';
import { AvaliadorSintaticoBase } from './avaliador-sintatico-base';
import { inferirTipoVariavel, tipoInferenciaParaTipoDadosElementar } from '../inferenciador';
import { TipoInferencia } from '../inferenciador';
import { PilhaEscopos } from './pilha-escopos';
import { InformacaoEscopo } from './informacao-escopo';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';
import { buscarRetornos, registrarPrimitiva } from './comum';
import { MontaoTipos } from './montao-tipos';
import { ElementoMontaoTipos } from './elemento-montao-tipos';

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
    implements AvaliadorSintaticoInterface<SimboloInterface, Declaracao>
{
    pilhaDecoradores: Decorador[];
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    tiposDefinidosEmCodigo: { [nomeTipo: string]: Declaracao };
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
            return tipoVetor as TipoDadosElementar;
        }

        return tipoElementarResolvido as TipoDadosElementar;
    }

    protected obterChaveDicionario(): Construto {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
            case tiposDeSimbolos.FALSO:
            case tiposDeSimbolos.VERDADEIRO:
                return this.primario();
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
                    return this.construtoTupla();
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

    protected construtoDicionario(simboloChaveEsquerda: SimboloInterface): Dicionario {
        this.avancarEDevolverAnterior();
        const chaves = [];
        const valores = [];

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
            return new Dicionario(this.hashArquivo, Number(simboloChaveEsquerda.linha), [], []);
        }

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
            const chave = this.obterChaveDicionario();
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' entre chave e valor.");
            const valor = this.atribuir();

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

    protected construtoTupla(): Tupla {
        const expressao = this.expressao();
        const argumentos = [expressao];
        while (this.simbolos[this.atual].tipo === tiposDeSimbolos.VIRGULA) {
            this.avancarEDevolverAnterior();
            argumentos.push(this.expressao());
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
        this.consumir(tiposDeSimbolos.COLCHETE_DIREITO, "Esperado ']' após a expressão.");
        return new SeletorTuplas(...argumentos) as Tupla;
    }

    protected enquantoComoConstruto(): EnquantoComoConstruto {
        const { condicao, corpo } = this.logicaComumEnquanto();

        return new EnquantoComoConstruto(
            condicao,
            corpo
        );
    }

    protected fazerComoConstruto(simboloFazer: SimboloInterface): Construto {
        try {
            this.blocos += 1;

            const { caminhoFazer, condicaoEnquanto } = this.logicaComumFazer();
            return new FazerComoConstruto(
                simboloFazer.hashArquivo,
                Number(simboloFazer.linha),
                caminhoFazer as Bloco,
                condicaoEnquanto
            );
        } finally {
            this.blocos -= 1;
        }
    }

    protected paraCadaComoConstrutoVetor(simboloPara: SimboloInterface) {
        const { variavelIteracao, vetor, corpo } = this.logicaComumParaCadaVetor(simboloPara);

        return new ParaCadaComoConstruto(
            this.hashArquivo,
            Number(simboloPara.linha),
            variavelIteracao,
            vetor,
            corpo
        );
    }

    protected paraCadaComoConstrutoDicionario(simboloPara: SimboloInterface) {
        const { nomeVariavelChave, nomeVariavelValor, dicionario, corpo } = this.logicaParaCadaDicionario(simboloPara);

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

    protected paraCadaComoConstruto(simboloPara: SimboloInterface): ParaCadaComoConstruto {
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR)) {
            return this.paraCadaComoConstrutoVetor(simboloPara);
        }

        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            return this.paraCadaComoConstrutoDicionario(simboloPara);
        }

        throw this.erro(
            simboloPara,
            'Identificador de iteração deve ser ou um par chave-valor, ou um nome de variável.'
        );
    }

    protected paraTradicionalComoConstruto(simboloPara: SimboloInterface) {
        const { inicializador, condicao, incrementar, corpo } = this.logicaComumPara(simboloPara);
        
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
    protected paraComoConstruto(simboloPara: SimboloInterface): ParaCadaComoConstruto | ParaComoConstruto {
        try {
            this.blocos += 1;

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CADA)) {
                return this.paraCadaComoConstruto(simboloPara);
            }

            return this.paraTradicionalComoConstruto(simboloPara);
        } finally {
            this.blocos -= 1;
        }
    }

    override primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];
        let valores = [];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                return this.construtoDicionario(simboloAtual);

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
                            const valor = this.atribuir();
                            valores.push(valor);
                            break;
                    }
                }

                // Remover comentários, verificar se vírgulas fazem sentido.
                const valoresSemComentarios: Construto[] = valores.filter(
                    (v) => v.constructor.name !== 'ComentarioComoConstruto'
                );
                let elementoSeparador = false; // O primeiro elemento não pode ser separador.
                for (const elemento of valoresSemComentarios) {
                    if (elementoSeparador) {
                        if (elemento.constructor.name !== 'Separador') {
                            throw this.erro(
                                (elemento as any).simbolo,
                                'Não podem haver duas vírgulas seguidas em uma definição de vetor, ou definição de vetor começando em vírgula.'
                            );
                        }
                        elementoSeparador = false;
                    } else {
                        if (elemento.constructor.name === 'Separador') {
                            throw this.erro(
                                (elemento as any).simbolo,
                                'Não podem haver duas vírgulas seguidas em uma definição de vetor, ou definição de vetor começando em vírgula.'
                            );
                        }
                        elementoSeparador = true;
                    }
                }

                const valoresSemSeparadores = valoresSemComentarios.filter(
                    (v) => v.constructor.name !== 'Separador'
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
                return this.enquantoComoConstruto();
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
                return this.fazerComoConstruto(simboloFazer);
            case tiposDeSimbolos.FUNCAO:
            case tiposDeSimbolos.FUNÇÃO:
                const simboloFuncao = this.avancarEDevolverAnterior();
                const corpoDaFuncao = this.corpoDaFuncao(simboloFuncao.lexema);
                this.pilhaEscopos.definirInformacoesVariavel(
                    simboloFuncao.lexema,
                    new InformacaoElementoSintatico(simboloFuncao.lexema, 'função')
                );
                return corpoDaFuncao;

            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
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
                return this.declaracaoImportar();

            case tiposDeSimbolos.ISTO:
                this.avancarEDevolverAnterior();
                return new Isto(this.hashArquivo, Number(simboloAtual.linha), simboloAtual);

            case tiposDeSimbolos.LEIA:
                return this.expressaoLeia();

            case tiposDeSimbolos.NULO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), null, 'nulo');

            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.NÚMERO:
            case tiposDeSimbolos.TEXTO:
                const simboloNumeroTexto: SimboloInterface = this.avancarEDevolverAnterior();
                const tipoInferido = inferirTipoVariavel(simboloNumeroTexto.literal);
                const tipoDadosElementar = tipoInferenciaParaTipoDadosElementar(
                    tipoInferido as TipoInferencia
                );
                return new Literal(
                    this.hashArquivo,
                    Number(simboloNumeroTexto.linha),
                    simboloNumeroTexto.literal,
                    tipoDadosElementar
                );

            case tiposDeSimbolos.PARA:
                const simboloPara = this.avancarEDevolverAnterior();
                return this.paraComoConstruto(simboloPara);
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
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
                    construto = this.expressao();
                }

                if (construto.constructor.name === 'AcessoMetodoOuPropriedade') {
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

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    protected resolverCadeiaChamadas(expressaoAnterior: Construto, tipoAnterior: string = 'qualquer') {
        if (!this.simbolos[this.atual]) {
            return expressaoAnterior;
        }

        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const chamada = this.finalizarChamada(expressaoAnterior, tipoAnterior);
                return this.resolverCadeiaChamadas(chamada);
            case tiposDeSimbolos.PONTO:
                this.avancarEDevolverAnterior();
                const nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome de método ou propriedade após '.'."
                );

                let tipoInferido = expressaoAnterior.tipo;
                // Se não for um dicionário anônimo (ou seja, ser variável ou constante com nome)
                if (expressaoAnterior.tipo === 'dicionário' && expressaoAnterior.constructor !== Dicionario) {
                    // TODO: Achar algum caso em que aqui não seja variável.
                    const nomeDicionario = (expressaoAnterior as Variavel).simbolo.lexema;
                    const elementoDicionarioPilha = this.pilhaEscopos.obterElementoMontaoTipos(nomeDicionario);
                    const referenciaMontaoTipos = this.montaoTipos.obterReferencia(
                        expressaoAnterior.hashArquivo, 
                        expressaoAnterior.linha, 
                        elementoDicionarioPilha.endereco
                    );

                    if (nome.lexema in referenciaMontaoTipos.subElementos) {
                        tipoInferido = referenciaMontaoTipos.subElementos[nome.lexema].tipo;
                    }
                }

                const acesso = new AcessoMetodoOuPropriedade(this.hashArquivo, expressaoAnterior, nome, tipoInferido);
                return this.resolverCadeiaChamadas(acesso, tipoInferido);
            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const indice = this.expressao();
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                const acessoVariavel = new AcessoIndiceVariavel(
                    this.hashArquivo,
                    expressaoAnterior,
                    indice,
                    simboloFechamento
                );
                return this.resolverCadeiaChamadas(acessoVariavel);
            default:
                return expressaoAnterior;
        }
    }

    override chamar(): Construto {
        let expressao = this.primario();
        return this.resolverCadeiaChamadas(expressao);
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

    override finalizarChamada(
        entidadeChamada: Construto,
        tipoPrimitiva: string | undefined = undefined
    ): Chamada {
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
                argumentos.push(this.expressao());
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

    override unario(): Construto {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.BIT_NOT,
                tiposDeSimbolos.INCREMENTAR,
                tiposDeSimbolos.DECREMENTAR
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            return new Unario(this.hashArquivo, operador, direito, 'ANTES');
        }

        return this.chamar();
    }

    override multiplicar(): Construto {
        let expressao = this.exponenciacao();

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
            const direito = this.exponenciacao();
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
    override adicaoOuSubtracao(): Construto {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.MENOS_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];

            const direito = this.multiplicar();
            // const tipoInferido = inferirTipoParaBinario(expressao, operador, direito);
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)) {
            const operador = this.simbolos[this.atual - 1];

            const direito = this.atribuir();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override bitShift(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.adicaoOuSubtracao();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override bitE(): Construto {
        let expressao = this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.bitShift();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override bitOu(): Construto {
        let expressao = this.bitE();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.bitE();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override comparar(): Construto {
        let expressao = this.bitOu();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.bitOu();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override em(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    override e(): Construto {
        let expressao = this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.em();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Método que resolve atribuições.
     * @returns Um construto do tipo `Atribuir`, `Conjunto` ou `AtribuicaoPorIndice`.
     */
    override atribuir(): Construto {
        const expressao = this.ou();

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
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const igual = this.simbolos[this.atual - 1];
            const valor = this.expressao();

            switch (expressao.constructor.name) {
                case 'Variavel':
                    return new Atribuir(this.hashArquivo, expressao, valor);
                case 'AcessoMetodoOuPropriedade':
                    const expressaoAcessoMetodoOuPropriedade =
                        expressao as AcessoMetodoOuPropriedade;
                    return new DefinirValor(
                        this.hashArquivo,
                        igual.linha,
                        expressaoAcessoMetodoOuPropriedade.objeto,
                        expressaoAcessoMetodoOuPropriedade.simbolo,
                        valor
                    );
                case 'AcessoIndiceVariavel':
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
    override expressaoLeia(): Leia {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos argumentos em instrução `leia`."
        );

        const argumentos: Construto[] = [];

        if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.PARENTESE_DIREITO) {
            do {
                argumentos.push(this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os argumentos em instrução `leia`."
        );

        return new Leia(simboloLeia, argumentos);
    }

    // TODO: Depreciar.
    override expressao(): Construto {
        return this.atribuir();
    }

    override blocoEscopo(): Array<Declaracao> {
        this.pilhaEscopos.empilhar(new InformacaoEscopo());
        let declaracoes: Array<Declaracao> = [];

        while (
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) &&
            !this.estaNoFinal()
        ) {
            const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
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

    protected logicaComumEnquanto() {
        const condicao = this.expressao();
        // TODO: Talvez não seja uma ideia melhor chamar o método de `Bloco` aqui?
        const corpo: Bloco = this.resolverDeclaracao() as Bloco;

        return {
            condicao,
            corpo
        };
    }

    override declaracaoEnquanto(): Enquanto {
        try {
            this.blocos += 1;

            const { condicao, corpo } = this.logicaComumEnquanto();

            return new Enquanto(condicao, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    protected declaracaoEscolha(): Escolha {
        try {
            this.blocos += 1;

            const condicao = this.expressao();
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

                    let declaracoes = [];
                    do {
                        const retornoDeclaracao = this.resolverDeclaracao();
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
                        declaracoes.push(this.resolverDeclaracao());
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

    override declaracaoEscreva(): Escreva {
        const simboloAtual = this.simbolos[this.atual];

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: Construto[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                argumentos.push(this.expressao());
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

    protected declaracaoExpressao(): Expressao {
        // Se há decoradores a serem adicionados aqui, obtemo-los agora,
        // para evitar que outros passos recursivos peguem-los antes.
        const decoradores = Array.from(this.pilhaDecoradores);
        this.pilhaDecoradores = [];

        const expressao = this.expressao();
        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Expressao(expressao, decoradores);
    }

    protected declaracaoFalhar(): Falhar {
        const simboloFalha: SimboloInterface = this.simbolos[this.atual - 1];
        return new Falhar(simboloFalha, this.declaracaoExpressao().expressao);
    }

    protected logicaComumFazer() {
        const caminhoFazer = this.resolverDeclaracao();
        this.consumir(
            tiposDeSimbolos.ENQUANTO,
            "Esperado declaração do 'enquanto' após o escopo do 'fazer'."
        );
        const condicaoEnquanto = this.expressao();

        return {
            caminhoFazer, 
            condicaoEnquanto
        }
    }

    protected declaracaoFazer(simboloFazer: SimboloInterface): Fazer {
        try {
            this.blocos += 1;

            const { caminhoFazer, condicaoEnquanto } = this.logicaComumFazer();
            return new Fazer(
                simboloFazer.hashArquivo,
                Number(simboloFazer.linha),
                caminhoFazer as any, // TODO: Aqui pode ser um `Bloco`?
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
    override declaracaoImportar(): Importar {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");
        const caminho = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new Importar(caminho as Literal);
    }

    override declaracaoPara(): Para | ParaCada {
        try {
            const simboloPara: SimboloInterface = this.simbolos[this.atual - 1];
            this.blocos += 1;

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CADA)) {
                return this.declaracaoParaCada(simboloPara);
            }

            return this.declaracaoParaTradicional(simboloPara);
        } finally {
            this.blocos -= 1;
        }
    }

    protected logicaParaCadaDicionario(simboloPara: SimboloInterface) {
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

        const dicionario = this.expressao();
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
        // TODO: Talvez não seja uma ideia melhor chamar o método de `Bloco` aqui?
        const corpo: Bloco = this.resolverDeclaracao() as Bloco;

        return {
            nomeVariavelChave, 
            nomeVariavelValor,
            dicionario,
            corpo
        }
    }

    protected declaracaoParaCadaDicionario(simboloPara: SimboloInterface) {
        const { nomeVariavelChave, nomeVariavelValor, dicionario, corpo } = this.logicaParaCadaDicionario(simboloPara);

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

    protected logicaComumParaCadaVetor(simboloPara: SimboloInterface) {
        const nomeVariavelIteracao = this.avancarEDevolverAnterior();
        const variavelIteracao = new Variavel(this.hashArquivo, nomeVariavelIteracao);

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução 'para cada'."
            );
        }

        let vetor = this.expressao();

        if (vetor.constructor === AcessoIndiceVariavel) {
            const construtoAcessoIndiceVariavel = vetor as AcessoIndiceVariavel;
            if (construtoAcessoIndiceVariavel.entidadeChamada.tipo === 'dicionário') {
                // A avaliação sintática não deve verificar valores de dicionários.
                // Aqui se supõe que o programador sabe o que está fazendo.
                // TODO: Talvez pensar numa forma melhor de fazer isso.
                (vetor as any).tipo = 'vetor';
            }
        }

        if (!vetor.hasOwnProperty('tipo')) {
            throw this.erro(
                simboloPara,
                `Variável ou constante em 'para cada' não parece possuir um tipo iterável.`
            );
        }

        const tipoVetor = (vetor as any).tipo as string;

        if (!tipoVetor.endsWith('[]') && !['dicionário', 'qualquer', 'vetor'].includes(tipoVetor)) {
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
        // TODO: Talvez não seja uma ideia melhor chamar o método de `Bloco` aqui?
        const corpo: Bloco = this.resolverDeclaracao() as Bloco;

        return {
            variavelIteracao, 
            vetor,
            corpo
        };
    }

    protected declaracaoParaCadaVetor(simboloPara: SimboloInterface) {
        const { variavelIteracao, vetor, corpo } = this.logicaComumParaCadaVetor(simboloPara);

        return new ParaCada(
            this.hashArquivo,
            Number(simboloPara.linha),
            variavelIteracao,
            vetor,
            corpo
        );
    }

    protected declaracaoParaCada(simboloPara: SimboloInterface): ParaCada {
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.IDENTIFICADOR)) {
            return this.declaracaoParaCadaVetor(simboloPara);
        }

        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            return this.declaracaoParaCadaDicionario(simboloPara);
        }

        throw this.erro(
            simboloPara,
            'Identificador de iteração deve ser ou um par chave-valor, ou um nome de variável.'
        );
    }

    protected logicaComumPara(simboloPara: SimboloInterface) {
        const comParenteses = this.verificarSeSimboloAtualEIgualA(
            tiposDeSimbolos.PARENTESE_ESQUERDO
        );

        let inicializador: Var | Expressao | Const[];
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            inicializador = null;
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL)) {
            inicializador = this.declaracaoDeVariaveis();
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONSTANTE)) {
            inicializador = this.declaracaoDeConstantes();
        } else {
            inicializador = this.declaracaoExpressao();
        }

        let condicao = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            condicao = this.expressao();
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        let incrementar = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            incrementar = this.expressao();
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

        // TODO: Talvez não seja uma ideia melhor chamar o método de `Bloco` aqui?
        const corpo: Bloco = this.resolverDeclaracao() as Bloco;

        return {
            inicializador,
            condicao,
            incrementar,
            corpo
        };
    }

    protected declaracaoParaTradicional(simboloPara: SimboloInterface): Para {
        const { inicializador, condicao, incrementar, corpo } = this.logicaComumPara(simboloPara);

        return new Para(
            this.hashArquivo,
            Number(simboloPara.linha),
            inicializador,
            condicao,
            incrementar,
            corpo
        );
    }

    override declaracaoRetorna(): Retorna {
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
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.NULO,
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                tiposDeSimbolos.SUPER,
                tiposDeSimbolos.TEXTO,
                tiposDeSimbolos.VERDADEIRO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            valor = this.expressao();
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Retorna(simboloChave, valor);
    }

    override declaracaoSe(): Se {
        const condicao = this.expressao();

        const caminhoEntao: Declaracao = this.resolverDeclaracao() as Declaracao;

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            caminhoSenao = this.resolverDeclaracao();
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

    override declaracaoTente(): Tente {
        const simboloTente: SimboloInterface = this.simbolos[this.atual - 1];
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'tente'.");

        const blocoTente: any[] = this.blocoEscopo();

        let blocoPegue: FuncaoConstruto | Declaracao[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                // Caso 1: com parâmetro de erro.
                // `pegue` recebe um `FuncaoConstruto`.
                blocoPegue = this.corpoDaFuncao('bloco `pegue`');
            } else {
                // Caso 2: sem parâmetro de erro.
                // `pegue` recebe um bloco.
                this.consumir(
                    tiposDeSimbolos.CHAVE_ESQUERDA,
                    "Esperado '{' após a declaração 'pegue'."
                );
                blocoPegue = this.blocoEscopo();
            }
        }

        let blocoSenao: any[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'senão'."
            );

            blocoSenao = this.blocoEscopo();
        }

        let blocoFinalmente: any[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'finalmente'."
            );

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

    protected resolverDecorador(): void {
        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.ARROBA)) {
            let nomeDecorador: string = '';
            let linha: number;
            let parametros: ParametroInterface[] = [];
            let parenteseEsquerdo = false;
            linha = this.simbolos[this.atual].linha;
            let simbolosLinhaAtual = this.simbolos.filter((l) => l.linha === linha);

            for (let simbolo of simbolosLinhaAtual) {
                parenteseEsquerdo = this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.PARENTESE_ESQUERDO
                );
                if (parenteseEsquerdo) {
                    if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                        parametros = this.logicaComumParametros();
                    }
                    this.consumir(
                        tiposDeSimbolos.PARENTESE_DIREITO,
                        "Esperado ')' após parâmetros."
                    );
                    break;
                }
                this.avancarEDevolverAnterior();
                nomeDecorador += simbolo.lexema || '.';
            }

            const atributos: { [key: string]: any } = {};
            for (const parametro of parametros) {
                if (parametro.nome.lexema in atributos) {
                    throw this.erro(
                        parametro.nome,
                        `Atributo de decorador declarado duas ou mais vezes: ${parametro.nome.lexema}`
                    );
                }

                atributos[parametro.nome.lexema] = parametro.valorPadrao;
            }

            this.pilhaDecoradores.push(
                new Decorador(this.hashArquivo, linha, nomeDecorador, atributos)
            );
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
    protected resolverDeclaracao(): Declaracao | Declaracao[] {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                const simboloInicioBloco: SimboloInterface = this.avancarEDevolverAnterior();
                return new Bloco(
                    simboloInicioBloco.hashArquivo,
                    Number(simboloInicioBloco.linha),
                    this.blocoEscopo()
                );
            case tiposDeSimbolos.COMENTARIO:
                return this.declaracaoComentarioUmaLinha();
            case tiposDeSimbolos.CONSTANTE:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeConstantes();
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                this.avancarEDevolverAnterior();
                return this.declaracaoEscolha();
            case tiposDeSimbolos.ESCREVA:
                this.avancarEDevolverAnterior();
                return this.declaracaoEscreva();
            case tiposDeSimbolos.FALHAR:
                this.avancarEDevolverAnterior();
                return this.declaracaoFalhar();
            case tiposDeSimbolos.FAZER:
                const simboloFazer = this.avancarEDevolverAnterior();
                return this.declaracaoFazer(simboloFazer);
            case tiposDeSimbolos.LINHA_COMENTARIO:
                return this.declaracaoComentarioMultilinha();
            case tiposDeSimbolos.PARA:
                this.avancarEDevolverAnterior();
                return this.declaracaoPara();
            case tiposDeSimbolos.PAUSA:
            case tiposDeSimbolos.SUSTAR:
                this.avancarEDevolverAnterior();
                return this.declaracaoSustar();
            case tiposDeSimbolos.SE:
                this.avancarEDevolverAnterior();
                return this.declaracaoSe();
            case tiposDeSimbolos.RETORNA:
                this.avancarEDevolverAnterior();
                return this.declaracaoRetorna();
            case tiposDeSimbolos.TENDO:
                this.avancarEDevolverAnterior();
                return this.declaracaoTendoComo();
            case tiposDeSimbolos.TENTE:
                this.avancarEDevolverAnterior();
                return this.declaracaoTente();
            case tiposDeSimbolos.VARIAVEL:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeVariaveis();
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

        return this.declaracaoExpressao();
    }

    protected declaracaoTendoComo(): TendoComo {
        const simboloTendo = this.simbolos[this.atual - 1];
        const expressaoInicializacao = this.expressao();
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
        switch (expressaoInicializacao.constructor.name) {
            case 'Chamada':
                const construtoChamada = expressaoInicializacao as Chamada;
                switch (construtoChamada.entidadeChamada.constructor.name) {
                    case 'Variavel':
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

        const blocoCorpo = this.blocoEscopo();
        return new TendoComo(
            simboloTendo.linha,
            simboloTendo.hashArquivo,
            simboloNomeVariavel,
            expressaoInicializacao,
            new Bloco(simboloTendo.linha, simboloTendo.hashArquivo, blocoCorpo)
        );
    }

    protected declaracaoDesestruturacaoVariavel(): Var[] {
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
        this.consumir(
            tiposDeSimbolos.IGUAL,
            'Esperado igual após relação de propriedades da desestruturação.'
        );

        const inicializador = this.expressao();
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
                        const tipoRetornoAcessoMetodoResolvido = entidadeChamadaAcessoMetodo.tipoRetornoMetodo.replace('<T>', entidadeChamadaAcessoMetodo.objeto.tipo);
                        return tipoRetornoAcessoMetodoResolvido;
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

    protected resolverValorConstruto(construto: Construto) {
        if (construto instanceof Literal) {
            return construto.valor;
        }

        throw this.erro(
            { hashArquivo: construto.hashArquivo, linha: construto.linha } as SimboloInterface, 
            `Construto do tipo ${construto.constructor.name} não possui um mapeamento de valor.`
        )
    }

    protected resolverInformacaoElementoSintaticoDeDicionario(construto: Construto): ElementoMontaoTipos {
        let retorno: ElementoMontaoTipos;
        if (construto instanceof Dicionario) {
            retorno = new ElementoMontaoTipos('dicionário');
            const subElementos = {};
            for (var i = 0; i < construto.valores.length; i++) {
                const chaveCorrespondente = this.resolverValorConstruto(construto.chaves[i]);
                const valorCorrespondente = construto.valores[i];
                subElementos[chaveCorrespondente] = this.resolverInformacaoElementoSintaticoDeDicionario(valorCorrespondente);
            }

            retorno.subElementos = subElementos;
            const endereco = this.montaoTipos.adicionarReferencia(retorno);
            retorno.endereco = endereco;
        } else {
            retorno = new ElementoMontaoTipos(construto.tipo);
        }
        
        return retorno;
    }

    /**
     * Caso símbolo atual seja `var`, devolve uma declaração de variável.
     * @returns Um Construto do tipo Var.
     */
    protected declaracaoDeVariaveis(): Var[] {
        const simboloVariavel = this.simboloAnterior();
        const identificadores: SimboloInterface[] = [];
        const retorno: Var[] = [];
        let tipo: string = 'qualquer';

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            return this.declaracaoDesestruturacaoVariavel();
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

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
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
            inicializadores.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (identificadores.length !== inicializadores.length) {
            throw this.erro(
                simboloVariavel,
                'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
            );
        }

        for (let [indice, identificador] of identificadores.entries()) {
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
                    Array.from(this.pilhaDecoradores)
                )
            );
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        this.pilhaDecoradores = [];
        return retorno;
    }

    protected declaracaoDesestruturacaoConstante(): Const[] {
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
        this.consumir(
            tiposDeSimbolos.IGUAL,
            'Esperado igual após relação de propriedades da desestruturação.'
        );

        const inicializador = this.expressao();
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
    declaracaoDeConstantes(): Const[] {
        const simboloConstante = this.simboloAnterior();
        const identificadores: SimboloInterface[] = [];
        let tipo: string = 'qualquer';

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            return this.declaracaoDesestruturacaoConstante();
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

        this.consumir(
            tiposDeSimbolos.IGUAL,
            "Esperado '=' após identificador em instrução 'constante'."
        );

        const inicializadores = [];
        do {
            inicializadores.push(this.expressao());
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
                    tipo as TipoDadosElementar,
                    tipoExplicito,
                    Array.from(this.pilhaDecoradores)
                )
            );
        }

        this.pilhaDecoradores = [];
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return retorno;
    }

    protected funcao(tipo: string): FuncaoDeclaracao {
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

        const corpoDaFuncao = this.corpoDaFuncao(tipo);
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

    protected logicaComumParametros(): ParametroInterface[] {
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
                const valorPadrao = this.primario();
                parametro.valorPadrao = valorPadrao;
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
                let tipoDadoParametro = this.verificarDefinicaoTipoAtual();
                parametro.tipoDado = tipoDadoParametro;
                this.avancarEDevolverAnterior();
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

    override corpoDaFuncao(tipo: string): FuncaoConstruto {
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
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            tipoRetorno = this.verificarDefinicaoTipoAtual();
            this.avancarEDevolverAnterior();
            definicaoExplicitaDeTipo = true;
        }

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, `Esperado '{' antes do escopo do ${tipo}.`);

        const corpo = this.blocoEscopo();
        let expressoesRetorna: Retorna[] = [];
        for (const declaracao of corpo) {
            expressoesRetorna = expressoesRetorna.concat(buscarRetornos(declaracao));
        }

        if (tipoRetorno === 'vazio' && expressoesRetorna.length > 0) {
            const retornosNaoVazios = expressoesRetorna.filter((e) => e.tipo !== 'vazio');
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

    override declaracaoDeClasse(): Classe {
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
            // TODO: Validar classes existentes?
            this.superclasseAtual = simboloSuperclasse.lexema;
            // TODO: Colocar tipo aqui?
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
                this.resolverDecorador();
                continue;
            }

            // Se o próximo símbolo ao atual for um parênteses, é um método.
            // Caso contrário, é uma propriedade.
            const proximoSimbolo = this.simbolos[this.atual + 1];
            switch (proximoSimbolo.tipo) {
                case tiposDeSimbolos.PARENTESE_ESQUERDO:
                    metodos.push(this.funcao('método'));
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
     * @see resolverDecorador
     */
    override resolverDeclaracaoForaDeBloco(): Declaracao | Declaracao[] {
        try {
            while (this.verificarTipoSimboloAtual(tiposDeSimbolos.ARROBA)) {
                this.resolverDecorador();
            }

            if (
                (this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.avancarEDevolverAnterior();
                return this.funcao('funcao');
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE)) {
                return this.declaracaoDeClasse();
            }

            return this.resolverDeclaracao();
        } catch (erro: any) {
            this.sincronizar();
            this.erros.push(erro);
            return null;
        }
    }

    /**
     * Usado quando há erros na avaliação sintática.
     * Garante que o código não entre em loop infinito.
     * @returns Sempre retorna `void`.
     */
    protected sincronizar(): void {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            const tipoSimboloAtual: string = this.simbolos[this.atual - 1].tipo;

            switch (tipoSimboloAtual) {
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

    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
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
            this.resolverDecorador();
            const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
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
