import hrtime from 'browser-process-hrtime';

import { EspacoVariaveis } from '../espaco-variaveis';
import carregarBibliotecasGlobais from '../bibliotecas/biblioteca-global';

import { MicroLexador } from './../../fontes/lexador/micro-lexador';
import { MicroAvaliadorSintatico } from './../../fontes/avaliador-sintatico/micro-avaliador-sintatico';

import { ErroEmTempoDeExecucao } from '../excecoes';
import { InterpretadorInterface, ParametroInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import {
    Aleatorio,
    Bloco,
    Classe,
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
    Leia,
    LeiaMultiplo,
    Para,
    ParaCada,
    Retorna,
    Se,
    Tente,
    Var,
    VarMultiplo,
} from '../declaracoes';
import {
    Chamavel,
    DeleguaClasse,
    DeleguaFuncao,
    ObjetoDeleguaClasse,
    DeleguaModulo,
    FuncaoPadrao,
    ObjetoPadrao,
} from '../estruturas';
import {
    AcessoIndiceVariavel,
    Agrupamento,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    Literal,
    Logico,
    QualTipo,
    Super,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import { ErroInterpretador } from '../interfaces/erros/erro-interpretador';
import { RetornoInterpretador } from '../interfaces/retornos/retorno-interpretador';
import { EscopoExecucao } from '../interfaces/escopo-execucao';
import { PilhaEscoposExecucao } from './pilha-escopos-execucao';
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from '../quebras';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import { inferirTipoVariavel } from './inferenciador';
import { MetodoPrimitiva } from '../estruturas/metodo-primitiva';

import primitivasTexto from '../bibliotecas/primitivas-texto';
import primitivasVetor from '../bibliotecas/primitivas-vetor';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import { ArgumentoInterface } from './argumento-interface';
import tipoDeDadosPrimitivos from '../tipos-de-dados/primitivos'
import tipoDeDadosDelegua from '../tipos-de-dados/delegua'

/**
 * O Interpretador visita todos os elementos complexos gerados pelo avaliador sintático (_parser_),
 * e de fato executa a lógica de programação descrita no código.
 *
 * O Interpretador Base não contém dependências com o Node.js. É
 * recomendado para uso em execuções que ocorrem no navegador de internet.
 */
export class InterpretadorBase implements InterpretadorInterface {
    diretorioBase: string;
    erros: ErroInterpretador[];
    declaracoes: Declaracao[];
    resultadoInterpretador: Array<string> = [];

    // Esta variável indica que uma propriedade de um objeto
    // não precisa da palavra `isto` para ser acessada, ou seja,
    // `minhaPropriedade` e `isto.minhaPropriedade` são a mesma coisa.
    // Potigol, por exemplo, é um dialeto que tem essa característica.
    expandirPropriedadesDeObjetosEmEspacoVariaveis: boolean;

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
    microAvaliadorSintatico: MicroAvaliadorSintatico = new MicroAvaliadorSintatico();

    regexInterpolacao = /\${(.*?)}/g;

    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        this.diretorioBase = diretorioBase;
        this.performance = performance;

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.funcaoDeRetornoMesmaLinha = funcaoDeRetornoMesmaLinha || process.stdout.write.bind(process.stdout);

        this.erros = [];
        this.declaracoes = [];
        this.resultadoInterpretador = [];

        // Isso existe por causa de Potigol.
        // Para acessar uma variável de classe, não é preciso a palavra `isto`.
        this.expandirPropriedadesDeObjetosEmEspacoVariaveis = false;

        // Por padrão é verdadeiro porque Delégua e Pituguês usam
        // o interpretador base como implementação padrão.
        this.requerDeclaracaoPropriedades = true;

        this.pilhaEscoposExecucao = new PilhaEscoposExecucao();
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        carregarBibliotecasGlobais(this, this.pilhaEscoposExecucao);
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error('Método não implementado.');
    }

    //https://stackoverflow.com/a/66751666/9043143
    textoParaRegex(texto): any {
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
        return this.textoParaRegex(expressao.valor);
    }

    async visitarExpressaoTipoDe(expressao: TipoDe): Promise<string> {
        let tipoDe = expressao.valor;

        if (
            tipoDe instanceof Binario ||
            tipoDe instanceof TipoDe ||
            tipoDe instanceof Unario ||
            tipoDe instanceof Variavel ||
            tipoDe instanceof Agrupamento ||
            tipoDe instanceof Chamada
        ) {
            tipoDe = await this.avaliar(tipoDe);
            return tipoDe.tipo || inferirTipoVariavel(tipoDe);
        }

        return inferirTipoVariavel(tipoDe?.valores || tipoDe);
    }

    async visitarExpressaoQualTipo(expressao: QualTipo): Promise<string> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoFalhar(expressao: Falhar): Promise<any> {
        const textoFalha = expressao.explicacao.valor ?? ((await this.avaliar(expressao.explicacao)) as any).valor;
        throw new ErroEmTempoDeExecucao(expressao.simbolo, textoFalha, expressao.linha);
    }

    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado.');
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

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        const mensagem = expressao.argumentos && expressao.argumentos[0] ? expressao.argumentos[0].valor : '> ';
        return new Promise((resolucao) =>
            this.interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                resolucao(resposta);
            })
        );
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo `LeiaMultiplo`.
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        const mensagem = '> ';
        if (expressao.argumento instanceof Literal) {
            let valor = expressao.argumento.valor;
            if (typeof valor === tipoDeDadosPrimitivos.TEXTO) {
                return new Promise((resolucao) =>
                    this.interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                        resolucao(
                            String(resposta)
                                .split(valor)
                                .filter((r) => !/(\s+)/.test(r))
                        );
                    })
                );
            }

            let respostas = [];
            for (let i = 0; i < valor; i++) {
                this.interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                    respostas.push(resposta);
                });
            }
            return Promise.resolve(respostas);
        }
        return Promise.resolve();
    }

    /**
     * Retira a interpolação de um texto.
     * @param {texto} texto O texto
     * @param {any[]} variaveis A lista de variaveis interpoladas
     * @returns O texto com o valor das variaveis.
     */
    protected retirarInterpolacao(texto: string, variaveis: any[]): string {
        let textoFinal = texto;

        variaveis.forEach((elemento) => {
            if (elemento?.valor?.tipo === tipoDeDadosDelegua.LOGICO) {
                textoFinal = textoFinal.replace('${' + elemento.variavel + '}', this.paraTexto(elemento?.valor?.valor));
            } else {
                const valor = elemento?.valor?.hasOwnProperty('valor') ? elemento?.valor.valor : elemento?.valor
                textoFinal = textoFinal.replace(
                    '${' + elemento.variavel + '}',
                    `${this.paraTexto(valor)}`
                );
            }
        });

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
            const nomeVariavel: string = s.replace(/[\$\{\}]*/gm, '');

            let microLexador = this.microLexador.mapear(nomeVariavel);
            const resultadoMicroAvaliadorSintatico = this.microAvaliadorSintatico.analisar(microLexador, linha);

            return {
                nomeVariavel,
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
            variavel: resultadosAvaliacaoSintatica[indice].nomeVariavel,
            valor: item,
        }));
    }

    async visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        if (this.regexInterpolacao.test(expressao.valor)) {
            const variaveis = await this.resolverInterpolacoes(expressao.valor, expressao.linha);

            return this.retirarInterpolacao(expressao.valor, variaveis);
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
        if (typeof operando === tipoDeDadosPrimitivos.NUMERO || operando.tipo === tipoDeDadosDelegua.NUMERO) return;
        throw new ErroEmTempoDeExecucao(operador, 'Operando precisa ser um número.', Number(operador.linha));
    }

    async visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        const operando = await this.avaliar(expressao.operando);
        let valor: any = operando.hasOwnProperty('valor') ? operando.valor : operando;

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
                        this.pilhaEscoposExecucao.atribuirVariavel(expressao.operando.simbolo, valor);
                    }

                    return valor;
                }

                const valorAnteriorIncremento = valor;
                this.pilhaEscoposExecucao.atribuirVariavel(expressao.operando.simbolo, ++valor);
                return valorAnteriorIncremento;
            case tiposDeSimbolos.DECREMENTAR:
                if (expressao.incidenciaOperador === 'ANTES') {
                    valor--;
                    if (expressao.operando instanceof Variavel) {
                        this.pilhaEscoposExecucao.atribuirVariavel(expressao.operando.simbolo, valor);
                    }

                    return valor;
                }

                const valorAnteriorDecremento = valor;
                this.pilhaEscoposExecucao.atribuirVariavel(expressao.operando.simbolo, --valor);
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

        const valorConteudo: any = conteudo?.hasOwnProperty('valor') ? conteudo.valor : conteudo;

        const tipoConteudo: string = conteudo.hasOwnProperty('tipo') ? conteudo.tipo : typeof conteudo;

        resultado = valorConteudo;
        if ([tipoDeDadosDelegua.NUMERO, tipoDeDadosPrimitivos.NUMERO].includes(tipoConteudo) && declaracao.casasDecimais > 0) {
            resultado = valorConteudo.toLocaleString('pt', { maximumFractionDigits: declaracao.casasDecimais });
        }

        if (declaracao.espacos > 0) {
            resultado += ' '.repeat(declaracao.espacos);
        }

        return resultado;
    }

    protected eIgual(esquerda: VariavelInterface | any, direita: VariavelInterface | any): boolean {
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
        const tipoDireita: string = direita.tipo ? direita.tipo : typeof direita === tipoDeDadosPrimitivos.NUMERO ? tipoDeDadosDelegua.NUMERO : String(NaN);
        const tipoEsquerda: string = esquerda.tipo
            ? esquerda.tipo
            : typeof esquerda === tipoDeDadosPrimitivos.NUMERO
            ? tipoDeDadosDelegua.NUMERO
            : String(NaN);
        if (tipoDireita === tipoDeDadosDelegua.NUMERO && tipoEsquerda === tipoDeDadosDelegua.NUMERO) return;
        throw new ErroEmTempoDeExecucao(operador, 'Operadores precisam ser números.', operador.linha);
    }

    async visitarExpressaoBinaria(expressao: any): Promise<any> {
        const esquerda: VariavelInterface | any = await this.avaliar(expressao.esquerda);
        const direita: VariavelInterface | any = await this.avaliar(expressao.direita);
        const valorEsquerdo: any = esquerda?.hasOwnProperty('valor') ? esquerda.valor : esquerda;
        const valorDireito: any = direita?.hasOwnProperty('valor') ? direita.valor : direita;
        const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo') ? esquerda.tipo : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita?.hasOwnProperty('tipo') ? direita.tipo : inferirTipoVariavel(direita);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.EXPONENCIACAO:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Math.pow(valorEsquerdo, valorDireito);

            case tiposDeSimbolos.MAIOR:
                if (tipoEsquerdo === tipoDeDadosDelegua.NUMERO && tipoDireito === tipoDeDadosDelegua.NUMERO) {
                    return Number(valorEsquerdo) > Number(valorDireito);
                } else {
                    return String(valorEsquerdo) > String(valorDireito);
                }

            case tiposDeSimbolos.MAIOR_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) >= Number(valorDireito);

            case tiposDeSimbolos.MENOR:
                if (tipoEsquerdo === tipoDeDadosDelegua.NUMERO && tipoDireito === tipoDeDadosDelegua.NUMERO) {
                    return Number(valorEsquerdo) < Number(valorDireito);
                } else {
                    return String(valorEsquerdo) < String(valorDireito);
                }

            case tiposDeSimbolos.MENOR_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) <= Number(valorDireito);

            case tiposDeSimbolos.SUBTRACAO:
            case tiposDeSimbolos.MENOS_IGUAL:
                this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) - Number(valorDireito);

            case tiposDeSimbolos.ADICAO:
            case tiposDeSimbolos.MAIS_IGUAL:
                if ([tipoDeDadosDelegua.NUMERO, tipoDeDadosDelegua.INTEIRO].includes(tipoEsquerdo) && [tipoDeDadosDelegua.NUMERO, tipoDeDadosDelegua.INTEIRO].includes(tipoDireito)) {
                    return Number(valorEsquerdo) + Number(valorDireito);
                } else {
                    return this.paraTexto(valorEsquerdo) + this.paraTexto(valorDireito);
                }

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
                if (tipoEsquerdo === tipoDeDadosDelegua.TEXTO || tipoDireito === tipoDeDadosDelegua.TEXTO) {
                    // Sem ambos os valores resolvem como texto, multiplica normal.
                    // Se apenas um resolve como texto, o outro repete o
                    // texto n vezes, sendo n o valor do outro.
                    if (tipoEsquerdo === tipoDeDadosDelegua.TEXTO && tipoDireito === tipoDeDadosDelegua.TEXTO) {
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
     * Executa uma chamada de função, método ou classe.
     * @param expressao A expressão chamada.
     * @returns O resultado da chamada.
     */
    async visitarExpressaoDeChamada(expressao: any): Promise<any> {
        try {
            const variavelEntidadeChamada: VariavelInterface | any = await this.avaliar(expressao.entidadeChamada);

            if (variavelEntidadeChamada === null) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.parentese,
                        'Chamada de função ou método inexistente: ' + String(expressao.entidadeChamada),
                        expressao.linha
                    )
                );
            }

            const entidadeChamada = variavelEntidadeChamada.hasOwnProperty('valor')
                ? variavelEntidadeChamada.valor
                : variavelEntidadeChamada;

            let argumentos: ArgumentoInterface[] = [];
            for (let i = 0; i < expressao.argumentos.length; i++) {
                const variavelArgumento = expressao.argumentos[i];
                const nomeArgumento = variavelArgumento.hasOwnProperty('simbolo')
                    ? variavelArgumento.simbolo.lexema
                    : undefined;

                argumentos.push({
                    nome: nomeArgumento,
                    valor: await this.avaliar(variavelArgumento),
                });
            }

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
                const argumentosResolvidos: any[] = [];
                for (const argumento of expressao.argumentos) {
                    const valorResolvido: any = await this.avaliar(argumento);
                    argumentosResolvidos.push(
                        valorResolvido?.hasOwnProperty('valor') ? valorResolvido.valor : valorResolvido
                    );
                }

                return await entidadeChamada.chamar(this, argumentosResolvidos);
            }

            let parametros: ParametroInterface[];
            if (entidadeChamada instanceof DeleguaFuncao) {
                parametros = entidadeChamada.declaracao.parametros;
            } else if (entidadeChamada instanceof DeleguaClasse) {
                parametros = entidadeChamada.metodos.construtor
                    ? entidadeChamada.metodos.construtor.declaracao.parametros
                    : [];
            } else {
                parametros = [];
            }

            const aridade = entidadeChamada.aridade ? entidadeChamada.aridade() : entidadeChamada.length;

            // Completar os parâmetros não preenchidos com nulos.
            if (argumentos.length < aridade) {
                const diferenca = aridade - argumentos.length;
                for (let i = 0; i < diferenca; i++) {
                    argumentos.push(null);
                }
            } else {
                // TODO: Aparentemente isso aqui nunca funcionou.
                // Avaliar de simplesmente apagar este código, e usar o que foi
                // implementado em `DeleguaFuncao.chamar`.
                if (
                    parametros &&
                    parametros.length > 0 &&
                    parametros[parametros.length - 1].abrangencia === 'multiplo'
                ) {
                    let novosArgumentos = argumentos.slice(0, parametros.length - 1);
                    novosArgumentos = novosArgumentos.concat(
                        argumentos.slice(parametros.length - 1, argumentos.length)
                    );
                    argumentos = novosArgumentos;
                }
            }

            if (entidadeChamada instanceof FuncaoPadrao) {
                try {
                    return entidadeChamada.chamar(
                        argumentos.map((a) =>
                            a && a.valor && a.valor.hasOwnProperty('valor') ? a.valor.valor : a?.valor
                        ),
                        expressao.entidadeChamada.nome
                    );
                } catch (erro: any) {
                    this.erros.push({
                        erroInterno: erro,
                        linha: expressao.linha,
                        hashArquivo: expressao.hashArquivo,
                    });
                }
            }

            if (entidadeChamada instanceof Chamavel) {
                const retornoEntidadeChamada = await entidadeChamada.chamar(this, argumentos);
                return retornoEntidadeChamada;
            }

            // A função chamada pode ser de uma biblioteca JavaScript.
            // Neste caso apenas testamos se o tipo é uma função.
            if (typeof entidadeChamada === tipoDeDadosPrimitivos.FUNCAO) {
                let objeto = null;
                if (expressao.entidadeChamada.objeto) {
                    objeto = await this.avaliar(expressao.entidadeChamada.objeto);
                }
                return entidadeChamada.apply(objeto.hasOwnProperty('valor') ? objeto.valor : objeto, argumentos);
            }

            return Promise.reject(
                new ErroEmTempoDeExecucao(expressao.parentese, 'Só pode chamar função ou classe.', expressao.linha)
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
        const valorResolvido = valor !== undefined && valor.hasOwnProperty('valor') ? valor.valor : valor;
        this.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valorResolvido);

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
            } else if (direita.constructor === Object) {
                return esquerda in direita;
            } else {
                throw new ErroEmTempoDeExecucao(esquerda, "Tipo de chamada inválida com 'em'.", expressao.linha);
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

        if (declaracaoInicializador !== null) {
            await this.avaliar(declaracaoInicializador);
        }

        let retornoExecucao: any;
        while (!(retornoExecucao instanceof Quebra)) {
            if (declaracao.condicao !== null && !this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                break;
            }

            try {
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao instanceof ContinuarQuebra) {
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

    async visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        let retornoExecucao: any;
        const vetorResolvido = await this.avaliar(declaracao.vetor);
        const valorVetorResolvido = vetorResolvido.hasOwnProperty('valor') ? vetorResolvido.valor : vetorResolvido;

        if (!Array.isArray(valorVetorResolvido)) {
            return Promise.reject("Variável ou literal provida em instrução 'para cada' não é um vetor.");
        }

        while (!(retornoExecucao instanceof Quebra) && declaracao.posicaoAtual < valorVetorResolvido.length) {
            try {
                this.pilhaEscoposExecucao.definirVariavel(
                    declaracao.nomeVariavelIteracao,
                    valorVetorResolvido[declaracao.posicaoAtual]
                );

                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao instanceof ContinuarQuebra) {
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
        if (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            return await this.executar(declaracao.caminhoEntao);
        }

        for (let i = 0; i < declaracao.caminhosSeSenao.length; i++) {
            const atual = declaracao.caminhosSeSenao[i];

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
        let retornoExecucao: any;
        while (!(retornoExecucao instanceof Quebra) && this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            try {
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao instanceof ContinuarQuebra) {
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
        const valorCondicaoEscolha = condicaoEscolha.hasOwnProperty('valor') ? condicaoEscolha.valor : condicaoEscolha;

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
        let retornoExecucao: any;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao instanceof ContinuarQuebra) {
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
            !(retornoExecucao instanceof Quebra) &&
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
                            null,
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
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;
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
            return null;
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
            return null;
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
    async executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): Promise<any> {
        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: ambiente || new EspacoVariaveis(),
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

    protected async avaliacaoDeclaracaoVarOuConst(declaracao: Const | ConstMultiplo | Var | VarMultiplo): Promise<any> {
        let valorOuOutraVariavel = null;
        if (declaracao.inicializador !== null) {
            valorOuOutraVariavel = await this.avaliar(declaracao.inicializador);
        }

        let valorFinal = null;
        if (valorOuOutraVariavel !== null && valorOuOutraVariavel !== undefined) {
            valorFinal = valorOuOutraVariavel.hasOwnProperty('valor')
                ? valorOuOutraVariavel.valor
                : valorOuOutraVariavel;
        }

        return valorFinal;
    }

    /**
     * Executa expressão de definição de constante.
     * @param declaracao A declaração `Const`.
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        const valorFinal = await this.avaliacaoDeclaracaoVarOuConst(declaracao);

        let subtipo;
        if (declaracao.tipo !== undefined) {
            subtipo = declaracao.tipo;
        }

        this.pilhaEscoposExecucao.definirConstante(declaracao.simbolo.lexema, valorFinal, subtipo);

        return null;
    }

    /**
     * Executa expressão de definição de múltiplas constantes.
     * @param declaracao A declaração `ConstMultiplo`.
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        const valoresFinais: any[] = await this.avaliacaoDeclaracaoVarOuConst(declaracao);

        for (let [indice, valor] of valoresFinais.entries()) {
            let subtipo;
            if (declaracao.tipo !== undefined) {
                subtipo = declaracao.tipo;
            }

            this.pilhaEscoposExecucao.definirConstante(declaracao.simbolos[indice].lexema, valor, subtipo);
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

    visitarExpressaoDeleguaFuncao(declaracao: any): DeleguaFuncao {
        return new DeleguaFuncao(null, declaracao);
    }

    async visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        const promises = await Promise.all([
            this.avaliar(expressao.objeto),
            this.avaliar(expressao.indice),
            this.avaliar(expressao.valor),
        ]);

        let objeto = promises[0];
        let indice = promises[1];
        const valor = promises[2];

        objeto = objeto.hasOwnProperty('valor') ? objeto.valor : objeto;
        indice = indice.hasOwnProperty('valor') ? indice.valor : indice;

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
            objeto instanceof DeleguaClasse ||
            objeto instanceof DeleguaModulo
        ) {
            objeto[indice] = valor;
        } else {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.objeto.nome,
                    'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
                    expressao.linha
                )
            );
        }
    }

    async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel | any): Promise<any> {
        const promises = await Promise.all([this.avaliar(expressao.entidadeChamada), this.avaliar(expressao.indice)]);

        const variavelObjeto: VariavelInterface = promises[0];
        const indice = promises[1];

        const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;
        let valorIndice = indice.hasOwnProperty('valor') ? indice.valor : indice;

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
        } else if (
            objeto.constructor === Object ||
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DeleguaClasse ||
            objeto instanceof DeleguaModulo
        ) {
            return objeto[valorIndice] || null;
        } else if (typeof objeto === tipoDeDadosPrimitivos.TEXTO) {
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
                    new ErroEmTempoDeExecucao(expressao.simboloFechamento, 'Índice fora do tamanho.', expressao.linha)
                );
            }
            return objeto.charAt(valorIndice);
        } else {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.entidadeChamada.nome,
                    'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
                    expressao.linha
                )
            );
        }
    }

    async visitarExpressaoDefinirValor(expressao: any): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;

        if (!(objeto instanceof ObjetoDeleguaClasse) && objeto.constructor !== Object) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.objeto.nome,
                    'Somente instâncias e dicionários podem possuir campos.',
                    expressao.linha
                )
            );
        }

        const valor = await this.avaliar(expressao.valor);
        if (objeto instanceof ObjetoDeleguaClasse) {
            objeto.definir(expressao.nome, valor);
            return valor;
        } else if (objeto.constructor === Object) {
            objeto[expressao.simbolo.lexema] = valor;
        }
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        const funcao = new DeleguaFuncao(declaracao.simbolo.lexema, declaracao.funcao);
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, funcao);
    }

    /**
     * Executa uma declaração de classe.
     * @param declaracao A declaração de classe.
     * @returns Sempre retorna nulo, por ser requerido pelo contrato de visita.
     */
    async visitarDeclaracaoClasse(declaracao: Classe): Promise<any> {
        let superClasse = null;
        if (declaracao.superClasse !== null && declaracao.superClasse !== undefined) {
            const variavelSuperClasse: VariavelInterface = await this.avaliar(declaracao.superClasse);
            superClasse = variavelSuperClasse.valor;
            if (!(superClasse instanceof DeleguaClasse)) {
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
            const funcao = new DeleguaFuncao(metodoAtual.simbolo.lexema, metodoAtual.funcao, undefined, eInicializador);
            metodos[metodoAtual.simbolo.lexema] = funcao;
        }

        const deleguaClasse: DeleguaClasse = new DeleguaClasse(
            declaracao.simbolo,
            superClasse,
            metodos,
            declaracao.propriedades
        );

        deleguaClasse.dialetoRequerExpansaoPropriedadesEspacoVariaveis =
            this.expandirPropriedadesDeObjetosEmEspacoVariaveis;
        deleguaClasse.dialetoRequerDeclaracaoPropriedades =
            this.requerDeclaracaoPropriedades;

        // TODO: Recolocar isso se for necessário.
        /* if (superClasse !== null) {
            this.ambiente = this.ambiente.enclosing;
        } */

        this.pilhaEscoposExecucao.atribuirVariavel(declaracao.simbolo, deleguaClasse);
        return null;
    }

    /**
     * Executa um acesso a método, normalmente de um objeto de classe.
     * @param expressao A expressão de acesso.
     * @returns O resultado da execução.
     */
    async visitarExpressaoAcessoMetodo(expressao: any): Promise<any> {
        const variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);
        const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;

        if (objeto instanceof ObjetoDeleguaClasse) {
            return objeto.obter(expressao.simbolo) || null;
        }

        // TODO: Possivelmente depreciar esta forma.
        // Não parece funcionar em momento algum.
        if (objeto.constructor === Object) {
            return objeto[expressao.simbolo.lexema] || null;
        }

        // Função tradicional do JavaScript.
        // Normalmente executa quando uma biblioteca é importada.
        if (typeof objeto[expressao.simbolo.lexema] === tipoDeDadosPrimitivos.FUNCAO) {
            return objeto[expressao.simbolo.lexema];
        }

        // Objeto tradicional do JavaScript.
        // Normalmente executa quando uma biblioteca é importada.
        if (typeof objeto[expressao.simbolo.lexema] === tipoDeDadosPrimitivos.OBJETO) {
            return objeto[expressao.simbolo.lexema];
        }

        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.simbolo.lexema] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        switch (tipoObjeto) {
            case tipoDeDadosDelegua.TEXTO:
                const metodoDePrimitivaTexto: Function = primitivasTexto[expressao.simbolo.lexema];
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaTexto);
                }
                break;
            case 'vetor':
                const metodoDePrimitivaVetor: Function = primitivasVetor[expressao.simbolo.lexema];
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaVetor);
                }
                break;
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                expressao.nome,
                `Método para objeto ou primitiva não encontrado: ${expressao.simbolo.lexema}.`,
                expressao.linha
            )
        );
    }

    visitarExpressaoIsto(expressao: any): any {
        return this.procurarVariavel(expressao.palavraChave);
    }


    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any>{
        return Promise.resolve();
    }

    async visitarExpressaoDicionario(expressao: any): Promise<any> {
        const dicionario = {};
        for (let i = 0; i < expressao.chaves.length; i++) {
            const promises = await Promise.all([this.avaliar(expressao.chaves[i]), this.avaliar(expressao.valores[i])]);

            dicionario[promises[0]] = promises[1];
        }
        return dicionario;
    }

    async visitarExpressaoVetor(expressao: Vetor): Promise<any> {
        const valores = [];
        for (let i = 0; i < expressao.valores.length; i++) {
            valores.push(await this.avaliar(expressao.valores[i]));
        }
        return valores;
    }

    visitarExpressaoSuper(expressao: Super): any {
        const superClasse: VariavelInterface = this.pilhaEscoposExecucao.obterVariavelPorNome('super');
        const objeto: VariavelInterface = this.pilhaEscoposExecucao.obterVariavelPorNome('isto');

        const metodo = superClasse.valor.encontrarMetodo(expressao.metodo.lexema);

        if (metodo === undefined) {
            throw new ErroEmTempoDeExecucao(expressao.metodo, 'Método chamado indefinido.', expressao.linha);
        }

        metodo.instancia = objeto.valor;

        return metodo;
    }

    /**
     * Executa expressão de definição de variável.
     * @param declaracao A declaração Var
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        const valorFinal = await this.avaliacaoDeclaracaoVarOuConst(declaracao);

        let subtipo;
        if (declaracao.tipo !== undefined) {
            subtipo = declaracao.tipo;
        }

        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, valorFinal, subtipo);

        return null;
    }

    /**
     * Executa expressão de definição de múltiplas variáveis.
     * @param declaracao A declaração `VarMultiplo`.
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        const valoresFinais: any[] = await this.avaliacaoDeclaracaoVarOuConst(declaracao);

        for (let [indice, valor] of valoresFinais.entries()) {
            let subtipo;
            if (declaracao.tipo !== undefined) {
                subtipo = declaracao.tipo;
            }

            this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolos[indice].lexema, valor, subtipo);
        }

        return null;
    }

    paraTexto(objeto: any): any {
        if (objeto === null || objeto === undefined) return tipoDeDadosDelegua.NULO;
        if (typeof objeto === tipoDeDadosPrimitivos.BOOLEANO) {
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
        // TODO: Idealmente isso deveria devolver um texto estruturado representando o objeto.
        if (objeto instanceof ObjetoDeleguaClasse) return objeto.toString();
        if (typeof objeto === tipoDeDadosPrimitivos.OBJETO) return JSON.stringify(objeto);

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
        /* console.log("Resultado aceitar: " + resultado, this); */
        if (mostrarResultado) {
            this.funcaoDeRetorno(this.paraTexto(resultado));
        }
        if (resultado || typeof resultado === tipoDeDadosPrimitivos.BOOLEANO) {
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
                !(retornoExecucao instanceof Quebra) && ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                retornoExecucao = await this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
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
            }

            return Promise.reject(erro);
        } finally {
            this.pilhaEscoposExecucao.removerUltimo();
            const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();

            if (manterAmbiente) {
                escopoAnterior.ambiente.valores = Object.assign(
                    escopoAnterior.ambiente.valores,
                    ultimoEscopo.ambiente.valores
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
    async interpretar(declaracoes: Declaracao[], manterAmbiente = false): Promise<RetornoInterpretador> {
        this.erros = [];
        this.emDeclaracaoTente = false;

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        const inicioInterpretacao: [number, number] = hrtime();
        try {
            const retornoOuErro = await this.executarUltimoEscopo(manterAmbiente);
            if (retornoOuErro instanceof ErroEmTempoDeExecucao) {
                this.erros.push(retornoOuErro);
            }
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: -1,
                hashArquivo: -1,
            });
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
            } as RetornoInterpretador;

            this.resultadoInterpretador = [];
            return retorno;
        }
    }
}
