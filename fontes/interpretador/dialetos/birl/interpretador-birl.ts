import {
    Atribuir,
    Binario,
    Construto,
    FimPara,
    Literal,
    Logico,
    Super,
    TipoDe,
    Unario,
    Variavel,
} from '../../../construtos';
import {
    Bloco,
    Classe,
    Const,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Leia,
    Para,
    ParaCada,
    Retorna,
    Se,
    Tente,
    Var,
} from '../../../declaracoes';
import { EspacoVariaveis } from '../../../espaco-variaveis';
import {
    Chamavel,
    DeleguaClasse,
    DeleguaFuncao,
    DeleguaModulo,
    FuncaoPadrao,
    MetodoPrimitiva,
    ObjetoPadrao,
} from '../../../estruturas';
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { ParametroInterface, SimboloInterface, VariavelInterface } from '../../../interfaces';
import { ErroInterpretador } from '../../../interfaces/erros/erro-interpretador';
import { EscopoExecucao } from '../../../interfaces/escopo-execucao';
import { InterpretadorInterfaceBirl } from '../../../interfaces/interpretador-interface-birl';
import { PilhaEscoposExecucaoInterface } from '../../../interfaces/pilha-escopos-execucao-interface';
import { RetornoInterpretador } from '../../../interfaces/retornos';
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from '../../../quebras';
import tiposDeSimbolos from '../../../tipos-de-simbolos/birl';
import { ArgumentoInterface } from '../../argumento-interface';
import { inferirTipoVariavel } from '../../inferenciador';
import { InterpretadorBase } from '../../interpretador-base';
import { PilhaEscoposExecucao } from '../../pilha-escopos-execucao';

import * as comum from './comum';

export class InterpretadorBirl extends InterpretadorBase implements InterpretadorInterfaceBirl {
    diretorioBase: any;

    funcaoDeRetorno: Function = null;
    funcaoDeRetornoMesmaLinha: Function = null;

    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;

    erros: ErroInterpretador[];
    declaracoes: Declaracao[];

    resultadoInterpretador: Array<string> = [];

    regexInterpolacao = /\$\{([a-z_][\w]*)\}/gi;

    expressoesStringC = {
        '%d': 'inteiro',
        '%i': 'inteiro',
        '%u': 'inteiro',
        '%f': 'real',
        '%F': 'real',
        '%e': 'real',
        '%E': 'real',
        '%g': 'real',
        '%G': 'real',
        '%x': 'inteiro',
        '%X': 'inteiro',
        '%o': 'inteiro',
        '%s': 'texto',
        '%c': 'texto',
        '%p': 'texto',
    };

    constructor(diretorioBase: string, funcaoDeRetorno: Function = null, funcaoDeRetornoMesmaLinha: Function = null) {
        super(diretorioBase, false, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.diretorioBase = diretorioBase;

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.funcaoDeRetornoMesmaLinha = funcaoDeRetornoMesmaLinha || process.stdout.write.bind(process.stdout);

        this.erros = [];
        this.declaracoes = [];

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
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async avaliar(expressao: Construto | Declaracao): Promise<any> {
        // @todo: Implementar validação mais inteligente.
        // Descomente o código abaixo quando precisar detectar expressões undefined ou nulas.
        // Por algum motivo o depurador do VSCode não funciona direito aqui
        // com breakpoint condicional.
        /* if (expressao === null || expressao === undefined) {
            console.log('Aqui');
        } */

        return await expressao.aceitar(this);
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

    async visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        return await this.avaliar(expressao.expressao);
    }

    protected verificarOperandoNumero(operador: SimboloInterface, operando: any): void {
        if (typeof operando === 'number' || operando.tipo === 'número') return;
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
        const tipoDireita: string = direita.tipo ? direita.tipo : typeof direita === 'number' ? 'número' : String(NaN);
        const tipoEsquerda: string = esquerda.tipo
            ? esquerda.tipo
            : typeof esquerda === 'number'
            ? 'número'
            : String(NaN);
        if (tipoDireita === 'número' && tipoEsquerda === 'número') return;
        throw new ErroEmTempoDeExecucao(operador, 'Operadores precisam ser números.', operador.linha);
    }

    async visitarExpressaoBinaria(expressao: Binario): Promise<any> {
        try {
            const esquerda: VariavelInterface | any = await this.avaliar(expressao.esquerda);
            const direita: VariavelInterface | any = await this.avaliar(expressao.direita);
            const valorEsquerdo: any = esquerda?.hasOwnProperty('valor') ? esquerda.valor : esquerda;
            const valorDireito: any = direita?.hasOwnProperty('valor') ? direita.valor : direita;
            const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo')
                ? esquerda.tipo
                : inferirTipoVariavel(esquerda);
            const tipoDireito: string = direita?.hasOwnProperty('tipo') ? direita.tipo : inferirTipoVariavel(direita);

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
                case tiposDeSimbolos.MENOS_IGUAL:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) - Number(valorDireito);

                case tiposDeSimbolos.ADICAO:
                case tiposDeSimbolos.MAIS_IGUAL:
                    if (tipoEsquerdo === 'número' && tipoDireito === 'número') {
                        return Number(valorEsquerdo) + Number(valorDireito);
                    } else {
                        return String(valorEsquerdo) + String(valorDireito);
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
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: expressao.linha,
                hashArquivo: expressao.hashArquivo,
            });
            return Promise.reject(erro);
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
                        'Entidade chamada é um módulo de Birl. Provavelmente você quer chamar um de seus componentes?',
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
                parametros = entidadeChamada.metodos.inicializacao
                    ? entidadeChamada.metodos.inicializacao.declaracao.parametros
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
                        argumentos.map((a) => (a !== null && a.hasOwnProperty('valor') ? a.valor : a)),
                        expressao.entidadeChamada.nome
                    );
                } catch (erro: any) {
                    this.erros.push({
                        erroInterno: erro,
                        linha: expressao.linha,
                        hashArquivo: expressao.hashArquivo,
                    });
                    this.erros.push(erro);
                }
            }

            if (entidadeChamada instanceof Chamavel) {
                return entidadeChamada.chamar(this, argumentos);
            }

            // A função chamada pode ser de uma biblioteca JavaScript.
            // Neste caso apenas testamos se o tipo é uma função.
            if (typeof entidadeChamada === 'function') {
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
            console.log(erro);
            this.erros.push({
                erroInterno: erro,
                linha: expressao.linha,
                hashArquivo: expressao.hashArquivo,
            });
            this.erros.push(erro);
        }
    }
    async visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        throw new Error('Método não implementado.');
    }

    protected procurarVariavel(simbolo: SimboloInterface): any {
        return this.pilhaEscoposExecucao.obterValorVariavel(simbolo);
    }

    visitarExpressaoDeVariavel(expressao: Variavel): any {
        return this.procurarVariavel(expressao.simbolo);
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        throw new Error('Método não implementado.');
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        await comum.visitarExpressaoLeia(this, expressao);
    }

    async visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        return comum.visitarExpressaoLiteral(expressao);
    }

    async visitarExpressaoLogica(expressao: Logico): Promise<any> {
        const esquerda = await this.avaliar(expressao.esquerda);

        if (expressao.operador.tipo === tiposDeSimbolos.EM) {
            const direita = await this.avaliar(expressao.direita);

            if (Array.isArray(direita) || typeof direita === 'string') {
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
        return comum.visitarDeclaracaoPara(this, declaracao);
    }

    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Método não implementado.');
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

        //  @todo: Verificar se é necessário avaliar o caminho Senão.
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

    async visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado.');
    }
    async visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error('Método não implementado.');
    }
    // async visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
    //     throw new Error('Método não implementado.');
    // }
    async visitarDeclaracaoEscolha(declaracao: Escolha) {
        throw new Error('Método não implementado.');
    }
    async visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error('Método não implementado.');
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

    async substituirValor(
        stringOriginal: string,
        novoValor: number | string | any,
        simboloTipo: string
    ): Promise<string> {
        return comum.substituirValor(stringOriginal, novoValor, simboloTipo);
    }

    async resolveQuantidadeDeInterpolacoes(texto: Literal): Promise<RegExpMatchArray> {
        return comum.resolveQuantidadeDeInterpolacoes(texto);
    }

    async verificaTipoDaInterpolação(dados: { tipo: string; valor: any }) {
        return comum.verificaTipoDaInterpolação(dados);
    }

    async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        return comum.avaliarArgumentosEscreva(this, argumentos);
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
        throw new Error('Método não implementado.');
    }
    async visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        return await this.executarBloco(declaracao.declaracoes);
    }

    protected async avaliacaoDeclaracaoVarOuConst(declaracao: Var): Promise<any> {
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

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error('Método não implementado.');
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
    // async visitarExpressaoDeleguaFuncao(expressao: any) {
    //     throw new Error('Método não implementado.');
    // }
    visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }
    async visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error('Método não implementado.');
    }
    async visitarExpressaoDefinirValor(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        const funcao = new DeleguaFuncao(declaracao.simbolo.lexema, declaracao.funcao);
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, funcao);
    }
    async visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error('Método não implementado.');
    }
    async visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error('Método não implementado.');
    }
    async visitarExpressaoDicionario(expressao: any) {
        throw new Error('Método não implementado.');
    }
    async visitarExpressaoVetor(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error('Método não implementado.');
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
    async executar(declaracao: Declaracao, mostrarResultado: boolean = false): Promise<any> {
        let resultado: any = null;

        resultado = await declaracao.aceitar(this);
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
                !(retornoExecucao instanceof Quebra) && ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                retornoExecucao = await this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
            }

            return retornoExecucao;
        } catch (erro: any) {
            const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
            this.erros.push({
                erroInterno: erro,
                linha: declaracaoAtual.linha,
                hashArquivo: declaracaoAtual.hashArquivo,
            });
            return Promise.reject(erro);
        } finally {
            this.pilhaEscoposExecucao.removerUltimo();
            if (manterAmbiente) {
                const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                escopoAnterior.ambiente.valores = Object.assign(
                    escopoAnterior.ambiente.valores,
                    ultimoEscopo.ambiente.valores
                );
            }
        }
    }

    async interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): Promise<RetornoInterpretador> {
        return comum.interpretar(this, declaracoes, manterAmbiente);
    }
}
