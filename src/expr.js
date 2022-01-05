class Expr {
    aceitar(visitor) {}
}

class Assign extends Expr {
    constructor(nome, valor) {
        super();
        this.nome = nome;
        this.valor = valor;
    }

    aceitar(visitor) {
        return visitor.visitAssignExpr(this);
    }
}

class Binary extends Expr {
    constructor(esquerda, operador, direita) {
        super();
        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}

class Funcao extends Expr {
    constructor(parametros, corpo) {
        super();
        this.parametros = parametros;
        this.corpo = corpo;
    }

    aceitar(visitor) {
        return visitor.visitFunctionExpr(this);
    }
}

class Call extends Expr {
    constructor(callee, paren, argumentos) {
        super();
        this.callee = callee;
        this.paren = paren;
        this.argumentos = argumentos;
    }

    aceitar(visitor) {
        return visitor.visitCallExpr(this);
    }
}

class Get extends Expr {
    constructor(objeto, nome) {
        super();
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitor) {
        return visitor.visitGetExpr(this);
    }
}

class Grouping extends Expr {
    constructor(expression) {
        super();
        this.expression = expression;
    }

    aceitar(visitor) {
        return visitor.visitGroupingExpr(this);
    }
}

class Literal extends Expr {
    constructor(valor) {
        super();
        this.valor = valor;
    }

    aceitar(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}

class Array extends Expr {
    constructor(valores) {
        super();
        this.valores = valores;
    }

    aceitar(visitor) {
        return visitor.visitArrayExpr(this);
    }
}

class Dictionary extends Expr {
    constructor(chaves, valores) {
        super();
        this.chaves = chaves;
        this.valores = valores;
    }

    aceitar(visitor) {
        return visitor.visitDictionaryExpr(this);
    }
}

class Subscript extends Expr {
    constructor(callee, indice, closeBracket) {
        super();
        this.callee = callee;
        this.indice = indice;
        this.closeBracket = closeBracket;
    }

    aceitar(visitor) {
        return visitor.visitSubscriptExpr(this);
    }
}

class Assignsubscript extends Expr {
    constructor(objeto, indice, valor) {
        super();
        this.objeto = objeto;
        this.indice = indice;
        this.valor = valor;
    }

    aceitar(visitor) {
        return visitor.visitAssignsubscriptExpr(this);
    }
}

class Logical extends Expr {
    constructor(esquerda, operador, direita) {
        super();
        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitor) {
        return visitor.visitLogicalExpr(this);
    }
}

class Set extends Expr {
    constructor(objeto, nome, valor) {
        super();
        this.objeto = objeto;
        this.nome = nome;
        this.valor = valor;
    }

    aceitar(visitor) {
        return visitor.visitSetExpr(this);
    }
}

class Super extends Expr {
    constructor(palavraChave, metodo) {
        super();
        this.palavraChave = palavraChave;
        this.metodo = metodo;
    }

    aceitar(visitor) {
        return visitor.visitSuperExpr(this);
    }
}

class Isto extends Expr {
    constructor(palavraChave) {
        super();
        this.palavraChave = palavraChave;
    }

    aceitar(visitor) {
        return visitor.visitThisExpr(this);
    }
}

class Unary extends Expr {
    constructor(operador, direita) {
        super();
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}

class Variable extends Expr {
    constructor(nome) {
        super();
        this.nome = nome;
    }

    aceitar(visitor) {
        return visitor.visitVariableExpr(this);
    }
}

module.exports = {
    Assign,
    Binary,
    Funcao,
    Call,
    Get,
    Grouping,
    Literal,
    Array,
    Dictionary,
    Subscript,
    Assignsubscript,
    Logical,
    Set,
    Super,
    Isto,
    Unary,
    Variable
};