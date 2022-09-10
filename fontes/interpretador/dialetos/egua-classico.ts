import * as caminho from 'path';
import * as fs from 'fs';

import tiposDeSimbolos from '../../tipos-de-simbolos';
import { Ambiente } from '../../ambiente';
import { Delegua } from '../../delegua';
import carregarBibliotecaGlobal from '../../bibliotecas/biblioteca-global';
import carregarModulo from '../../bibliotecas/importar-biblioteca';

import { Chamavel } from '../../estruturas/chamavel';
import { FuncaoPadrao } from '../../estruturas/funcao-padrao';
import { DeleguaClasse } from '../../estruturas/delegua-classe';
import { DeleguaFuncao } from '../../estruturas/funcao';
import { ObjetoDeleguaClasse } from '../../estruturas/objeto-delegua-classe';
import { DeleguaModulo } from '../../estruturas/modulo';

import {
    ErroEmTempoDeExecucao,
} from '../../excecoes';
import { InterpretadorInterface, SimboloInterface, ResolvedorInterface, VariavelInterface } from '../../interfaces';
import { Classe, Declaracao, Enquanto, Escolha, Escreva, Expressao, Fazer, Funcao, Importar, Para, Se, Tente, Var } from '../../declaracoes';
import { AcessoIndiceVariavel, Atribuir, Construto, Literal, Super, Variavel } from '../../construtos';
import { RetornoInterpretador } from '../../interfaces/retornos/retorno-interpretador';
import { ErroInterpretador } from '../erro-interpretador';
import { PilhaEscoposExecucao } from '../pilha-escopos-execucao';
import { EscopoExecucao } from '../../interfaces/escopo-execucao';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../../quebras';
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
            ambiente: new Ambiente()
        }
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        carregarBibliotecaGlobal(this, this.pilhaEscoposExecucao);
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

    eIgual(esquerda: VariavelInterface | any, direita: VariavelInterface | any): boolean {
        if (esquerda.tipo) {
            if (esquerda.tipo === "nulo" && direita.tipo && direita.tipo === "nulo") return true;
            if (esquerda.tipo === "nulo") return false;

            return esquerda.valor === direita.valor;
        }
        if (esquerda === null && direita === null) return true;
        if (esquerda === null) return false;

        return esquerda === direita;
    }

    verificarOperandosNumeros(operador: any, direita: VariavelInterface | any, esquerda: VariavelInterface | any): void {
        const tipoDireita: string = direita.tipo ? direita.tipo : (typeof direita === 'number' ? 'número' : String(NaN));
        const tipoEsquerda: string = esquerda.tipo ? esquerda.tipo : (typeof esquerda === 'number' ? 'número' : String(NaN));
        if (tipoDireita === "número" && tipoEsquerda === "número") return;
        throw new ErroEmTempoDeExecucao(
            operador,
            'Operadores precisam ser números.',
            operador.linha
        );
    }

    visitarExpressaoBinaria(expressao: any) {
        const esquerda: VariavelInterface | any = this.avaliar(expressao.esquerda);
        const direita: VariavelInterface | any = this.avaliar(expressao.direita);
        const valorEsquerdo: any = esquerda.valor ? esquerda.valor : esquerda;
        const valorDireito: any = direita.valor ? direita.valor : direita;
        const tipoEsquerdo: string = esquerda.tipo ? esquerda.tipo : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita.tipo ? direita.tipo : inferirTipoVariavel(direita);

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
                if (
                    tipoEsquerdo === 'número' &&
                    tipoDireito === 'número'
                ) {
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
                return !this.eIgual(esquerda, direita);

            case tiposDeSimbolos.IGUAL_IGUAL:
                return this.eIgual(esquerda, direita);
        }

        return null;
    }

    visitarExpressaoDeChamada(expressao: any) {
        const variavelEntidadeChamada: VariavelInterface | any = this.avaliar(expressao.entidadeChamada);
        const entidadeChamada = variavelEntidadeChamada.valor ? variavelEntidadeChamada.valor : variavelEntidadeChamada;

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
            parametros = entidadeChamada.metodos.inicializacao
                ? entidadeChamada.metodos.inicializacao.declaracao.parametros
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
                parametros[parametros.length - 1]['tipo'] === 'estrela'
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
                argumentos,
                expressao.entidadeChamada.nome
            );
        }

        return entidadeChamada.chamar(this, argumentos);
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        const valor = this.avaliar(expressao.valor);
        this.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valor);

        return valor;
    }

    procurarVariavel(simbolo: SimboloInterface, expressao: any): VariavelInterface {
        return this.pilhaEscoposExecucao.obterVariavel(simbolo);
    }

    visitarExpressaoDeVariavel(expressao: Variavel): VariavelInterface {
        return this.procurarVariavel(expressao.simbolo, expressao);
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
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
                throw erro;
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
                throw erro;
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

                for (let j = 0; j < caminho.condicoes.length; j++) {
                    if (
                        this.avaliar(caminho.condicoes[j]) === condicaoEscolha
                    ) {
                        encontrado = true;

                        try {
                            for (let k = 0; k < caminho.declaracoes.length; k++) {
                                this.executar(caminho.declaracoes[k]);
                            }
                        } catch (erro: any) {
                            throw erro;
                        }
                    }
                }
            }

            if (caminhoPadrao !== null && encontrado === false) {
                for (let i = 0; i < caminhoPadrao.declaracoes.length; i++) {
                    this.executar(caminhoPadrao['declaracoes'][i]);
                }
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

    visitarExpressaoEnquanto(declaracao: Enquanto) {
        while (this.eVerdadeiro(this.avaliar(declaracao.condicao))) {
            try {
                this.executar(declaracao.corpo);
            } catch (erro) {
                throw erro;
            }
        }

        return null;
    }

    visitarExpressaoImportar(declaracao: Importar) {
        const caminhoRelativo = this.avaliar(declaracao.caminho);
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

        let exportar = this.pilhaEscoposExecucao.obterTodasDeleguaFuncao();

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
        try {
            const valor = this.avaliar(declaracao.argumentos[0]);
            console.log(this.paraTexto(valor));
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }

    /**
     * Empilha declarações na pilha de escopos de execução, cria um novo ambiente e 
     * executa as declarações empilhadas.
     * @param declaracoes Um vetor de declaracoes a ser executado.
     * @param ambiente O ambiente de execução quando houver, como parâmetros, argumentos, etc.
     */
    executarBloco(declaracoes: Declaracao[], ambiente?: Ambiente): any {
        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: ambiente || new Ambiente()
        }
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        return this.executarUltimoEscopo();
    }

    visitarExpressaoBloco(declaracao: any) {
        this.executarBloco(declaracao.declaracoes);
        return null;
    }

    visitarExpressaoVar(declaracao: Var) {
        let valor = null;
        if (declaracao.inicializador !== null) {
            valor = this.avaliar(declaracao.inicializador);
        }

        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, valor);
        return null;
    }

    visitarExpressaoContinua(declaracao?: any): ContinuarQuebra {
        return new ContinuarQuebra();
    }

    visitarExpressaoSustar(declaracao?: any): SustarQuebra {
        return new SustarQuebra();
    }

    visitarExpressaoRetornar(declaracao: any): RetornoQuebra {
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

    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel | any) {
        const variavelObjeto: VariavelInterface = this.avaliar(expressao.entidadeChamada);
        const objeto = variavelObjeto.valor ? variavelObjeto.valor : variavelObjeto;

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
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, funcao);
    }

    visitarExpressaoClasse(declaracao: Classe) {
        let superClasse = null;
        if (declaracao.superClasse !== null) {
            const variavelSuperClasse: VariavelInterface = this.avaliar(declaracao.superClasse);
            superClasse = variavelSuperClasse.valor;
            if (!(superClasse instanceof DeleguaClasse)) {
                throw new ErroEmTempoDeExecucao(
                    declaracao.superClasse.nome,
                    'SuperClasse precisa ser uma classe.',
                    declaracao.linha
                );
            }
        }

        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, null);

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

        const deleguaClasse = new DeleguaClasse(
            declaracao.simbolo.lexema,
            superClasse,
            metodos
        );

        // TODO: Recolocar isso se for necessário.
        /* if (superClasse !== null) {
            this.ambiente = this.ambiente.enclosing;
        } */

        this.pilhaEscoposExecucao.atribuirVariavel(declaracao.simbolo, deleguaClasse);
        return null;
    }

    visitarExpressaoAcessoMetodo(expressao: any) {
        const variavelObjeto: VariavelInterface = this.avaliar(expressao.objeto);
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
        const superClasse = this.pilhaEscoposExecucao.obterVariavelEm(distancia, 'super');

        const objeto: VariavelInterface = this.pilhaEscoposExecucao.obterVariavelEm(distancia - 1, 'isto');

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

    executar(declaracao: Declaracao, mostrarResultado: boolean = false): void {
        declaracao.aceitar(this);
    }

    executarUltimoEscopo() {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        try {
            for (; ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length; ultimoEscopo.declaracaoAtual++) {
                this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
            }
        } finally {
            this.pilhaEscoposExecucao.removerUltimo();
        }
    }

    interpretar(declaracoes: Declaracao[]): RetornoInterpretador {
        this.erros = [];

        const retornoResolvedor = this.resolvedor.resolver(declaracoes);
        this.locais = retornoResolvedor.locais;
        
        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new Ambiente()
        }
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        this.executarUltimoEscopo();

        return {
            erros: this.erros
        } as RetornoInterpretador;
    }
}
