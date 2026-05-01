import {
    AcessoIndiceVariavel,
    AcessoIntervaloVariavel,
    AcessoMetodo,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    Atribuir,
    Chamada,
    ComentarioComoConstruto,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    Separador,
    Super,
    TipoDe,
    Tupla,
    TuplaN,
    Unario,
    Variavel,
} from '../../../construtos';
import {
    Bloco,
    CabecalhoPrograma,
    Classe,
    Comentario,
    Const,
    ConstMultiplo,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    TendoComo,
    Tente,
    TextoDocumentacao,
    Var,
    VarMultiplo,
} from '../../../declaracoes';
import { EspacoMemoria } from '../../espaco-memoria';
import { ConstrutoInterface } from '../../../interfaces/construtos/construto-interface';
import { Chamavel, FuncaoPadrao, ObjetoPadrao } from '../../estruturas';
import { ArgumentoInterface } from '../../argumento-interface';
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import {
    InterpretadorInterface,
    ResultadoParcialInterpretadorInterface,
    SimboloInterface,
    VariavelInterface,
} from '../../../interfaces';
import { ErroInterpretadorInterface } from '../../../interfaces/erros/erro-interpretador-interface';
import { EscopoExecucaoInterface } from '../../../interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '../../../interfaces/pilha-escopos-execucao-interface';
import { RetornoInterpretadorInterface } from '../../../interfaces/retornos';
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from '../../../quebras';
import { PilhaEscoposExecucao } from '../../pilha-escopos-execucao';
import { inferirTipoVariavel } from '../../../inferenciador';
import { InicioAlgoritmo } from '../../../declaracoes/inicio-algoritmo';

import tiposDeSimbolos from '../../../tipos-de-simbolos/portugol-ipt';

export class InterpretadorPortugolIpt implements InterpretadorInterface {
    diretorioBase: any;

    funcaoDeRetorno: Function = null;
    funcaoDeRetornoMesmaLinha: Function = null;

    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;

    declaracoes: Declaracao[];
    erros: ErroInterpretadorInterface[];

    hashArquivoDeclaracaoAtual: number;
    linhaDeclaracaoAtual: number;
    classeAtualEmExecucao: any = null;

    resultadoInterpretador: ResultadoParcialInterpretadorInterface[] = [];

    constructor(
        diretorioBase: string,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        this.diretorioBase = diretorioBase;

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.funcaoDeRetornoMesmaLinha =
            funcaoDeRetornoMesmaLinha || process.stdout.write.bind(process.stdout);

        this.erros = [];
        this.declaracoes = [];

        this.pilhaEscoposExecucao = new PilhaEscoposExecucao();
        const escopoExecucao: EscopoExecucaoInterface = {
            declaracoes: [],
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
    }

    // ── Utilitários ─────────────────────────────────────────────────────────────

    resolverValor(objeto: any) {
        if (objeto === null || objeto === undefined) return objeto;
        if (objeto.hasOwnProperty('valor')) return objeto.valor;
        return objeto;
    }

    eVerdadeiro(objeto: any): boolean {
        if (objeto === null) return false;
        if (typeof objeto === 'boolean') return Boolean(objeto);
        if (objeto.hasOwnProperty('valor')) return Boolean(objeto.valor);
        return true;
    }

    protected eIgual(esquerda: any, direita: any): boolean {
        if (esquerda === null && direita === null) return true;
        if (esquerda === null) return false;
        return esquerda === direita;
    }

    protected verificarOperandosNumeros(
        operador: SimboloInterface,
        direita: VariavelInterface | any,
        esquerda: VariavelInterface | any
    ): void {
        const valorDireita = this.resolverValor(direita);
        const valorEsquerda = this.resolverValor(esquerda);
        const tipoDireita: string =
            direita?.tipo ?? (typeof valorDireita === 'number' ? 'número' : String(NaN));
        const tipoEsquerda: string =
            esquerda?.tipo ?? (typeof valorEsquerda === 'number' ? 'número' : String(NaN));
        const tiposNumericos = ['inteiro', 'numero', 'número', 'real'];

        const eNumericoOuQualquer = (tipo: string, valor: any) =>
            tiposNumericos.includes(tipo.toLowerCase()) ||
            (tipo === 'qualquer' && typeof valor === 'number');

        if (
            eNumericoOuQualquer(tipoDireita, valorDireita) &&
            eNumericoOuQualquer(tipoEsquerda, valorEsquerda)
        )
            return;
        throw new ErroEmTempoDeExecucao(
            operador,
            'Operadores precisam ser números.',
            operador.linha
        );
    }

    paraTexto(objeto: any) {
        if (objeto === null || objeto === undefined) return 'nulo';
        if (typeof objeto === 'boolean') return objeto ? 'verdadeiro' : 'falso';
        if (objeto instanceof Date) {
            return Intl.DateTimeFormat('pt', { dateStyle: 'full', timeStyle: 'full' }).format(
                objeto
            );
        }
        if (Array.isArray(objeto)) return objeto;
        if (objeto.valor instanceof ObjetoPadrao) return objeto.valor.paraTexto();
        if (typeof objeto === 'object') return JSON.stringify(objeto);
        return objeto.toString();
    }

    // ── Expressões ──────────────────────────────────────────────────────────────

    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        return Promise.resolve(expressao.valor);
    }

    async visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> {
        return await this.avaliar(expressao.expressao);
    }

    async visitarExpressaoBinaria(expressao: any): Promise<any> {
        try {
            const esquerda: VariavelInterface | any = await this.avaliar(expressao.esquerda);
            const direita: VariavelInterface | any = await this.avaliar(expressao.direita);
            const valorEsquerdo: any = this.resolverValor(esquerda);
            const valorDireito: any = this.resolverValor(direita);
            const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo')
                ? esquerda.tipo
                : inferirTipoVariavel(esquerda);
            const tipoDireito: string = direita?.hasOwnProperty('tipo')
                ? direita.tipo
                : inferirTipoVariavel(direita);

            const tiposNumericos = ['inteiro', 'numero', 'número', 'real'];
            const ambosNumericos =
                (tiposNumericos.includes(tipoEsquerdo) ||
                    (tipoEsquerdo === 'qualquer' && typeof valorEsquerdo === 'number')) &&
                (tiposNumericos.includes(tipoDireito) ||
                    (tipoDireito === 'qualquer' && typeof valorDireito === 'number'));

            switch (expressao.operador.tipo) {
                case tiposDeSimbolos.EXPONENCIACAO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Math.pow(valorEsquerdo, valorDireito);

                case tiposDeSimbolos.MAIOR:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) > Number(valorDireito);

                case tiposDeSimbolos.MAIOR_IGUAL:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) >= Number(valorDireito);

                case tiposDeSimbolos.MENOR:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) < Number(valorDireito);

                case tiposDeSimbolos.MENOR_IGUAL:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) <= Number(valorDireito);

                case tiposDeSimbolos.SUBTRACAO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) - Number(valorDireito);

                case tiposDeSimbolos.ADICAO:
                    if (ambosNumericos) {
                        return Number(valorEsquerdo) + Number(valorDireito);
                    }
                    return String(valorEsquerdo) + String(valorDireito);

                case tiposDeSimbolos.DIVISAO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) / Number(valorDireito);

                case tiposDeSimbolos.DIVISAO_INTEIRA:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

                case tiposDeSimbolos.MULTIPLICACAO:
                    if (tipoEsquerdo === 'texto' || tipoDireito === 'texto') {
                        if (tipoEsquerdo === 'texto' && tipoDireito === 'texto') {
                            return Number(valorEsquerdo) * Number(valorDireito);
                        }
                        if (tipoEsquerdo === 'texto')
                            return valorEsquerdo.repeat(Number(valorDireito));
                        return valorDireito.repeat(Number(valorEsquerdo));
                    }
                    return Number(valorEsquerdo) * Number(valorDireito);

                case tiposDeSimbolos.MODULO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) % Number(valorDireito);

                case tiposDeSimbolos.DIFERENTE:
                    return !this.eIgual(valorEsquerdo, valorDireito);

                case tiposDeSimbolos.IGUAL:
                    return this.eIgual(valorEsquerdo, valorDireito);
            }
        } catch (erro: any) {
            return Promise.reject(erro);
        }
    }

    async visitarExpressaoLogica(expressao: Logico): Promise<any> {
        const esquerda = await this.avaliar(expressao.esquerda);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.OU:
                if (this.eVerdadeiro(esquerda)) return true;
                return this.eVerdadeiro(await this.avaliar(expressao.direita));

            case tiposDeSimbolos.XOU: {
                const ve = this.eVerdadeiro(esquerda);
                const vd = this.eVerdadeiro(await this.avaliar(expressao.direita));
                return ve !== vd;
            }

            case tiposDeSimbolos.E:
                if (!this.eVerdadeiro(esquerda)) return false;
                return this.eVerdadeiro(await this.avaliar(expressao.direita));
        }

        return await this.avaliar(expressao.direita);
    }

    async visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        const operando = await this.avaliar(expressao.operando);
        const valor = this.resolverValor(operando);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.SUBTRACAO:
                return -Number(valor);
            case tiposDeSimbolos.NEGACAO:
            case tiposDeSimbolos.NAO:
                return !this.eVerdadeiro(valor);
        }

        throw new ErroEmTempoDeExecucao(
            expressao.operador,
            `Operador unário desconhecido: ${expressao.operador.lexema}`,
            expressao.operador.linha
        );
    }

    async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        const valor = await this.avaliar(expressao.valor);
        const valorFinal = this.resolverValor(valor);
        const alvo = expressao.alvo as Variavel;
        this.pilhaEscoposExecucao.atribuirVariavel(alvo.simbolo, valorFinal);
        return valorFinal;
    }

    visitarExpressaoDeVariavel(expressao: Variavel): any {
        return this.pilhaEscoposExecucao.obterValorVariavel(expressao.simbolo);
    }

    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        for (const arg of expressao.argumentos) {
            const resposta = await new Promise<any>((resolve) =>
                this.interfaceEntradaSaida.question('> ', (r: any) => resolve(r))
            );

            // arg é um Expressao (declaração) envolvendo um Variavel
            const construto = (arg as any) instanceof Expressao ? (arg as any).expressao : arg;

            if (construto instanceof Variavel) {
                const valorConvertido =
                    typeof resposta === 'string' && !Number.isNaN(Number(resposta))
                        ? Number(resposta)
                        : resposta;
                this.pilhaEscoposExecucao.atribuirVariavel(construto.simbolo, valorConvertido);
            }
        }
        return null;
    }

    async visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<string> {
        const conteudo: VariavelInterface | any = await this.avaliar(declaracao.expressao);
        const valorConteudo: any = this.resolverValor(conteudo);
        const tipoConteudo: string = conteudo.hasOwnProperty('tipo')
            ? conteudo.tipo
            : typeof conteudo;

        let resultado = valorConteudo;
        if (['número', 'number'].includes(tipoConteudo) && declaracao.casasDecimais > 0) {
            resultado = valorConteudo.toLocaleString('pt', {
                maximumFractionDigits: declaracao.casasDecimais,
            });
        }
        if (declaracao.espacos > 0) resultado += ' '.repeat(declaracao.espacos);
        return resultado;
    }

    // ── Acesso a vetores ────────────────────────────────────────────────────────

    async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> {
        const objetoAvaliado = await this.avaliar(expressao.entidadeChamada);
        const indiceAvaliado = await this.avaliar(expressao.indice);

        const objeto = this.resolverValor(objetoAvaliado);
        const indice = this.resolverValor(indiceAvaliado);

        if (Array.isArray(objeto)) {
            if (indice < 0 || indice >= objeto.length) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice do vetor fora do intervalo.',
                        expressao.linha
                    )
                );
            }
            return objeto[indice];
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                expressao.simboloFechamento,
                'Acesso por índice só é suportado em vetores.',
                expressao.linha
            )
        );
    }

    async visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        const objetoAvaliado = await this.avaliar(expressao.objeto);
        const indiceAvaliado = await this.avaliar(expressao.indice);
        const valorAvaliado = await this.avaliar(expressao.valor);

        const objeto = this.resolverValor(objetoAvaliado);
        const indice = this.resolverValor(indiceAvaliado);
        const valor = this.resolverValor(valorAvaliado);

        if (Array.isArray(objeto)) {
            objeto[indice] = valor;
            return valor;
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                'Atribuição por índice só é suportada em vetores.',
                expressao.linha
            )
        );
    }

    // ── Chamadas de funções embutidas ───────────────────────────────────────────

    async visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        const callee = expressao.entidadeChamada;
        if (!(callee instanceof Variavel)) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(null, 'Chamada de função inválida.', expressao.linha)
            );
        }

        const nome = callee.simbolo.lexema.toUpperCase();
        const args: any[] = [];
        for (const arg of expressao.argumentos) {
            args.push(this.resolverValor(await this.avaliar(arg)));
        }

        return this.chamarFuncaoEmbutida(nome, args, expressao.linha);
    }

    private chamarFuncaoEmbutida(nome: string, args: any[], linha: number): any {
        switch (nome) {
            // ── 0 argumentos ──
            case 'ALEATORIO':
                return Math.random();

            // ── 1 argumento ──
            case 'SEN':
                return Math.sin(args[0]);
            case 'COS':
                return Math.cos(args[0]);
            case 'TAN':
                return Math.tan(args[0]);
            case 'CTG':
                return 1 / Math.tan(args[0]);
            case 'ASEN':
                return Math.asin(args[0]);
            case 'ACOS':
                return Math.acos(args[0]);
            case 'ATAN':
                return Math.atan(args[0]);
            case 'ACTG':
                return 1 / Math.atan(args[0]);
            case 'SENH':
                return Math.sinh(args[0]);
            case 'COSH':
                return Math.cosh(args[0]);
            case 'TANH':
                return Math.tanh(args[0]);
            case 'CTGH':
                return 1 / Math.tanh(args[0]);
            case 'EXP':
                return Math.exp(args[0]);
            case 'ABS':
                return Math.abs(args[0]);
            case 'RAIZ':
                return Math.sqrt(args[0]);
            case 'LOG':
                return Math.log10(args[0]);
            case 'LN':
                return Math.log(args[0]);
            case 'INT':
                return Math.trunc(args[0]);
            case 'FRAC':
                return args[0] - Math.trunc(args[0]);
            case 'ARRED':
                return Math.round(args[0]);

            // ── 2 argumentos ──
            case 'POTENCIA':
                return Math.pow(args[0], args[1]);

            // ── Texto ──
            case 'COMPRIMENTO':
                return String(args[0]).length;
            case 'LETRA':
                return String(args[0]).charAt(Number(args[1]));

            default:
                throw new ErroEmTempoDeExecucao(
                    null,
                    `Função embutida desconhecida: '${nome}'.`,
                    linha
                );
        }
    }

    // ── Declarações ─────────────────────────────────────────────────────────────

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return declaracao.expressao.aceitar(this);
    }

    async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscreva(declaracao.argumentos);
            this.funcaoDeRetorno(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });
        }
    }

    async visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscreva(declaracao.argumentos);
            this.funcaoDeRetornoMesmaLinha(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });
        }
    }

    protected async avaliarArgumentosEscreva(argumentos: ConstrutoInterface[]): Promise<string> {
        let formatoTexto = '';
        for (const argumento of argumentos) {
            const resultado = await this.avaliar(argumento);
            formatoTexto += `${this.paraTexto(this.resolverValor(resultado))} `;
        }
        return formatoTexto.trimEnd();
    }

    async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        let valorFinal = null;
        if (declaracao.inicializador !== null) {
            const avaliado = await this.avaliar(declaracao.inicializador);
            if (avaliado !== null && avaliado !== undefined) {
                valorFinal = this.resolverValor(avaliado);
            }
        }
        this.pilhaEscoposExecucao.definirVariavel(
            declaracao.simbolo.lexema,
            valorFinal,
            declaracao.tipo
        );
        return null;
    }

    async visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        let valorFinal = null;
        if (declaracao.inicializador !== null) {
            const avaliado = await this.avaliar(declaracao.inicializador);
            if (avaliado !== null && avaliado !== undefined) {
                valorFinal = this.resolverValor(avaliado);
            }
        }
        this.pilhaEscoposExecucao.definirConstante(
            declaracao.simbolo.lexema,
            valorFinal,
            declaracao.tipo
        );
        return null;
    }

    async visitarDeclaracaoSe(declaracao: Se): Promise<any> {
        if (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            return await this.executar(declaracao.caminhoEntao);
        }
        if (declaracao.caminhoSenao !== null) {
            return await this.executar(declaracao.caminhoSenao);
        }
        return null;
    }

    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        while (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            try {
                const resultado = await this.executar(declaracao.corpo);
                if (resultado instanceof SustarQuebra) return null;
                if (resultado instanceof ContinuarQuebra) continue;
                if (resultado instanceof Quebra) break;
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }
        }
        return null;
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        const inicializador = Array.isArray(declaracao.inicializador)
            ? declaracao.inicializador[0]
            : declaracao.inicializador;

        if (inicializador) await this.avaliar(inicializador);

        while (true) {
            if (declaracao.condicao && !this.eVerdadeiro(await this.avaliar(declaracao.condicao)))
                break;

            try {
                const resultado = await this.executar(declaracao.corpo);
                if (resultado instanceof SustarQuebra) return null;
                if (resultado instanceof ContinuarQuebra) {
                    /* continua para incremento */
                } else if (resultado instanceof Quebra) break;
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }

            if (declaracao.incrementar) await this.avaliar(declaracao.incrementar);
        }
        return null;
    }

    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        do {
            try {
                const resultado = await this.executar(declaracao.caminhoFazer);
                if (resultado instanceof SustarQuebra) return null;
                if (resultado instanceof ContinuarQuebra) continue;
                if (resultado instanceof Quebra) break;
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }
        } while (this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto)));
        return null;
    }

    async visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> {
        const valorCondicao = this.resolverValor(
            await this.avaliar(declaracao.identificadorOuLiteral)
        );
        let encontrado = false;

        for (const caminho of declaracao.caminhos) {
            for (const condicao of caminho.condicoes) {
                const valorCondicaoAvaliado = this.resolverValor(await this.avaliar(condicao));
                if (valorCondicaoAvaliado === valorCondicao) {
                    encontrado = true;
                    await this.executarBloco(caminho.declaracoes);
                    break;
                }
            }
            if (encontrado) break;
        }

        if (!encontrado && declaracao.caminhoPadrao) {
            await this.executarBloco(declaracao.caminhoPadrao.declaracoes);
        }
        return null;
    }

    visitarDeclaracaoComentario(declaracao: Comentario): Promise<any> {
        return Promise.resolve();
    }

    // ── Bloco e escopo ───────────────────────────────────────────────────────────

    async executarBloco(declaracoes: Declaracao[], ambiente?: EspacoMemoria): Promise<any> {
        const escopoExecucao: EscopoExecucaoInterface = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            espacoMemoria: ambiente || new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        return await this.executarUltimoEscopo();
    }

    async visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        return await this.executarBloco(declaracao.declaracoes);
    }

    // ── Métodos obrigatórios da interface não usados em Portugol IPT ────────────

    /* istanbul ignore next */
    visitarExpressaoTuplaN(_expressao: TuplaN): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoAcessoIntervaloVariavel(
        _expressao: AcessoIntervaloVariavel
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoTextoDocumentacao(_declaracao: TextoDocumentacao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoSeparador(_expressao: any): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoComentario(_expressao: ComentarioComoConstruto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoArgumentoReferenciaFuncao(
        _expressao: ArgumentoReferenciaFuncao
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoReferenciaFuncao(_expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoAcessoMetodo(_expressao: AcessoMetodo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoAcessoPropriedade(_expressao: AcessoPropriedade): Promise<any> | void {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoTendoComo(_declaracao: TendoComo): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoInicioAlgoritmo(_declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoCabecalhoPrograma(_declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoTupla(_expressao: Tupla): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoAcessoElementoMatriz(_expressao: any): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoAtribuicaoPorIndicesMatriz(_expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoExpressaoRegular(_expressao: ExpressaoRegular): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoTipoDe(_expressao: TipoDe): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoFalhar(_expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoParaCada(_declaracao: ParaCada): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoVarMultiplo(_declaracao: VarMultiplo): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoConstMultiplo(_declaracao: ConstMultiplo): Promise<any> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoContinua(_declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoSustar(_declaracao?: Sustar): SustarQuebra {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoRetornar(_declaracao: Retorna): Promise<RetornoQuebra> {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoFuncaoConstruto(_expressao: any): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoDefinirValor(_expressao: any): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoDefinicaoFuncao(_declaracao: FuncaoDeclaracao): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoClasse(_declaracao: Classe): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoAcessoMetodoOuPropriedade(_expressao: any): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoIsto(_expressao: any): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoDicionario(_expressao: any): never {
        throw new Error('Método não implementado.');
    }
    async visitarExpressaoVetor(expressao: any): Promise<any[]> {
        const valores: any[] = [];
        for (const elemento of expressao.valores) {
            const avaliado = await this.avaliar(elemento);
            valores.push(this.resolverValor(avaliado));
        }
        return valores;
    }
    /* istanbul ignore next */
    visitarExpressaoSuper(_expressao: Super): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarExpressaoFimPara(_declaracao: FimPara): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoTente(_declaracao: Tente): never {
        throw new Error('Método não implementado.');
    }
    /* istanbul ignore next */
    visitarDeclaracaoImportar(_declaracao: Importar): never {
        throw new Error('Método não implementado.');
    }

    // ── Motor de execução ────────────────────────────────────────────────────────

    async avaliar(expressao: ConstrutoInterface | Declaracao): Promise<any> {
        return await expressao.aceitar(this);
    }

    protected procurarVariavel(simbolo: SimboloInterface): any {
        return this.pilhaEscoposExecucao.obterValorVariavel(simbolo);
    }

    async executar(declaracao: Declaracao, mostrarResultado = false): Promise<any> {
        const resultado: any = await declaracao.aceitar(this);
        if (mostrarResultado) this.funcaoDeRetorno(this.paraTexto(resultado));
        if (resultado || typeof resultado === 'boolean') {
            this.resultadoInterpretador.push(this.paraTexto(resultado));
        }
        return resultado;
    }

    async executarUltimoEscopo(manterAmbiente = false): Promise<any> {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        try {
            let retornoExecucao: any;
            for (
                ;
                !(retornoExecucao instanceof Quebra) &&
                ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                retornoExecucao = await this.executar(
                    ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
                );
            }
            return retornoExecucao;
        } catch (erro: any) {
            return Promise.reject(erro);
        } finally {
            this.pilhaEscoposExecucao.removerUltimo();
            if (manterAmbiente) {
                const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                escopoAnterior.espacoMemoria.valores = Object.assign(
                    escopoAnterior.espacoMemoria.valores,
                    ultimoEscopo.espacoMemoria.valores
                );
            }
        }
    }

    async executarChamavel(chamavel: Chamavel, argumentos: any[]): Promise<any> {
        if (chamavel instanceof FuncaoPadrao) {
            return chamavel.chamar(this, argumentos, null);
        }
        const argumentosFormatados: ArgumentoInterface[] = argumentos.map((valor) => ({
            nome: null,
            valor,
        }));
        return chamavel.chamar(this, argumentosFormatados, null);
    }

    async interpretar(
        declaracoes: Declaracao[],
        manterAmbiente?: boolean
    ): Promise<RetornoInterpretadorInterface> {
        this.erros = [];

        const escopoExecucao: EscopoExecucaoInterface = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        try {
            const retornoOuErro = await this.executarUltimoEscopo(manterAmbiente);
            if (retornoOuErro instanceof ErroEmTempoDeExecucao) {
                this.erros.push(retornoOuErro);
            }
        } catch (erro: any) {
            this.erros.push(erro);
        } finally {
            const retorno = {
                erros: this.erros,
                resultado: this.resultadoInterpretador,
            } as RetornoInterpretadorInterface;
            this.resultadoInterpretador = [];
            return retorno;
        }
    }
}


