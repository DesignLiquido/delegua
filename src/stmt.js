class Stmt {
    aceitar(visitor) { }
}

class Expression extends Stmt {
    constructor(expression) {
        super();
        this.expression = expression;
    }

    aceitar(visitor) {
        return visitor.visitExpressionStmt(this)
    }
}

class Funcao extends Stmt {
    constructor(nome, funcao) {
        super();
        this.nome = nome;
        this.funcao = funcao;
    }

    aceitar(visitor) {
        return visitor.visitFunctionStmt(this);
    }
}

class Retorna extends Stmt {
    constructor(palavraChave, valor) {
        super();
        this.palavraChave = palavraChave;
        this.valor = valor;
    }

    aceitar(visitor) {
        return visitor.visitReturnStmt(this);
    }
}

class Classe extends Stmt {
    constructor(nome, superClasse, metodos) {
        super();
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    aceitar(visitor) {
        return visitor.visitClassStmt(this);
    }
}

class Block extends Stmt {
    constructor(declaracoes) {
        super();
        this.declaracoes = declaracoes;
    }

    aceitar(visitor) {
        return visitor.visitBlockStmt(this);
    }
}

class Escreva extends Stmt {
    constructor(expression) {
        super();
        this.expression = expression;
    }

    aceitar(visitor) {
        return visitor.visitPrintStmt(this);
    }
}

class Importar extends Stmt {
    constructor(caminho, closeBracket) {
        super();
        this.caminho = caminho;
        this.closeBracket = closeBracket;
    }

    aceitar(visitor) {
        return visitor.visitImportStmt(this);
    }
}

class Fazer extends Stmt {
    constructor(doBranch, whileCondition) {
      super();
      this.doBranch = doBranch;
      this.whileCondition = whileCondition;
    }
  
    aceitar(visitor) {
      return visitor.visitDoStmt(this);
    }
  }

class Enquanto extends Stmt {
    constructor(condicao, corpo) {
        super();
        this.condicao = condicao;
        this.corpo = corpo;
    }

    aceitar(visitor) {
        return visitor.visitWhileStmt(this);
    }
}

class Para extends Stmt {
    constructor(inicializador, condicao, incrementar, corpo) {
        super();
        this.inicializador = inicializador;
        this.condicao = condicao;
        this.incrementar = incrementar;
        this.corpo = corpo;
    }

    aceitar(visitor) {
        return visitor.visitForStmt(this);
    }
}

class Tente extends Stmt {
    constructor(tryBranch, catchBranch, elseBranch, finallyBranch) {
        super();
        this.tryBranch = tryBranch;
        this.catchBranch = catchBranch;
        this.elseBranch = elseBranch;
        this.finallyBranch = finallyBranch;
    }

    aceitar(visitor) {
        return visitor.visitTryStmt(this);
    }
}

class Se extends Stmt {
    constructor(condicao, thenBranch, elifBranches, elseBranch) {
        super();
        this.condicao = condicao;
        this.thenBranch = thenBranch;
        this.elifBranches = elifBranches;
        this.elseBranch = elseBranch;
    }

    aceitar(visitor) {
        return visitor.visitIfStmt(this);
    }
}

class Escolha extends Stmt {
    constructor(condicao, branches, defaultBranch) {
        super();
        this.condicao = condicao;
        this.branches = branches;
        this.defaultBranch = defaultBranch;
    }

    aceitar(visitor) {
        return visitor.visitSwitchStmt(this);
    }
}

class Pausa extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitor) {
        return visitor.visitBreakStmt(this);
    }
}

class Continua extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitor) {
        return visitor.visitContinueStmt(this);
    }
}

class Var extends Stmt {
    constructor(nome, inicializador) {
        super();
        this.nome = nome;
        this.inicializador = inicializador;
    }

    aceitar(visitor) {
        return visitor.visitVarStmt(this);
    }
}

module.exports = {
    Expression,
    Funcao,
    Retorna,
    Classe,
    Block,
    Escreva,
    Importar,
    Fazer,
    Enquanto,
    Para,
    Tente,
    Se,
    Escolha,
    Pausa,
    Continua,
    Var
};