export class Stmt {
    aceitar(visitor) { }
}

export class Expressao extends Stmt {
    expressao: any;

    constructor(expressao) {
        super();
        this.expressao = expressao;
    }

    aceitar(visitor: any) {
        return visitor.visitExpressionStmt(this)
    }
}

export class Funcao extends Stmt {
    nome: string;
    funcao: any;

    constructor(nome: any, funcao: any) {
        super();
        this.nome = nome;
        this.funcao = funcao;
    }

    aceitar(visitor: any) {
        return visitor.visitFunctionStmt(this);
    }
}

export class Retorna extends Stmt {
    palavraChave: string;
    valor: any;

    constructor(palavraChave, valor) {
        super();
        this.palavraChave = palavraChave;
        this.valor = valor;
    }

    aceitar(visitor) {
        return visitor.visitReturnStmt(this);
    }
}

export class Classe extends Stmt {
    nome: string;
    superClasse: any;
    metodos: any;

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

export class Block extends Stmt {
    declaracoes: any;

    constructor(declaracoes) {
        super();
        this.declaracoes = declaracoes;
    }

    aceitar(visitor) {
        return visitor.visitBlockStmt(this);
    }
}

export class Escreva extends Stmt {
    expressao: any;

    constructor(expressao) {
        super();
        this.expressao = expressao;
    }

    aceitar(visitor) {
        return visitor.visitPrintStmt(this);
    }
}

export class Importar extends Stmt {
    caminho: string;
    closeBracket: any;

    constructor(caminho, closeBracket) {
        super();
        this.caminho = caminho;
        this.closeBracket = closeBracket;
    }

    aceitar(visitor) {
        return visitor.visitImportStmt(this);
    }
}

export class Fazer extends Stmt {
    doBranch: any;
    whileCondition: any;

    constructor(doBranch, whileCondition) {
        super();
        this.doBranch = doBranch;
        this.whileCondition = whileCondition;
    }

    aceitar(visitor) {
        return visitor.visitDoStmt(this);
    }
}

export class Enquanto extends Stmt {
    condicao: any;
    corpo: any;

    constructor(condicao, corpo) {
        super();
        this.condicao = condicao;
        this.corpo = corpo;
    }

    aceitar(visitor) {
        return visitor.visitWhileStmt(this);
    }
}

export class Para extends Stmt {
    inicializador: any;
    condicao: any;
    incrementar: any;
    corpo: any;

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

export class Tente extends Stmt {
    tryBranch: any;
    catchBranch: any;
    elseBranch: any;
    finallyBranch: any;

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

export class Se extends Stmt {
    condicao: any;
    thenBranch: any;
    elifBranches: any;
    elseBranch: any;

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

export class Escolha extends Stmt {
    condicao: any;
    branches: any;
    defaultBranch: any;

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

export class Pausa extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitor) {
        return visitor.visitBreakStmt(this);
    }
}

export class Continua extends Stmt {
    constructor() {
        super();
    }

    aceitar(visitor) {
        return visitor.visitContinueStmt(this);
    }
}

export class Var extends Stmt {
    nome: any;
    inicializador: any;

    constructor(nome: any, inicializador: any) {
        super();
        this.nome = nome;
        this.inicializador = inicializador;
    }

    aceitar(visitor: any) {
        return visitor.visitVarStmt(this);
    }
}
