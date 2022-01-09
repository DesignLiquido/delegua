import tiposDeSimbolos from "./tiposDeSimbolos";
import { Ambiente } from "./ambiente";
import { Delegua } from "./delegua";
import carregarBibliotecaGlobal from "./bibliotecas/bibliotecaGlobal";
import * as caminho from "path";
import * as fs from "fs";
import carregarModulo from "./bibliotecas/importarBiblioteca";

import { Callable } from "./estruturas/callable";
import { FuncaoPadrao } from "./estruturas/funcao-padrao";
import { DeleguaClasse } from "./estruturas/classe";
import { DeleguaFuncao } from "./estruturas/funcao";
import { DeleguaInstancia } from "./estruturas/instancia";
import { DeleguaModulo } from "./estruturas/modulo";

import {
    ErroEmTempoDeExecucao,
    ContinueException,
    BreakException,
    ReturnException
} from "./erro";

/**
 * O Interpretador visita todos os elementos complexos gerados pelo analisador sintático (Parser)
 * e de fato executa a lógica de programação descrita no código.
 */
export class Interpretador {
    Delegua: any;
    diretorioBase: any;
    global: any;
    ambiente: any;
    locais: any;

    constructor(Delegua, diretorioBase) {
        this.Delegua = Delegua;
        this.diretorioBase = diretorioBase;

        this.global = new Ambiente();
        this.ambiente = this.global;
        this.locais = new Map();

        this.global = carregarBibliotecaGlobal(this, this.global);
    }

    resolver(expr, depth) {
        this.locais.set(expr, depth);
    }

    visitLiteralExpr(expr) {
        return expr.valor;
    }

    avaliar(expr: any) {
        if (expr.aceitar) {
            return expr.aceitar(this);
        }
    }

    visitGroupingExpr(expr) {
        return this.avaliar(expr.expressao);
    }

    eVerdadeiro(objeto) {
        if (objeto === null)
            return false;
        if (typeof objeto === "boolean")
            return Boolean(objeto);

        return true;
    }

    checkNumberOperand(operador, operand) {
        if (typeof operand === "number") return;
        throw new ErroEmTempoDeExecucao(operador, "Operador precisa ser um número.");
    }

    visitUnaryExpr(expr) {
        const direita = this.avaliar(expr.direita);

        switch (expr.operador.tipo) {
            case tiposDeSimbolos.SUBTRACAO:
                this.checkNumberOperand(expr.operador, direita);
                return -direita;
            case tiposDeSimbolos.NEGACAO:
                return !this.eVerdadeiro(direita);
            case tiposDeSimbolos.BIT_NOT:
                return ~direita;
        }

        return null;
    }

    eIgual(esquerda, direita) {
        if (esquerda === null && direita === null)
            return true;
        if (esquerda === null)
            return false;

        return esquerda === direita;
    }

    checkNumberOperands(operador: any, direita: any, esquerda: any) {
        if (typeof direita === "number" && typeof esquerda === "number") return;
        throw new ErroEmTempoDeExecucao(operador, "Operadores precisam ser números.");
    }

    visitBinaryExpr(expr: any) {
        let esquerda = this.avaliar(expr.esquerda);
        let direita = this.avaliar(expr.direita);

        switch (expr.operador.tipo) {
            case tiposDeSimbolos.EXPONENCIACAO:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Math.pow(esquerda, direita);

            case tiposDeSimbolos.MAIOR:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) > Number(direita);

            case tiposDeSimbolos.MAIOR_IGUAL:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) >= Number(direita);

            case tiposDeSimbolos.MENOR:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) < Number(direita);

            case tiposDeSimbolos.MENOR_IGUAL:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) <= Number(direita);

            case tiposDeSimbolos.SUBTRACAO:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) - Number(direita);

            case tiposDeSimbolos.ADICAO:
                if (typeof esquerda === "number" && typeof direita === "number") {
                    return Number(esquerda) + Number(direita);
                } else if (typeof esquerda === "string" && typeof direita === "string") {
                    return String(esquerda) + String(direita);
                } else {
                    return String(esquerda) + String(direita);
                }

            case tiposDeSimbolos.DIVISAO:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) / Number(direita);

            case tiposDeSimbolos.MULTIPLICACAO:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) * Number(direita);

            case tiposDeSimbolos.MODULO:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) % Number(direita);

            case tiposDeSimbolos.BIT_AND:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) & Number(direita);

            case tiposDeSimbolos.BIT_XOR:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) ^ Number(direita);

            case tiposDeSimbolos.BIT_OR:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) | Number(direita);

            case tiposDeSimbolos.MENOR_MENOR:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) << Number(direita);

            case tiposDeSimbolos.MAIOR_MAIOR:
                this.checkNumberOperands(expr.operador, esquerda, direita);
                return Number(esquerda) >> Number(direita);

            case tiposDeSimbolos.DIFERENTE:
                return !this.eIgual(esquerda, direita);

            case tiposDeSimbolos.IGUAL_IGUAL:
                return this.eIgual(esquerda, direita);
        }

        return null;
    }

    visitCallExpr(expr: any) {
        let callee = this.avaliar(expr.callee);

        let argumentos = [];
        for (let i = 0; i < expr.argumentos.length; i++) {
            argumentos.push(this.avaliar(expr.argumentos[i]));
        }

        if (!(callee instanceof Callable)) {
            throw new ErroEmTempoDeExecucao(
                expr.parentese,
                "Só pode chamar função ou classe."
            );
        }

        let parametros;
        if (callee instanceof DeleguaFuncao) {
            parametros = callee.declaracao.parametros;
        } else if (callee instanceof DeleguaClasse) {
            parametros = callee.metodos.init
                ? callee.metodos.init.declaracao.parametros
                : [];
        } else {
            parametros = [];
        }

        // Isso aqui completa os parâmetros não preenchidos com nulos.
        if (argumentos.length < callee.aridade()) {
            let diferenca = callee.aridade() - argumentos.length;
            for (let i = 0; i < diferenca; i++) {
                argumentos.push(null);
            }
        }

        else  {
            if (parametros &&
                parametros.length > 0 &&
                parametros[parametros.length - 1]["tipo"] === "wildcard"
            ) {
                let novosArgumentos = argumentos.slice(0, parametros.length - 1);
                novosArgumentos.push(argumentos.slice(parametros.length - 1, argumentos.length));
                argumentos = novosArgumentos;
            }
        }

        if (callee instanceof FuncaoPadrao) {
            return callee.chamar(this, argumentos, expr.callee.nome);
        }

        return callee.chamar(this, argumentos);
    }

    visitAssignExpr(expr: any) {
        const valor = this.avaliar(expr.valor);

        const distancia = this.locais.get(expr);
        if (distancia !== undefined) {
            this.ambiente.atribuirVariavelEm(distancia, expr.nome, valor);
        } else {
            this.ambiente.atribuirVariavel(expr.nome, valor);
        }

        return valor;
    }

    procurarVariavel(nome: any, expr: any) {
        const distancia = this.locais.get(expr);
        if (distancia !== undefined) {
            return this.ambiente.obterVariavelEm(distancia, nome.lexema);
        } else {
            return this.global.obterVariavel(nome);
        }
    }

    visitVariableExpr(expr: any) {
        return this.procurarVariavel(expr.nome, expr);
    }

    visitExpressionStmt(stmt: any) {
        return this.avaliar(stmt.expressao);
    }

    visitLogicalExpr(expr) {
        let esquerda = this.avaliar(expr.esquerda);

        if (expr.operador.tipo === tiposDeSimbolos.EM) {
            let direita = this.avaliar(expr.direita);

            if (Array.isArray(direita) || typeof direita === "string") {
                return direita.includes(esquerda);
            } else if (direita.constructor === Object) {
                return esquerda in direita;
            } else {
                throw new ErroEmTempoDeExecucao("Tipo de chamada inválida com 'em'.");
            }
        }

        // se um estado for verdadeiro, retorna verdadeiro
        if (expr.operador.tipo === tiposDeSimbolos.OU) {
            if (this.eVerdadeiro(esquerda)) return esquerda;
        }

        // se um estado for falso, retorna falso
        if (expr.operador.tipo === tiposDeSimbolos.E) {
            if (!this.eVerdadeiro(esquerda)) return esquerda;
        }

        return this.avaliar(expr.direita);
    }

    visitIfStmt(stmt) {
        if (this.eVerdadeiro(this.avaliar(stmt.condicao))) {
            this.executar(stmt.thenBranch);
            return null;
        }

        for (let i = 0; i < stmt.elifBranches.length; i++) {
            const atual = stmt.elifBranches[i];

            if (this.eVerdadeiro(this.avaliar(atual.condicao))) {
                this.executar(atual.branch);
                return null;
            }
        }

        if (stmt.elseBranch !== null) {
            this.executar(stmt.elseBranch);
        }

        return null;
    }

    visitForStmt(stmt) {
        if (stmt.inicializador !== null) {
            this.avaliar(stmt.inicializador);
        }
        while (true) {
            if (stmt.condicao !== null) {
                if (!this.eVerdadeiro(this.avaliar(stmt.condicao))) {
                    break;
                }
            }

            try {
                this.executar(stmt.corpo);
            } catch (erro) {
                if (erro instanceof BreakException) {
                    break;
                } else if (erro instanceof ContinueException) {
                } else {
                    throw erro;
                }
            }

            if (stmt.incrementar !== null) {
                this.avaliar(stmt.incrementar);
            }
        }
        return null;
    }

    visitDoStmt(stmt) {
        do {
            try {
                this.executar(stmt.doBranch);
            } catch (erro) {
                if (erro instanceof BreakException) {
                    break;
                } else if (erro instanceof ContinueException) {
                } else {
                    throw erro;
                }
            }
        } while (this.eVerdadeiro(this.avaliar(stmt.whileCondition)));
    }

    visitSwitchStmt(stmt) {
        let switchCondition = this.avaliar(stmt.condicao);
        let branches = stmt.branches;
        let defaultBranch = stmt.defaultBranch;

        let matched = false;
        try {
            for (let i = 0; i < branches.length; i++) {
                let branch = branches[i];

                for (let j = 0; j < branch.conditions.length; j++) {
                    if (this.avaliar(branch.conditions[j]) === switchCondition) {
                        matched = true;

                        try {
                            for (let k = 0; k < branch.stmts.length; k++) {
                                this.executar(branch.stmts[k]);
                            }
                        } catch (erro) {
                            if (erro instanceof ContinueException) {
                            } else {
                                throw erro;
                            }
                        }
                    }
                }
            }

            if (defaultBranch !== null && matched === false) {
                for (let i = 0; i < defaultBranch.stmts.length; i++) {
                    this.executar(defaultBranch["stmts"][i]);
                }
            }
        } catch (erro) {
            if (erro instanceof BreakException) {
            } else {
                throw erro;
            }
        }
    }

    visitTryStmt(stmt: any) {
        try {
            let sucesso = true;
            try {
                this.executeBlock(stmt.tryBranch, new Ambiente(this.ambiente));
            } catch (erro) {
                sucesso = false;

                if (stmt.catchBranch !== null) {
                    this.executeBlock(
                        stmt.catchBranch,
                        new Ambiente(this.ambiente)
                    );
                }
            }

            if (sucesso && stmt.elseBranch !== null) {
                this.executeBlock(stmt.elseBranch, new Ambiente(this.ambiente));
            }
        } finally {
            if (stmt.finallyBranch !== null)
                this.executeBlock(
                    stmt.finallyBranch,
                    new Ambiente(this.ambiente)
                );
        }
    }

    visitWhileStmt(stmt) {
        while (this.eVerdadeiro(this.avaliar(stmt.condicao))) {
            try {
                this.executar(stmt.corpo);
            } catch (erro) {
                if (erro instanceof BreakException) {
                    break;
                } else if (erro instanceof ContinueException) {
                } else {
                    throw erro;
                }
            }
        }

        return null;
    }

    visitImportStmt(stmt) {
        const caminhoRelativo = this.avaliar(stmt.caminho);
        const caminhoTotal = caminho.join(this.diretorioBase, caminhoRelativo);
        const pastaTotal = caminho.dirname(caminhoTotal);
        const nomeArquivo = caminho.basename(caminhoTotal);

        let dados: any = carregarModulo(caminhoRelativo);
        if (dados) return dados;

        try {
            if (!fs.existsSync(caminhoTotal)) {
                throw new ErroEmTempoDeExecucao(
                    stmt.closeBracket,
                    "Não foi possível encontrar arquivo importado."
                );
            }
        } catch (erro) {
            throw new ErroEmTempoDeExecucao(stmt.closeBracket, "Não foi possível ler o arquivo.");
        }

        dados = fs.readFileSync(caminhoTotal).toString();

        const delegua = new Delegua(nomeArquivo);
        const interpretador = new Interpretador(delegua, pastaTotal);

        delegua.run(dados, interpretador);

        let exportar = interpretador.global.valores.exports;

        const eDicionario = objeto => objeto.constructor === Object;

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

    visitPrintStmt(stmt) {
        const valor = this.avaliar(stmt.expressao);
        console.log(this.stringify(valor));
        return null;
    }

    executeBlock(declaracoes: any, ambiente: any) {
        let anterior = this.ambiente;
        try {
            this.ambiente = ambiente;

            if (declaracoes && declaracoes.length) {
                for (let i = 0; i < declaracoes.length; i++) {
                    this.executar(declaracoes[i]);
                }
            }

        }
        catch (erro) {
            // TODO: try sem catch é uma roubada total. Implementar uma forma de quebra de fluxo sem exceção.
            // console.error(erro);
            throw erro;
        } finally {
            this.ambiente = anterior;
        }
    }

    visitBlockStmt(stmt: any) {
        this.executeBlock(stmt.declaracoes, new Ambiente(this.ambiente));
        return null;
    }

    visitVarStmt(stmt: any) {
        let valor = null;
        if (stmt.inicializador !== null) {
            valor = this.avaliar(stmt.inicializador);
        }

        this.ambiente.definirVariavel(stmt.nome.lexema, valor);
        return null;
    }

    visitContinueStmt(stmt) {
        throw new ContinueException();
    }

    visitBreakStmt(stmt) {
        throw new BreakException();
    }

    visitReturnStmt(stmt) {
        let valor = null;
        if (stmt.valor != null) valor = this.avaliar(stmt.valor);

        throw new ReturnException(valor);
    }

    visitFunctionExpr(expr) {
        return new DeleguaFuncao(null, expr, this.ambiente, false);
    }

    visitAssignsubscriptExpr(expr) {
        let objeto = this.avaliar(expr.objeto);
        let indice = this.avaliar(expr.indice);
        let valor = this.avaliar(expr.valor);

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
        }

        else {
            throw new ErroEmTempoDeExecucao(
                expr.objeto.nome,
                "Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita."
            );
        }
    }

    visitSubscriptExpr(expressao) {
        const objeto = this.avaliar(expressao.callee);

        let indice = this.avaliar(expressao.indice);
        if (Array.isArray(objeto)) {
            if (!Number.isInteger(indice)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.closeBracket,
                    "Somente inteiros podem ser usados para indexar um vetor."
                );
            }

            if (indice < 0 && objeto.length !== 0) {
                while (indice < 0) {
                    indice += objeto.length;
                }
            }

            if (indice >= objeto.length) {
                throw new ErroEmTempoDeExecucao(expressao.closeBracket, "Índice do vetor fora do intervalo.");
            }
            return objeto[indice];
        }

        else if (
            objeto.constructor === Object ||
            objeto instanceof DeleguaInstancia ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DeleguaClasse ||
            objeto instanceof DeleguaModulo
        ) {
            return objeto[indice] || null;
        }

        else if (typeof objeto === "string") {
            if (!Number.isInteger(indice)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.closeBracket,
                    "Somente inteiros podem ser usados para indexar um vetor."
                );
            }

            if (indice < 0 && objeto.length !== 0) {
                while (indice < 0) {
                    indice += objeto.length;
                }
            }

            if (indice >= objeto.length) {
                throw new ErroEmTempoDeExecucao(expressao.closeBracket, "Índice fora do tamanho.");
            }
            return objeto.charAt(indice);
        }

        else {
            throw new ErroEmTempoDeExecucao(
                expressao.callee.nome,
                "Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita."
            );
        }
    }

    visitSetExpr(expr) {
        const objeto = this.avaliar(expr.objeto);

        if (!(objeto instanceof DeleguaInstancia) && objeto.constructor !== Object) {
            throw new ErroEmTempoDeExecucao(
                expr.objeto.nome,
                "Somente instâncias e dicionários podem possuir campos."
            );
        }

        const valor = this.avaliar(expr.valor);
        if (objeto instanceof DeleguaInstancia) {
            objeto.set(expr.nome, valor);
            return valor;
        } else if (objeto.constructor === Object) {
            objeto[expr.nome.lexema] = valor;
        }
    }

    visitFunctionStmt(stmt) {
        const funcao = new DeleguaFuncao(
            stmt.nome.lexema,
            stmt.funcao,
            this.ambiente,
            false
        );
        this.ambiente.definirVariavel(stmt.nome.lexema, funcao);
    }

    visitClassStmt(stmt: any) {
        let superClasse = null;
        if (stmt.superClasse !== null) {
            superClasse = this.avaliar(stmt.superClasse);
            if (!(superClasse instanceof DeleguaClasse)) {
                throw new ErroEmTempoDeExecucao(
                    stmt.superClasse.nome,
                    "SuperClasse precisa ser uma classe."
                );
            }
        }

        this.ambiente.definirVariavel(stmt.nome.lexema, null);

        if (stmt.superClasse !== null) {
            this.ambiente = new Ambiente(this.ambiente);
            this.ambiente.definirVariavel("super", superClasse);
        }

        let metodos = {};
        let definirMetodos = stmt.metodos;
        for (let i = 0; i < stmt.metodos.length; i++) {
            let metodoAtual = definirMetodos[i];
            let eInicializado = metodoAtual.nome.lexema === "construtor";
            const funcao = new DeleguaFuncao(
                metodoAtual.nome.lexema,
                metodoAtual.funcao,
                this.ambiente,
                eInicializado
            );
            metodos[metodoAtual.nome.lexema] = funcao;
        }

        const criado = new DeleguaClasse(stmt.nome.lexema, superClasse, metodos);

        if (superClasse !== null) {
            this.ambiente = this.ambiente.enclosing;
        }

        this.ambiente.atribuirVariavel(stmt.nome, criado);
        return null;
    }

    visitGetExpr(expr: any) {
        let objeto = this.avaliar(expr.objeto);
        if (objeto instanceof DeleguaInstancia) {
            return objeto.get(expr.nome) || null;
        } else if (objeto.constructor === Object) {
            return objeto[expr.nome.lexema] || null;
        } else if (objeto instanceof DeleguaModulo) {
            return objeto[expr.nome.lexema] || null;
        }

        throw new ErroEmTempoDeExecucao(
            expr.nome,
            "Você só pode acessar métodos do objeto e dicionários."
        );
    }

    visitThisExpr(expr: any) {
        return this.procurarVariavel(expr.palavraChave, expr);
    }

    visitDictionaryExpr(expr: any) {
        let dicionario = {};
        for (let i = 0; i < expr.chaves.length; i++) {
            dicionario[this.avaliar(expr.chaves[i])] = this.avaliar(expr.valores[i]);
        }
        return dicionario;
    }

    visitArrayExpr(expr) {
        let valores = [];
        for (let i = 0; i < expr.valores.length; i++) {
            valores.push(this.avaliar(expr.valores[i]));
        }
        return valores;
    }

    visitSuperExpr(expr) {
        const distancia = this.locais.get(expr);
        const superClasse = this.ambiente.obterVariavelEm(distancia, "super");

        const objeto = this.ambiente.obterVariavelEm(distancia - 1, "isto");

        let metodo = superClasse.encontrarMetodo(expr.metodo.lexema);

        if (metodo === undefined) {
            throw new ErroEmTempoDeExecucao(
                expr.metodo,
                "Método chamado indefinido."
            );
        }

        return metodo.bind(objeto);
    }

    stringify(objeto) {
        if (objeto === null) return "nulo";
        if (typeof objeto === "boolean") {
            return objeto ? "verdadeiro" : "falso";
        }

        if (objeto instanceof Date) {
            const formato = Intl.DateTimeFormat('pt', { dateStyle: 'full', timeStyle: 'full' });
            return formato.format(objeto);
        }

        if (Array.isArray(objeto)) return objeto;

        if (typeof objeto === 'object') return JSON.stringify(objeto);

        return objeto.toString();
    }

    executar(stmt: any, imprimirResultado: boolean = false) {
        const resultado = stmt.aceitar(this);
        if (imprimirResultado) {
            console.log(this.stringify(resultado));
        }
    }

    interpretar(declaracoes: any) {
        try {
            if (declaracoes.length === 1) {
                const eObjetoExpressao = declaracoes[0].constructor.name === 'Expressao'
                if (eObjetoExpressao) {
                    this.executar(declaracoes[0], eObjetoExpressao);
                    return;
                }
            }
            for (let i = 0; i < declaracoes.length; i++) {
                this.executar(declaracoes[i]);
            }
        } catch (erro) {
            this.Delegua.erroEmTempoDeExecucao(erro);
        }
    }
};
