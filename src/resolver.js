class ResolverError extends Error {
    constructor(mensagem) {
        super(mensagem);
        this.mensagem = mensagem;
    }
}

class Stack {
    constructor() {
        this.stack = [];
    }

    push(item) {
        this.stack.push(item);
    }

    isEmpty() {
        return this.stack.length === 0;
    }

    peek() {
        if (this.isEmpty()) throw new Error("Pilha vazia.");
        return this.stack[this.stack.length - 1];
    }

    pop() {
        if (this.isEmpty()) throw new Error("Pilha vazia.");
        return this.stack.pop();
    }
}

const FunctionType = {
    NONE: "NONE",
    FUNCAO: "FUNCAO",
    CONSTRUTOR: "CONSTRUTOR",
    METHOD: "METHOD"
};

const ClassType = {
    NONE: "NONE",
    CLASSE: "CLASSE",
    SUBCLASS: "SUBCLASS"
};

const LoopType = {
    NONE: "NONE",
    ENQUANTO: "ENQUANTO",
    ESCOLHA: "ESCOLHA",
    PARA: "PARA",
    FAZER: "FAZER"
};

/**
 * O Resolvedor (Resolver) é responsável por catalogar todos os identificadores complexos, como por exemplo: funções, classes, variáveis, 
 * e delimitar os escopos onde esses identificadores existem. 
 * Exemplo: uma classe A declara dois métodos chamados M e N. Todas as variáveis declaradas dentro de M não podem ser vistas por N, e vice-versa.
 * No entanto, todas as variáveis declaradas dentro da classe A podem ser vistas tanto por M quanto por N.
 */
module.exports = class Resolver {
    constructor(interpretador, Delegua) {
        this.interpretador = interpretador;
        this.Delegua = Delegua;
        this.escopos = new Stack();

        this.FuncaoAtual = FunctionType.NONE;
        this.ClasseAtual = ClassType.NONE;
        this.cicloAtual = ClassType.NONE;
    }

    definir(nome) {
        if (this.escopos.isEmpty()) return;
        this.escopos.peek()[nome.lexeme] = true;
    }

    declarar(nome) {
        if (this.escopos.isEmpty()) return;
        let escopo = this.escopos.peek();
        if (escopo.hasOwnProperty(nome.lexeme))
            this.Delegua.error(
                nome,
                "Variável com esse nome já declarada neste escopo."
            );
            escopo[nome.lexeme] = false;
    }

    inicioDoEscopo() {
        this.escopos.push({});
    }

    finalDoEscopo() {
        this.escopos.pop();
    }

    resolver(declaracoes) {
        if (Array.isArray(declaracoes)) {
            for (let i = 0; i < declaracoes.length; i++) {
                declaracoes[i].aceitar(this);
            }
        } else {
            declaracoes.aceitar(this);
        }
    }

    resolverLocal(expr, nome) {
        for (let i = this.escopos.stack.length - 1; i >= 0; i--) {
            if (this.escopos.stack[i].hasOwnProperty(nome.lexeme)) {                
                this.interpretador.resolver(expr, this.escopos.stack.length - 1 - i);
            }
        }
    }

    visitBlockStmt(stmt) {
        this.inicioDoEscopo();
        this.resolver(stmt.declaracoes);
        this.finalDoEscopo();
        return null;
    }

    visitVariableExpr(expr) {
        if (
            !this.escopos.isEmpty() &&
            this.escopos.peek()[expr.nome.lexeme] === false
        ) {
            throw new ResolverError(
                "Não é possível ler a variável local em seu próprio inicializador."
            );
        }
        this.resolverLocal(expr, expr.nome);
        return null;
    }

    visitVarStmt(stmt) {
        this.declarar(stmt.nome);
        if (stmt.inicializador !== null) {
            this.resolver(stmt.inicializador);
        }
        this.definir(stmt.nome);
        return null;
    }

    visitAssignExpr(expr) {
        this.resolver(expr.valor);
        this.resolverLocal(expr, expr.nome);
        return null;
    }

    resolverFuncao(funcao, funcType) {
        let enclosingFunc = this.FuncaoAtual;
        this.FuncaoAtual = funcType;

        this.inicioDoEscopo();
        let parametros = funcao.parametros;
        for (let i = 0; i < parametros.length; i++) {
            this.declarar(parametros[i]["nome"]);
            this.definir(parametros[i]["nome"]);
        }
        this.resolver(funcao.corpo);
        this.finalDoEscopo();

        this.FuncaoAtual = enclosingFunc;
    }

    visitFunctionStmt(stmt) {
        this.declarar(stmt.nome);
        this.definir(stmt.nome);

        this.resolverFuncao(stmt.funcao, FunctionType.FUNCAO);
        return null;
    }

    visitFunctionExpr(stmt) {
        this.resolverFuncao(stmt, FunctionType.FUNCAO);
        return null;
    }

    visitTryStmt(stmt) {
        this.resolver(stmt.tryBranch);

        if (stmt.catchBranch !== null) this.resolver(stmt.catchBranch);
        if (stmt.elseBranch !== null) this.resolver(stmt.elseBranch);
        if (stmt.finallyBranch !== null) this.resolver(stmt.finallyBranch);
    }

    visitClassStmt(stmt) {
        let enclosingClass = this.ClasseAtual;
        this.ClasseAtual = ClassType.CLASSE;

        this.declarar(stmt.nome);
        this.definir(stmt.nome);

        if (
            stmt.superClasse !== null &&
            stmt.nome.lexeme === stmt.superClasse.nome.lexeme
        ) {
            this.Delegua.error("Uma classe não pode herdar de si mesma.");
        }

        if (stmt.superClasse !== null) {
            this.ClasseAtual = ClassType.SUBCLASS;
            this.resolver(stmt.superClasse);
        }

        if (stmt.superClasse !== null) {
            this.inicioDoEscopo();
            this.escopos.peek()["super"] = true;
        }

        this.inicioDoEscopo();
        this.escopos.peek()["isto"] = true;

        let metodos = stmt.metodos;
        for (let i = 0; i < metodos.length; i++) {
            let declaracao = FunctionType.METHOD;

            if (metodos[i].nome.lexeme === "isto") {
                declaracao = FunctionType.CONSTRUTOR;
            }

            this.resolverFuncao(metodos[i].funcao, declaracao);
        }

        this.finalDoEscopo();

        if (stmt.superClasse !== null) this.finalDoEscopo();

        this.ClasseAtual = enclosingClass;
        return null;
    }

    visitSuperExpr(expr) {
        if (this.ClasseAtual === ClassType.NONE) {
            this.Delegua.error(expr.palavraChave, "Não pode usar 'super' fora de uma classe.");
        } else if (this.ClasseAtual !== ClassType.SUBCLASS) {
            this.Delegua.error(
                expr.palavraChave,
                "Não se usa 'super' numa classe sem SuperClasse."
            );
        }

        this.resolverLocal(expr, expr.palavraChave);
        return null;
    }

    visitGetExpr(expr) {
        this.resolver(expr.objeto);
        return null;
    }

    visitExpressionStmt(stmt) {
        this.resolver(stmt.expressao);
        return null;
    }

    visitIfStmt(stmt) {
        this.resolver(stmt.condicao);
        this.resolver(stmt.thenBranch);

        for (let i = 0; i < stmt.elifBranches.length; i++) {
            this.resolver(stmt.elifBranches[i].condicao);
            this.resolver(stmt.elifBranches[i].branch);
        }

        if (stmt.elseBranch !== null) this.resolver(stmt.elseBranch);
        return null;
    }

    visitImportStmt(stmt) {
        this.resolver(stmt.caminho);
    }

    visitPrintStmt(stmt) {
        this.resolver(stmt.expressao);
    }

    visitReturnStmt(stmt) {
        if (this.FuncaoAtual === FunctionType.NONE) {
            this.Delegua.error(stmt.palavraChave, "Não é possível retornar do código do escopo superior.");
        }
        if (stmt.valor !== null) {
            if (this.FuncaoAtual === FunctionType.CONSTRUTOR) {
                this.Delegua.error(
                    stmt.palavraChave,
                    "Não pode retornar o valor do construtor."
                );
            }
            this.resolver(stmt.valor);
        }
        return null;
    }

    visitSwitchStmt(stmt) {
        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.ESCOLHA;

        let branches = stmt.branches;
        let defaultBranch = stmt.defaultBranch;

        for (let i = 0; i < branches.length; i++) {
            this.resolver(branches[i]["stmts"]);
        }

        if (defaultBranch !== null) this.resolver(defaultBranch["stmts"]);

        this.cicloAtual = enclosingType;
    }

    visitWhileStmt(stmt) {
        this.resolver(stmt.condicao);
        this.resolver(stmt.corpo);
        return null;
    }

    visitForStmt(stmt) {
        if (stmt.inicializador !== null) {
            this.resolver(stmt.inicializador);
        }
        if (stmt.condicao !== null) {
            this.resolver(stmt.condicao);
        }
        if (stmt.incrementar !== null) {
            this.resolver(stmt.incrementar);
        }

        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.ENQUANTO;
        this.resolver(stmt.corpo);
        this.cicloAtual = enclosingType;

        return null;
    }

    visitDoStmt(stmt) {
        this.resolver(stmt.whileCondition);

        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.FAZER;
        this.resolver(stmt.doBranch);
        this.cicloAtual = enclosingType;
        return null;
    }

    visitBinaryExpr(expr) {
        this.resolver(expr.esquerda);
        this.resolver(expr.direita);
        return null;
    }

    visitCallExpr(expr) {
        this.resolver(expr.callee);

        let argumentos = expr.argumentos;
        for (let i = 0; i < argumentos.length; i++) {
            this.resolver(argumentos[i]);
        }

        return null;
    }

    visitGroupingExpr(expr) {
        this.resolver(expr.expressao);
        return null;
    }

    visitDictionaryExpr(expr) {
        for (let i = 0; i < expr.chaves.length; i++) {
            this.resolver(expr.chaves[i]);
            this.resolver(expr.valores[i]);
        }
        return null;
    }

    visitArrayExpr(expr) {
        for (let i = 0; i < expr.valores.length; i++) {
            this.resolver(expr.valores[i]);
        }
        return null;
    }

    visitSubscriptExpr(expr) {
        this.resolver(expr.callee);
        this.resolver(expr.indice);
        return null;
    }

    visitContinueStmt(stmt) {
        return null;
    }

    visitBreakStmt(stmt) {
        return null;
    }

    visitAssignsubscriptExpr(expr) {
        return null;
    }

    visitLiteralExpr(expr) {
        return null;
    }

    visitLogicalExpr(expr) {
        this.resolver(expr.esquerda);
        this.resolver(expr.direita);
        return null;
    }

    visitUnaryExpr(expr) {
        this.resolver(expr.direita);
        return null;
    }

    visitSetExpr(expr) {
        this.resolver(expr.valor);
        this.resolver(expr.objeto);
        return null;
    }

    visitThisExpr(expr) {
        if (this.ClasseAtual == ClassType.NONE) {
            this.Delegua.error(expr.palavraChave, "Não pode usar 'isto' fora da classe.");
        }
        this.resolverLocal(expr, expr.palavraChave);
        return null;
    }
};