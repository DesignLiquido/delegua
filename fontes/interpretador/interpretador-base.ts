import hrtime from 'browser-process-hrtime';

import {
    Aleatorio,
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
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    InicioAlgoritmo,
    Para,
    ParaCada,
    Retorna,
    Se,
    TendoComo,
    Tente,
    Var,
    VarMultiplo,
} from '../declaracoes';
import {
    Chamavel,
    DescritorTipoClasse,
    DeleguaFuncao,
    ObjetoDeleguaClasse,
    DeleguaModulo,
    FuncaoPadrao,
    ObjetoPadrao,
} from './estruturas';
import {
    AcessoIndiceVariavel,
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
    Construto,
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
    Unario,
    Variavel,
    Vetor,
    ListaCompreensao,
} from '../construtos';
import { ErroInterpretador } from '../interfaces/erros/erro-interpretador';
import { RetornoInterpretadorInterface } from '../interfaces/retornos/retorno-interpretador-interface';
import { EscopoExecucao } from '../interfaces/escopo-execucao';
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
import { carregarBibliotecasGlobais } from './comum';
import { ErroEmTempoDeExecucao } from '../excecoes';
import {
    InterpretadorInterface,
    ResultadoParcialInterpretadorInterface,
    SimboloInterface,
    VariavelInterface,
} from '../interfaces';

import primitivasDicionario from '../bibliotecas/primitivas-dicionario';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import tipoDeDadosPrimitivos from '../tipos-de-dados/primitivos';
import tipoDeDadosDelegua from '../tipos-de-dados/delegua';

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
    erros: ErroInterpretador[];
    declaracoes: Declaracao[];
    resultadoInterpretador: ResultadoParcialInterpretadorInterface[] = [];
    linhaDeclaracaoAtual: number;
    hashArquivoDeclaracaoAtual: number;

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
    funcaoDeRetorno: Function = null;
    funcaoDeRetornoMesmaLinha: Function = null;
    interfaceDeEntrada: any = null; // Originalmente é `readline.Interface`
    interfaceEntradaSaida: any = null;
    emDeclaracaoTente: boolean = false;

    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;

    microLexador: MicroLexador = new MicroLexador();
    microAvaliadorSintatico: MicroAvaliadorSintaticoBase = new MicroAvaliadorSintatico();

    regexInterpolacao = /\${(.*?)}/g;
    private tiposNumericos = [
        tipoDeDadosDelegua.INTEIRO,
        tipoDeDadosDelegua.NUMERO,
        tipoDeDadosDelegua.NÚMERO,
        tipoDeDadosDelegua.REAL,
    ];

    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        this.diretorioBase = diretorioBase;
        this.performance = performance;

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.funcaoDeRetornoMesmaLinha =
            funcaoDeRetornoMesmaLinha || process.stdout.write.bind(process.stdout);

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
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        carregarBibliotecasGlobais(this.pilhaEscoposExecucao);
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
     * @param {Construto} objetoAcessado O objeto que está sendo acessado.
     * @returns O nome desse objeto, se ele for uma variável ou constante.
     * @see resolverValor
     */
    protected resolverNomeObjectoAcessado(objetoAcessado: Construto): string {
        if (objetoAcessado instanceof Variavel) {
            return objetoAcessado.simbolo.lexema;
        }

        if (objetoAcessado instanceof Constante) {
            return objetoAcessado.simbolo.lexema;
        }

        return '';
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

    visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error('Método não implementado.');
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
        const retornoInicializacao = await this.avaliar(declaracao.inicializacaoVariavel);
        const retornoInicializacaoResolvido = this.resolverValor(retornoInicializacao);
        this.pilhaEscoposExecucao.definirConstante(
            declaracao.simboloVariavel.lexema,
            retornoInicializacaoResolvido
        );
        await this.executar(declaracao.corpo);

        if (retornoInicializacao instanceof ObjetoDeleguaClasse) {
            const metodoFinalizar = retornoInicializacaoResolvido.classe.metodos['finalizar'];
            if (metodoFinalizar) {
                const chamavel = metodoFinalizar.funcaoPorMetodoDeClasse(
                    retornoInicializacaoResolvido
                );
                chamavel.chamar(this, []);
            }
        }

        return null;
    }

    async visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        const chaves = Object.keys(expressao);
        const valores = [];
        for (let chave of chaves) {
            const valor = await this.avaliar(expressao[chave]);
            valores.push(valor);
        }

        return valores;
    }

    async visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoAcessoElementoMatriz(expressao: any): Promise<any> {
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

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<string> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoFalhar(expressao: Falhar): Promise<any> {
        const textoFalha =
            expressao.explicacao.valor ?? ((await this.avaliar(expressao.explicacao)) as any).valor;
        throw new ErroEmTempoDeExecucao(expressao.simbolo, textoFalha, expressao.linha);
    }

    async visitarExpressaoFimPara(declaracao: FimPara): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /**
     * Chama o método `aceitar` de um construto ou declaração, passando o
     * próprio interpretador como parâmetro.
     *
     * Isto é usado para saber qual método do próprio interpretador chamar
     * na sequência.
     * @param expressao A expressão, que pode ser um construto ou declaração.
     * @returns O retorno da execução do método de visita chamado.
     */
    async avaliar(expressao: Construto | Declaracao): Promise<any> {
        // Descomente o código abaixo quando precisar detectar expressões undefined ou nulas.
        // Por algum motivo o depurador do VSCode não funciona direito aqui
        // com breakpoint condicional.
        /* if (expressao === null || expressao === undefined) {
            console.log('Aqui');
        } */

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
            // TODO: Há alguma chance de `elemento` ser `undefined` aqui?
            let valor = elemento?.valor;
            if (valor.hasOwnProperty && valor.hasOwnProperty('valorRetornado')) {
                valor = valor.valorRetornado;
            }

            if (valor.tipo === tipoDeDadosDelegua.LOGICO) {
                textoFinal = textoFinal.replace(
                    '${' + elemento.expressaoInterpolacao + '}',
                    this.paraTexto(valor)
                );
            } else {
                valor = this.resolverValor(valor);
                textoFinal = textoFinal.replace(
                    '${' + elemento.expressaoInterpolacao + '}',
                    `${this.paraTexto(valor)}`
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

        let resultadosAvaliacaoSintatica = variaveis.map((s) => {
            const expressaoInterpolacao: string = s.replace(/[\$\{\}]*/gm, '');

            let microLexador = this.microLexador.mapear(expressaoInterpolacao);
            const resultadoMicroAvaliadorSintatico = this.microAvaliadorSintatico.analisar(
                microLexador,
                linha
            );

            return {
                expressaoInterpolacao,
                resultadoMicroAvaliadorSintatico,
            };
        });

        // TODO: Verificar erros do `resultadosAvaliacaoSintatica`.

        const resolucoesPromises = await Promise.all(
            resultadosAvaliacaoSintatica
                .flatMap((r) => r.resultadoMicroAvaliadorSintatico.declaracoes)
                .map((d) => this.avaliar(d))
        );

        return resolucoesPromises.map((item, indice) => ({
            expressaoInterpolacao: resultadosAvaliacaoSintatica[indice].expressaoInterpolacao,
            valor: item,
        }));
    }

    async visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        if (this.regexInterpolacao.test(expressao.valor)) {
            const interpolacoes = await this.resolverInterpolacoes(
                expressao.valor,
                expressao.linha
            );
            return this.retirarInterpolacao(expressao.valor, interpolacoes);
        }

        return expressao.valor;
    }

    async visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> {
        return await this.avaliar(expressao.expressao);
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
            case tiposDeSimbolos.SUBTRACAO:
                this.verificarOperandoNumero(expressao.operador, valor);
                return -valor;
            case tiposDeSimbolos.NEGACAO:
                return !this.eVerdadeiro(valor);
            case tiposDeSimbolos.BIT_NOT:
                return ~valor;
            // Para incrementar e decrementar, primeiro precisamos saber se o operador
            // veio antes do literal ou variável.
            // Se veio antes e o operando é uma variável, precisamos incrementar/decrementar,
            // armazenar o valor da variável pra só então devolver o valor.
            case tiposDeSimbolos.INCREMENTAR:
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
                // TODO: Provavelmente isso está incorreto. Descobrir se operando resolve para
                // `Construto` ou para `Simbolo`.
                this.pilhaEscoposExecucao.atribuirVariavel(
                    (expressao.operando as any).simbolo,
                    ++valor
                );
                return valorAnteriorIncremento;
            case tiposDeSimbolos.DECREMENTAR:
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
                // TODO: Provavelmente isso está incorreto. Descobrir se operando resolve para
                // `Construto` ou para `Simbolo`.
                this.pilhaEscoposExecucao.atribuirVariavel(
                    (expressao.operando as any).simbolo,
                    --valor
                );
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
        direita: VariavelInterface | any,
        esquerda: VariavelInterface | any
    ): void {
        const tipoDireita: string = direita.tipo
            ? direita.tipo
            : typeof direita === tipoDeDadosPrimitivos.NUMERO
              ? tipoDeDadosDelegua.NUMERO
              : String(NaN);
        const tipoEsquerda: string = esquerda.tipo
            ? esquerda.tipo
            : typeof esquerda === tipoDeDadosPrimitivos.NUMERO
              ? tipoDeDadosDelegua.NUMERO
              : String(NaN);

        if (this.tiposNumericos.includes(tipoDireita) && this.tiposNumericos.includes(tipoEsquerda))
            return;
        if (this.tiposNumericos.includes(tipoEsquerda) && tipoDireita === 'qualquer') return;
        if (this.tiposNumericos.includes(tipoDireita) && tipoEsquerda === 'qualquer') return;

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

    async visitarExpressaoBinaria(expressao: any): Promise<any> {
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
                if (
                    this.tiposNumericos.includes(tipoEsquerdo) &&
                    this.tiposNumericos.includes(tipoDireito)
                ) {
                    return Number(valorEsquerdo) > Number(valorDireito);
                }

                return String(valorEsquerdo) > String(valorDireito);

            case tiposDeSimbolos.MAIOR_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) >= Number(valorDireito);

            case tiposDeSimbolos.MENOR:
                if (
                    this.tiposNumericos.includes(tipoEsquerdo) &&
                    this.tiposNumericos.includes(tipoDireito)
                ) {
                    return Number(valorEsquerdo) < Number(valorDireito);
                }

                return String(valorEsquerdo) < String(valorDireito);

            case tiposDeSimbolos.MENOR_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) <= Number(valorDireito);

            case tiposDeSimbolos.SUBTRACAO:
            case tiposDeSimbolos.MENOS_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) - Number(valorDireito);

            case tiposDeSimbolos.ADICAO:
            case tiposDeSimbolos.MAIS_IGUAL:
                if (
                    this.tiposNumericos.includes(tipoEsquerdo) &&
                    this.tiposNumericos.includes(tipoDireito)
                ) {
                    return Number(valorEsquerdo) + Number(valorDireito);
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
                return Number(valorEsquerdo) / Number(valorDireito);

            case tiposDeSimbolos.DIVISAO_INTEIRA:
            case tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

            case tiposDeSimbolos.MULTIPLICACAO:
            case tiposDeSimbolos.MULTIPLICACAO_IGUAL:
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
                        return Number(valorEsquerdo) * Number(valorDireito);
                    }

                    if (tipoEsquerdo === tipoDeDadosDelegua.TEXTO) {
                        return valorEsquerdo.repeat(Number(valorDireito));
                    }

                    return valorDireito.repeat(Number(valorEsquerdo));
                }

                return Number(valorEsquerdo) * Number(valorDireito);

            case tiposDeSimbolos.MODULO:
            case tiposDeSimbolos.MODULO_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) % Number(valorDireito);

            case tiposDeSimbolos.BIT_AND:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) & Number(valorDireito);

            case tiposDeSimbolos.BIT_XOR:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) ^ Number(valorDireito);

            case tiposDeSimbolos.BIT_OR:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) | Number(valorDireito);

            case tiposDeSimbolos.MENOR_MENOR:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) << Number(valorDireito);

            case tiposDeSimbolos.MAIOR_MAIOR:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
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
                nome: nomeArgumento,
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
    async visitarExpressaoDeChamada(expressao: Chamada | any): Promise<any> {
        try {
            let variavelEntidadeChamada: VariavelInterface | any = await this.avaliar(
                expressao.entidadeChamada
            );

            if (variavelEntidadeChamada === null) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.parentese,
                        'Chamada de função ou método inexistente: ' +
                            String(expressao.entidadeChamada),
                        expressao.linha
                    )
                );
            }

            if (variavelEntidadeChamada.hasOwnProperty('valorRetornado')) {
                variavelEntidadeChamada = variavelEntidadeChamada.valorRetornado;
            }

            const entidadeChamada = this.resolverValor(variavelEntidadeChamada);

            if (entidadeChamada instanceof DeleguaModulo) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.parentese,
                        'Entidade chamada é um módulo de Delégua. Provavelmente você quer chamar um de seus componentes?',
                        expressao.linha
                    )
                );
            }

            if (entidadeChamada instanceof MetodoPrimitiva) {
                return await this.chamarMetodoPrimitiva(expressao, entidadeChamada);
            }

            const argumentos: ArgumentoInterface[] =
                await this.resolverArgumentosChamada(expressao);
            const aridade = entidadeChamada.aridade
                ? entidadeChamada.aridade()
                : entidadeChamada.length;

            // Completar os argumentos não preenchidos com valores indefinidos.
            if (argumentos.length < aridade) {
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
                    return entidadeChamada.chamar(
                        this,
                        argumentos.map((a) => a && a.valor && this.resolverValor(a.valor)),
                        expressao.entidadeChamada.simbolo
                    );
                } catch (erro: any) {
                    this.erros.push({
                        erroInterno: erro,
                        linha: expressao.linha,
                        hashArquivo: expressao.hashArquivo,
                    });
                }
            }

            // Por algum motivo misterioso, `entidadeChamada instanceof Chamavel` dá `false` em Liquido,
            // mesmo que esteja tudo certo com `DeleguaFuncao`,
            // então precisamos testar o nome do construtor também.
            if (
                entidadeChamada instanceof Chamavel ||
                entidadeChamada.constructor.name === 'DeleguaFuncao'
            ) {
                const retornoEntidadeChamada = await entidadeChamada.chamar(this, argumentos);
                return retornoEntidadeChamada;
            }

            // Chamadas a `super()`.
            // Basicamente, chamar o construtor da superclasse.
            if (expressao.entidadeChamada instanceof Super) {
                const descritorSuperclasse: DescritorTipoClasse =
                    variavelEntidadeChamada.classe.superClasse;
                const metodoConstrutor = descritorSuperclasse.encontrarMetodo('construtor');
                await metodoConstrutor.chamar(this, argumentos);
                return null;
            }

            // A função chamada pode ser de uma biblioteca JavaScript.
            // Neste caso apenas testamos se o tipo é uma função.
            // Casos que passam aqui: chamadas a métodos de bibliotecas de Delégua.
            if (typeof entidadeChamada === tipoDeDadosPrimitivos.FUNCAO) {
                let objeto = null;
                if (expressao.entidadeChamada.objeto) {
                    objeto = await this.avaliar(expressao.entidadeChamada.objeto);
                }
                return entidadeChamada.apply(this.resolverValor(objeto), argumentos);
            }

            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.parentese,
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

    /**
     * Execução de uma expressão de atribuição.
     * @param expressao A expressão.
     * @returns O valor atribuído.
     */
    async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        const valor = await this.avaliar(expressao.valor);
        const valorResolvido = this.resolverValor(valor);
        let indice: any = null;

        if (expressao.indice) {
            indice = await this.avaliar(expressao.indice);
        }

        switch (expressao.alvo.constructor.name) {
            case 'Variavel':
                const alvoVariavel = expressao.alvo as Variavel;
                this.pilhaEscoposExecucao.atribuirVariavel(
                    alvoVariavel.simbolo,
                    valorResolvido,
                    indice
                );
                break;
            case 'AcessoMetodoOuPropriedade':
                // Nunca será método aqui: apenas propriedade.
                const alvoPropriedade = expressao.alvo as AcessoMetodoOuPropriedade;
                const variavelObjeto = await this.avaliar(alvoPropriedade.objeto);
                const objeto = this.resolverValor(variavelObjeto);

                const valor = await this.avaliar(expressao.valor);
                if (objeto.constructor.name === 'ObjetoDeleguaClasse') {
                    const objetoDeleguaClasse = objeto as ObjetoDeleguaClasse;
                    objetoDeleguaClasse.definir(alvoPropriedade.simbolo, valor);
                }
                break;
            default:
                throw new ErroEmTempoDeExecucao(
                    null,
                    `Atribuição com caso faltante: ${expressao.alvo.constructor.name}.`
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

    async visitarExpressaoLogica(expressao: Logico): Promise<any> {
        const esquerda = await this.avaliar(expressao.esquerda);

        if (expressao.operador.tipo === tiposDeSimbolos.EM) {
            const direita = await this.avaliar(expressao.direita);

            if (Array.isArray(direita) || typeof direita === tipoDeDadosPrimitivos.TEXTO) {
                return direita.includes(esquerda);
            } else if (direita !== null && typeof direita === 'object') {
                return (
                    esquerda in direita ||
                    (direita.valor !== undefined && esquerda in direita.valor)
                );
            }

            throw new ErroEmTempoDeExecucao(
                esquerda,
                "Tipo de chamada inválida com 'em'.",
                expressao.linha
            );
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

        if (declaracaoInicializador !== null) {
            await this.avaliar(declaracaoInicializador);
        }

        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        while (!(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) {
            if (
                declaracao.condicao !== null &&
                !this.eVerdadeiro(await this.avaliar(declaracao.condicao))
            ) {
                break;
            }

            try {
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }

            if (declaracao.incrementar !== null) {
                await this.avaliar(declaracao.incrementar);
            }
        }

        return retornoExecucao;
    }

    // TODO: Descobrir se mais algum dialeto, fora Delégua e Pituguês, usam isso.
    async visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        // Posição atual precisa ser reiniciada, pois pode estar dentro de outro
        // laço de repetição.
        declaracao.posicaoAtual = 0;
        const vetorResolvido = await this.avaliar(declaracao.vetorOuDicionario);
        let valorVetorResolvido: any = this.resolverValor(vetorResolvido);

        // Se até aqui vetor resolvido é um dicionário, converte dicionário
        // para vetor de duplas.
        // TODO: Converter elementos para `Construto` se necessário.
        if (declaracao.vetorOuDicionario.tipo === 'dicionário') {
            valorVetorResolvido = Object.entries(valorVetorResolvido)
                .map(v => new Dupla(v[0] as any, v[1] as any));
        }

        if (!Array.isArray(valorVetorResolvido)) {
            return Promise.reject(
                "Variável ou literal provida em instrução 'para cada' não é um vetor."
            );
        }

        while (
            !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
            declaracao.posicaoAtual < valorVetorResolvido.length
        ) {
            try {
                if (declaracao.variavelIteracao instanceof Variavel) {
                    this.pilhaEscoposExecucao.definirVariavel(
                        declaracao.variavelIteracao.simbolo.lexema,
                        valorVetorResolvido[declaracao.posicaoAtual]
                    );
                }
                
                if (declaracao.variavelIteracao instanceof Dupla) {
                    const valorComoDupla = valorVetorResolvido[declaracao.posicaoAtual] as Dupla;
                    this.pilhaEscoposExecucao.definirVariavel(
                        (declaracao.variavelIteracao.primeiro as Literal).valor,
                        valorComoDupla.primeiro
                    );

                    this.pilhaEscoposExecucao.definirVariavel(
                        (declaracao.variavelIteracao.segundo as Literal).valor,
                        valorComoDupla.segundo
                    );
                }

                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
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
            return await this.executar(declaracao.caminhoEntao);
        }

        for (let i = 0; i < declaracao.caminhosSeSenao.length; i++) {
            // TODO: Qual o tipo de `atual`?
            const atual = declaracao.caminhosSeSenao[i] as any;

            if (this.eVerdadeiro(await this.avaliar(atual.condicao))) {
                return await this.executar(atual.caminho);
            }
        }

        if (declaracao.caminhoSenao !== null) {
            return await this.executar(declaracao.caminhoSenao);
        }

        return null;
    }

    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        while (
            !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
            this.eVerdadeiro(await this.avaliar(declaracao.condicao))
        ) {
            try {
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
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
        const condicaoEscolha = await this.avaliar(declaracao.identificadorOuLiteral);
        const valorCondicaoEscolha = this.resolverValor(condicaoEscolha);

        const caminhos = declaracao.caminhos;
        const caminhoPadrao = declaracao.caminhoPadrao;

        let encontrado = false;
        try {
            for (let i = 0; i < caminhos.length; i++) {
                const caminho = caminhos[i];

                for (let j = 0; j < caminho.condicoes.length; j++) {
                    const condicaoAvaliada = await this.avaliar(caminho.condicoes[j]);
                    if (condicaoAvaliada === valorCondicaoEscolha) {
                        encontrado = true;

                        try {
                            await this.executarBloco(caminho.declaracoes);
                        } catch (erro: any) {
                            this.erros.push({
                                erroInterno: erro,
                                linha: declaracao.linha,
                                hashArquivo: declaracao.hashArquivo,
                            });
                            return Promise.reject(erro);
                        }
                    }
                }
            }

            if (caminhoPadrao !== null && !encontrado) {
                await this.executarBloco(caminhoPadrao.declaracoes);
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
        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
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
     * Interpretação de uma declaração `tente`.
     * @param declaracao O objeto da declaração.
     */
    async visitarDeclaracaoTente(declaracao: Tente): Promise<any> {
        let valorRetorno: any;
        try {
            this.emDeclaracaoTente = true;
            try {
                valorRetorno = await this.executarBloco(declaracao.caminhoTente);
            } catch (erro: any) {
                if (declaracao.caminhoPegue !== null) {
                    // `caminhoPegue` aqui pode ser um construto de função (se `pegue` tem parâmetros)
                    // ou um vetor de `Declaracao` (`pegue` sem parâmetros).
                    // As execuções, portanto, são diferentes.
                    if (Array.isArray(declaracao.caminhoPegue)) {
                        valorRetorno = await this.executarBloco(declaracao.caminhoPegue);
                    } else {
                        const literalErro = new Literal(
                            declaracao.hashArquivo,
                            Number(declaracao.linha),
                            erro.mensagem
                        );
                        const chamadaPegue = new Chamada(
                            declaracao.caminhoPegue.hashArquivo,
                            declaracao.caminhoPegue,
                            [literalErro]
                        );
                        valorRetorno = await chamadaPegue.aceitar(this);
                    }
                }
            }
        } finally {
            if (declaracao.caminhoFinalmente !== null)
                valorRetorno = await this.executarBloco(declaracao.caminhoFinalmente);
            this.emDeclaracaoTente = false;
        }

        return valorRetorno;
    }

    async visitarDeclaracaoImportar(declaracao: Importar): Promise<DeleguaModulo> {
        return Promise.reject('Importação de arquivos não suportada por Interpretador Base.');
    }

    protected async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            let resultadoAvaliacao = await this.avaliar(argumento);
            if (resultadoAvaliacao && resultadoAvaliacao.hasOwnProperty('valorRetornado')) {
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
            this.funcaoDeRetornoMesmaLinha(formatoTexto);
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
            this.funcaoDeRetorno(formatoTexto);
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
        const escopoExecucao: EscopoExecucao = {
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
        const tipoIndividual = declaracao.tipo.replace('[]', '');
        for (let [indice, valor] of valoresFinais.entries()) {
            this.pilhaEscoposExecucao.definirConstante(
                declaracao.simbolos[indice].lexema,
                valor,
                tipoIndividual
            );
        }

        return null;
    }

    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        return new ContinuarQuebra();
    }

    visitarExpressaoSustar(declaracao?: any): SustarQuebra {
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

        if (objeto instanceof Vetor) {
            return objeto.valores[valorIndice];
        }

        if (
            objeto.constructor === Object ||
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

    async visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = this.resolverValor(variavelObjeto);

        if (objeto.constructor.name !== 'ObjetoDeleguaClasse' && objeto.constructor !== Object) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.nome,
                    'Somente instâncias e dicionários podem possuir campos.',
                    expressao.linha
                )
            );
        }

        const valor = await this.avaliar(expressao.valor);
        if (objeto.constructor.name === 'ObjetoDeleguaClasse') {
            objeto.definir(expressao.nome, valor);
            return valor;
        }

        if (objeto.constructor === Object) {
            objeto[expressao.nome.lexema] = valor;
        }
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        const funcao = new DeleguaFuncao(declaracao.simbolo.lexema, declaracao.funcao);
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, funcao);
    }

    /**
     * Executa uma declaração de classe.
     * Uma variável do tipo `DeleguaClasse` é adicionada à pilha de escopos de execução.
     * @param declaracao A declaração de classe.
     * @returns Sempre retorna nulo, por ser requerido pelo contrato de visita.
     */
    async visitarDeclaracaoClasse(declaracao: Classe): Promise<DescritorTipoClasse> {
        let superClasse = null;
        if (declaracao.superClasse !== null && declaracao.superClasse !== undefined) {
            const variavelSuperClasse: VariavelInterface = await this.avaliar(
                declaracao.superClasse
            );
            superClasse = variavelSuperClasse.valor;
            if (!(superClasse instanceof DescritorTipoClasse)) {
                throw new ErroEmTempoDeExecucao(
                    declaracao.superClasse.nome,
                    'Superclasse precisa ser uma classe.',
                    declaracao.linha
                );
            }
        }

        // TODO: Precisamos disso?
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, declaracao);

        if (declaracao.superClasse !== null && declaracao.superClasse !== undefined) {
            this.pilhaEscoposExecucao.definirVariavel('super', superClasse);
        }

        const metodos = {};
        const definirMetodos = declaracao.metodos;
        for (let i = 0; i < declaracao.metodos.length; i++) {
            const metodoAtual = definirMetodos[i];
            const eInicializador = metodoAtual.simbolo.lexema === 'construtor';
            const funcao = new DeleguaFuncao(
                metodoAtual.simbolo.lexema,
                metodoAtual.funcao,
                undefined,
                eInicializador
            );
            metodos[metodoAtual.simbolo.lexema] = funcao;
        }

        const descritorTipoClasse: DescritorTipoClasse = new DescritorTipoClasse(
            declaracao.simbolo,
            superClasse,
            metodos,
            declaracao.propriedades
        );

        // TODO: Até então, a única exceção a isso é Égua Clássico.
        // Por enquanto, tudo bem deixar isso aqui.
        descritorTipoClasse.dialetoRequerDeclaracaoPropriedades = this.requerDeclaracaoPropriedades;

        this.pilhaEscoposExecucao.atribuirVariavel(declaracao.simbolo, descritorTipoClasse);
        return descritorTipoClasse;
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

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor.name === 'RetornoQuebra') {
            variavelObjeto = variavelObjeto.valor;
        }

        const objeto = this.resolverValor(variavelObjeto);

        // Outro caso que `instanceof` simplesmente não funciona para casos em Liquido,
        // então testamos também o nome do construtor.
        if (
            objeto instanceof ObjetoDeleguaClasse ||
            objeto.constructor.name === 'ObjetoDeleguaClasse'
        ) {
            const valor = objeto.obter(expressao.simbolo);
            if (valor === 0) return 0;
            return valor || null;
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.simbolo.lexema in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.simbolo.lexema].implementacao;
                return new MetodoPrimitiva('', objeto, metodoDePrimitivaDicionario);
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

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.simbolo.lexema] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                expressao.simbolo,
                `Método ou propriedade para objeto não encontrado: ${expressao.simbolo.lexema}.`,
                expressao.linha
            )
        );
    }

    visitarExpressaoIsto(expressao: any): any {
        return this.procurarVariavel(expressao.palavraChave);
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        return Promise.resolve();
    }

    async visitarExpressaoDicionario(expressao: Dicionario): Promise<any> {
        const dicionario = {};
        for (let i = 0; i < expressao.chaves.length; i++) {
            const promises = await Promise.all([
                this.avaliar(expressao.chaves[i]),
                this.avaliar(expressao.valores[i]),
            ]);

            if (typeof promises[0] === 'boolean') {
                const chaveLogico = promises[0] === true ? 'verdadeiro' : 'falso';
                dicionario[chaveLogico] = promises[1];
                continue;
            }

            dicionario[promises[0]] = this.resolverValor(promises[1]);
        }

        return dicionario;
    }

    async visitarExpressaoVetor(expressao: Vetor): Promise<any> {
        const valores = [];
        for (let i = 0; i < expressao.valores.length; i++) {
            valores.push(await this.avaliar(expressao.valores[i]));
        }

        return valores.filter((v) => v !== null && v !== undefined);
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

        this.pilhaEscoposExecucao.definirVariavel(
            declaracao.simbolo.lexema,
            valorFinal,
            tipoResolvido
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
        const tipoIndividual = declaracao.tipo.replace('[]', '');
        for (let [indice, valor] of valoresFinais.entries()) {
            this.pilhaEscoposExecucao.definirVariavel(
                declaracao.simbolos[indice].lexema,
                valor,
                tipoIndividual
            );
        }

        return null;
    }

    paraTexto(objeto: any): string {
        if (objeto === null || objeto === undefined) return tipoDeDadosDelegua.NULO;
        if (typeof objeto === tipoDeDadosPrimitivos.BOOLEANO) {
            return objeto ? 'verdadeiro' : 'falso';
        }

        if (objeto.valor instanceof ObjetoPadrao) return objeto.valor.paraTexto();
        if (objeto instanceof ObjetoDeleguaClasse || objeto instanceof DeleguaFuncao)
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

        switch (objeto.constructor.name) {
            case 'Object':
                if ('tipo' in objeto) {
                    switch (objeto.tipo) {
                        case 'dicionário':
                            return JSON.stringify(objeto.valor);
                        default:
                            return objeto.valor;
                    }
                }
        }

        if (typeof objeto === tipoDeDadosPrimitivos.OBJETO) {
            const objetoEscrita = {};
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
    async executar(declaracao: Declaracao): Promise<ResultadoParcialInterpretadorInterface> {
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
    async interpretar(
        declaracoes: Declaracao[],
        manterAmbiente = false
    ): Promise<RetornoInterpretadorInterface> {
        this.erros = [];
        this.emDeclaracaoTente = false;
        this.linhaDeclaracaoAtual = -1;
        this.hashArquivoDeclaracaoAtual = -1;

        const escopoExecucao: EscopoExecucao = {
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
            // TODO: Esta lógica já ocorre em `executarUltimoEscopo`.
            // Estudar remoção.
            if (retornoOuErro instanceof ErroEmTempoDeExecucao) {
                this.erros.push(retornoOuErro);
            }

            if (retornoOuErro !== undefined) {
                this.resultadoInterpretador.push(retornoOuErro);
            }
        } catch (erro: any) {
            // TODO: Estudar remoção do `catch`.
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

            const retorno = {
                erros: this.erros,
                resultado: this.resultadoInterpretador,
            } as RetornoInterpretadorInterface;

            this.resultadoInterpretador = [];
            return retorno;
        }
    }
}
