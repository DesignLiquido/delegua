import * as caminho from 'path';
import * as readline from 'readline';
import hrtime from 'browser-process-hrtime';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

import { EspacoVariaveis } from '../espaco-variaveis';
import carregarBibliotecaGlobal from '../bibliotecas/biblioteca-global';
import carregarBibliotecaNode from '../bibliotecas/importar-biblioteca';

import { ErroEmTempoDeExecucao } from '../excecoes';
import {
    InterpretadorInterface,
    ParametroInterface,
    SimboloInterface,
    VariavelInterface,
} from '../interfaces';
import {
    Bloco,
    Classe,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    Funcao,
    Importar,
    Leia,
    Para,
    Retorna,
    Se,
    Tente,
    Var,
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
    Atribuir,
    Construto,
    Literal,
    Super,
    Variavel,
} from '../construtos';
import { ErroInterpretador } from './erro-interpretador';
import { RetornoInterpretador } from '../interfaces/retornos/retorno-interpretador';
import { ImportadorInterface } from '../interfaces/importador-interface';
import { EscopoExecucao } from '../interfaces/escopo-execucao';
import { PilhaEscoposExecucao } from './pilha-escopos-execucao';
import {
    ContinuarQuebra,
    Quebra,
    RetornoQuebra,
    SustarQuebra,
} from '../quebras';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import { inferirTipoVariavel } from './inferenciador';
import primitivasTexto from '../bibliotecas/primitivas-texto';
import { MetodoPrimitiva } from '../estruturas/metodo-primitiva';
import primitivasVetor from '../bibliotecas/primitivas-vetor';

/**
 * O Interpretador visita todos os elementos complexos gerados pelo avaliador sintático (_parser_),
 * e de fato executa a lógica de programação descrita no código.
 */
export class Interpretador implements InterpretadorInterface {
    importador: ImportadorInterface;
    diretorioBase: any;
    erros: ErroInterpretador[];
    performance: boolean;
    funcaoDeRetorno: Function = null;
    interfaceDeEntrada: readline.Interface = null;
    resultadoInterpretador: Array<string> = [];
    declaracoes: Declaracao[];
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    regexInterpolacao = /\$\{([a-z_][\w]*)\}/gi;

    constructor(
        importador: ImportadorInterface,
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null
    ) {
        this.importador = importador;
        this.diretorioBase = diretorioBase;
        this.performance = performance;

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;

        this.interfaceDeEntrada = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\n> ',
        });

        this.erros = [];
        this.declaracoes = [];

        this.pilhaEscoposExecucao = new PilhaEscoposExecucao();
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        carregarBibliotecaGlobal(this, this.pilhaEscoposExecucao);
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        const mensagem = "Mensagem de teste";
        return new Promise(resolucao =>
            this.interfaceDeEntrada.question(mensagem, resposta => {
                resolucao(resposta);
            })
        );
    }

    /**
     * Retira a interpolação de um texto.
     * @param {texto} texto O texto
     * @param {any[]} variaveis A lista de variaveis interpoladas
     * @returns O texto com o valor das variaveis.
     */
    retirarInterpolacao(texto: string, variaveis: any[]): string {
        const valoresVariaveis = variaveis.map((v) => ({
            valorResolvido: this.pilhaEscoposExecucao.obterVariavelPorNome(
                v.variavel
            ),
            variavel: v.variavel,
        }));

        let textoFinal = texto;

        valoresVariaveis.forEach((elemento) => {
            const valorFinal = elemento.valorResolvido.hasOwnProperty('valor')
                ? elemento.valorResolvido.valor
                : elemento.valorResolvido;

            textoFinal = textoFinal.replace(
                '${' + elemento.variavel + '}',
                valorFinal
            );
        });

        return textoFinal;
    }

    /**
     * Busca variáveis interpoladas.
     * @param {texto} textoOriginal O texto original com as variáveis interpoladas.
     * @returns Uma lista de variáveis interpoladas.
     */
    buscarVariaveisInterpolacao(textoOriginal: string): any[] {
        const variaveis = textoOriginal.match(this.regexInterpolacao);

        return variaveis.map((s) => {
            const nomeVariavel: string = s.replace(/[\$\{\}]*/g, '');
            return {
                variavel: nomeVariavel,
                valor: this.pilhaEscoposExecucao.obterVariavelPorNome(
                    nomeVariavel
                ),
            };
        });
    }

    visitarExpressaoLiteral(expressao: Literal): any {
        if (this.regexInterpolacao.test(expressao.valor)) {
            const variaveis = this.buscarVariaveisInterpolacao(expressao.valor);

            return this.retirarInterpolacao(expressao.valor, variaveis);
        }

        return expressao.valor;
    }

    async avaliar(expressao: Construto): Promise<any> {
        return await expressao.aceitar(this);
    }

    async visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        return await this.avaliar(expressao.expressao);
    }

    eVerdadeiro(objeto: any): boolean {
        if (objeto === null) return false;
        if (typeof objeto === 'boolean') return Boolean(objeto);

        return true;
    }

    verificarOperandoNumero(operador: any, operando: any): void {
        if (typeof operando === 'number') return;
        throw new ErroEmTempoDeExecucao(
            operador,
            'Operando precisa ser um número.',
            operador.linha
        );
    }

    async visitarExpressaoUnaria(expressao: any): Promise<any> {
        const direita = await this.avaliar(expressao.direita);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.SUBTRACAO:
                this.verificarOperandoNumero(expressao.operador, direita);
                return -direita;
            case tiposDeSimbolos.NEGACAO:
                return !this.eVerdadeiro(direita);
            case tiposDeSimbolos.BIT_NOT:
                return ~direita;
        }

        return null;
    }

    eIgual(
        esquerda: VariavelInterface | any,
        direita: VariavelInterface | any
    ): boolean {
        if (esquerda === null && direita === null) return true;
        if (esquerda === null) return false;
        if (esquerda.tipo) {
            if (
                esquerda.tipo === 'nulo' &&
                direita.tipo &&
                direita.tipo === 'nulo'
            )
                return true;
            if (esquerda.tipo === 'nulo') return false;

            return esquerda.valor === direita.valor;
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
    verificarOperandosNumeros(
        operador: any,
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
        if (tipoDireita === 'número' && tipoEsquerda === 'número') return;
        throw new ErroEmTempoDeExecucao(
            operador,
            'Operadores precisam ser números.',
            operador.linha
        );
    }

    async visitarExpressaoBinaria(expressao: any): Promise<any> {
        const esquerda: VariavelInterface | any = await this.avaliar(
            expressao.esquerda
        );
        const direita: VariavelInterface | any = await this.avaliar(
            expressao.direita
        );
        const valorEsquerdo: any = esquerda?.hasOwnProperty('valor')
            ? esquerda.valor
            : esquerda;
        const valorDireito: any = direita?.hasOwnProperty('valor')
            ? direita.valor
            : direita;
        const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo')
            ? esquerda.tipo
            : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita?.hasOwnProperty('tipo')
            ? direita.tipo
            : inferirTipoVariavel(direita);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.EXPONENCIACAO:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Math.pow(valorEsquerdo, valorDireito);

            case tiposDeSimbolos.MAIOR:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) > Number(valorDireito);

            case tiposDeSimbolos.MAIOR_IGUAL:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) >= Number(valorDireito);

            case tiposDeSimbolos.MENOR:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) < Number(valorDireito);

            case tiposDeSimbolos.MENOR_IGUAL:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) <= Number(valorDireito);

            case tiposDeSimbolos.SUBTRACAO:
            case tiposDeSimbolos.MENOS_IGUAL:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
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
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) / Number(valorDireito);

            case tiposDeSimbolos.MULTIPLICACAO:
            case tiposDeSimbolos.MULTIPLICACAO_IGUAL:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) * Number(valorDireito);

            case tiposDeSimbolos.MODULO:
            case tiposDeSimbolos.MODULO_IGUAL:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) % Number(valorDireito);

            case tiposDeSimbolos.BIT_AND:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) & Number(valorDireito);

            case tiposDeSimbolos.BIT_XOR:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) ^ Number(valorDireito);

            case tiposDeSimbolos.BIT_OR:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) | Number(valorDireito);

            case tiposDeSimbolos.MENOR_MENOR:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) << Number(valorDireito);

            case tiposDeSimbolos.MAIOR_MAIOR:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
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
            const variavelEntidadeChamada: VariavelInterface | any = await this.avaliar(
                expressao.entidadeChamada
            );
            const entidadeChamada = variavelEntidadeChamada.hasOwnProperty('valor')
                ? variavelEntidadeChamada.valor
                : variavelEntidadeChamada;

            let argumentos = [];
            for (let i = 0; i < expressao.argumentos.length; i++) {
                argumentos.push(await this.avaliar(expressao.argumentos[i]));
            }

            if (!(entidadeChamada instanceof Chamavel)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.parentese,
                    'Só pode chamar função ou classe.',
                    expressao.linha
                );
            }

            if (entidadeChamada instanceof MetodoPrimitiva) {
                const argumentosResolvidos: any[] = [];
                for (const argumento of expressao.argumentos) {
                    const valorResolvido: any = await this.avaliar(argumento);
                    argumentosResolvidos.push(
                        valorResolvido.hasOwnProperty('valor')
                            ? valorResolvido.valor
                            : valorResolvido
                    );
                }
                return entidadeChamada.chamar(argumentosResolvidos);
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

            // Completar os parâmetros não preenchidos com nulos.
            if (argumentos.length < entidadeChamada.aridade()) {
                const diferenca = entidadeChamada.aridade() - argumentos.length;
                for (let i = 0; i < diferenca; i++) {
                    argumentos.push(null);
                }
            } else {
                if (
                    parametros &&
                    parametros.length > 0 &&
                    parametros[parametros.length - 1].tipo === 'estrela'
                ) {
                    const novosArgumentos = argumentos.slice(
                        0,
                        parametros.length - 1
                    );
                    novosArgumentos.push(
                        argumentos.slice(parametros.length - 1, argumentos.length)
                    );
                    argumentos = novosArgumentos;
                }
            }

            if (entidadeChamada instanceof FuncaoPadrao) {
                try {
                    return entidadeChamada.chamar(
                        argumentos,
                        expressao.entidadeChamada.nome
                    );
                } catch (erro: any) {
                    this.erros.push(erro);
                }
            }

            return entidadeChamada.chamar(this, argumentos);
        } catch (erro: any) {
            console.log(erro)
        }
    }

    /**
     * Execução de uma expressão de atribuição.
     * @param expressao A expressão.
     * @returns O valor atribuído.
     */
    async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        const valor = await this.avaliar(expressao.valor);
        this.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valor);

        return valor;
    }

    procurarVariavel(simbolo: SimboloInterface): any {
        return this.pilhaEscoposExecucao.obterVariavel(simbolo);
    }

    visitarExpressaoDeVariavel(expressao: Variavel): any {
        return this.procurarVariavel(expressao.simbolo);
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return await this.avaliar(declaracao.expressao);
    }

    async visitarExpressaoLogica(expressao: any): Promise<any> {
        const esquerda = await this.avaliar(expressao.esquerda);

        if (expressao.operador.tipo === tiposDeSimbolos.EM) {
            const direita = await this.avaliar(expressao.direita);

            if (Array.isArray(direita) || typeof direita === 'string') {
                return direita.includes(esquerda);
            } else if (direita.constructor === Object) {
                return esquerda in direita;
            } else {
                throw new ErroEmTempoDeExecucao(
                    esquerda,
                    "Tipo de chamada inválida com 'em'.",
                    expressao.linha
                );
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

    /**
     * Executa uma expressão Se, que tem uma condição, pode ter um bloco
     * Senão, e múltiplos blocos Senão-se.
     * @param declaracao A declaração Se.
     * @returns O resultado da avaliação do bloco cuja condição é verdadeira.
     */
    async visitarExpressaoSe(declaracao: Se): Promise<any> {
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

    async visitarExpressaoPara(declaracao: Para): Promise<any> {
        if (declaracao.inicializador !== null) {
            await this.avaliar(declaracao.inicializador);
        }

        let retornoExecucao: any;
        while (!(retornoExecucao instanceof Quebra)) {
            if (
                declaracao.condicao !== null &&
                !this.eVerdadeiro(await this.avaliar(declaracao.condicao))
            ) {
                break;
            }

            try {
                retornoExecucao = await this.executar(declaracao.corpo);
            } catch (erro: any) {
                throw erro;
            }

            if (declaracao.incrementar !== null) {
                await this.avaliar(declaracao.incrementar);
            }
        }
        return null;
    }

    async visitarExpressaoFazer(declaracao: Fazer): Promise<any> {
        let retornoExecucao: any;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
            } catch (erro: any) {
                throw erro;
            }
        } while (
            !(retornoExecucao instanceof Quebra) &&
            this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto))
        );
    }

    async visitarExpressaoEscolha(declaracao: Escolha): Promise<any> {
        const condicaoEscolha = await this.avaliar(declaracao.identificadorOuLiteral);
        const caminhos = declaracao.caminhos;
        const caminhoPadrao = declaracao.caminhoPadrao;

        let encontrado = false;
        try {
            for (let i = 0; i < caminhos.length; i++) {
                const caminho = caminhos[i];

                for (let j = 0; j < caminho.condicoes.length; j++) {
                    if (
                        await this.avaliar(caminho.condicoes[j]) === condicaoEscolha
                    ) {
                        encontrado = true;

                        try {
                            this.executarBloco(caminho.declaracoes);
                        } catch (erro: any) {
                            throw erro;
                        }
                    }
                }
            }

            if (caminhoPadrao !== null && encontrado === false) {
                this.executarBloco(caminhoPadrao.declaracoes);
            }
        } catch (erro: any) {
            throw erro;
        }
    }

    visitarExpressaoTente(declaracao: Tente): any {
        try {
            let sucesso = true;
            try {
                this.executarBloco(declaracao.caminhoTente);
            } catch (erro: any) {
                sucesso = false;

                if (declaracao.caminhoPegue !== null) {
                    this.executarBloco(declaracao.caminhoPegue);
                } else {
                    this.erros.push(erro);
                }
            }

            if (sucesso && declaracao.caminhoSenao !== null) {
                this.executarBloco(declaracao.caminhoSenao);
            }
        } finally {
            if (declaracao.caminhoFinalmente !== null)
                this.executarBloco(declaracao.caminhoFinalmente);
        }
    }

    async visitarExpressaoEnquanto(declaracao: Enquanto): Promise<any> {
        let retornoExecucao: any;
        while (
            !(retornoExecucao instanceof Quebra) &&
            this.eVerdadeiro(await this.avaliar(declaracao.condicao))
        ) {
            try {
                retornoExecucao = await this.executar(declaracao.corpo);
            } catch (erro) {
                throw erro;
            }
        }

        return null;
    }

    async visitarExpressaoImportar(declaracao: Importar): Promise<any> {
        const caminhoRelativo = await this.avaliar(declaracao.caminho);
        const caminhoTotal = caminho.join(this.diretorioBase, caminhoRelativo);
        const nomeArquivo = caminho.basename(caminhoTotal);

        if (
            !caminhoTotal.endsWith('.egua') &&
            !caminhoTotal.endsWith('.delegua')
        ) {
            try {
                return carregarBibliotecaNode(caminhoRelativo);
            } catch (erro: any) {
                this.erros.push(erro);
                return null;
            }
        }

        const conteudoImportacao = this.importador.importar(caminhoRelativo);
        const retornoInterpretador = this.interpretar(
            conteudoImportacao.retornoAvaliadorSintatico.declaracoes,
            true
        );

        const funcoesChamaveis =
            this.pilhaEscoposExecucao.obterTodasDeleguaFuncao();

        const eDicionario = (objeto: any) => objeto.constructor === Object;

        if (eDicionario(funcoesChamaveis)) {
            const novoModulo = new DeleguaModulo();

            const chaves = Object.keys(funcoesChamaveis);
            for (let i = 0; i < chaves.length; i++) {
                novoModulo.componentes[chaves[i]] = funcoesChamaveis[chaves[i]];
            }

            return novoModulo;
        }

        return funcoesChamaveis;
    }

    /**
     * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
     * alguma função para escrever numa página Web.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarExpressaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            let valor: any;
            for (const argumento of declaracao.argumentos) {
                const resultadoAvaliacao = await this.avaliar(argumento);
                valor = resultadoAvaliacao?.hasOwnProperty('valor')
                    ? resultadoAvaliacao.valor
                    : resultadoAvaliacao;
            }
            const formatoTexto = this.paraTexto(valor);
            // Por enquanto `escreva` não devolve resultado no interpretador.
            // this.resultadoInterpretador.push(formatoTexto);
            this.funcaoDeRetorno(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
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
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        const retornoUltimoEscopo: any = await this.executarUltimoEscopo();
        if (retornoUltimoEscopo instanceof ErroEmTempoDeExecucao) {
            throw retornoUltimoEscopo;
        }
        return retornoUltimoEscopo;
    }

    visitarExpressaoBloco(declaracao: Bloco): any {
        return this.executarBloco(declaracao.declaracoes);
    }

    /**
     * Executa expressão de definição de variável.
     * @param declaracao A declaração Var
     * @returns Sempre retorna nulo.
     */
    async visitarExpressaoVar(declaracao: Var): Promise<any> {
        let valorOuOutraVariavel = null;
        if (declaracao.inicializador !== null) {
            valorOuOutraVariavel = await this.avaliar(declaracao.inicializador);
        }

        this.pilhaEscoposExecucao.definirVariavel(
            declaracao.simbolo.lexema,
            valorOuOutraVariavel.hasOwnProperty('valor')
                ? valorOuOutraVariavel.valor
                : valorOuOutraVariavel
        );

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

    visitarExpressaoDeleguaFuncao(expressao: any) {
        return new DeleguaFuncao(null, expressao);
    }

    async visitarExpressaoAtribuicaoSobrescrita(expressao: any): Promise<any> {
        const promises = await Promise.all([
            this.avaliar(expressao.objeto),
            this.avaliar(expressao.indice),
            this.avaliar(expressao.valor)
        ]);

        const objeto = promises[0];
        let indice = promises[1];
        const valor = promises[2];

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
            throw new ErroEmTempoDeExecucao(
                expressao.objeto.nome,
                'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
                expressao.linha
            );
        }
    }

    async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel | any): Promise<any> {
        const variavelObjeto: VariavelInterface = await this.avaliar(
            expressao.entidadeChamada
        );
        const objeto = variavelObjeto.hasOwnProperty('valor')
            ? variavelObjeto.valor
            : variavelObjeto;

        const indice = await this.avaliar(expressao.indice);
        let valorIndice = indice.hasOwnProperty('valor') ? indice.valor : indice;
        if (Array.isArray(objeto)) {
            if (!Number.isInteger(valorIndice)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Somente inteiros podem ser usados para indexar um vetor.',
                    expressao.linha
                );
            }

            if (valorIndice < 0 && objeto.length !== 0) {
                while (valorIndice < 0) {
                    valorIndice += objeto.length;
                }
            }

            if (valorIndice >= objeto.length) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice do vetor fora do intervalo.',
                    expressao.linha
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
        } else if (typeof objeto === 'string') {
            if (!Number.isInteger(valorIndice)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Somente inteiros podem ser usados para indexar um vetor.',
                    expressao.linha
                );
            }

            if (valorIndice < 0 && objeto.length !== 0) {
                while (valorIndice < 0) {
                    valorIndice += objeto.length;
                }
            }

            if (valorIndice >= objeto.length) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice fora do tamanho.',
                    expressao.linha
                );
            }
            return objeto.charAt(valorIndice);
        } else {
            throw new ErroEmTempoDeExecucao(
                expressao.entidadeChamada.nome,
                'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
                expressao.linha
            );
        }
    }

    async visitarExpressaoDefinir(expressao: any): Promise<any> {
        const objeto = await this.avaliar(expressao.objeto);

        if (
            !(objeto instanceof ObjetoDeleguaClasse) &&
            objeto.constructor !== Object
        ) {
            throw new ErroEmTempoDeExecucao(
                expressao.objeto.nome,
                'Somente instâncias e dicionários podem possuir campos.',
                expressao.linha
            );
        }

        const valor = await this.avaliar(expressao.valor);
        if (objeto instanceof ObjetoDeleguaClasse) {
            objeto.set(expressao.nome, valor);
            return valor;
        } else if (objeto.constructor === Object) {
            objeto[expressao.simbolo.lexema] = valor;
        }
    }

    visitarExpressaoFuncao(declaracao: Funcao) {
        const funcao = new DeleguaFuncao(
            declaracao.simbolo.lexema,
            declaracao.funcao
        );
        this.pilhaEscoposExecucao.definirVariavel(
            declaracao.simbolo.lexema,
            funcao
        );
    }

    /**
     * Executa uma declaração de classe.
     * @param declaracao A declaração de classe.
     * @returns Sempre retorna nulo, por ser requerido pelo contrato de visita.
     */
    async visitarExpressaoClasse(declaracao: Classe): Promise<any> {
        let superClasse = null;
        if (declaracao.superClasse !== null) {
            const variavelSuperClasse: VariavelInterface = await this.avaliar(
                declaracao.superClasse
            );
            superClasse = variavelSuperClasse.valor;
            if (!(superClasse instanceof DeleguaClasse)) {
                throw new ErroEmTempoDeExecucao(
                    declaracao.superClasse.nome,
                    'SuperClasse precisa ser uma classe.',
                    declaracao.linha
                );
            }
        }

        this.pilhaEscoposExecucao.definirVariavel(
            declaracao.simbolo.lexema,
            null
        );

        if (declaracao.superClasse !== null) {
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

        const deleguaClasse: DeleguaClasse = new DeleguaClasse(
            declaracao.simbolo.lexema,
            superClasse,
            metodos
        );

        // TODO: Recolocar isso se for necessário.
        /* if (superClasse !== null) {
            this.ambiente = this.ambiente.enclosing;
        } */

        this.pilhaEscoposExecucao.atribuirVariavel(
            declaracao.simbolo,
            deleguaClasse
        );
        return null;
    }

    /**
     * Executa um acesso a método, normalmente de um objeto de classe.
     * @param expressao A expressão de acesso.
     * @returns O resultado da execução.
     */
    async visitarExpressaoAcessoMetodo(expressao: any): Promise<any> {
        const variavelObjeto: VariavelInterface = await this.avaliar(
            expressao.objeto
        );
        const objeto = variavelObjeto?.valor;

        if (objeto instanceof ObjetoDeleguaClasse) {
            return objeto.get(expressao.simbolo) || null;
        }

        if (objeto.constructor === Object) {
            return objeto[expressao.simbolo.lexema] || null;
        }

        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.simbolo.lexema] || null;
        }

        switch (variavelObjeto.tipo) {
            case 'texto':
                const metodoDePrimitivaTexto: Function =
                    primitivasTexto[expressao.simbolo.lexema];
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaTexto);
                }
                break;
            case 'vetor':
                const metodoDePrimitivaVetor: Function =
                    primitivasVetor[expressao.simbolo.lexema];
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaVetor);
                }
                break;
        }

        throw new ErroEmTempoDeExecucao(
            expressao.nome,
            'Você só pode acessar métodos do objeto e dicionários.',
            expressao.linha
        );
    }

    visitarExpressaoIsto(expressao: any): any {
        return this.procurarVariavel(expressao.palavraChave);
    }

    async visitarExpressaoDicionario(expressao: any): Promise<any> {
        const dicionario = {};
        for (let i = 0; i < expressao.chaves.length; i++) {
            const promises = await Promise.all([
                this.avaliar(expressao.chaves[i]),
                this.avaliar(expressao.valores[i])
            ]);

            dicionario[promises[0]] = promises[1];
        }
        return dicionario;
    }

    async visitarExpressaoVetor(expressao: any): Promise<any> {
        const valores = [];
        for (let i = 0; i < expressao.valores.length; i++) {
            valores.push(await this.avaliar(expressao.valores[i]));
        }
        return valores;
    }

    // TODO: Após remoção do Resolvedor, simular casos que usem 'super' e 'isto'.
    visitarExpressaoSuper(expressao: Super): any {
        const superClasse: VariavelInterface =
            this.pilhaEscoposExecucao.obterVariavelPorNome('super');
        const objeto: VariavelInterface =
            this.pilhaEscoposExecucao.obterVariavelPorNome('isto');

        const metodo = superClasse.valor.encontrarMetodo(
            expressao.metodo.lexema
        );

        if (metodo === undefined) {
            throw new ErroEmTempoDeExecucao(
                expressao.metodo,
                'Método chamado indefinido.',
                expressao.linha
            );
        }

        return metodo.definirInstancia(objeto.valor);
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

        if (objeto.valor instanceof ObjetoPadrao)
            return objeto.valor.paraTexto();
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
            return erro;
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

    /**
     * Interpretação sem depurador, com medição de performance.
     * Método que efetivamente inicia o processo de interpretação.
     * @param declaracoes Um vetor de declarações gerado pelo Avaliador Sintático.
     * @param manterAmbiente Se ambiente de execução (variáveis, classes, etc.) deve ser mantido. Normalmente usado
     *                       pelo modo REPL (LEIA).
     * @returns Um objeto com o resultado da interpretação.
     */
    async interpretar(
        declaracoes: Declaracao[],
        manterAmbiente = false
    ): Promise<RetornoInterpretador> {
        this.erros = [];

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        const inicioInterpretacao: [number, number] = hrtime();
        try {
            const retornoOuErro = await this.executarUltimoEscopo(manterAmbiente);
            if (retornoOuErro instanceof ErroEmTempoDeExecucao) {
                this.erros.push(retornoOuErro);
            }
        } finally {
            if (this.performance) {
                const deltaInterpretacao: [number, number] =
                    hrtime(inicioInterpretacao);
                console.log(
                    `[Interpretador] Tempo para interpretaçao: ${
                        deltaInterpretacao[0] * 1e9 + deltaInterpretacao[1]
                    }ns`
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

    /**
     * Procedimento de finalização de execução, normalmente solicitado pelo
     * núcleo da linguagem.
     */
    finalizacao(): void {
        this.interfaceDeEntrada.close();
    }
}
