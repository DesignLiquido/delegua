import * as caminho from 'path';
import * as fs from 'fs';

import tiposDeSimbolos from '../../tipos-de-simbolos/delegua';
import { EspacoVariaveis } from '../../espaco-variaveis';
import { Delegua } from '../../delegua';
import carregarBibliotecaGlobal from '../../bibliotecas/biblioteca-global';
import carregarModulo from '../../bibliotecas/importar-biblioteca';

import { Chamavel } from '../../estruturas/chamavel';
import { FuncaoPadrao } from '../../estruturas/funcao-padrao';
import { DeleguaClasse } from '../../estruturas/delegua-classe';
import { DeleguaFuncao } from '../../estruturas/funcao';
import { ObjetoDeleguaClasse } from '../../estruturas/objeto-delegua-classe';
import { DeleguaModulo } from '../../estruturas/modulo';

import { ErroEmTempoDeExecucao } from '../../excecoes';
import {
    InterpretadorInterface,
    SimboloInterface,
    ResolvedorInterface,
    VariavelInterface,
} from '../../interfaces';
import {
    Classe,
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
    Se,
    Tente,
    Var,
} from '../../declaracoes';
import {
    AcessoIndiceVariavel,
    Atribuir,
    Construto,
    Literal,
    Super,
    Variavel,
} from '../../construtos';
import { RetornoInterpretador } from '../../interfaces/retornos/retorno-interpretador';
import { ErroInterpretador } from '../erro-interpretador';
import { PilhaEscoposExecucao } from '../pilha-escopos-execucao';
import { EscopoExecucao } from '../../interfaces/escopo-execucao';
import {
    ContinuarQuebra,
    Quebra,
    RetornoQuebra,
    SustarQuebra,
} from '../../quebras';
import { inferirTipoVariavel } from '../inferenciador';

/**
 * O Interpretador visita todos os elementos complexos gerados pelo analisador sintático (Parser)
 * e de fato executa a lógica de programação descrita no código.
 */
export class InterpretadorEguaClassico implements InterpretadorInterface {
    Delegua: Delegua;
    resolvedor: ResolvedorInterface;

    diretorioBase: any;
    funcaoDeRetorno: Function;
    locais: Map<Construto, number>;
    erros: ErroInterpretador[];
    pilhaEscoposExecucao: PilhaEscoposExecucao;

    constructor(
        Delegua: Delegua,
        resolvedor: ResolvedorInterface,
        diretorioBase: string
    ) {
        this.Delegua = Delegua;
        this.resolvedor = resolvedor;
        this.diretorioBase = diretorioBase;
        this.funcaoDeRetorno = console.log;

        this.locais = new Map();
        this.erros = [];
        this.pilhaEscoposExecucao = new PilhaEscoposExecucao();
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        carregarBibliotecaGlobal(this, this.pilhaEscoposExecucao);
    }

    visitarExpressaoLeia(expressao: Leia): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoLiteral(expressao: Literal) {
        return expressao.valor;
    }

    avaliar(expressao: Construto): VariavelInterface | any {
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

    verificarOperandoNumero(operador: any, operand: any): void {
        if (typeof operand === 'number') return;
        throw new ErroEmTempoDeExecucao(
            operador,
            'Operador precisa ser um número.',
            operador.linha
        );
    }

    async visitarExpressaoUnaria(expr: any) {
        const direita = await this.avaliar(expr.direita);

        switch (expr.operador.tipo) {
            case tiposDeSimbolos.SUBTRACAO:
                this.verificarOperandoNumero(expr.operador, direita);
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
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) - Number(valorDireito);

            case tiposDeSimbolos.ADICAO:
                if (tipoEsquerdo === 'número' && tipoDireito === 'número') {
                    return Number(esquerda) + Number(direita);
                } else if (
                    tipoEsquerdo === 'texto' &&
                    tipoDireito === 'texto'
                ) {
                    return String(esquerda) + String(direita);
                }

                throw new ErroEmTempoDeExecucao(
                    expressao.operador,
                    'Operadores precisam ser dois números ou duas strings.'
                );

            case tiposDeSimbolos.DIVISAO:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) / Number(valorDireito);

            case tiposDeSimbolos.MULTIPLICACAO:
                this.verificarOperandosNumeros(
                    expressao.operador,
                    esquerda,
                    direita
                );
                return Number(valorEsquerdo) * Number(valorDireito);

            case tiposDeSimbolos.MODULO:
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

    async visitarExpressaoDeChamada(expressao: any) {
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

        let parametros;
        if (entidadeChamada instanceof DeleguaFuncao) {
            parametros = entidadeChamada.declaracao.parametros;
        } else if (entidadeChamada instanceof DeleguaClasse) {
            parametros = entidadeChamada.metodos.inicializacao
                ? entidadeChamada.metodos.inicializacao.declaracao.parametros
                : [];
        } else {
            parametros = [];
        }

        // Isso aqui completa os parâmetros não preenchidos com nulos.
        if (argumentos.length < entidadeChamada.aridade()) {
            const diferenca = entidadeChamada.aridade() - argumentos.length;
            for (let i = 0; i < diferenca; i++) {
                argumentos.push(null);
            }
        } else {
            if (
                parametros &&
                parametros.length > 0 &&
                parametros[parametros.length - 1]['tipo'] === 'estrela'
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
            return entidadeChamada.chamar(
                argumentos,
                expressao.entidadeChamada.nome
            );
        }

        return entidadeChamada.chamar(this, argumentos);
    }

    async visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        const valor = await this.avaliar(expressao.valor);
        this.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valor);

        return valor;
    }

    procurarVariavel(
        simbolo: SimboloInterface,
        expressao: any
    ): VariavelInterface {
        return this.pilhaEscoposExecucao.obterVariavel(simbolo);
    }

    visitarExpressaoDeVariavel(expressao: Variavel): VariavelInterface {
        return this.procurarVariavel(expressao.simbolo, expressao);
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return await this.avaliar(declaracao.expressao);
    }

    async visitarExpressaoLogica(expressao: any) {
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

    async visitarExpressaoPara(declaracao: Para) {
        if (declaracao.inicializador !== null) {
            await this.avaliar(declaracao.inicializador);
        }
        while (true) {
            if (declaracao.condicao !== null) {
                if (!this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                    break;
                }
            }

            try {
                await this.executar(declaracao.corpo);
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
        do {
            try {
                await this.executar(declaracao.caminhoFazer);
            } catch (erro) {
                throw erro;
            }
        } while (this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto)));
    }

    async visitarExpressaoEscolha(declaracao: Escolha) {
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
                            for (
                                let k = 0;
                                k < caminho.declaracoes.length;
                                k++
                            ) {
                                await this.executar(caminho.declaracoes[k]);
                            }
                        } catch (erro: any) {
                            throw erro;
                        }
                    }
                }
            }

            if (caminhoPadrao !== null && encontrado === false) {
                for (let i = 0; i < caminhoPadrao.declaracoes.length; i++) {
                    await this.executar(caminhoPadrao['declaracoes'][i]);
                }
            }
        } catch (erro: any) {
            throw erro;
        }
    }

    async visitarExpressaoTente(declaracao: Tente): Promise<any> {
        try {
            let sucesso = true;
            try {
                await this.executarBloco(declaracao.caminhoTente);
            } catch (erro: any) {
                sucesso = false;

                if (declaracao.caminhoPegue !== null) {
                    await this.executarBloco(declaracao.caminhoPegue);
                } else {
                    this.erros.push(erro);
                }
            }

            if (sucesso && declaracao.caminhoSenao !== null) {
                await this.executarBloco(declaracao.caminhoSenao);
            }
        } finally {
            if (declaracao.caminhoFinalmente !== null)
                await this.executarBloco(declaracao.caminhoFinalmente);
        }
    }

    async visitarExpressaoEnquanto(declaracao: Enquanto) {
        while (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            try {
                await this.executar(declaracao.corpo);
            } catch (erro) {
                throw erro;
            }
        }

        return null;
    }

    async visitarExpressaoImportar(declaracao: Importar) {
        const caminhoRelativo = await this.avaliar(declaracao.caminho);
        const caminhoTotal = caminho.join(this.diretorioBase, caminhoRelativo);
        // const nomeArquivo = caminho.basename(caminhoTotal);

        let dados: any = carregarModulo(caminhoRelativo);
        if (dados) return dados;

        try {
            if (!fs.existsSync(caminhoTotal)) {
                throw new ErroEmTempoDeExecucao(
                    declaracao.simboloFechamento,
                    'Não foi possível encontrar arquivo importado.',
                    declaracao.linha
                );
            }
        } catch (erro) {
            throw new ErroEmTempoDeExecucao(
                declaracao.simboloFechamento,
                'Não foi possível ler o arquivo.',
                declaracao.linha
            );
        }

        dados = fs.readFileSync(caminhoTotal).toString();

        const delegua = new Delegua(this.Delegua.dialeto, false);

        delegua.executar(dados);

        const exportar = this.pilhaEscoposExecucao.obterTodasDeleguaFuncao();

        const eDicionario = (objeto: any) => objeto.constructor === Object;

        if (eDicionario(exportar)) {
            const novoModulo = new DeleguaModulo();

            const chaves = Object.keys(exportar);
            for (let i = 0; i < chaves.length; i++) {
                novoModulo[chaves[i]] = exportar[chaves[i]];
            }

            return novoModulo;
        }

        return exportar;
    }

    async visitarExpressaoEscreva(declaracao: Escreva) {
        try {
            const valor = await this.avaliar(declaracao.argumentos[0]);
            console.log(this.paraTexto(valor));
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }

    /**
     * Empilha declarações na pilha de escopos de execução, cria um novo ambiente e
     * executa as declarações empilhadas.
     *
     * Se o retorno do último bloco foi uma exceção (normalmente um erro em tempo de execução),
     * atira a exceção daqui.
     * Isso é usado, por exemplo, em blocos `tente ... pegue ... finalmente`.
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

    async visitarExpressaoBloco(declaracao: any): Promise<any> {
        return await this.executarBloco(declaracao.declaracoes);
    }

    /**
     * Executa expressão de definição de variável.
     * @param declaracao A declaração Var
     * @returns Sempre retorna nulo.
     */
     async visitarExpressaoVar(declaracao: Var) {
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

    visitarExpressaoContinua(declaracao?: any): ContinuarQuebra {
        return new ContinuarQuebra();
    }

    visitarExpressaoSustar(declaracao?: any): SustarQuebra {
        return new SustarQuebra();
    }

    async visitarExpressaoRetornar(declaracao: any): Promise<RetornoQuebra> {
        let valor = null;
        if (declaracao.valor != null) valor = await this.avaliar(declaracao.valor);

        return new RetornoQuebra(valor);
    }

    visitarExpressaoDeleguaFuncao(expressao: any) {
        return new DeleguaFuncao(null, expressao);
    }

    async visitarExpressaoAtribuicaoSobrescrita(expressao: any) {
        const objeto = await this.avaliar(expressao.objeto);
        let indice = await this.avaliar(expressao.indice);
        const valor = await this.avaliar(expressao.valor);

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

    async visitarExpressaoAcessoIndiceVariavel(
        expressao: AcessoIndiceVariavel | any
    ) {
        const variavelObjeto: VariavelInterface = await this.avaliar(
            expressao.entidadeChamada
        );
        const objeto = variavelObjeto.hasOwnProperty('valor')
            ? variavelObjeto.valor
            : variavelObjeto;

        let indice = await this.avaliar(expressao.indice);
        const valorIndice = indice.hasOwnProperty('valor') ? indice.valor : indice;
        if (Array.isArray(objeto)) {
            if (!Number.isInteger(valorIndice)) {
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

    async visitarExpressaoDefinir(expressao: any) {
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

    async visitarExpressaoClasse(declaracao: Classe) {
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

        const deleguaClasse = new DeleguaClasse(
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

    async visitarExpressaoAcessoMetodo(expressao: any) {
        const variavelObjeto: VariavelInterface = await this.avaliar(
            expressao.objeto
        );
        const objeto = variavelObjeto?.valor;
        if (objeto instanceof ObjetoDeleguaClasse) {
            return objeto.get(expressao.simbolo) || null;
        } else if (objeto.constructor === Object) {
            return objeto[expressao.simbolo.lexema] || null;
        } else if (objeto instanceof DeleguaModulo) {
            return objeto[expressao.simbolo.lexema] || null;
        }

        throw new ErroEmTempoDeExecucao(
            expressao.nome,
            'Você só pode acessar métodos do objeto e dicionários.',
            expressao.linha
        );
    }

    visitarExpressaoIsto(expressao: any) {
        return this.procurarVariavel(expressao.palavraChave, expressao);
    }

    async visitarExpressaoDicionario(expressao: any) {
        const dicionario = {};
        for (let i = 0; i < expressao.chaves.length; i++) {
            dicionario[await this.avaliar(expressao.chaves[i])] = await this.avaliar(
                expressao.valores[i]
            );
        }
        return dicionario;
    }

    async visitarExpressaoVetor(expressao: any) {
        const valores = [];
        for (let i = 0; i < expressao.valores.length; i++) {
            valores.push(await this.avaliar(expressao.valores[i]));
        }
        return valores;
    }

    visitarExpressaoSuper(expressao: Super) {
        const distancia = this.locais.get(expressao);
        const superClasse = this.pilhaEscoposExecucao.obterVariavelEm(
            distancia,
            'super'
        );

        const objeto: VariavelInterface =
            this.pilhaEscoposExecucao.obterVariavelEm(distancia - 1, 'isto');

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

    paraTexto(objeto: any): any {
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

        if (typeof objeto === 'object') return JSON.stringify(objeto);
        if (objeto === undefined) {
            return 'nulo';
        }

        return objeto.toString();
    }

    async executar(declaracao: Declaracao, mostrarResultado = false): Promise<any> {
        return await declaracao.aceitar(this);
    }

    /**
     * Executa o último escopo empilhado no topo na pilha de escopos do Interpretador.
     * Originalmente, Égua não trabalha com uma pilha de escopos.
     *
     * O tratamento das exceções é feito de acordo com o bloco chamador.
     * Por exemplo, em `tente ... pegue ... finalmente`, a exceção é capturada e tratada.
     * Em outros blocos, pode ser desejável ter o erro em tela.
     *
     * Essa implementação é derivada do Interpretador de Delégua, mas simulando todos os
     * comportamos do interpretador Égua original.
     * Interpretador Égua: https://github.com/eguatech/egua/blob/master/src/interpreter.js
     * @returns O resultado da execução do escopo, se houver.
     */
    async executarUltimoEscopo(): Promise<any> {
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
        }
    }

    async interpretar(declaracoes: Declaracao[]): Promise<RetornoInterpretador> {
        this.erros = [];

        const retornoResolvedor = this.resolvedor.resolver(declaracoes);
        this.locais = retornoResolvedor.locais;

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        await this.executarUltimoEscopo();

        return {
            erros: this.erros,
        } as RetornoInterpretador;
    }

    finalizacao(): void {
        this.funcaoDeRetorno();
    }
}
