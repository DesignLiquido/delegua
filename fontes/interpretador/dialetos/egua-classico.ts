import * as caminho from 'path';
import * as fs from 'fs';

import tiposDeSimbolos from '../../tipos-de-simbolos';
import { Ambiente } from '../../ambiente';
import { Delegua } from '../../delegua';
import carregarBibliotecaGlobal from '../../bibliotecas/biblioteca-global';
import carregarModulo from '../../bibliotecas/importar-biblioteca';

import { Chamavel } from '../../estruturas/chamavel';
import { FuncaoPadrao } from '../../estruturas/funcao-padrao';
import { DeleguaClasse } from '../../estruturas/classe';
import { DeleguaFuncao } from '../../estruturas/funcao';
import { DeleguaInstancia } from '../../estruturas/instancia';
import { DeleguaModulo } from '../../estruturas/modulo';

import {
    ExcecaoRetornar,
    ExcecaoSustar,
    ExcecaoContinuar,
    ErroEmTempoDeExecucao,
} from '../../excecoes';
import { InterpretadorInterface, SimboloInterface } from '../../interfaces';
import { Classe, Enquanto, Escolha, Escreva, Fazer, Funcao, Importar, Para, Se, Tente } from '../../declaracoes';
import { Construto, Super } from '../../construtos';
import { RetornoInterpretador } from '../retorno-interpretador';
import { ErroInterpretador } from '../erro-interpretador';

/**
 * O Interpretador visita todos os elementos complexos gerados pelo analisador sintático (Parser)
 * e de fato executa a lógica de programação descrita no código.
 */
export class InterpretadorEguaClassico implements InterpretadorInterface {
    Delegua: Delegua;
    diretorioBase: any;
    global: Ambiente;
    ambiente: Ambiente;
    locais: Map<Construto, number>;
    erros: ErroInterpretador[];

    constructor(Delegua: Delegua, diretorioBase: string) {
        this.Delegua = Delegua;
        this.diretorioBase = diretorioBase;

        this.global = new Ambiente();
        this.ambiente = this.global;
        this.locais = new Map();
        this.erros = [];

        this.global = carregarBibliotecaGlobal(this, this.global);
    }

    visitarExpressaoLiteral(expressao: any) {
        return expressao.valor;
    }

    avaliar(expressao: any) {
        if (expressao.aceitar) {
            return expressao.aceitar(this);
        }
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

    visitarExpressaoUnaria(expr: any) {
        const direita = this.avaliar(expr.direita);

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

    eIgual(esquerda: any, direita: any): boolean {
        if (esquerda === null && direita === null) return true;
        if (esquerda === null) return false;

        return esquerda === direita;
    }

    verificarOperandosNumeros(operador: any, direita: any, esquerda: any): void {
        if (typeof direita === 'number' && typeof esquerda === 'number') return;
        throw new ErroEmTempoDeExecucao(
            operador,
            'Operadores precisam ser números.',
            operador.linha
        );
    }

    visitarExpressaoBinaria(expr: any) {
        let esquerda = this.avaliar(expr.esquerda);
        let direita = this.avaliar(expr.direita);

        switch (expr.operador.tipo) {
            case tiposDeSimbolos.EXPONENCIACAO:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Math.pow(esquerda, direita);

            case tiposDeSimbolos.MAIOR:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) > Number(direita);

            case tiposDeSimbolos.MAIOR_IGUAL:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) >= Number(direita);

            case tiposDeSimbolos.MENOR:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) < Number(direita);

            case tiposDeSimbolos.MENOR_IGUAL:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) <= Number(direita);

            case tiposDeSimbolos.SUBTRACAO:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) - Number(direita);

            case tiposDeSimbolos.ADICAO:
                if (
                    typeof esquerda === 'number' &&
                    typeof direita === 'number'
                ) {
                    return Number(esquerda) + Number(direita);
                } else if (
                    typeof esquerda === 'string' &&
                    typeof direita === 'string'
                ) {
                    return String(esquerda) + String(direita);
                }

                throw new ErroEmTempoDeExecucao(
                    expr.operador,
                    'Operadores precisam ser dois números ou duas strings.'
                );

            case tiposDeSimbolos.DIVISAO:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) / Number(direita);

            case tiposDeSimbolos.MULTIPLICACAO:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) * Number(direita);

            case tiposDeSimbolos.MODULO:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) % Number(direita);

            case tiposDeSimbolos.BIT_AND:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) & Number(direita);

            case tiposDeSimbolos.BIT_XOR:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) ^ Number(direita);

            case tiposDeSimbolos.BIT_OR:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) | Number(direita);

            case tiposDeSimbolos.MENOR_MENOR:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) << Number(direita);

            case tiposDeSimbolos.MAIOR_MAIOR:
                this.verificarOperandosNumeros(
                    expr.operador,
                    esquerda,
                    direita
                );
                return Number(esquerda) >> Number(direita);

            case tiposDeSimbolos.DIFERENTE:
                return !this.eIgual(esquerda, direita);

            case tiposDeSimbolos.IGUAL_IGUAL:
                return this.eIgual(esquerda, direita);
        }

        return null;
    }

    visitarExpressaoDeChamada(expressao: any) {
        let entidadeChamada = this.avaliar(expressao.entidadeChamada);

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

        let parametros;
        if (entidadeChamada instanceof DeleguaFuncao) {
            parametros = entidadeChamada.declaracao.parametros;
        } else if (entidadeChamada instanceof DeleguaClasse) {
            parametros = entidadeChamada.metodos.init
                ? entidadeChamada.metodos.init.declaracao.parametros
                : [];
        } else {
            parametros = [];
        }

        // Isso aqui completa os parâmetros não preenchidos com nulos.
        if (argumentos.length < entidadeChamada.aridade()) {
            let diferenca = entidadeChamada.aridade() - argumentos.length;
            for (let i = 0; i < diferenca; i++) {
                argumentos.push(null);
            }
        } else {
            if (
                parametros &&
                parametros.length > 0 &&
                parametros[parametros.length - 1]['tipo'] === 'wildcard'
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
            return entidadeChamada.chamar(
                this,
                argumentos,
                expressao.entidadeChamada.nome
            );
        }

        return entidadeChamada.chamar(this, argumentos);
    }

    visitarExpressaoDeAtribuicao(expressao: any) {
        const valor = this.avaliar(expressao.valor);

        const distancia = this.locais.get(expressao);
        if (distancia !== undefined) {
            this.ambiente.atribuirVariavelEm(distancia, expressao.simbolo, valor);
        } else {
            this.ambiente.atribuirVariavel(expressao.simbolo, valor);
        }

        return valor;
    }

    procurarVariavel(simbolo: SimboloInterface, expr: any) {
        const distancia = this.locais.get(expr);
        if (distancia !== undefined) {
            return this.ambiente.obterVariavelEm(distancia, simbolo.lexema);
        } else {
            return this.global.obterVariavel(simbolo);
        }
    }

    visitarExpressaoDeVariavel(expressao: any) {
        return this.procurarVariavel(expressao.simbolo, expressao);
    }

    visitarDeclaracaoDeExpressao(declaracao: any) {
        return this.avaliar(declaracao.expressao);
    }

    visitarExpressaoLogica(expressao: any) {
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

    visitarExpressaoSe(declaracao: Se) {
        if (this.eVerdadeiro(this.avaliar(declaracao.condicao))) {
            this.executar(declaracao.caminhoEntao);
            return null;
        }

        for (let i = 0; i < declaracao.caminhosSeSenao.length; i++) {
            const atual = declaracao.caminhosSeSenao[i];

            if (this.eVerdadeiro(this.avaliar(atual.condicao))) {
                this.executar(atual.caminho);
                return null;
            }
        }

        if (declaracao.caminhoSenao !== null) {
            this.executar(declaracao.caminhoSenao);
        }

        return null;
    }

    visitarExpressaoPara(declaracao: Para) {
        if (declaracao.inicializador !== null) {
            this.avaliar(declaracao.inicializador);
        }
        while (true) {
            if (declaracao.condicao !== null) {
                if (!this.eVerdadeiro(this.avaliar(declaracao.condicao))) {
                    break;
                }
            }

            try {
                this.executar(declaracao.corpo);
            } catch (erro: any) {
                if (erro instanceof ExcecaoSustar) {
                    break;
                } else if (erro instanceof ExcecaoContinuar) {
                } else {
                    throw erro;
                }
            }

            if (declaracao.incrementar !== null) {
                this.avaliar(declaracao.incrementar);
            }
        }
        return null;
    }

    visitarExpressaoFazer(declaracao: Fazer) {
        do {
            try {
                this.executar(declaracao.caminhoFazer);
            } catch (erro) {
                if (erro instanceof ExcecaoSustar) {
                    break;
                } else if (erro instanceof ExcecaoContinuar) {
                } else {
                    throw erro;
                }
            }
        } while (this.eVerdadeiro(this.avaliar(declaracao.condicaoEnquanto)));
    }

    visitarExpressaoEscolha(declaracao: Escolha) {
        let condicaoEscolha = this.avaliar(declaracao.condicao);
        let caminhos = declaracao.caminhos;
        let caminhoPadrao = declaracao.caminhoPadrao;

        let encontrado = false;
        try {
            for (let i = 0; i < caminhos.length; i++) {
                let caminho = caminhos[i];

                for (let j = 0; j < caminho.conditions.length; j++) {
                    if (
                        this.avaliar(caminho.conditions[j]) === condicaoEscolha
                    ) {
                        encontrado = true;

                        try {
                            for (let k = 0; k < caminho.declaracoes.length; k++) {
                                this.executar(caminho.declaracoes[k]);
                            }
                        } catch (erro: any) {
                            if (erro instanceof ExcecaoContinuar) {
                            } else {
                                throw erro;
                            }
                        }
                    }
                }
            }

            if (caminhoPadrao !== null && encontrado === false) {
                for (let i = 0; i < caminhoPadrao.declaracoes.length; i++) {
                    this.executar(caminhoPadrao['declaracoes'][i]);
                }
            }
        } catch (erro) {
            if (erro instanceof ExcecaoSustar) {
            } else {
                throw erro;
            }
        }
    }

    visitarExpressaoTente(declaracao: Tente) {
        try {
            let sucesso = true;
            try {
                this.executarBloco(declaracao.caminhoTente, new Ambiente(this.ambiente));
            } catch (erro) {
                sucesso = false;

                if (declaracao.caminhoPegue !== null) {
                    this.executarBloco(
                        declaracao.caminhoPegue,
                        new Ambiente(this.ambiente)
                    );
                }
            }

            if (sucesso && declaracao.caminhoSenao !== null) {
                this.executarBloco(
                    declaracao.caminhoSenao,
                    new Ambiente(this.ambiente)
                );
            }
        } finally {
            if (declaracao.caminhoFinalmente !== null)
                this.executarBloco(
                    declaracao.caminhoFinalmente,
                    new Ambiente(this.ambiente)
                );
        }
    }

    visitarExpressaoEnquanto(declaracao: Enquanto) {
        while (this.eVerdadeiro(this.avaliar(declaracao.condicao))) {
            try {
                this.executar(declaracao.corpo);
            } catch (erro) {
                if (erro instanceof ExcecaoSustar) {
                    break;
                } else if (erro instanceof ExcecaoContinuar) {
                } else {
                    throw erro;
                }
            }
        }

        return null;
    }

    visitarExpressaoImportar(declaracao: Importar) {
        const caminhoRelativo = this.avaliar(declaracao.caminho);
        const caminhoTotal = caminho.join(this.diretorioBase, caminhoRelativo);
        const nomeArquivo = caminho.basename(caminhoTotal);

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

        const delegua = new Delegua(this.Delegua.dialeto, false, nomeArquivo);

        delegua.executar(dados);

        let exportar = delegua.interpretador.global.valores.exports;

        const eDicionario = (objeto: any) => objeto.constructor === Object;

        if (eDicionario(exportar)) {
            let novoModulo = new DeleguaModulo();

            let chaves = Object.keys(exportar);
            for (let i = 0; i < chaves.length; i++) {
                novoModulo[chaves[i]] = exportar[chaves[i]];
            }

            return novoModulo;
        }

        return exportar;
    }

    visitarExpressaoEscreva(declaracao: Escreva) {
        const valor = this.avaliar(declaracao.expressao);
        console.log(this.paraTexto(valor));
        return null;
    }

    executarBloco(declaracoes: any, ambiente: any) {
        let anterior = this.ambiente;
        try {
            this.ambiente = ambiente;

            if (declaracoes && declaracoes.length) {
                for (let i = 0; i < declaracoes.length; i++) {
                    this.executar(declaracoes[i]);
                }
            }
        } catch (erro: any) {
            // TODO: try sem catch é uma roubada total. Implementar uma forma de quebra de fluxo sem exceção.
            throw erro;
        } finally {
            this.ambiente = anterior;
        }
    }

    visitarExpressaoBloco(declaracao: any) {
        this.executarBloco(declaracao.declaracoes, new Ambiente(this.ambiente));
        return null;
    }

    visitarExpressaoVar(declaracao: any) {
        let valor = null;
        if (declaracao.inicializador !== null) {
            valor = this.avaliar(declaracao.inicializador);
        }

        this.ambiente.definirVariavel(declaracao.simbolo.lexema, valor);
        return null;
    }

    visitarExpressaoContinua(declaracao?: any) {
        throw new ExcecaoContinuar();
    }

    visitarExpressaoSustar(declaracao?: any) {
        throw new ExcecaoSustar();
    }

    visitarExpressaoRetornar(declaracao: any) {
        let valor = null;
        if (declaracao.valor != null) valor = this.avaliar(declaracao.valor);

        throw new ExcecaoRetornar(valor);
    }

    visitarExpressaoDeleguaFuncao(expressao: any) {
        return new DeleguaFuncao(null, expressao, this.ambiente, false);
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
            objeto instanceof DeleguaInstancia ||
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

    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        const objeto = this.avaliar(expressao.entidadeChamada);

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
            objeto instanceof DeleguaInstancia ||
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
            !(objeto instanceof DeleguaInstancia) &&
            objeto.constructor !== Object
        ) {
            throw new ErroEmTempoDeExecucao(
                expressao.objeto.nome,
                'Somente instâncias e dicionários podem possuir campos.',
                expressao.linha
            );
        }

        const valor = this.avaliar(expressao.valor);
        if (objeto instanceof DeleguaInstancia) {
            objeto.set(expressao.nome, valor);
            return valor;
        } else if (objeto.constructor === Object) {
            objeto[expressao.simbolo.lexema] = valor;
        }
    }

    visitarExpressaoFuncao(declaracao: Funcao) {
        const funcao = new DeleguaFuncao(
            declaracao.simbolo.lexema,
            declaracao.funcao,
            this.ambiente,
            false
        );
        this.ambiente.definirVariavel(declaracao.simbolo.lexema, funcao);
    }

    visitarExpressaoClasse(declaracao: Classe) {
        let superClasse = null;
        if (declaracao.superClasse !== null) {
            superClasse = this.avaliar(declaracao.superClasse);
            if (!(superClasse instanceof DeleguaClasse)) {
                throw new ErroEmTempoDeExecucao(
                    declaracao.superClasse.nome,
                    'SuperClasse precisa ser uma classe.',
                    declaracao.linha
                );
            }
        }

        this.ambiente.definirVariavel(declaracao.simbolo.lexema, null);

        if (declaracao.superClasse !== null) {
            this.ambiente = new Ambiente(this.ambiente);
            this.ambiente.definirVariavel('super', superClasse);
        }

        let metodos = {};
        let definirMetodos = declaracao.metodos;
        for (let i = 0; i < declaracao.metodos.length; i++) {
            let metodoAtual = definirMetodos[i];
            let eInicializado = metodoAtual.simbolo.lexema === 'construtor';
            const funcao = new DeleguaFuncao(
                metodoAtual.simbolo.lexema,
                metodoAtual.funcao,
                this.ambiente,
                eInicializado
            );
            metodos[metodoAtual.simbolo.lexema] = funcao;
        }

        const criado = new DeleguaClasse(
            declaracao.simbolo.lexema,
            superClasse,
            metodos
        );

        if (superClasse !== null) {
            this.ambiente = this.ambiente.enclosing;
        }

        this.ambiente.atribuirVariavel(declaracao.simbolo, criado);
        return null;
    }

    visitarExpressaoAcessoMetodo(expressao: any) {
        let objeto = this.avaliar(expressao.objeto);
        if (objeto instanceof DeleguaInstancia) {
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

    visitarExpressaoSuper(expressao: Super) {
        const distancia = this.locais.get(expressao);
        const superClasse = this.ambiente.obterVariavelEm(distancia, 'super');

        const objeto = this.ambiente.obterVariavelEm(distancia - 1, 'isto');

        let metodo = superClasse.encontrarMetodo(expressao.metodo.lexema);

        if (metodo === undefined) {
            throw new ErroEmTempoDeExecucao(
                expressao.metodo,
                'Método chamado indefinido.',
                expressao.linha
            );
        }

        return metodo.definirEscopo(objeto);
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

        return objeto.toString();
    }

    executar(declaracao: any, mostrarResultado: boolean = false): void {
        declaracao.aceitar(this);
    }

    interpretar(declaracoes: any, locais: Map<Construto, number>): RetornoInterpretador {
        this.locais = locais;
        this.erros = [];
        
        try {
            for (let i = 0; i < declaracoes.length; i++) {
                this.executar(declaracoes[i], false);
            }
        } catch (erro) {
            this.erros.push(erro);
        }

        return {
            erros: this.erros
        } as RetornoInterpretador;
    }
}
