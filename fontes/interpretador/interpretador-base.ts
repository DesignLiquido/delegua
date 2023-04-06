import hrtime from 'browser-process-hrtime';

import { EspacoVariaveis } from '../espaco-variaveis';
import carregarBibliotecasGlobais from '../bibliotecas/biblioteca-global';

import { ErroEmTempoDeExecucao } from '../excecoes';
import { InterpretadorInterface, ParametroInterface, SimboloInterface, VariavelInterface } from '../interfaces';
import {
    Bloco,
    Classe,
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
    Agrupamento,
    Atribuir,
    Chamada,
    Construto,
    FormatacaoEscrita,
    Literal,
    Logico,
    Super,
    Unario,
    Variavel,
} from '../construtos';
import { ErroInterpretador } from './erro-interpretador';
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
    performance: boolean;
    funcaoDeRetorno: Function = null;
    funcaoDeRetornoMesmaLinha: Function = null;
    interfaceDeEntrada: any = null; // Originalmente é `readline.Interface`
    resultadoInterpretador: Array<string> = [];
    declaracoes: Declaracao[];
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any = null;

    regexInterpolacao = /\$\{([a-z_][\w]*)\}/gi;

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

        this.pilhaEscoposExecucao = new PilhaEscoposExecucao();
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        carregarBibliotecasGlobais(this, this.pilhaEscoposExecucao);
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
     * Retira a interpolação de um texto.
     * @param {texto} texto O texto
     * @param {any[]} variaveis A lista de variaveis interpoladas
     * @returns O texto com o valor das variaveis.
     */
    private retirarInterpolacao(texto: string, variaveis: any[]): string {
        const valoresVariaveis = variaveis.map((v) => ({
            valorResolvido: this.pilhaEscoposExecucao.obterVariavelPorNome(v.variavel),
            variavel: v.variavel,
        }));

        let textoFinal = texto;

        valoresVariaveis.forEach((elemento) => {
            const valorFinal = elemento.valorResolvido.hasOwnProperty('valor')
                ? elemento.valorResolvido.valor
                : elemento.valorResolvido;

            textoFinal = textoFinal.replace('${' + elemento.variavel + '}', valorFinal);
        });

        return textoFinal;
    }

    /**
     * Busca variáveis interpoladas.
     * @param {texto} textoOriginal O texto original com as variáveis interpoladas.
     * @returns Uma lista de variáveis interpoladas.
     */
    private buscarVariaveisInterpolacao(textoOriginal: string): any[] {
        const variaveis = textoOriginal.match(this.regexInterpolacao);

        return variaveis.map((s) => {
            const nomeVariavel: string = s.replace(/[\$\{\}]*/g, '');
            return {
                variavel: nomeVariavel,
                valor: this.pilhaEscoposExecucao.obterVariavelPorNome(nomeVariavel),
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

    async visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> {
        return await this.avaliar(expressao.expressao);
    }

    protected eVerdadeiro(objeto: any): boolean {
        if (objeto === null) return false;
        if (typeof objeto === 'boolean') return Boolean(objeto);
        if (objeto.hasOwnProperty('valor')) {
            return Boolean(objeto.valor);
        }

        return true;
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

    async visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<string> {
        let resultado = '';
        const conteudo: VariavelInterface | any = await this.avaliar(declaracao.expressao);

        const valorConteudo: any = conteudo?.hasOwnProperty('valor') ? conteudo.valor : conteudo;

        const tipoConteudo: string = conteudo.hasOwnProperty('tipo') ? conteudo.tipo : typeof conteudo;

        resultado = valorConteudo;
        if (['número', 'number'].includes(tipoConteudo) && declaracao.casasDecimais > 0) {
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
        const tipoDireita: string = direita.tipo ? direita.tipo : typeof direita === 'number' ? 'número' : String(NaN);
        const tipoEsquerda: string = esquerda.tipo
            ? esquerda.tipo
            : typeof esquerda === 'number'
            ? 'número'
            : String(NaN);
        if (tipoDireita === 'número' && tipoEsquerda === 'número') return;
        throw new ErroEmTempoDeExecucao(operador, 'Operadores precisam ser números.', operador.linha);
    }

    async visitarExpressaoBinaria(expressao: any): Promise<any> {
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

            let argumentos = [];
            for (let i = 0; i < expressao.argumentos.length; i++) {
                argumentos.push(await this.avaliar(expressao.argumentos[i]));
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
                        valorResolvido.hasOwnProperty('valor') ? valorResolvido.valor : valorResolvido
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

            const aridade = entidadeChamada.aridade ? entidadeChamada.aridade() : entidadeChamada.length;

            // Completar os parâmetros não preenchidos com nulos.
            if (argumentos.length < aridade) {
                const diferenca = aridade - argumentos.length;
                for (let i = 0; i < diferenca; i++) {
                    argumentos.push(null);
                }
            } else {
                if (parametros && parametros.length > 0 && parametros[parametros.length - 1].abrangencia === 'multiplo') {
                    const novosArgumentos = argumentos.slice(0, parametros.length - 1);
                    novosArgumentos.push(argumentos.slice(parametros.length - 1, argumentos.length));
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
        }
    }

    /**
     * Execução de uma expressão de atribuição.
     * @param expressao A expressão.
     * @returns O valor atribuído.
     */
    async visitarDeclaracaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        const valor = await this.avaliar(expressao.valor);
        const valorResolvido = valor.hasOwnProperty('valor') ? valor.valor : valor;
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

    async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        if (declaracao.inicializador !== null) {
            await this.avaliar(declaracao.inicializador);
        }

        let retornoExecucao: any;
        while (!(retornoExecucao instanceof Quebra)) {
            if (declaracao.condicao !== null && !this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                break;
            }

            try {
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                return Promise.reject(erro);
            }

            if (declaracao.incrementar !== null) {
                await this.avaliar(declaracao.incrementar);
            }
        }
        return null;
    }

    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        let retornoExecucao: any;
        while (!(retornoExecucao instanceof Quebra) && this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            try {
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                return Promise.reject(erro);
            }
        }

        return null;
    }

    async visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> {
        const condicaoEscolha = await this.avaliar(declaracao.identificadorOuLiteral);
        const valorCondicaoEscolha = condicaoEscolha.hasOwnProperty('valor') ? 
            condicaoEscolha.valor :
            condicaoEscolha;

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
                            return Promise.reject(erro);
                        }
                    }
                }
            }

            if (caminhoPadrao !== null && !encontrado) {
                await this.executarBloco(caminhoPadrao.declaracoes);
            }
        } catch (erro: any) {
            throw erro;
        }
    }

    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        let retornoExecucao: any;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
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
            let sucesso = true;
            try {
                valorRetorno = await this.executarBloco(declaracao.caminhoTente);
            } catch (erro: any) {
                sucesso = false;

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
        }

        return valorRetorno;
    }

    async visitarDeclaracaoImportar(declaracao: Importar): Promise<DeleguaModulo> {
        return Promise.reject("Importação de arquivos não suportada por Interpretador Base.");
    }

    protected async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;

            formatoTexto += `${this.paraTexto(valor)} `;
        }

        return formatoTexto;
    }

    /**
     * Execução de uma escrita na saída padrão, sem quebras de linha.
     * Implementada para alguns dialetos, como VisuAlg.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
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
            emLacoRepeticao: false
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

    protected async avaliacaoDeclaracaoVar(declaracao: Var): Promise<any> {
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
        const valorFinal = await this.avaliacaoDeclaracaoVar(declaracao);

        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, valorFinal);

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

    async visitarExpressaoAtribuicaoSobrescrita(expressao: any): Promise<any> {
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
        const promises = await Promise.all([
            this.avaliar(expressao.entidadeChamada),
            this.avaliar(expressao.indice)
        ]);

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
        } else if (typeof objeto === 'string') {
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
        if (declaracao.superClasse !== null) {
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

        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, null);

        if (declaracao.superClasse !== null) {
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

        const deleguaClasse: DeleguaClasse = new DeleguaClasse(declaracao.simbolo.lexema, superClasse, metodos);

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
        if (typeof objeto[expressao.simbolo.lexema] === 'function') {
            return objeto[expressao.simbolo.lexema];
        }

        // Objeto tradicional do JavaScript.
        // Normalmente executa quando uma biblioteca é importada.
        if (typeof objeto[expressao.simbolo.lexema] === 'object') {
            return objeto[expressao.simbolo.lexema];
        }

        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.simbolo.lexema] || null;
        }

        switch (variavelObjeto.tipo) {
            case 'texto':
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
                'Você só pode acessar métodos do objeto e dicionários.',
                expressao.linha
            )
        );
    }

    visitarExpressaoIsto(expressao: any): any {
        return this.procurarVariavel(expressao.palavraChave);
    }

    async visitarExpressaoDicionario(expressao: any): Promise<any> {
        const dicionario = {};
        for (let i = 0; i < expressao.chaves.length; i++) {
            const promises = await Promise.all([this.avaliar(expressao.chaves[i]), this.avaliar(expressao.valores[i])]);

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
        const superClasse: VariavelInterface = this.pilhaEscoposExecucao.obterVariavelPorNome('super');
        const objeto: VariavelInterface = this.pilhaEscoposExecucao.obterVariavelPorNome('isto');

        const metodo = superClasse.valor.encontrarMetodo(expressao.metodo.lexema);

        if (metodo === undefined) {
            throw new ErroEmTempoDeExecucao(expressao.metodo, 'Método chamado indefinido.', expressao.linha);
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
                !(retornoExecucao instanceof Quebra) && ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                retornoExecucao = await this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
            }

            return retornoExecucao;
        } catch (erro: any) {
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

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        const inicioInterpretacao: [number, number] = hrtime();
        try {
            const retornoOuErro = await this.executarUltimoEscopo(manterAmbiente);
            if (retornoOuErro instanceof ErroEmTempoDeExecucao) {
                this.erros.push(retornoOuErro);
            }
        } catch (erro: any) {
            this.erros.push(erro);
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
