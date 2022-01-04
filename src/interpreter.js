const tokenTypes = require("./tokenTypes.js"),
    Environment = require("./environment.js"),
    Egua = require("./egua.js"),
    loadGlobalLib = require("./lib/globalLib.js"),
    path = require("path"),
    fs = require("fs"),
    checkStdLib = require("./lib/importStdlib.js");

const Callable = require("./structures/callable.js"),
    StandardFn = require("./structures/standardFn.js"),
    EguaClass = require("./structures/class.js"),
    EguaFunction = require("./structures/function.js"),
    EguaInstance = require("./structures/instance.js"),
    EguaModule = require("./structures/module.js");

const {
    RuntimeError,
    ContinueException,
    BreakException,
    ReturnException
} = require("./errors.js");

/**
 * O Interpretador (Interpreter) visita todos os elementos complexos gerados pelo analisador sintático (Parser)
 * e de fato executa a lógica de programação descrita no código.
 */
module.exports = class Interpreter {
    constructor(Egua, diretorioBase) {
        this.Egua = Egua;
        this.diretorioBase = diretorioBase;

        this.globals = new Environment();
        this.environment = this.globals;
        this.locals = new Map();

        this.globals = loadGlobalLib(this, this.globals);
    }

    resolve(expr, depth) {
        this.locals.set(expr, depth);
    }

    visitLiteralExpr(expr) {
        return expr.value;
    }

    avaliar(expr) {
        return expr.aceitar(this);
    }

    visitGroupingExpr(expr) {
        return this.avaliar(expr.expression);
    }

    eVerdadeiro(objeto) {
        if (objeto === null)
            return false;
        if (typeof objeto === "boolean")
            return Boolean(objeto);

        return true;
    }

    checkNumberOperand(operator, operand) {
        if (typeof operand === "number") return;
        throw new RuntimeError(operator, "Operador precisa ser um número.");
    }

    visitUnaryExpr(expr) {
        let right = this.avaliar(expr.right);

        switch (expr.operator.type) {
            case tokenTypes.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -right;
            case tokenTypes.BANG:
                return !this.eVerdadeiro(right);
            case tokenTypes.BIT_NOT:
                return ~right;
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

    checkNumberOperands(operador, direita, esquerda) {
        if (typeof direita === "number" && typeof esquerda === "number") return;
        throw new RuntimeError(operador, "Operadores precisam ser números.");
    }

    visitBinaryExpr(expr) {
        let esquerda = this.avaliar(expr.left);
        let direita = this.avaliar(expr.right);

        switch (expr.operator.type) {
            case tokenTypes.STAR_STAR:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Math.pow(esquerda, direita);

            case tokenTypes.GREATER:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) > Number(direita);

            case tokenTypes.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) >= Number(direita);

            case tokenTypes.LESS:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) < Number(direita);

            case tokenTypes.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) <= Number(direita);

            case tokenTypes.MINUS:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) - Number(direita);

            case tokenTypes.PLUS:
                if (typeof esquerda === "number" && typeof direita === "number") {
                    return Number(esquerda) + Number(direita);
                }

                if (typeof esquerda === "string" && typeof direita === "string") {
                    return String(esquerda) + String(direita);
                }

                throw new RuntimeError(
                    expr.operator,
                    "Operadores precisam ser dois números ou duas strings."
                );

            case tokenTypes.SLASH:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) / Number(direita);

            case tokenTypes.STAR:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) * Number(direita);

            case tokenTypes.MODULUS:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) % Number(direita);

            case tokenTypes.BIT_AND:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) & Number(direita);

            case tokenTypes.BIT_XOR:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) ^ Number(direita);

            case tokenTypes.BIT_OR:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) | Number(direita);

            case tokenTypes.LESSER_LESSER:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) << Number(direita);

            case tokenTypes.GREATER_GREATER:
                this.checkNumberOperands(expr.operator, esquerda, direita);
                return Number(esquerda) >> Number(direita);

            case tokenTypes.BANG_EQUAL:
                return !this.eIgual(esquerda, direita);

            case tokenTypes.EQUAL_EQUAL:
                return this.eIgual(esquerda, direita);
        }

        return null;
    }

    visitCallExpr(expr) {
        let callee = this.avaliar(expr.callee);

        let argumentos = [];
        for (let i = 0; i < expr.args.length; i++) {
            argumentos.push(this.avaliar(expr.args[i]));
        }

        if (!(callee instanceof Callable)) {
            throw new RuntimeError(
                expr.paren,
                "Só pode chamar função ou classe."
            );
        }

        let parametros;
        if (callee instanceof EguaFunction) {
            parametros = callee.declaration.params;
        } else if (callee instanceof EguaClass) {
            parametros = callee.methods.init
                ? callee.methods.init.declaration.params
                : [];
        } else {
            parametros = [];
        }

        if (argumentos.length < callee.arity()) {
            let diferenca = callee.arity() - argumentos.length;
            for (let i = 0; i < diferenca; i++) {
                argumentos.push(null);
            }
        }

        else if (argumentos.length >= callee.arity()) {
            if (
                parametros.length > 0 &&
                parametros[parametros.length - 1]["type"] === "wildcard"
            ) {
                let novosArgumentos = argumentos.slice(0, parametros.length - 1);
                novosArgumentos.push(argumentos.slice(parametros.length - 1, argumentos.length));
                argumentos = novosArgumentos;
            }
        }

        if (callee instanceof StandardFn) {
            return callee.call(this, argumentos, expr.callee.name);
        }

        return callee.call(this, argumentos);
    }

    visitAssignExpr(expr) {
        const valor = this.avaliar(expr.value);

        const distancia = this.locals.get(expr);
        if (distancia !== undefined) {
            this.environment.atribuirVariavelEm(distancia, expr.name, valor);
        } else {
            this.environment.atribuirVariavel(expr.name, valor);
        }

        return valor;
    }

    procurarVariavel(nome, expr) {
        const distancia = this.locals.get(expr);
        if (distancia !== undefined) {
            return this.environment.obterVariavelEm(distancia, name.lexeme);
        } else {
            return this.globals.obterVariavel(nome);
        }
    }

    visitVariableExpr(expr) {
        return this.procurarVariavel(expr.name, expr);
    }

    visitExpressionStmt(stmt) {
        this.avaliar(stmt.expression);
        return null;
    }

    visitLogicalExpr(expr) {
        let esquerda = this.avaliar(expr.left);

        if (expr.operator.type === tokenTypes.EM) {
            let direita = this.avaliar(expr.right);

            if (Array.isArray(direita) || typeof direita === "string") {
                return direita.includes(esquerda);
            } else if (direita.constructor === Object) {
                return esquerda in direita;
            } else {
                throw new RuntimeError("Tipo de chamada inválida com 'em'.");
            }
        }

        // se um estado for verdadeiro, retorna verdadeiro
        if (expr.operator.type === tokenTypes.OU) {
            if (this.eVerdadeiro(esquerda)) return esquerda;
        }

        // se um estado for falso, retorna falso
        if (expr.operator.type === tokenTypes.E) {
            if (!this.eVerdadeiro(esquerda)) return esquerda;
        }

        return this.avaliar(expr.right);
    }

    visitIfStmt(stmt) {
        if (this.eVerdadeiro(this.avaliar(stmt.condition))) {
            this.executar(stmt.thenBranch);
            return null;
        }

        for (let i = 0; i < stmt.elifBranches.length; i++) {
            const atual = stmt.elifBranches[i];

            if (this.eVerdadeiro(this.avaliar(atual.condition))) {
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
        if (stmt.initializer !== null) {
            this.avaliar(stmt.initializer);
        }
        while (true) {
            if (stmt.condition !== null) {
                if (!this.eVerdadeiro(this.avaliar(stmt.condition))) {
                    break;
                }
            }

            try {
                this.executar(stmt.body);
            } catch (erro) {
                if (erro instanceof BreakException) {
                    break;
                } else if (erro instanceof ContinueException) {
                } else {
                    throw erro;
                }
            }

            if (stmt.increment !== null) {
                this.avaliar(stmt.increment);
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
        let switchCondition = this.avaliar(stmt.condition);
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

    visitTryStmt(stmt) {
        try {
            let sucesso = true;
            try {
                this.executeBlock(stmt.tryBranch, new Environment(this.environment));
            } catch (erro) {
                sucesso = false;

                if (stmt.catchBranch !== null) {
                    this.executeBlock(
                        stmt.catchBranch,
                        new Environment(this.environment)
                    );
                }
            }

            if (sucesso && stmt.elseBranch !== null) {
                this.executeBlock(stmt.elseBranch, new Environment(this.environment));
            }
        } finally {
            if (stmt.finallyBranch !== null)
                this.executeBlock(
                    stmt.finallyBranch,
                    new Environment(this.environment)
                );
        }
    }

    visitWhileStmt(stmt) {
        while (this.eVerdadeiro(this.avaliar(stmt.condition))) {
            try {
                this.executar(stmt.body);
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
        const caminhoRelativo = this.avaliar(stmt.path);
        const caminhoTotal = path.join(this.diretorioBase, caminhoRelativo);
        const pastaTotal = path.dirname(caminhoTotal);
        const nomeArquivo = path.basename(caminhoTotal);

        let data = checkStdLib(caminhoRelativo);
        if (data !== null) return data;

        try {
            if (!fs.existsSync(caminhoTotal)) {
                throw new RuntimeError(
                    stmt.closeBracket,
                    "Não foi possível encontrar arquivo importado."
                );
            }
        } catch (erro) {
            throw new RuntimeError(stmt.closeBracket, "Não foi possível ler o arquivo.");
        }

        data = fs.readFileSync(caminhoTotal).toString();

        const egua = new Egua.Egua(nomeArquivo);
        const interpretador = new Interpreter(egua, pastaTotal);

        egua.run(data, interpretador);

        let exportar = interpretador.globals.values.exports;

        const eDicionario = objeto => objeto.constructor === Object;

        if (eDicionario(exportar)) {
            let novoModulo = new EguaModule();

            let chaves = Object.keys(exportar);
            for (let i = 0; i < chaves.length; i++) {
                novoModulo[chaves[i]] = exportar[chaves[i]];
            }

            return novoModulo;
        }

        return exportar;
    }

    visitPrintStmt(stmt) {
        const valor = this.avaliar(stmt.expression);
        console.log(this.stringify(valor));
        return null;
    }

    executeBlock(statements, environment) {
        let anterior = this.environment;
        try {
            this.environment = environment;

            for (let i = 0; i < statements.length; i++) {
                this.executar(statements[i]);
            }
        } finally {
            this.environment = anterior;
        }
    }

    visitBlockStmt(stmt) {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }

    visitVarStmt(stmt) {
        let valor = null;
        if (stmt.initializer !== null) {
            valor = this.avaliar(stmt.initializer);
        }

        this.environment.definirVariavel(stmt.name.lexeme, valor);
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
        if (stmt.value != null) valor = this.avaliar(stmt.value);

        throw new ReturnException(valor);
    }

    visitFunctionExpr(expr) {
        return new EguaFunction(null, expr, this.environment, false);
    }

    visitAssignsubscriptExpr(expr) {
        let objeto = this.avaliar(expr.obj);
        let indice = this.avaliar(expr.index);
        let value = this.avaliar(expr.value);

        if (Array.isArray(objeto)) {
            if (indice < 0 && objeto.length !== 0) {
                while (indice < 0) {
                    indice += objeto.length;
                }
            }

            while (objeto.length < indice) {
                objeto.push(null);
            }

            objeto[indice] = value;
        } else if (
            objeto.constructor === Object ||
            objeto instanceof EguaInstance ||
            objeto instanceof EguaFunction ||
            objeto instanceof EguaClass ||
            objeto instanceof EguaModule
        ) {
            objeto[indice] = value;
        }

        else {
            throw new RuntimeError(
                expr.obj.name,
                "Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita."
            );
        }
    }

    visitSubscriptExpr(expressao) {
        const objeto = this.avaliar(expressao.callee);

        let indice = this.avaliar(expressao.index);
        if (Array.isArray(objeto)) {
            if (!Number.isInteger(indice)) {
                throw new RuntimeError(
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
                throw new RuntimeError(expressao.closeBracket, "Índice do vetor fora do intervalo.");
            }
            return objeto[indice];
        }

        else if (
            objeto.constructor === Object ||
            objeto instanceof EguaInstance ||
            objeto instanceof EguaFunction ||
            objeto instanceof EguaClass ||
            objeto instanceof EguaModule
        ) {
            return objeto[indice] || null;
        }

        else if (typeof objeto === "string") {
            if (!Number.isInteger(indice)) {
                throw new RuntimeError(
                    expressao.closeBracket,
                    "Somente inteiros podem ser usados para indexar um vetor."
                );
            }

            if (indice < 0 && objeto.length !== 0) {
                while (indice < 0) {
                    indice += obj.length;
                }
            }

            if (indice >= objeto.length) {
                throw new RuntimeError(expressao.closeBracket, "Índice fora do tamanho.");
            }
            return objeto.charAt(indice);
        }

        else {
            throw new RuntimeError(
                expressao.callee.name,
                "Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita."
            );
        }
    }

    visitSetExpr(expr) {
        const objeto = this.avaliar(expr.object);

        if (!(objeto instanceof EguaInstance) && objeto.constructor !== Object) {
            throw new RuntimeError(
                expr.object.name,
                "Somente instâncias e dicionários podem possuir campos."
            );
        }

        const valor = this.avaliar(expr.value);
        if (objeto instanceof EguaInstance) {
            objeto.set(expr.name, valor);
            return valor;
        } else if (objeto.constructor === Object) {
            objeto[expr.name.lexeme] = valor;
        }
    }

    visitFunctionStmt(stmt) {
        const funcao = new EguaFunction(
            stmt.name.lexeme,
            stmt.func,
            this.environment,
            false
        );
        this.environment.definirVariavel(stmt.name.lexeme, funcao);
    }

    visitClassStmt(stmt) {
        let superClasse = null;
        if (stmt.superclass !== null) {
            superclass = this.avaliar(stmt.superclass);
            if (!(superclass instanceof EguaClass)) {
                throw new RuntimeError(
                    stmt.superclass.name,
                    "Superclasse precisa ser uma classe."
                );
            }
        }

        this.environment.definirVariavel(stmt.name.lexeme, null);

        if (stmt.superclass !== null) {
            this.environment = new Environment(this.environment);
            this.environment.definirVariavel("super", superClasse);
        }

        let metodos = {};
        let definirMetodos = stmt.methods;
        for (let i = 0; i < stmt.methods.length; i++) {
            let metodoAtual = definirMetodos[i];
            let eInicializado = metodoAtual.name.lexeme === "construtor";
            const funcao = new EguaFunction(
                metodoAtual.name.lexeme,
                metodoAtual.func,
                this.environment,
                eInicializado
            );
            metodos[metodoAtual.name.lexeme] = funcao;
        }

        const criado = new EguaClass(stmt.name.lexeme, superClasse, metodos);

        if (superClasse !== null) {
            this.environment = this.environment.enclosing;
        }

        this.environment.atribuirVariavel(stmt.name, criado);
        return null;
    }

    visitGetExpr(expr) {
        let object = this.avaliar(expr.object);
        if (object instanceof EguaInstance) {
            return object.get(expr.name) || null;
        } else if (object.constructor === Object) {
            return object[expr.name.lexeme] || null;
        } else if (object instanceof EguaModule) {
            return object[expr.name.lexeme] || null;
        }

        throw new RuntimeError(
            expr.name,
            "Você só pode acessar métodos do objeto e dicionários."
        );
    }

    visitThisExpr(expr) {
        return this.procurarVariavel(expr.keyword, expr);
    }

    visitDictionaryExpr(expr) {
        let dict = {};
        for (let i = 0; i < expr.keys.length; i++) {
            dict[this.avaliar(expr.keys[i])] = this.avaliar(expr.values[i]);
        }
        return dict;
    }

    visitArrayExpr(expr) {
        let values = [];
        for (let i = 0; i < expr.values.length; i++) {
            values.push(this.avaliar(expr.values[i]));
        }
        return values;
    }

    visitSuperExpr(expr) {
        const distancia = this.locals.get(expr);
        const superClasse = this.environment.obterVariavelEm(distancia, "super");

        const objeto = this.environment.obterVariavelEm(distancia - 1, "isto");

        let metodo = superClasse.findMethod(expr.method.lexeme);

        if (metodo === undefined) {
            throw new RuntimeError(
                expr.method,
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

    executar(stmt) {
        stmt.aceitar(this);
    }

    interpretar(declaracoes) {
        try {
            for (let i = 0; i < declaracoes.length; i++) {
                this.executar(declaracoes[i]);
            }
        } catch (erro) {
            this.Egua.runtimeError(erro);
        }
    }
};
