import hrtime from 'browser-process-hrtime';
import { DespachadorFFIInterface } from '../ffi';

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
    Extensao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    InicioAlgoritmo,
    InterfaceDeclaracao,
    Para,
    ParaCada,
    Retorna,
    Se,
    TendoComo,
    Tente,
    TextoDocumentacao,
    Var,
    VarMultiplo,
} from '../declaracoes';
import {
    Chamavel,
    DescritorTipoClasse,
    DeleguaFuncao,
    MetodoPolimorfico,
    ObjetoDeleguaClasse,
    DeleguaModulo,
    FuncaoPadrao,
    ObjetoPadrao,
    OBJETO_BASE,
} from './estruturas';
import {
    AcessoIndiceVariavel,
    AcessoIntervaloVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    Atribuir,
    Chamada,
    ComentarioComoConstruto,
    Constante,
    DefinirValor,
    Dicionario,
    Dupla,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
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
    Vetor,
    Isto,
    Binario,
} from '../construtos';
import { ErroInterpretadorInterface } from '../interfaces/erros/erro-interpretador-interface';
import { RetornoInterpretadorInterface } from '../interfaces/retornos/retorno-interpretador-interface';
import { EscopoExecucaoInterface } from '../interfaces/escopo-execucao';
import { PilhaEscoposExecucao } from './pilha-escopos-execucao';
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from '../quebras';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import { inferirTipoVariavel } from '../inferenciador';
import { MetodoPrimitiva } from './estruturas/metodo-primitiva';
import { ArgumentoInterface } from './argumento-interface';

import { MicroLexador } from '../lexador';
import { MicroAvaliadorSintatico } from '../avaliador-sintatico';
import { MicroAvaliadorSintaticoBase } from '../avaliador-sintatico/micro-avaliador-sintatico-base';

import { EspacoMemoria } from './espaco-memoria';
import { ErroEmTempoDeExecucao } from '../excecoes';
import {
    ConstrutoInterface,
    InterpretadorInterface,
    ResultadoParcialInterpretadorInterface,
    SimboloInterface,
    VariavelInterface,
} from '../interfaces';

import primitivasDicionario from '../bibliotecas/primitivas-dicionario';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import tipoDeDadosPrimitivos from '../tipos-de-dados/primitivos';
import tipoDeDadosDelegua from '../tipos-de-dados/delegua';
import primitivasVetor from '../bibliotecas/primitivas-vetor';

/**
 * O Interpretador visita todos os elementos complexos gerados pelo avaliador sintático (_parser_),
 * e de fato executa a lógica de programação descrita no código. Este interpretador base é usado
 * por Delégua e todos os seus dialetos, contendo somente os pontos em comum entre todas as
 * linguagens.
 *
 * O Interpretador Base não contém dependências com o Node.js. É
 * recomendado para uso em execuções que ocorrem no navegador de internet.
 */
export class InterpretadorBase implements InterpretadorInterface {
    diretorioBase: string;
    erros: ErroInterpretadorInterface[];
    declaracoes: Declaracao[];
    resultadoInterpretador: ResultadoParcialInterpretadorInterface[] = [];
    linhaDeclaracaoAtual: number = -1;
    hashArquivoDeclaracaoAtual: number = -1;
    classeAtualEmExecucao: any = null;

    // Esta variável indica que uma propriedade de um objeto
    // não precisa da palavra `isto` para ser acessada, ou seja,
    // `minhaPropriedade` e `isto.minhaPropriedade` são a mesma coisa.
    // Potigol, por exemplo, é um dialeto que tem essa característica.
    expandirPropriedadesDeObjetosEmEspacoMemoria: boolean;

    // Esta variável indica que propriedades de classes precisam ser
    // declaradas para serem válidas.
    // Delégua e Pituguês são dialetos que requerem a declaração
    // de propriedades de classes.
    requerDeclaracaoPropriedades: boolean;

    performance: boolean;
    funcaoDeRetorno: Function | undefined = undefined;
    funcaoDeRetornoMesmaLinha: Function | undefined = undefined;
    interfaceDeEntrada: any = undefined; // Originalmente é `readline.Interface`
    interfaceEntradaSaida: any = undefined;
    funcaoVerificarIteracao: (() => Promise<void>) | undefined = undefined;
    emDeclaracaoTente: boolean = false;

    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;

    // typeName → methodName → DeleguaFuncao
    extensoesGlobais: Map<string, Map<string, DeleguaFuncao>> = new Map();
    // hashArquivo → typeName → methodName → DeleguaFuncao
    extensoesModulo: Map<number, Map<string, Map<string, DeleguaFuncao>>> = new Map();

    microLexador: MicroLexador = new MicroLexador();
    microAvaliadorSintatico: MicroAvaliadorSintaticoBase = new MicroAvaliadorSintatico();

    /**
     * Despachador FFI opcional. Quando presente, é invocado ao visitar uma
     * `classe estrangeira` com `@definicao`, permitindo que o runtime forneça
     * métodos vinculados a bibliotecas nativas (ex.: via `koffi` em Node.js).
     * Quando ausente, o comportamento padrão é preservado: a classe recebe
     * `estrangeira = true` e lança erro ao ser instanciada diretamente.
     */
    despachadorFFI?: DespachadorFFIInterface;

    regexInterpolacao = /\${(.*?)}/g;

    // Número de iterações entre cada cessão de controle ao loop de eventos do JavaScript.
    // Isso permite que laços de repetição longos ou infinitos não bloqueiem o loop de eventos.
    private iteracoesParaCederControle = 1000;

    private tiposNumericos = [
        tipoDeDadosDelegua.INTEIRO,
        tipoDeDadosDelegua.LONGO,
        tipoDeDadosDelegua.NUMERO,
        tipoDeDadosDelegua.NÚMERO,
        tipoDeDadosDelegua.REAL,
    ];

    lancarErroPorDivisaoPorZero = false;

    /**
     * Gancho opcional para instrumentação de cobertura de ramos.
     * Subclasses (como `InterpretadorComImportacao` em delegua-node) podem sobrescrever
     * este método para registrar qual ramo de uma estrutura de controle foi executado.
     * @param hashArquivo Identificador do arquivo-fonte.
     * @param linha Linha da declaração de controle.
     * @param ramo O ramo executado: 'verdadeiro', 'falso', 'senao', 'caso-padrao', ou 'iteracao'.
     */
    protected registrarRamo?(hashArquivo: number, linha: number, ramo: 'verdadeiro' | 'falso' | 'senao' | 'caso-padrao' | 'iteracao'): void;

    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function | undefined = undefined,
        funcaoDeRetornoMesmaLinha: Function | undefined = undefined
    ) {
        this.diretorioBase = diretorioBase;
        this.performance = performance;

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        const _process = (globalThis as any).process;
        this.funcaoDeRetornoMesmaLinha =
            funcaoDeRetornoMesmaLinha ||
            (_process?.stdout?.write
                ? _process.stdout.write.bind(_process.stdout)
                : (texto: string) => console.log(texto));

        this.erros = [];
        this.declaracoes = [];
        this.resultadoInterpretador = [];

        // Isso existe por causa de Potigol.
        // Para acessar uma variável de classe, não é preciso a palavra `isto`.
        this.expandirPropriedadesDeObjetosEmEspacoMemoria = false;

        // Por padrão é verdadeiro porque Delégua e Pituguês usam
        // o interpretador base como implementação padrão.
        this.requerDeclaracaoPropriedades = true;

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

        // Registrar a classe base `Objeto` no escopo global.
        this.pilhaEscoposExecucao.definirVariavel('Objeto', OBJETO_BASE);
    }

    /**
     * Cede o controle ao loop de eventos do JavaScript.
     * Usado em laços de repetição para evitar bloqueio do loop de eventos
     * em iterações longas ou infinitas.
     */
    protected async cederControle(iteracoes: number): Promise<void> {
        if (iteracoes % this.iteracoesParaCederControle === 0) {
            await new Promise<void>((resolve) => {
                const _setImmediate = (globalThis as any).setImmediate;
                if (_setImmediate) {
                    _setImmediate(resolve);
                } else {
                    setTimeout(resolve, 0);
                }
            });
        }
    }

    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /**
     * Usado para chamadas de métodos de primitiva.
     * Sendo uma variável ou constante, a primitiva precisa atualizar a referência
     * para o objeto que está sendo acessado.
     * @param {ConstrutoInterface} objetoAcessado O objeto que está sendo acessado.
     * @returns O nome desse objeto, se ele for uma variável ou constante.
     * @see resolverValor
     */
    protected resolverNomeObjectoAcessado(objetoAcessado: ConstrutoInterface): string {
        switch (objetoAcessado.constructor) {
            // TODO: Não habilitar isso até que vetores sejam repassados para o montão.
            /* case AcessoMetodoOuPropriedade:
                return (objetoAcessado as AcessoMetodoOuPropriedade).simbolo.lexema;
            case AcessoIndiceVariavel:
                return this.resolverNomeObjectoAcessado((objetoAcessado as AcessoIndiceVariavel).entidadeChamada); */
            case Chamada:
                return this.resolverNomeObjectoAcessado(
                    (objetoAcessado as Chamada).entidadeChamada
                );
            case Agrupamento:
                return this.resolverNomeObjectoAcessado((objetoAcessado as Agrupamento).expressao);
            case Constante:
                return (objetoAcessado as Constante).simbolo.lexema;
            case AcessoMetodo:
            case AcessoMetodoOuPropriedade:
            case AcessoIndiceVariavel:
            case Binario:
            case Dicionario:
            case Leia:
            case Literal:
            case Unario:
            case Vetor:
                return '';
            case Isto:
                return (objetoAcessado as Isto).simboloChave.lexema;
            case Super:
                return (objetoAcessado as Super).simboloChave.lexema;
            case Variavel:
                return (objetoAcessado as Variavel).simbolo.lexema;
        }

        throw new ErroEmTempoDeExecucao(
            (objetoAcessado as any).simbolo,
            `Construto ${objetoAcessado.constructor.name} não possui resolução de nome apropriada.`
        );
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

    /**
     * Resolve valores recursivamente, incluindo valores aninhados em arrays e dicionários.
     * Remove metadados que não devem ser serializados.
     * @param objeto O objeto a ser resolvido
     * @returns O valor resolvido sem metadados
     */
    protected resolverValorRecursivo(objeto: any): any {
        // Null, undefined, ou tipos primitivos
        if (objeto === null || objeto === undefined || typeof objeto !== 'object') {
            return objeto;
        }

        // Resolve metadados primeiro (valorRetornado ou valor)
        if (objeto.hasOwnProperty && objeto.hasOwnProperty('valorRetornado')) {
            return this.resolverValorRecursivo(objeto.valorRetornado);
        }

        if (objeto.hasOwnProperty && objeto.hasOwnProperty('valor')) {
            return this.resolverValorRecursivo(objeto.valor);
        }

        // Se é array, resolve recursivamente todos os elementos
        if (Array.isArray(objeto)) {
            return objeto.map((elemento) => this.resolverValorRecursivo(elemento));
        }

        // Se é objeto plano, resolve recursivamente todas as propriedades
        if (objeto && objeto.constructor && objeto.constructor === Object) {
            const objetoResolvido: any = {};
            for (const chave in objeto) {
                objetoResolvido[chave] = this.resolverValorRecursivo(objeto[chave]);
            }
            return objetoResolvido;
        }

        // Outros tipos de objetos (Date, classes customizadas, etc.)
        return objeto;
    }

    async visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> {
        const deleguaFuncao = this.pilhaEscoposExecucao.obterVariavelPorNome(
            expressao.simboloFuncao.lexema
        );

        return deleguaFuncao;
    }

    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    /**
     * Construtos de comentários não têm utilidade para o Interpretador.
     * Apenas retornamos `Promise.resolve()` para não termos erros.
     * @param declaracao A declaração de comentário.
     */
    visitarDeclaracaoComentario(declaracao: Comentario): Promise<any> {
        return Promise.resolve();
    }

    async visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        // Lista de propriedades válidas para tuplas (ignorar propriedades de controle)
        const propriedadesValidas = [
            'primeiro',
            'segundo',
            'terceiro',
            'quarto',
            'quinto',
            'sexto',
            'sétimo',
            'setimo',
            'oitavo',
            'nono',
            'décimo',
            'decimo',
        ];

        const valores = [];
        for (let propriedade of propriedadesValidas) {
            if (
                expressao.hasOwnProperty(propriedade) &&
                (expressao as any)[propriedade] !== undefined
            ) {
                const valor = await this.avaliar((expressao as any)[propriedade]);
                valores.push(valor);
            }
        }

        return valores;
    }

    async visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> {
        const elementos = [];

        for (let i = 0; i < expressao.elementos.length; i++) {
            const res = await this.avaliar(expressao.elementos[i]);
            elementos.push(this.resolverValor(res));
        }

        const elementosComoConstrutos = elementos.map(
            (valor) => new Literal(expressao.hashArquivo, expressao.linha, valor)
        );

        return new TuplaN(expressao.hashArquivo, expressao.linha, elementosComoConstrutos);
    }

    async visitarExpressaoAtribuicaoPorIndicesMatriz(_: any): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoAcessoElementoMatriz(_: any): Promise<any> {
        throw new Error('Método não implementado.');
    }

    protected textoParaRegex(texto: string): RegExp {
        const match = texto.match(/^([\/~@;%#'])(.*?)\1([gimsuy]*)$/);
        return match
            ? new RegExp(
                  match[2],
                  match[3]
                      .split('')
                      .filter((char, pos, flagArr) => flagArr.indexOf(char) === pos)
                      .join('')
              )
            : new RegExp(texto);
    }

    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        return Promise.resolve(this.textoParaRegex(expressao.valor));
    }

    visitarExpressaoTipoDe(_: TipoDe): Promise<string> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoFalhar(expressao: Falhar): Promise<any> {
        let valorAvaliado = expressao.explicacao;

        // Se for um construto (ex.: Variavel), avalia para obter seu valor real
        if (
            expressao.explicacao &&
            typeof expressao.explicacao.aceitar === 'function'
        ) {
            valorAvaliado = await this.avaliar(expressao.explicacao);
        }

        let textoFalha: string;

        if (valorAvaliado === null || valorAvaliado === undefined) {
            textoFalha = 'nulo';
        } else if (typeof valorAvaliado === 'string') {
            textoFalha = valorAvaliado;
        } else if (
            typeof valorAvaliado === 'object' &&
            'valor' in valorAvaliado
        ) {
            // Objetos tipados como { valor: 'mensagem', tipo: 'texto' }
            textoFalha = String(valorAvaliado.valor);
        } else {
            // Caso incomum: usa a representação textual padrão
            textoFalha = this.paraTexto(valorAvaliado);
        }

        throw new ErroEmTempoDeExecucao(
            expressao.simbolo,
            textoFalha,
            expressao.linha
        );
    }

    async visitarExpressaoFimPara(_: FimPara): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> {
        const deleguaFuncao = this.pilhaEscoposExecucao.obterReferenciaFuncao(expressao.idFuncao);
        return deleguaFuncao;
    }

    /**
     * Gancho opcional para instrumentação de cobertura de expressões.
     * Subclasses podem sobrescrever este método para registrar que uma expressão
     * em determinada linha foi avaliada.
     * @param hashArquivo Identificador do arquivo-fonte.
     * @param linha Linha da expressão avaliada.
     */
    protected registrarExpressao?(hashArquivo: number, linha: number): void;

    /**
     * Chama o método `aceitar` de um construto ou declaração, passando o
     * próprio interpretador como parâmetro.
     *
     * Isto é usado para saber qual método do próprio interpretador chamar
     * na sequência.
     * @param expressao A expressão, que pode ser um construto ou declaração.
     * @returns O retorno da execução do método de visita chamado.
     */
    async avaliar(expressao: ConstrutoInterface | Declaracao): Promise<any> {
        // Descomente o código abaixo quando precisar detectar expressões undefined ou nulas.
        // Por algum motivo o depurador do VSCode não funciona direito aqui
        // com breakpoint condicional.
        /* if (expressao === null || expressao === undefined) {
            console.log('Aqui');
        } */

        if ((expressao as any).hashArquivo >= 0 && (expressao as any).linha >= 0) {
            this.registrarExpressao?.((expressao as any).hashArquivo, (expressao as any).linha);
        }

        return await expressao.aceitar(this);
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

    /**
     * Retira a interpolação de um texto.
     * @param {texto} texto O texto
     * @param {any[]} interpolacoes A lista de interpolações a serem resolvidas.
     * @returns O texto com o valor das variáveis.
     */
    protected retirarInterpolacao(
        texto: string,
        interpolacoes: { expressaoInterpolacao: string; valor: any }[]
    ): string {
        let textoFinal = texto;

        for (const elemento of interpolacoes) {
            let valor = elemento.valor;
            if (valor?.hasOwnProperty && valor.hasOwnProperty('valorRetornado')) {
                valor = valor.valorRetornado;
            }

            if (valor?.tipo === tipoDeDadosDelegua.LOGICO) {
                textoFinal = textoFinal.replace(
                    '${' + elemento.expressaoInterpolacao + '}',
                    this.paraTexto(valor)
                );
            } else {
                valor = this.resolverValor(valor);
                const valorResolvidoComoTexto = this.paraTexto(valor);
                textoFinal = textoFinal.replace(
                    '${' + elemento.expressaoInterpolacao + '}',
                    valorResolvidoComoTexto.replace(/"/g, '')
                );
            }
        }

        return textoFinal;
    }

    /**
     * Resolve todas as interpolações em um texto.
     * @param {texto} textoOriginal O texto original com as variáveis interpoladas.
     * @returns Uma lista de variáveis interpoladas.
     */
    protected async resolverInterpolacoes(textoOriginal: string, linha: number): Promise<any[]> {
        const variaveis = textoOriginal.match(this.regexInterpolacao);

        if (!variaveis) {
            return [];
        }

        return await Promise.all(
            variaveis.map(async (s) => {
                const expressaoInterpolacao: string = s.replace(/[\$\{\}]*/gm, '');

                const microLexador = this.microLexador.mapear(expressaoInterpolacao);
                let declaracoes: any[] = [];
                try {
                    const resultadoMicroAvaliadorSintatico = this.microAvaliadorSintatico.analisar(
                        microLexador,
                        linha
                    );

                    for (const erro of resultadoMicroAvaliadorSintatico.erros) {
                        this.erros.push({
                            erroInterno: erro,
                            linha: erro.linha ?? linha,
                            hashArquivo: erro.hashArquivo ?? -1,
                        });
                    }

                    declaracoes = resultadoMicroAvaliadorSintatico.declaracoes;
                } catch (erroAvaliador: any) {
                    this.erros.push({
                        erroInterno: erroAvaliador,
                        linha: erroAvaliador.linha ?? linha,
                        hashArquivo: erroAvaliador.hashArquivo ?? -1,
                    });
                }

                let valor = declaracoes.length > 0 ? await this.avaliar(declaracoes[0]) : '';

                const instancia =
                    valor instanceof ObjetoDeleguaClasse
                        ? valor
                        : valor?.valor instanceof ObjetoDeleguaClasse
                          ? valor.valor
                          : null;
                if (instancia) {
                    const metodoParaTexto = instancia.classe.encontrarMetodo('paraTexto');
                    if (metodoParaTexto) {
                        const funcaoBound = metodoParaTexto.funcaoPorMetodoDeClasse(instancia);
                        valor = await funcaoBound.chamar(this, []);
                    }
                }

                return { expressaoInterpolacao, valor };
            })
        );
    }

    async visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        if (this.regexInterpolacao.test(String(expressao.valor))) {
            const valorComoTexto = String(expressao.valor);
            const interpolacoes = await this.resolverInterpolacoes(valorComoTexto, expressao.linha);
            return this.retirarInterpolacao(valorComoTexto, interpolacoes);
        }

        return expressao.valor;
    }

    /**
     * Avaliação de agrupamento. Se resultado da avaliação é uma declaração de
     * função (por exemplo, funções anônimas), a declaração é retornada. Este
     * retorno é utilizado, entre outros lugares, por `visitarExpressaoDeChamada`.
     * @param {Agrupamento} expressao O construto de agrupamento.
     * @returns O resultado da avaliação.
     * @see this.visitarExpressaoDeChamada
     */
    async visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> {
        const avaliacaoAgrupamento = await this.avaliar(expressao.expressao);

        if (avaliacaoAgrupamento !== null && avaliacaoAgrupamento.declaracao) {
            return avaliacaoAgrupamento.declaracao;
        }

        return avaliacaoAgrupamento;
    }

    eVerdadeiro(objeto: any): boolean {
        if (objeto === null) return false;
        if (typeof objeto === tipoDeDadosPrimitivos.BOOLEANO) return Boolean(objeto);
        if (objeto.hasOwnProperty('valor')) {
            return Boolean(objeto.valor);
        }

        return true;
    }

    protected verificarOperandoNumero(operador: SimboloInterface, operando: any): void {
        if (
            typeof operando === tipoDeDadosPrimitivos.NUMERO ||
            operando.tipo === tipoDeDadosDelegua.NUMERO
        )
            return;
        throw new ErroEmTempoDeExecucao(
            operador,
            'Operando precisa ser um número.',
            Number(operador.linha)
        );
    }

    async visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        const operando = await this.avaliar(expressao.operando);
        let valor: any = this.resolverValor(operando);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                this.verificarOperandoNumero(expressao.operador, valor);
                return +valor;
            case tiposDeSimbolos.SUBTRACAO:
                this.verificarOperandoNumero(expressao.operador, valor);
                return -valor;
            case tiposDeSimbolos.NEGACAO:
            case tiposDeSimbolos.NAO:
                return !this.eVerdadeiro(valor);
            case tiposDeSimbolos.BIT_NOT:
                if (typeof valor === 'bigint') {
                    return ~valor;
                }
                this.verificarOperandoNumero(expressao.operador, valor);
                return ~Number(valor);
            // Para incrementar e decrementar, primeiro precisamos saber se o operador
            // veio antes do literal ou variável.
            // Se veio antes e o operando é uma variável, precisamos incrementar/decrementar,
            // armazenar o valor da variável pra só então devolver o valor.
            case tiposDeSimbolos.INCREMENTAR:
                if (typeof valor === 'string') {
                    throw new ErroEmTempoDeExecucao(
                        expressao.operador,
                        `Operador '${expressao.operador.lexema}' não pode ser aplicado a um texto.`,
                        expressao.linha
                    );
                }

                if (expressao.incidenciaOperador === 'ANTES') {
                    valor++;
                    if (expressao.operando instanceof Variavel) {
                        this.pilhaEscoposExecucao.atribuirVariavel(
                            expressao.operando.simbolo,
                            valor
                        );
                    }

                    return valor;
                }

                const valorAnteriorIncremento = valor;
                if (expressao.operando instanceof Variavel) {
                    this.pilhaEscoposExecucao.atribuirVariavel(expressao.operando.simbolo, ++valor);
                }
                return valorAnteriorIncremento;
            case tiposDeSimbolos.DECREMENTAR:
                if (typeof valor === 'string') {
                    throw new ErroEmTempoDeExecucao(
                        expressao.operador,
                        `Operador '${expressao.operador.lexema}' não pode ser aplicado a um texto.`,
                        expressao.linha
                    );
                }

                if (expressao.incidenciaOperador === 'ANTES') {
                    valor--;
                    if (expressao.operando instanceof Variavel) {
                        this.pilhaEscoposExecucao.atribuirVariavel(
                            expressao.operando.simbolo,
                            valor
                        );
                    }

                    return valor;
                }

                const valorAnteriorDecremento = valor;
                if (expressao.operando instanceof Variavel) {
                    this.pilhaEscoposExecucao.atribuirVariavel(expressao.operando.simbolo, --valor);
                }
                return valorAnteriorDecremento;
        }

        return null;
    }

    /**
     * Formata uma saída de acordo com o número e espaços e casas decimais solicitados.
     * @param declaracao A declaração de formatação de escrita.
     * @returns {string} A saída formatada como texto e os respectivos parâmetros aplicados.
     */
    async visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<string> {
        let resultado = '';
        const conteudo: VariavelInterface | any = await this.avaliar(declaracao.expressao);

        const valorConteudo: any = this.resolverValor(conteudo);

        const tipoConteudo: string = conteudo.hasOwnProperty('tipo')
            ? conteudo.tipo
            : typeof conteudo;

        resultado = valorConteudo;
        if (
            [tipoDeDadosDelegua.NUMERO, tipoDeDadosPrimitivos.NUMERO].includes(tipoConteudo) &&
            declaracao.casasDecimais > 0
        ) {
            resultado = valorConteudo.toLocaleString('pt', {
                maximumFractionDigits: declaracao.casasDecimais,
            });
        }

        if (declaracao.espacos > 0) {
            resultado += ' '.repeat(declaracao.espacos);
        }

        return resultado;
    }

    /**
     * Lógica para verificação de valores iguais, para Delégua e alguns dialetos.
     * @param esquerda Uma variável.
     * @param direita Outra variável.
     * @returns Verdadeiro se são iguais. Falso em caso contrário.
     */
    eIgual(esquerda: VariavelInterface | any, direita: VariavelInterface | any): boolean {
        if (esquerda === null && direita === null) return true;
        if (esquerda === null) return false;

        // Handle BigInt/Number comparison
        if (typeof esquerda === 'bigint' && typeof direita === 'number') {
            return esquerda == BigInt(direita);
        }
        if (typeof esquerda === 'number' && typeof direita === 'bigint') {
            return BigInt(esquerda) == direita;
        }

        return esquerda === direita;
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
        esquerda: VariavelInterface | any,
        direita: VariavelInterface | any
    ): void {
        const tipoDireita: string = direita.tipo
            ? direita.tipo
            : typeof direita === tipoDeDadosPrimitivos.NUMERO
              ? tipoDeDadosDelegua.NUMERO
              : typeof direita === 'bigint'
                ? tipoDeDadosDelegua.LONGO
                : String(NaN);

        const tipoEsquerda: string = esquerda.tipo
            ? esquerda.tipo
            : typeof esquerda === tipoDeDadosPrimitivos.NUMERO
              ? tipoDeDadosDelegua.NUMERO
              : typeof esquerda === 'bigint'
                ? tipoDeDadosDelegua.LONGO
                : String(NaN);

        if (this.tiposNumericos.includes(tipoDireita) && this.tiposNumericos.includes(tipoEsquerda))
            return;
        if (this.tiposNumericos.includes(tipoEsquerda) && tipoDireita === 'qualquer') return;
        if (this.tiposNumericos.includes(tipoDireita) && tipoEsquerda === 'qualquer') return;
        if (this.tiposNumericos.includes(tipoEsquerda) && tipoDireita === 'nulo') return;
        if (this.tiposNumericos.includes(tipoDireita) && tipoEsquerda === 'nulo') return;

        // Se operador é subtração, os dois tipos são `qualquer`, mas ambos podem ser convertidos
        // para número, a operação é válida.
        if (operador.tipo === tiposDeSimbolos.SUBTRACAO) {
            if (typeof esquerda.valor === 'number' && typeof direita.valor === 'number') {
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(
            operador,
            'Operadores precisam ser números.',
            operador.linha
        );
    }

    private converterParaBigInt(valor: any): bigint {
        return typeof valor === 'bigint' ? valor : BigInt(Math.floor(Number(valor)));
    }

    async visitarExpressaoBinaria(expressao: Binario): Promise<any> {
        const esquerda: VariavelInterface | any = await this.avaliar(expressao.esquerda);
        const direita: VariavelInterface | any = await this.avaliar(expressao.direita);
        const valorEsquerdo: any = this.resolverValor(esquerda);
        const valorDireito: any = this.resolverValor(direita);

        // Verificar sobrecarga de operador: se o operando esquerdo é uma instância de classe,
        // procurar método `operador<símbolo>` (ex: `operador+`, `operador==`).
        if (valorEsquerdo instanceof ObjetoDeleguaClasse) {
            const nomeOperador = 'operador' + expressao.operador.lexema;
            const metodoOperador = valorEsquerdo.classe.encontrarMetodo(nomeOperador);
            if (metodoOperador) {
                const metodoASerChamado = metodoOperador.funcaoPorMetodoDeClasse(valorEsquerdo);
                const argumentoOperador: VariavelInterface | any =
                    direita && Object.prototype.hasOwnProperty.call(direita, 'tipo')
                        ? (direita as VariavelInterface)
                        : {
                              tipo: inferirTipoVariavel(valorDireito),
                              valor: valorDireito,
                              imutavel: false,
                          };
                return await metodoASerChamado.chamar(this, [
                    { nome: null, valor: argumentoOperador },
                ]);
            }
        }

        const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo')
            ? esquerda.tipo
            : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita?.hasOwnProperty('tipo')
            ? direita.tipo
            : inferirTipoVariavel(direita);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.EXPONENCIACAO:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                // Auto-promove para BigInt se qualquer operando for BigInt
                if (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') {
                    return (
                        this.converterParaBigInt(valorEsquerdo) **
                        this.converterParaBigInt(valorDireito)
                    );
                }

                const resultadoExponenciacao = Math.pow(valorEsquerdo, valorDireito);
                return resultadoExponenciacao;

            case tiposDeSimbolos.MAIOR:
                if (
                    typeof valorEsquerdo === 'string' &&
                    typeof valorDireito === 'string'
                ) {
                    return valorEsquerdo > valorDireito;
                }

                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );

                return Number(valorEsquerdo) > Number(valorDireito);

            case tiposDeSimbolos.MAIOR_IGUAL:
                if (
                    typeof valorEsquerdo === 'string' &&
                    typeof valorDireito === 'string'
                ) {
                    return valorEsquerdo >= valorDireito;
                }

                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );

                return Number(valorEsquerdo) >= Number(valorDireito);

            case tiposDeSimbolos.MENOR:
                if (
                    typeof valorEsquerdo === 'string' &&
                    typeof valorDireito === 'string'
                ) {
                    return valorEsquerdo < valorDireito;
                }

                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );

                return Number(valorEsquerdo) < Number(valorDireito);

            case tiposDeSimbolos.MENOR_IGUAL:
                if (
                    typeof valorEsquerdo === 'string' &&
                    typeof valorDireito === 'string'
                ) {
                    return valorEsquerdo <= valorDireito;
                }

                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );

                return Number(valorEsquerdo) <= Number(valorDireito);

            case tiposDeSimbolos.SUBTRACAO:
            case tiposDeSimbolos.MENOS_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                // Auto-promove para BigInt se qualquer operando for BigInt
                if (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') {
                    return (
                        this.converterParaBigInt(valorEsquerdo) -
                        this.converterParaBigInt(valorDireito)
                    );
                }
                return Number(valorEsquerdo) - Number(valorDireito);

            case tiposDeSimbolos.ADICAO:
            case tiposDeSimbolos.MAIS_IGUAL:
                // Se ambos os operandos são vetores, concatená-los
                if (Array.isArray(valorEsquerdo) && Array.isArray(valorDireito)) {
                    return valorEsquerdo.concat(valorDireito);
                }

                // Se ambos os operandos são dicionários, mescla-os.
                // Em caso de chaves duplicadas, valores à direita sobrescrevem os da esquerda.
                if (
                    valorEsquerdo &&
                    valorDireito &&
                    !Array.isArray(valorEsquerdo) &&
                    !Array.isArray(valorDireito) &&
                    valorEsquerdo.constructor === Object &&
                    valorDireito.constructor === Object
                ) {
                    return Object.assign({}, valorEsquerdo, valorDireito);
                }

                // Auto-promove para BigInt se qualquer operando for BigInt
                if (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') {
                    const valorResolvidoEsquerdo =
                        typeof valorEsquerdo === 'bigint'
                            ? valorEsquerdo
                            : BigInt(Math.floor(Number(valorEsquerdo)));
                    const valorResolvidoDireito =
                        typeof valorDireito === 'bigint'
                            ? valorDireito
                            : BigInt(Math.floor(Number(valorDireito)));
                    return valorResolvidoEsquerdo + valorResolvidoDireito;
                }

                if (
                    this.tiposNumericos.includes(tipoEsquerdo) &&
                    this.tiposNumericos.includes(tipoDireito)
                ) {
                    return Number(valorEsquerdo) + Number(valorDireito);
                }

                if (valorEsquerdo === null || valorDireito === null) {
                    return this.paraTexto(valorEsquerdo) + this.paraTexto(valorDireito);
                }

                // TODO: Se tipo for 'qualquer', seria uma boa confiar nos operadores
                // tradicionais do JavaScript?
                if (tipoEsquerdo === 'qualquer' || tipoDireito === 'qualquer') {
                    return valorEsquerdo + valorDireito;
                }

                return this.paraTexto(valorEsquerdo) + this.paraTexto(valorDireito);

            case tiposDeSimbolos.DIVISAO:
            case tiposDeSimbolos.DIVISAO_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);

                if (this.lancarErroPorDivisaoPorZero && Number(valorDireito) === 0) {
                    throw new ErroEmTempoDeExecucao(
                        expressao.operador,
                        'Divisão por zero não é permitida.',
                        expressao.operador.linha
                    );
                }

                // SEMPRE retorna Number para precisão decimal (preferência do usuário)
                // Mesmo se operandos forem BigInt, converte para Number
                return Number(valorEsquerdo) / Number(valorDireito);

            case tiposDeSimbolos.DIVISAO_INTEIRA:
            case tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);

                if (this.lancarErroPorDivisaoPorZero && valorDireito === 0) {
                    throw new ErroEmTempoDeExecucao(
                        expressao.operador,
                        'Divisão por zero não é permitida.',
                        expressao.operador.linha
                    );
                }

                // Retorna BigInt se qualquer operando for BigInt
                if (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') {
                    const valorResolvidoEsquerdo =
                        typeof valorEsquerdo === 'bigint'
                            ? valorEsquerdo
                            : BigInt(Math.floor(Number(valorEsquerdo)));
                    const valorResolvidoDireito =
                        typeof valorDireito === 'bigint'
                            ? valorDireito
                            : BigInt(Math.floor(Number(valorDireito)));
                    return valorResolvidoEsquerdo / valorResolvidoDireito; // Trunca automaticamente
                }
                return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

            case tiposDeSimbolos.MULTIPLICACAO:
            case tiposDeSimbolos.MULTIPLICACAO_IGUAL:
                // Auto-promove para BigInt se qualquer operando for BigInt (e não for texto)
                if (
                    (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') &&
                    tipoEsquerdo !== tipoDeDadosDelegua.TEXTO &&
                    tipoDireito !== tipoDeDadosDelegua.TEXTO
                ) {
                    const valorResolvidoEsquerdo =
                        typeof valorEsquerdo === 'bigint'
                            ? valorEsquerdo
                            : BigInt(Math.floor(Number(valorEsquerdo)));
                    const valorResolvidoDireito =
                        typeof valorDireito === 'bigint'
                            ? valorDireito
                            : BigInt(Math.floor(Number(valorDireito)));
                    return valorResolvidoEsquerdo * valorResolvidoDireito;
                }

                if (
                    tipoEsquerdo === tipoDeDadosDelegua.TEXTO ||
                    tipoDireito === tipoDeDadosDelegua.TEXTO
                ) {
                    // Sem ambos os valores resolvem como texto, multiplica normal.
                    // Se apenas um resolve como texto, o outro repete o
                    // texto n vezes, sendo n o valor do outro.
                    if (
                        tipoEsquerdo === tipoDeDadosDelegua.TEXTO &&
                        tipoDireito === tipoDeDadosDelegua.TEXTO
                    ) {
                        throw new ErroEmTempoDeExecucao(
                            expressao.operador,
                            'Não é possível multiplicar dois textos.',
                            expressao.linha
                        );
                    }

                    const valorTexto =
                        tipoEsquerdo === tipoDeDadosDelegua.TEXTO ? valorEsquerdo : valorDireito;
                    const valorQuantidade =
                        tipoEsquerdo === tipoDeDadosDelegua.TEXTO ? valorDireito : valorEsquerdo;

                    if (typeof valorQuantidade !== 'number') {
                        throw new ErroEmTempoDeExecucao(
                            expressao.operador,
                            'Para multiplicar um texto, o outro operando deve ser um número.',
                            expressao.linha
                        );
                    }

                    const textoParaNumero = Number(valorTexto);
                    if (!isNaN(textoParaNumero)) {
                        return textoParaNumero * valorQuantidade;
                    }

                    if (!Number.isInteger(valorQuantidade)) {
                        throw new ErroEmTempoDeExecucao(
                            expressao.operador,
                            'A multiplicação de texto exige um número inteiro.',
                            expressao.linha
                        );
                    }

                    if (valorQuantidade < 0) {
                        throw new ErroEmTempoDeExecucao(
                            expressao.operador,
                            'Não é possível multiplicar texto por número negativo.',
                            expressao.linha
                        );
                    }

                    return valorTexto.repeat(valorQuantidade);
                }

                return Number(valorEsquerdo) * Number(valorDireito);

            case tiposDeSimbolos.MODULO:
            case tiposDeSimbolos.MODULO_IGUAL:
                // Se o operando esquerdo é uma string, usar formatação de string
                if (
                    tipoEsquerdo === tipoDeDadosDelegua.TEXTO ||
                    typeof valorEsquerdo === 'string'
                ) {
                    return this.formatarStringComOperadorPorcentagem(
                        String(valorEsquerdo),
                        direita, // Passar 'direita' ao invés de 'valorDireito' para preservar arrays de tuplas
                        expressao.operador
                    );
                }

                // Caso contrário, operação matemática normal
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) % Number(valorDireito);

            case tiposDeSimbolos.BIT_AND:
                if (typeof valorEsquerdo === 'boolean' && typeof valorDireito === 'boolean') {
                    return valorEsquerdo && valorDireito;
                }

                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                // Auto-promove para BigInt se qualquer operando for BigInt
                if (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') {
                    return (
                        this.converterParaBigInt(valorEsquerdo) &
                        this.converterParaBigInt(valorDireito)
                    );
                }
                return Number(valorEsquerdo) & Number(valorDireito);

            case tiposDeSimbolos.CIRCUMFLEXO:
                if (typeof valorEsquerdo === 'boolean' && typeof valorDireito === 'boolean') {
                    return valorEsquerdo !== valorDireito;
                }

                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                // Auto-promove para BigInt se qualquer operando for BigInt
                if (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') {
                    return (
                        this.converterParaBigInt(valorEsquerdo) ^
                        this.converterParaBigInt(valorDireito)
                    );
                }
                return Number(valorEsquerdo) ^ Number(valorDireito);

            case tiposDeSimbolos.BIT_OR:
                if (typeof valorEsquerdo === 'boolean' && typeof valorDireito === 'boolean') {
                    return valorEsquerdo || valorDireito;
                }

                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                // Auto-promove para BigInt se qualquer operando for BigInt
                if (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') {
                    return (
                        this.converterParaBigInt(valorEsquerdo) |
                        this.converterParaBigInt(valorDireito)
                    );
                }
                return Number(valorEsquerdo) | Number(valorDireito);

            case tiposDeSimbolos.MENOR_MENOR:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                // Auto-promove para BigInt (interno para longo) se qualquer operando for BigInt ou se deslocamento >= 32
                if (
                    typeof valorEsquerdo === 'bigint' ||
                    typeof valorDireito === 'bigint' ||
                    Number(valorDireito) >= 32
                ) {
                    return (
                        this.converterParaBigInt(valorEsquerdo) <<
                        this.converterParaBigInt(valorDireito)
                    );
                }
                return Number(valorEsquerdo) << Number(valorDireito);

            case tiposDeSimbolos.MAIOR_MAIOR:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                // Auto-promove para BigInt (interno para longo) se qualquer operando for BigInt ou se deslocamento >= 32
                if (
                    typeof valorEsquerdo === 'bigint' ||
                    typeof valorDireito === 'bigint' ||
                    Number(valorDireito) >= 32
                ) {
                    return (
                        this.converterParaBigInt(valorEsquerdo) >>
                        this.converterParaBigInt(valorDireito)
                    );
                }
                return Number(valorEsquerdo) >> Number(valorDireito);

            case tiposDeSimbolos.DIFERENTE:
                return !this.eIgual(valorEsquerdo, valorDireito);

            case tiposDeSimbolos.IGUAL_IGUAL:
                return this.eIgual(valorEsquerdo, valorDireito);
        }
    }

    /**
     * Faz a chamada do método de uma primitiva (por exemplo, número, texto, etc.) com seus
     * respectivos argumentos.
     * @param {Chamada} expressao A expressão de chamada.
     * @param {MetodoPrimitiva} metodoPrimitivaChamado O método da primitiva chamado.
     * @returns O resultado da chamada do método da primitiva.
     */
    protected async chamarMetodoPrimitiva(
        expressao: Chamada,
        metodoPrimitivaChamado: MetodoPrimitiva
    ): Promise<any> {
        const argumentosResolvidos: any[] = [];

        for (const argumento of expressao.argumentos) {
            const valorResolvido: any = await this.avaliar(argumento);
            argumentosResolvidos.push(this.resolverValor(valorResolvido));
        }

        return await metodoPrimitivaChamado.chamar(this, argumentosResolvidos);
    }

    protected async resolverArgumentosChamada(expressao: Chamada): Promise<ArgumentoInterface[]> {
        const argumentos: ArgumentoInterface[] = [];
        for (let i = 0; i < expressao.argumentos.length; i++) {
            const variavelArgumento = expressao.argumentos[i];
            const nomeArgumento = variavelArgumento.hasOwnProperty('simbolo')
                ? (variavelArgumento as Variavel).simbolo.lexema
                : undefined;

            let valor = await this.avaliar(variavelArgumento);

            argumentos.push({
                nome: nomeArgumento ?? null,
                valor,
            });
        }

        return argumentos;
    }

    /**
     * Executa uma chamada de função, método ou classe.
     * @param expressao A expressão chamada.
     * @returns O resultado da chamada.
     */
    async visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        try {
            let variavelEntidadeChamada: VariavelInterface | any = await this
                .avaliar(expressao.entidadeChamada);

            if (
                variavelEntidadeChamada === null ||
                variavelEntidadeChamada === undefined
            ) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        (expressao as any).parentese,
                        'Chamada de função ou método inexistente: ' +
                            String(expressao.entidadeChamada),
                        expressao.linha
                    )
                );
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    variavelEntidadeChamada, 'valorRetornado'
                )
            ) {
                variavelEntidadeChamada = variavelEntidadeChamada.valorRetornado;
            }

            let entidadeChamada = this.resolverValor(variavelEntidadeChamada);

            // Funções anônimas
            if (entidadeChamada instanceof FuncaoConstruto) {
                entidadeChamada = new DeleguaFuncao(null, entidadeChamada);
            }

            if (entidadeChamada instanceof DeleguaModulo) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        (expressao as any).parentese,
                        'Entidade chamada é um módulo de Delégua. Provavelmente você quer chamar um de seus componentes?',
                        expressao.linha
                    )
                );
            }

            if (entidadeChamada instanceof MetodoPrimitiva) {
                return await this.chamarMetodoPrimitiva(
                    expressao,
                    entidadeChamada
                );
            }

            const argumentos: ArgumentoInterface[] = await this
                .resolverArgumentosChamada(expressao);
            const aridade = entidadeChamada.aridade
                ? entidadeChamada.aridade()
                : entidadeChamada.length;

            // Completar os argumentos não preenchidos com valores indefinidos.
            // Para métodos polimórficos e classes com construtores polimórficos,
            // a quantidade original de argumentos é necessária para o despacho
            // correto da sobrecarga.
            const ehPolimorfico =
                entidadeChamada instanceof MetodoPolimorfico ||
                (entidadeChamada instanceof DescritorTipoClasse &&
                    entidadeChamada.encontrarMetodo('construtor') instanceof MetodoPolimorfico);

            if (
                entidadeChamada instanceof DeleguaFuncao && entidadeChamada.declaracao
            ) {
                // Pega os parâmetros da declaração e filtra apenas os obrigatórios
                // (ignora os que têm valor padrão ou são rest parameters)
                const parametros = entidadeChamada.declaracao.parametros || [];
                const parametrosObrigatorios = parametros.filter(
                    (p) => !p.valorPadrao && p.abrangencia !== 'multiplo'
                ).length;

                if (argumentos.length < parametrosObrigatorios) {
                    const nomeFuncao = entidadeChamada.nome || 'anônima';

                    return Promise.reject(
                        new ErroEmTempoDeExecucao(
                            (expressao as any).parentese,
                            `A função '${nomeFuncao}' esperava no mínimo ${parametrosObrigatorios} argumento(s), mas recebeu ${argumentos.length}.`,
                            expressao.linha
                        )
                    );
                }
            }

            if (!ehPolimorfico && argumentos.length < aridade) {
                const diferenca = aridade - argumentos.length;
                for (let i = 0; i < diferenca; i++) {
                    argumentos.push({
                        nome: null,
                        valor: null,
                    });
                }
            }

            if (entidadeChamada instanceof FuncaoPadrao) {
                try {
                    return await entidadeChamada.chamar(
                        this,
                        argumentos.map((a) => a && this.resolverValor(a.valor)),
                        (expressao.entidadeChamada as any).simbolo // TODO: O que exatamente pode ser aqui?
                    );
                } catch (erro: any) {
                    if (this.emDeclaracaoTente) {
                        return Promise.reject(erro);
                    }
                    this.erros.push({
                        erroInterno: erro,
                        linha: expressao.linha,
                        hashArquivo: expressao.hashArquivo,
                    });
                    return;
                }
            }

            // Por algum motivo misterioso, `entidadeChamada instanceof Chamavel` dá `false` em Liquido,
            // mesmo que esteja tudo certo com `DeleguaFuncao`,
            // então precisamos testar o nome do construtor também.
            if (
                entidadeChamada instanceof Chamavel ||
                entidadeChamada.constructor === DeleguaFuncao ||
                entidadeChamada.constructor === MetodoPolimorfico
            ) {
                const retornoEntidadeChamada = await entidadeChamada.chamar(this, argumentos);
                return retornoEntidadeChamada;
            }

            // Chamadas a `super()`.
            // Basicamente, chamar o construtor da superclasse.
            if (expressao.entidadeChamada instanceof Super) {
                const descritorSuperclasse: DescritorTipoClasse =
                    variavelEntidadeChamada.classe.superClasse;
                const metodoConstrutor = descritorSuperclasse.encontrarMetodo('construtor') as
                    | MetodoPolimorfico
                    | DeleguaFuncao;
                await metodoConstrutor.chamar(this, argumentos);
                return null;
            }

            // A função chamada pode ser de uma biblioteca JavaScript.
            // Neste caso apenas testamos se o tipo é uma função.
            // Casos que passam aqui: chamadas a métodos de bibliotecas de Delégua.
            if (typeof entidadeChamada === tipoDeDadosPrimitivos.FUNCAO) {
                let objeto = null;
                if ((expressao.entidadeChamada as any).objeto) {
                    // TODO: Qual o tipo certo aqui?
                    objeto = await this.avaliar((expressao.entidadeChamada as any).objeto);
                }
                return entidadeChamada.apply(this.resolverValor(objeto), argumentos);
            }

            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    (expressao as any).parentese,
                    'Só pode chamar função ou classe.',
                    expressao.linha
                )
            );
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: expressao.linha,
                hashArquivo: expressao.hashArquivo,
            });
        }
    }

    /** Gancho para linguagens definirem lógica de escopo (Pituguês LEGB) ou de memória (Delégua) */
    protected atribuirVariavel(
        alvoVariavel: Variavel,
        valorResolvido: any,
        indice: number
    ): void {
        this.pilhaEscoposExecucao.atribuirVariavel(
            alvoVariavel.simbolo,
            valorResolvido,
            indice
        );
    }

    /** Gancho para linguagens definirem como acessar propriedades de objetos */
    protected async definirPropriedadeObjeto(
        objeto: any,
        simbolo: SimboloInterface,
        valor: any
    ): Promise<void> {
        if (objeto instanceof ObjetoDeleguaClasse) {
            await objeto.definir(simbolo, valor, this);
        } else if (objeto !== null && objeto !== undefined) {
            objeto[simbolo.lexema] = valor;
        }
    }

    /**
     * Execução de uma expressão de atribuição.
     * @param expressao A expressão.
     * @returns O valor atribuído.
     */
    async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        let valor = await this.avaliar(expressao.valor);

        if (valor && valor.hasOwnProperty('valorRetornado')) {
            valor = valor.valorRetornado;
        }

        const valorResolvido = this.resolverValor(valor);

        let indice: any = null;

        if (expressao.indice) {
            indice = this.resolverValor(await this.avaliar(expressao.indice));
        }

        switch (expressao.alvo.constructor) {
            case AcessoMetodoOuPropriedade:
                const alvoPropriedade = expressao.alvo as AcessoMetodoOuPropriedade;
                const variavelObjeto = await this.avaliar(
                    alvoPropriedade.objeto
                );
                const objeto = this.resolverValor(variavelObjeto);
                const valorProp = await this.avaliar(expressao.valor);

                await this.definirPropriedadeObjeto(
                    objeto,
                    alvoPropriedade.simbolo,
                    valorProp
                );

                break;

            case Variavel:
                const alvoVariavel = expressao.alvo as Variavel;

                if (expressao.simboloOperador) {
                    let valorAtual: any;

                    valorAtual = this.resolverValor(
                        this.pilhaEscoposExecucao.obterValorVariavel(alvoVariavel.simbolo)
                    );

                    if (typeof valorAtual === 'string') {
                        let valorDireito: any;

                        if (expressao.valor instanceof Binario) {
                            valorDireito = this.resolverValor(
                                await this.avaliar(expressao.valor.direita)
                            );
                        } else {
                            valorDireito = valorResolvido;
                        }

                        if (expressao.simboloOperador.tipo === tiposDeSimbolos.MAIS_IGUAL) {
                            if (typeof valorDireito !== 'string') {
                                throw new ErroEmTempoDeExecucao(
                                    expressao.simboloOperador,
                                    `Operador '+=' não pode concatenar texto com ${typeof valorDireito}. Use conversão explícita.`,
                                    expressao.linha
                                );
                            }
                        } else if (
                            [tiposDeSimbolos.MENOS_IGUAL,
                             tiposDeSimbolos.MULTIPLICACAO_IGUAL,
                             tiposDeSimbolos.DIVISAO_IGUAL,
                             tiposDeSimbolos.MODULO_IGUAL]
                            .includes(expressao.simboloOperador.tipo)
                        ) {
                            throw new ErroEmTempoDeExecucao(
                                expressao.simboloOperador,
                                `Operador '${expressao.simboloOperador.lexema}' não pode ser aplicado a um texto.`,
                                expressao.linha
                            );
                        }
                    }
                }

                this.atribuirVariavel(alvoVariavel, valorResolvido, indice);

                break;

            default:
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloOperador,
                    "Alvo da atribuição inválido. O lado esquerdo de uma atribuição deve ser uma variável, propriedade ou índice."
                );
        }

        return valorResolvido;
    }

    protected procurarVariavel(simbolo: SimboloInterface): any {
        return this.pilhaEscoposExecucao.obterValorVariavel(simbolo);
    }

    visitarExpressaoDeVariavel(expressao: Variavel): any {
        return this.procurarVariavel(expressao.simbolo);
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return await this.avaliar(declaracao.expressao);
    }

    protected logicaContemOuEm(esquerda: any, direita: any, expressao: Logico) {
        const valorEsquerdoResolvido = this.resolverValor(esquerda);
        const valorDireitoResolvido = this.resolverValor(direita);
        if (
            Array.isArray(valorDireitoResolvido) ||
            typeof valorDireitoResolvido === tipoDeDadosPrimitivos.TEXTO
        ) {
            const avaliacao = valorDireitoResolvido.includes(valorEsquerdoResolvido);
            return expressao.negado ? !avaliacao : avaliacao;
        }

        if (valorDireitoResolvido !== null && typeof valorDireitoResolvido === 'object') {
            const avaliacao = valorEsquerdoResolvido in valorDireitoResolvido;
            return expressao.negado ? !avaliacao : avaliacao;
        }

        throw new ErroEmTempoDeExecucao(
            esquerda,
            `Tipo de chamada inválida com '${expressao.operador.tipo}'.`,
            expressao.linha
        );
    }

    async visitarExpressaoLogica(expressao: Logico): Promise<any> {
        const esquerda = await this.avaliar(expressao.esquerda);

        if ([tiposDeSimbolos.EM, tiposDeSimbolos.CONTEM].includes(expressao.operador.tipo)) {
            const direita = await this.avaliar(expressao.direita);

            // `3 em lista` é igual a `lista contém 3`.
            // Portanto, precisamos inverter os operandos de acordo com a
            // palavra reservada usada.
            switch (expressao.operador.tipo) {
                case tiposDeSimbolos.EM:
                    return this.logicaContemOuEm(esquerda, direita, expressao);
                case tiposDeSimbolos.CONTEM:
                    return this.logicaContemOuEm(direita, esquerda, expressao);
            }
        }

        // E/OU como bitwise quando ambos operandos são numéricos
        if ([tiposDeSimbolos.E, tiposDeSimbolos.OU].includes(expressao.operador.tipo)) {
            const valorEsquerdo = this.resolverValor(esquerda);
            if (typeof valorEsquerdo === 'number' || typeof valorEsquerdo === 'bigint') {
                const direita = await this.avaliar(expressao.direita);
                const valorDireito = this.resolverValor(direita);

                if (typeof valorDireito === 'number' || typeof valorDireito === 'bigint') {
                    if (typeof valorEsquerdo === 'bigint' || typeof valorDireito === 'bigint') {
                        const esq =
                            typeof valorEsquerdo === 'bigint'
                                ? valorEsquerdo
                                : BigInt(Math.floor(Number(valorEsquerdo)));
                        const dir =
                            typeof valorDireito === 'bigint'
                                ? valorDireito
                                : BigInt(Math.floor(Number(valorDireito)));
                        return expressao.operador.tipo === tiposDeSimbolos.E
                            ? esq & dir
                            : esq | dir;
                    }

                    return expressao.operador.tipo === tiposDeSimbolos.E
                        ? Number(valorEsquerdo) & Number(valorDireito)
                        : Number(valorEsquerdo) | Number(valorDireito);
                }

                // Demais casos sem diferença de tipos
                if (expressao.operador.tipo === tiposDeSimbolos.OU) {
                    if (this.eVerdadeiro(esquerda)) return esquerda;
                    return direita;
                }

                if (expressao.operador.tipo === tiposDeSimbolos.E) {
                    if (!this.eVerdadeiro(esquerda)) return esquerda;
                    return direita;
                }
            }
        }

        // se um estado for verdadeiro, retorna verdadeiro
        if (expressao.operador.tipo === tiposDeSimbolos.OU) {
            if (this.eVerdadeiro(esquerda)) return esquerda;
        }

        // se um estado for falso, retorna falso
        if (expressao.operador.tipo === tiposDeSimbolos.E) {
            if (!this.eVerdadeiro(esquerda)) return esquerda;
        }

        return await this.avaliar(expressao.direita);
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        const declaracaoInicializador = Array.isArray(declaracao.inicializador)
            ? declaracao.inicializador[0]
            : declaracao.inicializador;

        if (declaracaoInicializador !== null && declaracaoInicializador !== undefined) {
            await this.avaliar(declaracaoInicializador);
        }

        let retornoExecucao: ResultadoParcialInterpretadorInterface | undefined | null = undefined;
        let iteracoes = 0;
        while (!(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) {
            if (
                declaracao.condicao !== null &&
                !this.eVerdadeiro(await this.avaliar(declaracao.condicao))
            ) {
                break;
            }

            this.registrarRamo?.(declaracao.hashArquivo, declaracao.linha, 'iteracao');
            try {
                await this.cederControle(++iteracoes);
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = undefined;
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }

            if (declaracao.incrementar) {
                await this.avaliar(declaracao.incrementar);
            }
        }

        return retornoExecucao;
    }

    /**
     * Lógica de `para cada`, usada por Delégua, Pituguês, e Tenda.
     * @param {ParaCada} declaracao A declaração de `para cada` a ser executada.
     * @returns {Promise<any>} O resultado da execução da declaração.
     */
    async visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        let retornoExecucao: ResultadoParcialInterpretadorInterface | undefined | null = undefined;
        // Posição atual precisa ser reiniciada, pois pode estar dentro de outro
        // laço de repetição.
        declaracao.posicaoAtual = 0;
        const vetorResolvido = await this.avaliar(declaracao.vetorOuDicionario);
        let valorVetorResolvido: any = this.resolverValor(vetorResolvido);

        // Se até aqui vetor resolvido é um dicionário, converte dicionário
        // para vetor de duplas.
        // TODO: Converter elementos para `Construto` se necessário.
        if (declaracao.vetorOuDicionario.tipo === 'dicionário') {
            valorVetorResolvido = Object.entries(valorVetorResolvido).map(
                (v) => new Dupla(v[0] as any, v[1] as any)
            );
        }

        if (!Array.isArray(valorVetorResolvido)) {
            return Promise.reject(
                "Variável ou literal provida em instrução 'para cada' não é um vetor."
            );
        }

        let iteracoes = 0;
        while (
            !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
            declaracao.posicaoAtual < valorVetorResolvido.length
        ) {
            this.registrarRamo?.(declaracao.hashArquivo, declaracao.linha, 'iteracao');
            try {
                await this.cederControle(++iteracoes);
                if (declaracao.variavelIteracao instanceof Variavel) {
                    this.pilhaEscoposExecucao.definirVariavel(
                        declaracao.variavelIteracao.simbolo.lexema,
                        valorVetorResolvido[declaracao.posicaoAtual]
                    );
                }

                if (declaracao.variavelIteracao instanceof Dupla) {
                    const valorComoDupla = valorVetorResolvido[declaracao.posicaoAtual] as Dupla;

                    const promises = await Promise.all([
                        this.avaliar(declaracao.variavelIteracao.primeiro),
                        this.avaliar(declaracao.variavelIteracao.segundo),
                    ]);

                    // TODO: O que fazer quando não forem literais?
                    this.pilhaEscoposExecucao.definirVariavel(
                        String((promises[0] as Literal).valor),
                        valorComoDupla.primeiro
                    );

                    this.pilhaEscoposExecucao.definirVariavel(
                        String((promises[1] as Literal).valor),
                        valorComoDupla.segundo
                    );
                }

                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = undefined;
                }

                declaracao.posicaoAtual++;
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }
        }

        return retornoExecucao;
    }

    /**
     * Executa uma expressão Se, que tem uma condição, pode ter um bloco
     * Senão, e múltiplos blocos Senão-se.
     * @param declaracao A declaração Se.
     * @returns O resultado da avaliação do bloco cuja condição é verdadeira.
     */
    async visitarDeclaracaoSe(declaracao: Se): Promise<any> {
        const avaliacaoCondicaoSe = await this.avaliar(declaracao.condicao);
        if (this.eVerdadeiro(avaliacaoCondicaoSe)) {
            this.registrarRamo?.(declaracao.hashArquivo, declaracao.linha, 'verdadeiro');
            return await this.executar(declaracao.caminhoEntao);
        }

        const declaracaoCaminhosSeSenao = declaracao.caminhosSeSenao || [];
        for (let i = 0; i < declaracaoCaminhosSeSenao.length; i++) {
            const atual = declaracaoCaminhosSeSenao[i];

            if (this.eVerdadeiro(await this.avaliar(atual.condicao))) {
                this.registrarRamo?.(declaracao.hashArquivo, declaracao.linha, 'verdadeiro');
                return await this.executar(atual.caminho);
            }
        }

        if (declaracao.caminhoSenao) {
            this.registrarRamo?.(declaracao.hashArquivo, declaracao.linha, 'senao');
            return await this.executar(declaracao.caminhoSenao);
        }

        this.registrarRamo?.(declaracao.hashArquivo, declaracao.linha, 'falso');
        return null;
    }

    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        let retornoExecucao: ResultadoParcialInterpretadorInterface | undefined | null = undefined;
        let iteracoes = 0;
        while (
            !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
            this.eVerdadeiro(await this.avaliar(declaracao.condicao))
        ) {
            this.registrarRamo?.(declaracao.hashArquivo, declaracao.linha, 'iteracao');
            try {
                await this.cederControle(++iteracoes);
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = undefined;
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }
        }

        return retornoExecucao;
    }

    async visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> {
        try {
            const condicaoEscolha = await this.avaliar(
                declaracao.identificadorOuLiteral
            );
            const valorCondicaoEscolha = this.resolverValor(condicaoEscolha);
            const caminhos = declaracao.caminhos;
            const caminhoPadrao = declaracao.caminhoPadrao;

            for (const caminho of caminhos) {
                for (const condicao of caminho.condicoes) {
                    const condicaoAvaliada = await this.avaliar(condicao);

                    if (condicaoAvaliada === valorCondicaoEscolha) {
                        return await this.executarBloco(caminho.declaracoes);
                    }
                }
            }

            if (caminhoPadrao !== null) {
                this.registrarRamo?.(
                    declaracao.hashArquivo,
                    declaracao.linha,
                    'caso-padrao'
                );

                return await this.executarBloco(caminhoPadrao.declaracoes);
            }
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });

            throw erro;
        }
    }

    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        let retornoExecucao: ResultadoParcialInterpretadorInterface | undefined | null = undefined;
        let iteracoes = 0;
        do {
            this.registrarRamo?.(declaracao.hashArquivo, declaracao.linha, 'iteracao');
            try {
                await this.cederControle(++iteracoes);
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return undefined;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = undefined;
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }
        } while (
            !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
            this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto))
        );
    }

    /**
     * Unifica a execução do bloco 'pegue', tratando tanto o caso de
     * declarações simples quanto o caso de função com parâmetro de erro.
     */
    private async executarBlocoPegue(
        pegue: FuncaoConstruto | Declaracao[],
        erro: any
    ): Promise<any> {
        if (Array.isArray(pegue)) {
            return await this.executarBloco(pegue);
        }

        // Caso seja FuncaoConstruto (pegue com parâmetro de erro)
        const literalErro = new Literal(
            pegue.hashArquivo,
            pegue.linha,
            erro.mensagem || erro.message || erro
        );
        const chamadaPegue = new Chamada(
            pegue.hashArquivo,
            pegue,
            [literalErro]
        );

        return await chamadaPegue.aceitar(this);
    }

    /**
     * Interpretação de uma declaração `tente`.
     * @param declaracao O objeto da declaração.
     */
    async visitarDeclaracaoTente(declaracao: Tente): Promise<any> {
        let valorRetorno: any;
        let sucessoNoTente = false;

        try {
            this.emDeclaracaoTente = true;

            try {
                valorRetorno = await this.executarBloco(
                    declaracao.caminhoTente
                );
                sucessoNoTente = true;
            } catch (erro: any) {
                if (declaracao.caminhoPegue !== null) {
                    valorRetorno = await this.executarBlocoPegue(
                        declaracao.caminhoPegue,
                        erro
                    );
                } else throw erro;
            }

            if (sucessoNoTente && declaracao.caminhoSenao) {
                valorRetorno = await this.executarBloco(
                    declaracao.caminhoSenao
                );
            }
        } finally {
            if (declaracao.caminhoFinalmente) {
                valorRetorno = await this.executarBloco(
                    declaracao.caminhoFinalmente
                );
            }

            this.emDeclaracaoTente = false;
        }

        return valorRetorno;
    }

    async visitarDeclaracaoImportar(declaracao: Importar): Promise<DeleguaModulo> {
        return Promise.reject('Importação de arquivos não suportada por Interpretador Base.');
    }

    protected async avaliarArgumentosEscreva(argumentos: ConstrutoInterface[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            let resultadoAvaliacao = await this.avaliar(argumento);
            if (
                resultadoAvaliacao &&
                resultadoAvaliacao.hasOwnProperty &&
                resultadoAvaliacao.hasOwnProperty('valorRetornado')
            ) {
                resultadoAvaliacao = resultadoAvaliacao.valorRetornado;
            }

            let valor = this.resolverValor(resultadoAvaliacao);
            formatoTexto += `${this.paraTexto(valor)} `;
        }

        return formatoTexto.trimEnd();
    }

    /**
     * Execução de uma escrita na saída padrão, sem quebras de linha.
     * Implementada para alguns dialetos, como VisuAlg.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscreva(declaracao.argumentos);
            this.funcaoDeRetornoMesmaLinha?.(formatoTexto);
            return {
                tipo: 'vazio',
                tipoExplicito: false,
            };
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });
        }
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
            this.funcaoDeRetorno?.(formatoTexto);
            return {
                tipo: 'vazio',
                tipoExplicito: false,
            };
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });
        }
    }

    /**
     * Empilha declarações na pilha de escopos de execução, cria um novo ambiente e
     * executa as declarações empilhadas.
     * Se o retorno do último bloco foi uma exceção (normalmente um erro em tempo de execução),
     * atira a exceção daqui.
     * Isso é usado, por exemplo, em blocos tente ... pegue ... finalmente.
     * @param declaracoes Um vetor de declaracoes a ser executado.
     * @param ambiente O ambiente de execução quando houver, como parâmetros, argumentos, etc.
     */
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
        const retornoUltimoEscopo: any = await this.executarUltimoEscopo();
        if (retornoUltimoEscopo instanceof ErroEmTempoDeExecucao) {
            return Promise.reject(retornoUltimoEscopo);
        }
        return retornoUltimoEscopo;
    }

    async visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        return await this.executarBloco(declaracao.declaracoes);
    }

    async avaliacaoDeclaracaoVarOuConst(
        declaracao: Const | ConstMultiplo | Var | VarMultiplo
    ): Promise<any> {
        let valorOuOutraVariavel = null;
        if (declaracao.inicializador != null) {
            valorOuOutraVariavel = await this.avaliar(declaracao.inicializador);
        }

        let valorFinal = null;
        if (valorOuOutraVariavel !== null && valorOuOutraVariavel !== undefined) {
            valorFinal = this.resolverValor(valorOuOutraVariavel);
        }

        return valorFinal;
    }

    /**
     * Executa expressão de definição de constante.
     * @param declaracao A declaração `Const`.
     * @returns Um descritor de informações importantes para o retorno externo.
     */
    async visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        const valorFinal = await this.avaliacaoDeclaracaoVarOuConst(declaracao);

        this.pilhaEscoposExecucao.definirConstante(
            declaracao.simbolo.lexema,
            valorFinal,
            declaracao.tipo
        );

        return {
            tipo: declaracao.tipo,
            tipoExplicito: declaracao.tipoExplicito,
        };
    }

    /**
     * Executa expressão de definição de múltiplas constantes.
     * @param declaracao A declaração `ConstMultiplo`.
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        const valoresFinais: any[] = await this.avaliacaoDeclaracaoVarOuConst(declaracao);
        const tipoIndividual = (declaracao.tipo || '').replace('[]', '');
        for (let [indice, valor] of valoresFinais.entries()) {
            this.pilhaEscoposExecucao.definirConstante(
                declaracao.simbolos[indice].lexema,
                valor,
                tipoIndividual
            );
        }

        return null;
    }

    visitarExpressaoContinua(_?: Continua): ContinuarQuebra {
        return new ContinuarQuebra();
    }

    visitarExpressaoSustar(_?: any): SustarQuebra {
        return new SustarQuebra();
    }

    async visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        let valor = null;
        if (declaracao.valor != null) valor = await this.avaliar(declaracao.valor);

        return new RetornoQuebra(valor);
    }

    async visitarExpressaoFuncaoConstruto(
        funcaoConstruto: FuncaoConstruto
    ): Promise<DeleguaFuncao> {
        return new DeleguaFuncao(null, funcaoConstruto);
    }

    async visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        const promises = await Promise.all([
            this.avaliar(expressao.objeto),
            this.avaliar(expressao.indice),
            this.avaliar(expressao.valor),
        ]);

        let objeto = promises[0];
        let indice = promises[1];
        const valor = promises[2];

        if (objeto.tipo === tipoDeDadosDelegua.TUPLA) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    (expressao.objeto as any).simbolo.lexema,
                    'Não é possível modificar uma tupla. As tuplas são estruturas de dados imutáveis.',
                    expressao.linha
                )
            );
        }

        objeto = this.resolverValor(objeto);
        indice = this.resolverValor(indice);

        if (Array.isArray(objeto)) {
            if (indice < 0 && objeto.length !== 0) {
                while (indice < 0) {
                    indice += objeto.length;
                }
            }

            while (objeto.length < indice) {
                objeto.push(null);
            }

            objeto[indice] = valor;
        } else if (
            objeto.constructor === Object ||
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DescritorTipoClasse ||
            objeto instanceof DeleguaModulo
        ) {
            objeto[indice] = valor;
        } else {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    (expressao.objeto as any).nome,
                    'Somente listas, dicionários, classes e objetos podem ser mudados por índice.',
                    expressao.linha
                )
            );
        }
    }

    async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> {
        const promises = await Promise.all([
            this.avaliar(expressao.entidadeChamada),
            this.avaliar(expressao.indice),
        ]);

        const variavelObjeto: VariavelInterface = promises[0];
        const indice = promises[1];

        const objeto = this.resolverValor(variavelObjeto);
        let valorIndice = this.resolverValor(indice);

        if (Array.isArray(objeto)) {
            if (!Number.isInteger(valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar um vetor.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice < 0 && objeto.length !== 0) {
                while (valorIndice < 0) {
                    valorIndice += objeto.length;
                }
            }

            if (valorIndice >= objeto.length) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice do vetor fora do intervalo.',
                        expressao.linha
                    )
                );
            }

            return objeto[valorIndice];
        }

        if (objeto instanceof TuplaN || objeto.constructor.name === 'TuplaN') {
            if (!Number.isInteger(valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar uma tupla.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice < 0 && objeto.elementos.length !== 0) {
                valorIndice += objeto.elementos.length;
            }

            if (valorIndice >= objeto.elementos.length || valorIndice < 0) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice da tupla fora de intervalo.',
                        expressao.linha
                    )
                );
            }

            const elemento = objeto.elementos[valorIndice];
            if (elemento && elemento.constructor && elemento.constructor.name === 'Literal') {
                return elemento.valor;
            }

            return elemento;
        }

        if (objeto instanceof Vetor) {
            return objeto.valores[valorIndice];
        }

        if (objeto.constructor === Object) {
            if (!Object.prototype.hasOwnProperty.call(objeto, valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        `Chave '${valorIndice}' não encontrada no dicionário.`,
                        expressao.linha
                    )
                );
            }
            if (objeto[valorIndice] === 0) return 0;
            return objeto[valorIndice];
        }

        if (
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DescritorTipoClasse ||
            objeto instanceof DeleguaModulo
        ) {
            if (objeto[valorIndice] === 0) return 0;
            return objeto[valorIndice] || null;
        }

        if (typeof objeto === tipoDeDadosPrimitivos.TEXTO) {
            if (!Number.isInteger(valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar um vetor.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice < 0 && objeto.length !== 0) {
                while (valorIndice < 0) {
                    valorIndice += objeto.length;
                }
            }

            if (valorIndice >= objeto.length) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice fora do tamanho.',
                        expressao.linha
                    )
                );
            }

            return objeto.charAt(valorIndice);
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: this.hashArquivoDeclaracaoAtual,
                    linha: this.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Somente listas, dicionários, classes e objetos podem ter seus valores indexados.',
                expressao.linha
            )
        );
    }

    /**
     * Método base para acesso a intervalo.
     * Por padrão lança erro, pois a maioria dos dialetos (como Delégua padrão)
     * ainda não suporta isso nativamente, apenas Pituguês.
     */
    visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                expressao.simboloFechamento,
                'Acesso por intervalo não implementado para este dialeto.',
                expressao.linha
            )
        );
    }

    async visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = this.resolverValor(variavelObjeto);

        if (objeto.constructor !== ObjetoDeleguaClasse && objeto.constructor !== Object) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.nome,
                    'Somente instâncias e dicionários podem possuir campos.',
                    expressao.linha
                )
            );
        }

        const valor = await this.avaliar(expressao.valor);
        if (objeto.constructor === ObjetoDeleguaClasse) {
            await objeto.definir(expressao.nome, valor, this);
            return valor;
        }

        if (objeto.constructor === Object) {
            objeto[expressao.nome.lexema] = valor;
        }
    }

    async visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> {
        const funcao: any = new DeleguaFuncao(declaracao.simbolo.lexema, declaracao.funcao);
        funcao.documentacao = declaracao.documentacao;
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, funcao);
        this.pilhaEscoposExecucao.registrarReferenciaFuncao(declaracao.id, funcao);
        return { declaracao: funcao };
    }

    /**
     * Executa uma declaração de classe.
     * Uma variável do tipo `DeleguaClasse` é adicionada à pilha de escopos de execução.
     * @param declaracao A declaração de classe.
     * @returns Sempre retorna nulo, por ser requerido pelo contrato de visita.
     */
    async visitarDeclaracaoClasse(declaracao: Classe): Promise<DescritorTipoClasse> {
        // Resolver cada superclasse listada em `herda A, B, ...`
        const superClassesResolvidas: DescritorTipoClasse[] = [];
        for (const superClasseVariavel of declaracao.superClasses) {
            const variavelSuperClasse: VariavelInterface = await this.avaliar(superClasseVariavel);
            const superClasse = variavelSuperClasse.valor;
            if (!(superClasse instanceof DescritorTipoClasse)) {
                throw new ErroEmTempoDeExecucao(
                    superClasseVariavel.nome,
                    'Superclasse precisa ser uma classe.',
                    declaracao.linha
                );
            }
            superClassesResolvidas.push(superClasse);
        }

        // Resolver cada misturável listado em `mescla X, Y, ...`
        const mesclaResolvidas: DescritorTipoClasse[] = [];
        for (const mesclaVariavel of declaracao.mesclas) {
            const variavelMisturavel: VariavelInterface = await this.avaliar(mesclaVariavel);
            const misturável = variavelMisturavel.valor;
            if (!(misturável instanceof DescritorTipoClasse)) {
                throw new ErroEmTempoDeExecucao(
                    mesclaVariavel.nome,
                    'Misturável precisa ser uma classe.',
                    declaracao.linha
                );
            }
            mesclaResolvidas.push(misturável);
        }

        // TODO: Precisamos disso?
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, declaracao);

        if (superClassesResolvidas.length > 0) {
            this.pilhaEscoposExecucao.definirVariavel('super', superClassesResolvidas[0]);
        }

        const descritorTipoClasse = this.resolverMetodoDeClasse(
            declaracao,
            superClassesResolvidas,
            mesclaResolvidas
        );

        // TODO: Até então, a única exceção a isso é Égua Clássico.
        // Por enquanto, tudo bem deixar isso aqui.
        descritorTipoClasse.dialetoRequerDeclaracaoPropriedades = this.requerDeclaracaoPropriedades;

        this.pilhaEscoposExecucao.atribuirVariavel(declaracao.simbolo, descritorTipoClasse);
        return descritorTipoClasse;
    }

    protected resolverMetodoDeClasse(
        declaracao: Classe,
        superClassesResolvidas: DescritorTipoClasse[],
        _mesclaResolvidas: DescritorTipoClasse[]
    ): DescritorTipoClasse {
        if (declaracao.estrangeira && this.despachadorFFI) {
            const descritorFFI = this.despachadorFFI.resolverClasseEstrangeira(declaracao);
            if (descritorFFI) {
                descritorFFI.estrangeira = true;
                descritorFFI.orem = DescritorTipoClasse.computarOReM(descritorFFI);
                return descritorFFI;
            }
        }

        const metodos: { [nome: string]: DeleguaFuncao | DeleguaFuncao[] } = {};
        for (const metodoAtual of declaracao.metodos) {
            const nomeMetodo = metodoAtual.simbolo.lexema;
            const eInicializador = nomeMetodo === 'construtor';
            const funcao = new DeleguaFuncao(
                nomeMetodo,
                metodoAtual.funcao,
                undefined,
                eInicializador
            );
            funcao.documentacao = metodoAtual.documentacao;
            metodos[nomeMetodo] = funcao;
        }

        const descritorTipoClasse = new DescritorTipoClasse(
            declaracao.simbolo,
            superClassesResolvidas,
            metodos,
            declaracao.propriedades
        );

        if (
            descritorTipoClasse.superClasses.length === 0 &&
            OBJETO_BASE &&
            descritorTipoClasse !== OBJETO_BASE
        ) {
            descritorTipoClasse.superClasses = [OBJETO_BASE];
        }

        descritorTipoClasse.orem = DescritorTipoClasse.computarOReM(descritorTipoClasse);
        if (declaracao.estrangeira) {
            descritorTipoClasse.estrangeira = true;
        }
        return descritorTipoClasse;
    }

    /**
     * Registra uma declaração de interface no ambiente de execução.
     * Interfaces são verificadas em tempo de análise; em tempo de execução, apenas registramos
     * o nome para possíveis verificações futuras (ex: `eInstanciaDe`).
     */
    async visitarDeclaracaoInterface(_declaracao: InterfaceDeclaracao): Promise<void> {
        // Interfaces não possuem comportamento em tempo de execução.
        // São contratos verificados em tempo de análise sintática.
        return Promise.resolve();
    }

    /**
     * Procura um método de extensão nos registros de módulo e global,
     * percorrendo os tipos na ordem indicada (específico antes de base).
     */
    encontrarMetodoExtensao(
        tiposParaVerificar: string[],
        nomeMetodo: string,
        hashArquivo: number
    ): DeleguaFuncao | undefined {
        // Extensões module-scoped têm prioridade sobre as globais.
        const extensoesDoModulo = this.extensoesModulo.get(hashArquivo);
        if (extensoesDoModulo) {
            for (const tipo of tiposParaVerificar) {
                const metodo = extensoesDoModulo.get(tipo)?.get(nomeMetodo);
                if (metodo) return metodo;
            }
        }
        for (const tipo of tiposParaVerificar) {
            const metodo = this.extensoesGlobais.get(tipo)?.get(nomeMetodo);
            if (metodo) return metodo;
        }
        return undefined;
    }

    /**
     * Registra os métodos de uma declaração de extensão nos registros
     * de extensão do interpretador.
     */
    async visitarDeclaracaoExtensao(declaracao: Extensao): Promise<void> {
        const tipoNome = declaracao.simboloTipo.lexema;

        for (const metodoDeclarado of declaracao.metodos) {
            const nomeMetodo = metodoDeclarado.simbolo.lexema;
            const funcao = new DeleguaFuncao(nomeMetodo, metodoDeclarado.funcao);

            if (declaracao.ehGlobal) {
                if (!this.extensoesGlobais.has(tipoNome)) {
                    this.extensoesGlobais.set(tipoNome, new Map());
                }

                const extensaoGlobal = this.extensoesGlobais.get(tipoNome);
                extensaoGlobal?.set(nomeMetodo, funcao);
            } else {
                const hash = declaracao.hashArquivo;
                if (!this.extensoesModulo.has(hash)) {
                    this.extensoesModulo.set(hash, new Map());
                }
                const mapa = this.extensoesModulo.get(hash);

                if (!mapa) {
                    throw new ErroEmTempoDeExecucao(
                        declaracao.simboloTipo,
                        'Erro interno: mapa de extensões do módulo não encontrado.',
                        declaracao.linha
                    );
                }

                if (!mapa.has(tipoNome)) {
                    mapa?.set(tipoNome, new Map());
                }
                mapa.get(tipoNome)?.set(nomeMetodo, funcao);
            }
        }
    }

    /**
     * Executa um acesso a método, normalmente de um objeto de classe.
     * @param {AcessoMetodoOuPropriedade} expressao A expressão de acesso.
     * @returns O resultado da execução.
     */
    async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);
        const nomeObjeto = this.resolverNomeObjectoAcessado(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor === RetornoQuebra) {
            variavelObjeto = (variavelObjeto as RetornoQuebra).valor;
        }

        const objeto = this.resolverValor(variavelObjeto);

        // Outro caso que `instanceof` simplesmente não funciona para casos em Liquido,
        // então testamos também o nome do construtor.
        if (
            objeto instanceof ObjetoDeleguaClasse ||
            objeto.constructor.name === 'ObjetoDeleguaClasse'
        ) {
            const valor = await objeto.obter(expressao.simbolo, this);
            if (valor === 0) return 0;
            return valor || null;
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.simbolo.lexema in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.simbolo.lexema].implementacao;
                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodoDePrimitivaDicionario,
                    expressao.simbolo.lexema,
                    'dicionário'
                );
            }

            return objeto[expressao.simbolo.lexema];
        }

        // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
        // Normalmente executam quando uma biblioteca é importada, e estamos tentando
        // obter alguma propriedade ou método desse objeto.

        // Caso 1: Função tradicional do JavaScript.
        if (typeof objeto[expressao.simbolo.lexema] === tipoDeDadosPrimitivos.FUNCAO) {
            return objeto[expressao.simbolo.lexema];
        }

        // Caso 2: Objeto tradicional do JavaScript.
        if (typeof objeto[expressao.simbolo.lexema] === tipoDeDadosPrimitivos.OBJETO) {
            return objeto[expressao.simbolo.lexema];
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        // Trata qualquer tipo terminado em '[]' como vetor
        if (tipoObjeto && tipoObjeto.endsWith('[]')) {
            if (expressao.simbolo.lexema in primitivasVetor) {
                const metodo = primitivasVetor[expressao.simbolo.lexema].implementacao as (...args: any[]) => any;

                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodo,
                    expressao.simbolo.lexema,
                    tipoObjeto
                );
            }
        }

        // Caso 3: Vetor simples do JavaScript.
        if (Array.isArray(objeto)) {
            if (expressao.simbolo.lexema in primitivasVetor) {
                const metodoDePrimitivaVetor: Function =
                    primitivasVetor[expressao.simbolo.lexema].implementacao;
                // TODO: Um problema a ser resolvido na questão de vetores é quando eles pertencem a outro objeto.
                // Por exemplo, um dicionário.
                // Existe uma lógica nas bibliotecas padrão que, quando a primitiva tem um nome, ela deve ser definida na
                // pilha de escopos, para registrar a mutação do vetor corretamente.
                // Não é uma boa solução. Algo melhor precisa ser feito.
                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodoDePrimitivaVetor,
                    expressao.simbolo.lexema,
                    tipoObjeto
                );
            }
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.simbolo.lexema] || null;
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                expressao.simbolo,
                `Método ou propriedade para objeto não encontrado: ${expressao.simbolo.lexema}.`,
                expressao.linha
            )
        );
    }

    visitarExpressaoIsto(expressao: Isto): any {
        return this.procurarVariavel(expressao.simboloChave);
    }

    async visitarExpressaoDicionario(expressao: Dicionario): Promise<any> {
        const dicionario: { [chave: string]: any } = {};
        for (let i = 0; i < expressao.chaves.length; i++) {
            if (expressao.esSpread && expressao.esSpread[i]) {
                const dicionarioParaDesempacotar = this.resolverValor(
                    await this.avaliar(expressao.valores[i])
                );

                // Validação: verificar se é realmente um dicionário
                if (
                    typeof dicionarioParaDesempacotar !== 'object' ||
                    dicionarioParaDesempacotar === null ||
                    Array.isArray(dicionarioParaDesempacotar)
                ) {
                    throw new ErroEmTempoDeExecucao(
                        { linha: expressao.linha, lexema: '**' } as any,
                        `Operador '**' só pode ser usado com dicionários. Tipo encontrado: ${
                            dicionarioParaDesempacotar === null
                                ? 'nulo'
                                : Array.isArray(dicionarioParaDesempacotar)
                                  ? 'vetor'
                                  : typeof dicionarioParaDesempacotar
                        }`,
                        expressao.linha
                    );
                }

                // Desempacotar: copiar todas as propriedades
                Object.assign(dicionario, dicionarioParaDesempacotar);
            } else {
                const promises = await Promise.all([
                    this.avaliar(expressao.chaves[i]),
                    this.avaliar(expressao.valores[i]),
                ]);

                if (typeof promises[0] === 'boolean') {
                    const chaveLogico: string = promises[0] === true ? 'verdadeiro' : 'falso';
                    dicionario[chaveLogico] = this.resolverValor(promises[1]);
                    continue;
                }

                dicionario[promises[0].toString()] = this.resolverValor(promises[1]);
            }
        }

        return dicionario;
    }

    async visitarExpressaoVetor(expressao: Vetor): Promise<any> {
        const valores = [];
        for (let i = 0; i < expressao.elementos.length; i++) {
            valores.push(this.resolverValor(await this.avaliar(expressao.elementos[i])));
        }

        return valores;
    }

    visitarExpressaoSuper(expressao: Super): any {
        const objeto: VariavelInterface = this.pilhaEscoposExecucao.obterVariavelPorNome('isto');
        return objeto.valor;
    }

    /**
     * Executa expressão de definição de variável.
     * @param declaracao A declaração Var
     * @returns Um descritor de informações importantes para o retorno externo.
     */
    async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        const valorFinal = await this.avaliacaoDeclaracaoVarOuConst(declaracao);
        let tipoResolvido = declaracao.tipo;
        if (tipoResolvido.startsWith('função<')) {
            tipoResolvido = tipoResolvido.replace('função<', '').replace('>', '');
        }

        if (!declaracao.tipoExplicito && tipoResolvido === tipoDeDadosDelegua.QUALQUER && valorFinal instanceof Array) {
            tipoResolvido = inferirTipoVariavel(valorFinal) as string;
        }

        this.pilhaEscoposExecucao.definirVariavel(
            declaracao.simbolo.lexema,
            valorFinal,
            tipoResolvido,
            declaracao.tipoExplicito && declaracao.tipoOriginal !== 'qualquer'
        );

        // TODO: É relevante registrar uma declaração de variável no
        // resultado do interpretador?
        /* return {
            tipo: declaracao.tipo,
            tipoExplicito: declaracao.tipoExplicito
        }; */
        return null;
    }

    /**
     * Executa expressão de definição de múltiplas variáveis.
     * @param declaracao A declaração `VarMultiplo`.
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        const valoresFinais: any[] = await this.avaliacaoDeclaracaoVarOuConst(declaracao);
        const tipoIndividual = (declaracao.tipo || '').replace('[]', '');
        for (let [indice, valor] of valoresFinais.entries()) {
            this.pilhaEscoposExecucao.definirVariavel(
                declaracao.simbolos[indice].lexema,
                valor,
                tipoIndividual
            );
        }

        return null;
    }

    /**
     * Formata uma string usando o operador % (similar ao Python).
     * @param formato A string de formato com especificadores (ex: "Olá %s").
     * @param valores Os valores para substituir (pode ser um único valor ou uma tupla/vetor).
     * @param operador O símbolo do operador para mensagens de erro.
     * @returns A string formatada.
     */
    private formatarStringComOperadorPorcentagem(
        formato: string,
        valores: any,
        operador: any
    ): string {
        let valoresArray: any[];

        // Verificar se é uma TuplaN (verifica instanceof OU propriedade elementos/tipo para maior compatibilidade)
        if (
            valores instanceof TuplaN ||
            (valores &&
                valores.tipo === 'tupla' &&
                valores.elementos &&
                Array.isArray(valores.elementos))
        ) {
            valoresArray = valores.elementos.map((elem: any) => {
                if (
                    elem instanceof Literal ||
                    (elem && typeof elem === 'object' && elem.hasOwnProperty('valor'))
                ) {
                    return this.resolverValor(elem.valor);
                }
                return this.resolverValor(elem);
            });
        } else if (Array.isArray(valores)) {
            valoresArray = valores.map((v) => this.resolverValor(v));
        } else {
            const valorResolvido = this.resolverValor(valores);

            if (Array.isArray(valorResolvido)) {
                valoresArray = valorResolvido.map((v) => this.resolverValor(v));
            } else {
                valoresArray = [valorResolvido];
            }
        }

        let indiceValor = 0;
        let resultado = '';
        let i = 0;

        while (i < formato.length) {
            if (formato[i] === '%') {
                if (i + 1 >= formato.length) {
                    throw new ErroEmTempoDeExecucao(
                        operador,
                        'Formato inválido: % no final da string',
                        operador.linha
                    );
                }

                const proximoChar = formato[i + 1];

                // %% -> % literal
                if (proximoChar === '%') {
                    resultado += '%';
                    i += 2;
                    continue;
                }

                // Verificar se ainda temos valores para substituir
                if (indiceValor >= valoresArray.length) {
                    throw new ErroEmTempoDeExecucao(
                        operador,
                        'Argumentos insuficientes para a string de formatação',
                        operador.linha
                    );
                }

                const valor = valoresArray[indiceValor];
                indiceValor++;

                // Processar especificadores de formato
                if (proximoChar === 's') {
                    // %s - string
                    resultado += this.paraTexto(valor);
                    i += 2;
                } else if (proximoChar === 'd') {
                    // %d - inteiro
                    const valorNumerico = Number(valor);
                    if (isNaN(valorNumerico)) {
                        throw new ErroEmTempoDeExecucao(
                            operador,
                            `Esperado número para %d, mas recebeu ${typeof valor}`,
                            operador.linha
                        );
                    }
                    resultado += Math.floor(valorNumerico).toString();
                    i += 2;
                } else if (proximoChar === 'f') {
                    // %f - flutuante
                    const valorNumerico = Number(valor);
                    if (isNaN(valorNumerico)) {
                        throw new ErroEmTempoDeExecucao(
                            operador,
                            `Esperado número para %f, mas recebeu ${typeof valor}`,
                            operador.linha
                        );
                    }
                    resultado += valorNumerico.toString();
                    i += 2;
                } else if (proximoChar === '.') {
                    // %.nf - flutuante com n casas decimais
                    let j = i + 2;
                    let casasDecimais = '';
                    while (j < formato.length && formato[j] >= '0' && formato[j] <= '9') {
                        casasDecimais += formato[j];
                        j++;
                    }

                    if (j >= formato.length || formato[j] !== 'f') {
                        throw new ErroEmTempoDeExecucao(
                            operador,
                            'Formato inválido: esperado %.nf (ex: %.2f)',
                            operador.linha
                        );
                    }

                    const precisao = parseInt(casasDecimais, 10);
                    const valorNumerico = Number(valor);
                    if (isNaN(valorNumerico)) {
                        throw new ErroEmTempoDeExecucao(
                            operador,
                            `Esperado número para %.${precisao}f, mas recebeu ${typeof valor}`,
                            operador.linha
                        );
                    }
                    resultado += valorNumerico.toFixed(precisao);
                    i = j + 1;
                } else if (proximoChar === 'x') {
                    // %x - hexadecimal (caixa baixa)
                    const valorNumerico = Number(valor);
                    if (isNaN(valorNumerico)) {
                        throw new ErroEmTempoDeExecucao(
                            operador,
                            `Esperado número para %x, mas recebeu ${typeof valor}`,
                            operador.linha
                        );
                    }
                    resultado += Math.floor(valorNumerico).toString(16);
                    i += 2;
                } else if (proximoChar === 'X') {
                    // %X - hexadecimal (caixa alta)
                    const valorNumerico = Number(valor);
                    if (isNaN(valorNumerico)) {
                        throw new ErroEmTempoDeExecucao(
                            operador,
                            `Esperado número para %X, mas recebeu ${typeof valor}`,
                            operador.linha
                        );
                    }
                    resultado += Math.floor(valorNumerico).toString(16).toUpperCase();
                    i += 2;
                } else if (proximoChar === 'o') {
                    // %o - octal
                    const valorNumerico = Number(valor);
                    if (isNaN(valorNumerico)) {
                        throw new ErroEmTempoDeExecucao(
                            operador,
                            `Esperado número para %o, mas recebeu ${typeof valor}`,
                            operador.linha
                        );
                    }
                    resultado += Math.floor(valorNumerico).toString(8);
                    i += 2;
                } else {
                    throw new ErroEmTempoDeExecucao(
                        operador,
                        `Especificador de formato desconhecido: %${proximoChar}`,
                        operador.linha
                    );
                }
            } else {
                resultado += formato[i];
                i++;
            }
        }

        // Verificar se há valores não utilizados
        if (indiceValor < valoresArray.length) {
            throw new ErroEmTempoDeExecucao(
                operador,
                'Nem todos os argumentos foram convertidos durante a formatação da string.',
                operador.linha
            );
        }

        return resultado;
    }

    paraTexto(objeto: any): string {
        if (objeto === null || objeto === undefined) return tipoDeDadosDelegua.NULO;
        if (typeof objeto === tipoDeDadosPrimitivos.BOOLEANO) {
            return objeto ? 'verdadeiro' : 'falso';
        }

        if (objeto.valor instanceof ObjetoPadrao) return objeto.valor.paraTexto();
        if (objeto instanceof Literal) return this.paraTexto(objeto.valor);
        if (
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DescritorTipoClasse
        )
            return objeto.paraTexto();

        if (objeto instanceof RetornoQuebra) {
            if (typeof objeto.valor === 'boolean') return objeto.valor ? 'verdadeiro' : 'falso';
        }

        if (objeto instanceof Date) {
            const formato = Intl.DateTimeFormat('pt', {
                dateStyle: 'full',
                timeStyle: 'full',
            });
            return formato.format(objeto);
        }

        if (Array.isArray(objeto)) {
            let retornoVetor: string = '[';
            for (let elemento of objeto) {
                if (typeof elemento === 'object') {
                    retornoVetor += `${JSON.stringify(elemento)}, `;
                    continue;
                }
                retornoVetor +=
                    typeof elemento === 'string'
                        ? `'${elemento}', `
                        : `${this.paraTexto(elemento)}, `;
            }

            if (retornoVetor.length > 1) {
                retornoVetor = retornoVetor.slice(0, -2);
            }
            retornoVetor += ']';

            return retornoVetor;
        }

        switch (objeto.constructor) {
            case Object:
                if ('tipo' in objeto) {
                    switch (objeto.tipo) {
                        case 'dicionário':
                            const valorResolvido = this.resolverValorRecursivo(objeto.valor);
                            return JSON.stringify(valorResolvido);
                        default:
                            return objeto.valor;
                    }
                }
        }

        if (typeof objeto === tipoDeDadosPrimitivos.OBJETO) {
            const objetoEscrita: { [chave: string]: any } = {};
            for (const propriedade in objeto) {
                let valor = objeto[propriedade];
                if (typeof valor === tipoDeDadosPrimitivos.BOOLEANO) {
                    valor = valor ? 'verdadeiro' : 'falso';
                }

                objetoEscrita[propriedade] = valor;
            }

            return JSON.stringify(objetoEscrita);
        }

        return objeto.toString();
    }

    /**
     * Efetivamente executa uma declaração.
     * @param declaracao A declaração a ser executada.
     * @returns O resultado parcial da execução, normalmente usado por
     *          ferramentas externas.
     */
    async executar(declaracao: Declaracao): Promise<ResultadoParcialInterpretadorInterface | null> {
        const resultado: any = await declaracao.aceitar(this);

        // Alguns casos não possuem retorno, como declarações `se`, `enquanto`, etc.,
        // que não satisfazem suas respectivas condições.
        if (resultado === null || resultado === undefined) {
            return null;
        }

        // Se o retorno já possui um `valorRetornado`, apenas retorna o resultado.
        if (resultado.hasOwnProperty('valorRetornado')) {
            return resultado;
        }

        let tipoResultado = resultado.tipo;
        switch (resultado.constructor) {
            case DescritorTipoClasse:
                tipoResultado = resultado.simboloOriginal.lexema;
                break;
            default:
                if (!tipoResultado) {
                    tipoResultado = inferirTipoVariavel(resultado);
                }
                break;
        }

        return {
            hashArquivo: declaracao.hashArquivo,
            linha: declaracao.linha,
            valorRetornado: resultado,
            tipo: tipoResultado,
        } as ResultadoParcialInterpretadorInterface;
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
        let retornoExecucao: any;
        try {
            for (
                ;
                !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
                ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
                this.linhaDeclaracaoAtual = declaracaoAtual.linha;
                this.hashArquivoDeclaracaoAtual = declaracaoAtual.hashArquivo;
                retornoExecucao = await this.executar(declaracaoAtual);
            }

            return retornoExecucao;
        } catch (erro: any) {
            const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
            if (!this.emDeclaracaoTente) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracaoAtual.linha,
                    hashArquivo: declaracaoAtual.hashArquivo,
                });
            } else {
                return Promise.reject(erro);
            }
        } finally {
            this.pilhaEscoposExecucao.removerUltimo();
            const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();

            if (manterAmbiente || (retornoExecucao && retornoExecucao.preservarEscopo === true)) {
                escopoAnterior.espacoMemoria.valores = Object.assign(
                    escopoAnterior.espacoMemoria.valores,
                    ultimoEscopo.espacoMemoria.valores
                );
            }
        }
    }

    /**
     * Interpretação sem depurador, com medição de performance.
     * Método que efetivamente inicia o processo de interpretação.
     * @param declaracoes Um vetor de declarações gerado pelo Avaliador Sintático.
     * @param manterAmbiente Se ambiente de execução (variáveis, classes, etc.) deve ser mantido. Normalmente usado
     *                       pelo modo REPL (LAIR).
     * @returns Um objeto com o resultado da interpretação.
     */
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
        manterAmbiente = false
    ): Promise<RetornoInterpretadorInterface> {
        this.erros = [];
        this.emDeclaracaoTente = false;
        this.linhaDeclaracaoAtual = -1;
        this.hashArquivoDeclaracaoAtual = -1;

        const escopoExecucao: EscopoExecucaoInterface = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        const inicioInterpretacao: [number, number] = hrtime();
        try {
            const retornoOuErro = await this.executarUltimoEscopo(manterAmbiente);

            if (retornoOuErro !== undefined) {
                this.resultadoInterpretador.push(retornoOuErro);
            }
        } catch (erro: any) {
            throw new Error(
                `Não deveria estar caindo aqui. Há erros no interpretador que não estão tratados corretamente. Erro atual: ${JSON.stringify(erro)}.`
            );
        } finally {
            if (this.performance) {
                const deltaInterpretacao: [number, number] = hrtime(inicioInterpretacao);
                console.log(
                    `[Interpretador] Tempo para interpretaçao: ${deltaInterpretacao[0] * 1e9 + deltaInterpretacao[1]}ns`
                );
            }

            if (!manterAmbiente) {
                this.despachadorFFI?.descarregarTudo();
            }

            const retorno = {
                erros: this.erros,
                resultado: this.resultadoInterpretador,
            } as RetornoInterpretadorInterface;

            this.resultadoInterpretador = [];
            return retorno;
        }
    }
}
