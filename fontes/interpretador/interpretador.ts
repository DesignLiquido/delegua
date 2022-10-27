import * as caminho from 'path';
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
    resultadoInterpretador: Array<String> = [];
    declaracoes: Declaracao[];
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    regexInterpolacao = /\$\{([a-z_][\w]*)\}/ig;

    constructor(
        importador: ImportadorInterface,
        diretorioBase: string,
        performance: boolean = false,
        funcaoDeRetorno: Function
    ) {
        this.importador = importador;
        this.diretorioBase = diretorioBase;
        this.performance = performance;

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;

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
     * @param expressao 
     */
    visitarExpressaoLeia(expressao: Leia) {
        throw new Error('Método não implementado.');
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
                valor: this.pilhaEscoposExecucao.obterVariavelPorNome(nomeVariavel)
            }
        });
    }

    visitarExpressaoLiteral(expressao: Literal): any {
        if (this.regexInterpolacao.test(expressao.valor)) {
            const variaveis = this.buscarVariaveisInterpolacao(expressao.valor);

            return this.retirarInterpolacao(expressao.valor, variaveis);
        }

        return expressao.valor;
    }

    avaliar(expressao: Construto): any {
        return expressao.aceitar(this);
    }

    visitarExpressaoAgrupamento(expressao: any) {
        return this.avaliar(expressao.expressao);
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

    visitarExpressaoUnaria(expressao: any): any {
        const direita = this.avaliar(expressao.direita);

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

    visitarExpressaoBinaria(expressao: any): any {
        const esquerda: VariavelInterface | any = this.avaliar(
            expressao.esquerda
        );
        const direita: VariavelInterface | any = this.avaliar(
            expressao.direita
        );
        const valorEsquerdo: any = esquerda.hasOwnProperty('valor')
            ? esquerda.valor
            : esquerda;
        const valorDireito: any = direita.hasOwnProperty('valor')
            ? direita.valor
            : direita;
        const tipoEsquerdo: string = esquerda.hasOwnProperty('tipo')
            ? esquerda.tipo
            : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita.hasOwnProperty('tipo')
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

        return null;
    }

    /**
     * Executa uma chamada de função, método ou classe.
     * @param expressao A expressão chamada.
     * @returns O resultado da chamada.
     */
    visitarExpressaoDeChamada(expressao: any) {
        const variavelEntidadeChamada: VariavelInterface | any = this.avaliar(
            expressao.entidadeChamada
        );
        const entidadeChamada = variavelEntidadeChamada.hasOwnProperty('valor')
            ? variavelEntidadeChamada.valor
            : variavelEntidadeChamada;

        let argumentos = [];
        for (let i = 0; i < expressao.argumentos.length; i++) {
            argumentos.push(this.avaliar(expressao.argumentos[i]));
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
            for (let argumento of expressao.argumentos) {
                let valorResolvido: any = this.avaliar(argumento);
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
            let diferenca = entidadeChamada.aridade() - argumentos.length;
            for (let i = 0; i < diferenca; i++) {
                argumentos.push(null);
            }
        } else {
            if (
                parametros &&
                parametros.length > 0 &&
                parametros[parametros.length - 1].tipo === 'estrela'
            ) {
                let novosArgumentos = argumentos.slice(
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
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir): any {
        const valor = this.avaliar(expressao.valor);
        this.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valor);

        return valor;
    }

    procurarVariavel(simbolo: SimboloInterface): any {
        return this.pilhaEscoposExecucao.obterVariavel(simbolo);
    }

    visitarExpressaoDeVariavel(expressao: any): any {
        return this.procurarVariavel(expressao.simbolo);
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao): any {
        return this.avaliar(declaracao.expressao);
    }

    visitarExpressaoLogica(expressao: any): any {
        let esquerda = this.avaliar(expressao.esquerda);

        if (expressao.operador.tipo === tiposDeSimbolos.EM) {
            let direita = this.avaliar(expressao.direita);

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

        return this.avaliar(expressao.direita);
    }

    /**
     * Executa uma expressão Se, que tem uma condição, pode ter um bloco
     * Senão, e múltiplos blocos Senão-se.
     * @param declaracao A declaração Se.
     * @returns O resultado da avaliação do bloco cuja condição é verdadeira.
     */
    visitarExpressaoSe(declaracao: Se): any {
        if (this.eVerdadeiro(this.avaliar(declaracao.condicao))) {
            return this.executar(declaracao.caminhoEntao);
        }

        for (let i = 0; i < declaracao.caminhosSeSenao.length; i++) {
            const atual = declaracao.caminhosSeSenao[i];

            if (this.eVerdadeiro(this.avaliar(atual.condicao))) {
                return this.executar(atual.caminho);
            }
        }

        if (declaracao.caminhoSenao !== null) {
            return this.executar(declaracao.caminhoSenao);
        }

        return null;
    }

    visitarExpressaoPara(declaracao: Para): any {
        if (declaracao.inicializador !== null) {
            this.avaliar(declaracao.inicializador);
        }

        let retornoExecucao: any;
        while (!(retornoExecucao instanceof Quebra)) {
            if (
                declaracao.condicao !== null &&
                !this.eVerdadeiro(this.avaliar(declaracao.condicao))
            ) {
                break;
            }

            try {
                retornoExecucao = this.executar(declaracao.corpo);
            } catch (erro: any) {
                throw erro;
            }

            if (declaracao.incrementar !== null) {
                this.avaliar(declaracao.incrementar);
            }
        }
        return null;
    }

    visitarExpressaoFazer(declaracao: Fazer): any {
        let retornoExecucao: any;
        do {
            try {
                retornoExecucao = this.executar(declaracao.caminhoFazer);
            } catch (erro: any) {
                throw erro;
            }
        } while (
            !(retornoExecucao instanceof Quebra) &&
            this.eVerdadeiro(this.avaliar(declaracao.condicaoEnquanto))
        );
    }

    visitarExpressaoEscolha(declaracao: Escolha): any {
        let condicaoEscolha = this.avaliar(declaracao.condicao);
        let caminhos = declaracao.caminhos;
        let caminhoPadrao = declaracao.caminhoPadrao;

        let encontrado = false;
        try {
            for (let i = 0; i < caminhos.length; i++) {
                let caminho = caminhos[i];

                for (let j = 0; j < caminho.condicoes.length; j++) {
                    if (
                        this.avaliar(caminho.condicoes[j]) === condicaoEscolha
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

    visitarExpressaoEnquanto(declaracao: Enquanto): any {
        let retornoExecucao: any;
        while (
            !(retornoExecucao instanceof Quebra) &&
            this.eVerdadeiro(this.avaliar(declaracao.condicao))
        ) {
            try {
                retornoExecucao = this.executar(declaracao.corpo);
            } catch (erro) {
                throw erro;
            }
        }

        return null;
    }

    visitarExpressaoImportar(declaracao: Importar): any {
        const caminhoRelativo = this.avaliar(declaracao.caminho);
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

        let funcoesChamaveis =
            this.pilhaEscoposExecucao.obterTodasDeleguaFuncao();

        const eDicionario = (objeto: any) => objeto.constructor === Object;

        if (eDicionario(funcoesChamaveis)) {
            let novoModulo = new DeleguaModulo();

            let chaves = Object.keys(funcoesChamaveis);
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
    visitarExpressaoEscreva(declaracao: Escreva): any {
        try {
            let valor: string = '';
            for (const argumento of declaracao.argumentos) {
                const resultadoAvaliacao = this.avaliar(argumento) || '';
                const valorArgumento = resultadoAvaliacao.hasOwnProperty('valor')
                    ? resultadoAvaliacao.valor
                    : resultadoAvaliacao;
                
                valor += `${JSON.stringify(valorArgumento)} `;
            }
            valor = valor.trim();
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
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): any {
        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: ambiente || new EspacoVariaveis(),
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        const retornoUltimoEscopo: any = this.executarUltimoEscopo();
        if (retornoUltimoEscopo instanceof ErroEmTempoDeExecucao) {
            throw retornoUltimoEscopo;
        }
        return retornoUltimoEscopo;
    }

    visitarExpressaoBloco(declaracao: Bloco): any {
        return this.executarBloco(declaracao.declaracoes);
    }

    visitarExpressaoVar(declaracao: Var): any {
        let valor = null;
        if (declaracao.inicializador !== null) {
            valor = this.avaliar(declaracao.inicializador);
        }

        this.pilhaEscoposExecucao.definirVariavel(
            declaracao.simbolo.lexema,
            valor
        );
        return null;
    }

    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        return new ContinuarQuebra();
    }

    visitarExpressaoSustar(declaracao?: any): SustarQuebra {
        return new SustarQuebra();
    }

    visitarExpressaoRetornar(declaracao: Retorna): RetornoQuebra {
        let valor = null;
        if (declaracao.valor != null) valor = this.avaliar(declaracao.valor);

        return new RetornoQuebra(valor);
    }

    visitarExpressaoDeleguaFuncao(expressao: any) {
        return new DeleguaFuncao(null, expressao);
    }

    visitarExpressaoAtribuicaoSobrescrita(expressao: any) {
        let objeto = this.avaliar(expressao.objeto);
        let indice = this.avaliar(expressao.indice);
        let valor = this.avaliar(expressao.valor);

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

    visitarExpressaoAcessoIndiceVariavel(
        expressao: AcessoIndiceVariavel | any
    ) {
        const variavelObjeto: VariavelInterface = this.avaliar(
            expressao.entidadeChamada
        );
        const objeto = variavelObjeto.hasOwnProperty('valor')
            ? variavelObjeto.valor
            : variavelObjeto;

        let indice = this.avaliar(expressao.indice);
        if (Array.isArray(objeto)) {
            if (!Number.isInteger(indice)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Somente inteiros podem ser usados para indexar um vetor.',
                    expressao.linha
                );
            }

            if (indice < 0 && objeto.length !== 0) {
                while (indice < 0) {
                    indice += objeto.length;
                }
            }

            if (indice >= objeto.length) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice do vetor fora do intervalo.',
                    expressao.linha
                );
            }
            return objeto[indice];
        } else if (
            objeto.constructor === Object ||
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DeleguaClasse ||
            objeto instanceof DeleguaModulo
        ) {
            return objeto[indice] || null;
        } else if (typeof objeto === 'string') {
            if (!Number.isInteger(indice)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Somente inteiros podem ser usados para indexar um vetor.',
                    expressao.linha
                );
            }

            if (indice < 0 && objeto.length !== 0) {
                while (indice < 0) {
                    indice += objeto.length;
                }
            }

            if (indice >= objeto.length) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice fora do tamanho.',
                    expressao.linha
                );
            }
            return objeto.charAt(indice);
        } else {
            throw new ErroEmTempoDeExecucao(
                expressao.entidadeChamada.nome,
                'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
                expressao.linha
            );
        }
    }

    visitarExpressaoDefinir(expressao: any) {
        const objeto = this.avaliar(expressao.objeto);

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

        const valor = this.avaliar(expressao.valor);
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
    visitarExpressaoClasse(declaracao: Classe): any {
        let superClasse = null;
        if (declaracao.superClasse !== null) {
            const variavelSuperClasse: VariavelInterface = this.avaliar(
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

        let metodos = {};
        let definirMetodos = declaracao.metodos;
        for (let i = 0; i < declaracao.metodos.length; i++) {
            let metodoAtual = definirMetodos[i];
            let eInicializador = metodoAtual.simbolo.lexema === 'construtor';
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
    visitarExpressaoAcessoMetodo(expressao: any) {
        const variavelObjeto: VariavelInterface = this.avaliar(
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

    visitarExpressaoDicionario(expressao: any) {
        let dicionario = {};
        for (let i = 0; i < expressao.chaves.length; i++) {
            dicionario[this.avaliar(expressao.chaves[i])] = this.avaliar(
                expressao.valores[i]
            );
        }
        return dicionario;
    }

    visitarExpressaoVetor(expressao: any) {
        let valores = [];
        for (let i = 0; i < expressao.valores.length; i++) {
            valores.push(this.avaliar(expressao.valores[i]));
        }
        return valores;
    }

    // TODO: Após remoção do Resolvedor, simular casos que usem 'super' e 'isto'.
    visitarExpressaoSuper(expressao: Super): any {
        const superClasse: VariavelInterface =
            this.pilhaEscoposExecucao.obterVariavelPorNome('super');
        const objeto: VariavelInterface =
            this.pilhaEscoposExecucao.obterVariavelPorNome('isto');

        let metodo = superClasse.valor.encontrarMetodo(expressao.metodo.lexema);

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
        if (objeto === null) return 'nulo';
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
        if (objeto === undefined) {
            return 'nulo';
        }

        return objeto.toString();
    }

    /**
     * Efetivamente executa uma declaração.
     * @param declaracao A declaração a ser executada.
     * @param mostrarResultado Se resultado deve ser mostrado ou não. Normalmente usado
     *                         pelo modo LAIR.
     */
    executar(declaracao: Declaracao, mostrarResultado: boolean = false): any {
        const resultado: any = declaracao.aceitar(this);
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
    executarUltimoEscopo(manterAmbiente: boolean = false): any {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        try {
            let retornoExecucao: any;
            for (
                ;
                !(retornoExecucao instanceof Quebra) &&
                ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                retornoExecucao = this.executar(
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
    interpretar(
        declaracoes: Declaracao[],
        manterAmbiente: boolean = false
    ): RetornoInterpretador {
        this.erros = [];

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        const inicioInterpretacao: [number, number] = hrtime();
        try {
            this.executarUltimoEscopo(manterAmbiente);
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
}
