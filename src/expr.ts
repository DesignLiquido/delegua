export class Expr {
    aceitar(visitor: any) { }
}

export class Atribuir extends Expr {
    nome: any;
    valor: any;

    constructor(nome: any, valor: any) {
        super();
        this.nome = nome;
        this.valor = valor;
    }

    aceitar(visitor: any) {
        return visitor.visitAssignExpr(this);
    }
}

export class Binario extends Expr {
    esquerda: any;
    operador: any;
    direita: any;

    constructor(esquerda: any, operador: any, direita: any) {
        super();
        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitor: any) {
        return visitor.visitBinaryExpr(this);
    }
}

export class Funcao extends Expr {
    parametros: any;
    corpo: any;

    constructor(parametros: any, corpo: any) {
        super();
        this.parametros = parametros;
        this.corpo = corpo;
    }

    aceitar(visitor: any) {
        return visitor.visitFunctionExpr(this);
    }
}

export class Call extends Expr {
    callee: any;
    argumentos: any;
    parentese: any;

    constructor(callee: any, parentese: any, argumentos: any) {
        super();
        this.callee = callee;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    aceitar(visitor: any) {
        return visitor.visitCallExpr(this);
    }
}

export class Get extends Expr {
    objeto: any;
    nome: any;

    constructor(objeto: any, nome: any) {
        super();
        this.objeto = objeto;
        this.nome = nome;
    }

    aceitar(visitor: any) {
        return visitor.visitGetExpr(this);
    }
}

export class Grouping extends Expr {
    expressao: any;

    constructor(expressao: any) {
        super();
        this.expressao = expressao;
    }

    aceitar(visitor: any) {
        return visitor.visitGroupingExpr(this);
    }
}

export class Literal extends Expr {
    valor: any;

    constructor(valor: any) {
        super();
        this.valor = valor;
    }

    aceitar(visitor: any) {
        return visitor.visitLiteralExpr(this);
    }
}

export class Array extends Expr {
    valores: any;

    constructor(valores: any) {
        super();
        this.valores = valores;
    }

    aceitar(visitor: any) {
        return visitor.visitArrayExpr(this);
    }
}

export class Dicionario extends Expr {
    chaves: any;
    valores: any;

    constructor(chaves: any, valores: any) {
        super();
        this.chaves = chaves;
        this.valores = valores;
    }

    aceitar(visitor: any) {
        return visitor.visitDictionaryExpr(this);
    }
}

export class Subscript extends Expr {
    callee: any;
    closeBracket: any;
    indice: any;

    constructor(callee: any, indice: any, closeBracket: any) {
        super();
        this.callee = callee;
        this.indice = indice;
        this.closeBracket = closeBracket;
    }

    aceitar(visitor: any) {
        return visitor.visitSubscriptExpr(this);
    }
}

export class Assignsubscript extends Expr {
    objeto: any;
    valor: any;
    indice: any;

    constructor(objeto: any, indice: any, valor: any) {
        super();
        this.objeto = objeto;
        this.indice = indice;
        this.valor = valor;
    }

    aceitar(visitor: any) {
        return visitor.visitAssignsubscriptExpr(this);
    }
}

export class Logical extends Expr {
    esquerda: any;
    operador: any;
    direita: any;

    constructor(esquerda: any, operador: any, direita: any) {
        super();
        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitor: any) {
        return visitor.visitLogicalExpr(this);
    }
}

export class Set extends Expr {
    objeto: any;
    nome: any;
    valor: any;

    constructor(objeto: any, nome: any, valor: any) {
        super();
        this.objeto = objeto;
        this.nome = nome;
        this.valor = valor;
    }

    aceitar(visitor: any) {
        return visitor.visitSetExpr(this);
    }
}

export class Super extends Expr {
    palavraChave: any;
    metodo: any;

    constructor(palavraChave: any, metodo: any) {
        super();
        this.palavraChave = palavraChave;
        this.metodo = metodo;
    }

    aceitar(visitor: any) {
        return visitor.visitSuperExpr(this);
    }
}

export class Isto extends Expr {
    palavraChave: any;

    constructor(palavraChave?: any) {
        super();
        this.palavraChave = palavraChave;
    }

    aceitar(visitor: any) {
        return visitor.visitThisExpr(this);
    }
}

export class Unario extends Expr {
    operador: any;
    direita: any;

    constructor(operador: any, direita: any) {
        super();
        this.operador = operador;
        this.direita = direita;
    }

    aceitar(visitor: any) {
        return visitor.visitUnaryExpr(this);
    }
}

export class Variavel extends Expr {
    nome: any;

    constructor(nome: any) {
        super();
        this.nome = nome;
    }

    aceitar(visitor: any) {
        return visitor.visitVariableExpr(this);
    }
}
