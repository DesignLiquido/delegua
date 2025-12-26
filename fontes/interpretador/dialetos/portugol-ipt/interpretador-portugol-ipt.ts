import {
    AcessoIntervaloVariavel,
    AcessoMetodo,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    Atribuir,
    ComentarioComoConstruto,
    Construto,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    Leia,
    Literal,
    ReferenciaFuncao,
    Separador,
    Super,
    TipoDe,
    Tupla,
    TuplaN,
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
import { ObjetoPadrao } from '../../estruturas';
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import {
    InterpretadorInterface,
    ResultadoParcialInterpretadorInterface,
    SimboloInterface,
    VariavelInterface,
} from '../../../interfaces';
import { ErroInterpretador } from '../../../interfaces/erros/erro-interpretador';
import { EscopoExecucao } from '../../../interfaces/escopo-execucao';
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
    erros: ErroInterpretador[];

    hashArquivoDeclaracaoAtual: number;
    linhaDeclaracaoAtual: number;

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
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
    }
    
    /* istanbul ignore next */
    visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    resolverValor(objeto: any) {
        if (objeto === null || objeto === undefined) {
            return objeto;
        }

        if (objeto.hasOwnProperty('valor')) {
            return objeto.valor;
        }

        return objeto;
    }

    /* istanbul ignore next */
    visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoComentario(declaracao: Comentario): Promise<any> {
        return Promise.resolve();
    }

    /* istanbul ignore next */
    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoElementoMatriz(expressao: any): never {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /* istanbul ignore next */
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        return Promise.resolve(expressao.valor);
    }

    async avaliar(expressao: Construto | Declaracao): Promise<any> {
        // Descomente o código abaixo quando precisar detectar expressões undefined ou nulas.
        // Por algum motivo o depurador do VSCode não funciona direito aqui
        // com breakpoint condicional.
        /* if (expressao === null || expressao === undefined) {
            console.log('Aqui');
        } */

        return await expressao.aceitar(this);
    }

    async visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> {
        return await this.avaliar(expressao.expressao);
    }

    /* istanbul ignore next */
    visitarExpressaoUnaria(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /**
     * Verifica se operandos são números, que podem ser tanto variáveis puras do JavaScript
     * (neste caso, `number`), ou podem ser variáveis de Delégua com inferência (`VariavelInterface`).
     * @param operador O símbolo do operador.
     * @param direita O operando direito.
     * @param esquerda O operando esquerdo.
     * @returns Se ambos os operandos são números ou não.
     */
    protected verificarOperandosNumeros(
        operador: SimboloInterface,
        direita: VariavelInterface | any,
        esquerda: VariavelInterface | any
    ): void {
        const tipoDireita: string = direita.tipo
            ? direita.tipo
            : typeof direita === 'number'
              ? 'número'
              : String(NaN);
        const tipoEsquerda: string = esquerda.tipo
            ? esquerda.tipo
            : typeof esquerda === 'number'
              ? 'número'
              : String(NaN);
        const tiposNumericos = ['inteiro', 'numero', 'número', 'real'];
        if (
            tiposNumericos.includes(tipoDireita.toLowerCase()) &&
            tiposNumericos.includes(tipoEsquerda.toLowerCase())
        )
            return;
        throw new ErroEmTempoDeExecucao(
            operador,
            'Operadores precisam ser números.',
            operador.linha
        );
    }

    protected eIgual(esquerda: VariavelInterface | any, direita: VariavelInterface | any): boolean {
        if (esquerda === null && direita === null) return true;
        if (esquerda === null) return false;
        return esquerda === direita;
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
                    if (tipoEsquerdo === 'número' && tipoDireito === 'número') {
                        return Number(valorEsquerdo) + Number(valorDireito);
                    } else {
                        return String(valorEsquerdo) + String(valorDireito);
                    }

                case tiposDeSimbolos.DIVISAO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) / Number(valorDireito);

                case tiposDeSimbolos.DIVISAO_INTEIRA:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

                case tiposDeSimbolos.MULTIPLICACAO:
                    if (tipoEsquerdo === 'texto' || tipoDireito === 'texto') {
                        // Sem ambos os valores resolvem como texto, multiplica normal.
                        // Se apenas um resolve como texto, o outro repete o
                        // texto n vezes, sendo n o valor do outro.
                        if (tipoEsquerdo === 'texto' && tipoDireito === 'texto') {
                            return Number(valorEsquerdo) * Number(valorDireito);
                        }

                        if (tipoEsquerdo === 'texto') {
                            return valorEsquerdo.repeat(Number(valorDireito));
                        }

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

    /* istanbul ignore next */
    visitarExpressaoDeChamada(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoDeAtribuicao(expressao: Atribuir): never {
        throw new Error('Método não implementado');
    }

    protected procurarVariavel(simbolo: SimboloInterface): any {
        return this.pilhaEscoposExecucao.obterValorVariavel(simbolo);
    }

    visitarExpressaoDeVariavel(expressao: Variavel): any {
        return this.procurarVariavel(expressao.simbolo);
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return declaracao.expressao.aceitar(this);
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        const mensagem =
            expressao.argumentos && expressao.argumentos[0] ? expressao.argumentos[0].valor : '> ';
        return new Promise((resolucao) =>
            this.interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                resolucao(resposta);
            })
        );
    }

    /* istanbul ignore next */
    visitarExpressaoLogica(expressao: any): never {
        throw new Error('Método não implementado');
    }

    eVerdadeiro(objeto: any): boolean {
        if (objeto === null) return false;
        if (typeof objeto === 'boolean') return Boolean(objeto);
        if (objeto.hasOwnProperty('valor')) {
            return Boolean(objeto.valor);
        }

        return true;
    }

    /**
     * Executa uma expressão Se, que tem uma condição, pode ter um bloco
     * Senão, e múltiplos blocos Senão-se.
     * @param declaracao A declaração Se.
     * @returns O resultado da avaliação do bloco cuja condição é verdadeira.
     */
    async visitarDeclaracaoSe(declaracao: Se): Promise<any> {
        if (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            return await this.executar(declaracao.caminhoEntao);
        }

        if (declaracao.caminhoSenao !== null) {
            return await this.executar(declaracao.caminhoSenao);
        }

        return null;
    }

    /* istanbul ignore next */
    visitarDeclaracaoPara(declaracao: Para) {
        return Promise.reject('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoFimPara(declaracao: FimPara): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoFazer(declaracao: Fazer): never {
        throw new Error('Método não implementado');
    }

    async visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<string> {
        let resultado = '';
        const conteudo: VariavelInterface | any = await this.avaliar(declaracao.expressao);

        const valorConteudo: any = this.resolverValor(conteudo);

        const tipoConteudo: string = conteudo.hasOwnProperty('tipo')
            ? conteudo.tipo
            : typeof conteudo;

        resultado = valorConteudo;
        if (['número', 'number'].includes(tipoConteudo) && declaracao.casasDecimais > 0) {
            resultado = valorConteudo.toLocaleString('pt', {
                maximumFractionDigits: declaracao.casasDecimais,
            });
        }

        if (declaracao.espacos > 0) {
            resultado += ' '.repeat(declaracao.espacos);
        }

        return resultado;
    }

    /* istanbul ignore next */
    visitarDeclaracaoEscolha(declaracao: Escolha): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoTente(declaracao: Tente): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoEnquanto(declaracao: Enquanto): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoImportar(declaracao: Importar): never {
        throw new Error('Método não implementado');
    }

    protected async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = this.resolverValor(resultadoAvaliacao);

            formatoTexto += `${this.paraTexto(valor)} `;
        }

        return formatoTexto.trimEnd();
    }

    /**
     * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
     * alguma função para escrever numa página Web.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
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

    async visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
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

    /* istanbul ignore next */
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoMemoria): Promise<any> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error('Método não implementado');
    }

    protected async avaliacaoDeclaracaoVar(declaracao: Var): Promise<any> {
        let valorOuOutraVariavel = null;
        if (declaracao.inicializador !== null) {
            valorOuOutraVariavel = await this.avaliar(declaracao.inicializador);
        }

        let valorFinal = null;
        if (valorOuOutraVariavel !== null && valorOuOutraVariavel !== undefined) {
            valorFinal = this.resolverValor(valorOuOutraVariavel);
        }

        return valorFinal;
    }

    /**
     * Executa expressão de definição de variável.
     * @param declaracao A declaração Var
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        const valorFinal = await this.avaliacaoDeclaracaoVar(declaracao);

        this.pilhaEscoposExecucao.definirVariavel(
            declaracao.simbolo.lexema,
            valorFinal,
            declaracao.tipo
        );

        return null;
    }

    /* istanbul ignore next */
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoFuncaoConstruto(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoIndiceVariavel(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoDefinirValor(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarDeclaracaoClasse(declaracao: Classe): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoAcessoMetodoOuPropriedade(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoIsto(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoDicionario(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoVetor(expressao: any): never {
        throw new Error('Método não implementado');
    }

    /* istanbul ignore next */
    visitarExpressaoSuper(expressao: Super): never {
        throw new Error('Método não implementado');
    }

    paraTexto(objeto: any) {
        if (objeto === null || objeto === undefined) return 'nulo';
        if (typeof objeto === 'boolean') {
            return objeto ? 'verdadeiro' : 'falso';
        }

        if (objeto instanceof Date) {
            const formato = Intl.DateTimeFormat('pt', {
                dateStyle: 'full',
                timeStyle: 'full',
            });
            return formato.format(objeto);
        }

        if (Array.isArray(objeto)) return objeto;
        if (objeto.valor instanceof ObjetoPadrao) return objeto.valor.paraTexto();
        if (typeof objeto === 'object') return JSON.stringify(objeto);

        return objeto.toString();
    }

    /**
     * Efetivamente executa uma declaração.
     * @param declaracao A declaração a ser executada.
     * @param mostrarResultado Se resultado deve ser mostrado ou não. Normalmente usado
     *                         pelo modo LAIR.
     */
    async executar(declaracao: Declaracao, mostrarResultado = false): Promise<any> {
        const resultado: any = await declaracao.aceitar(this);
        if (mostrarResultado) {
            this.funcaoDeRetorno(this.paraTexto(resultado));
        }
        if (resultado || typeof resultado === 'boolean') {
            this.resultadoInterpretador.push(this.paraTexto(resultado));
        }
        return resultado;
    }

    /**
     * Executa o último escopo empilhado no topo na pilha de escopos do interpretador.
     * Esse método pega exceções, mas apenas as devolve.
     *
     * O tratamento das exceções é feito de acordo com o bloco chamador.
     * Por exemplo, em `tente ... pegue ... finalmente`, a exceção é capturada e tratada.
     * Em outros blocos, pode ser desejável ter o erro em tela.
     * @param manterAmbiente Se verdadeiro, ambiente do topo da pilha de escopo é copiado para o ambiente imediatamente abaixo.
     * @returns O resultado da execução do escopo, se houver.
     */
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

    async interpretar(
        declaracoes: Declaracao[],
        manterAmbiente?: boolean
    ): Promise<RetornoInterpretadorInterface> {
        this.erros = [];

        const escopoExecucao: EscopoExecucao = {
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
