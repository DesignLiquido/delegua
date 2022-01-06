const tiposDeSimbolos = require("./tiposDeSimbolos.js");
const Expr = require("./expr.js");
const Stmt = require("./stmt.js");

class ParserError extends Error { }

/**
 * O avaliador sintático (Parser) é responsável por transformar tokens do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 */
module.exports = class Parser {
    constructor(simbolos, Delegua) {
        this.simbolos = simbolos;
        this.Delegua = Delegua;

        this.atual = 0;
        this.ciclos = 0;
    }

    sincronizar() {
        this.avancar();

        while (!this.estaNoFinal()) {
            if (this.voltar().tipo === tiposDeSimbolos.SEMICOLON) return;

            switch (this.peek().tipo) {
                case tiposDeSimbolos.CLASSE:
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.VAR:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.ESCREVA:
                case tiposDeSimbolos.RETORNA:
                    return;
            }

            this.avancar();
        }
    }

    erro(token, mensagemDeErro) {
        this.Delegua.erro(token, mensagemDeErro);
        return new ParserError();
    }

    consumir(tipo, mensagemDeErro) {
        if (this.verificar(tipo)) return this.avancar();
        else throw this.erro(this.peek(), mensagemDeErro);
    }

    verificar(tipo) {
        if (this.estaNoFinal()) return false;
        return this.peek().tipo === tipo;
    }

    verificarProximo(tipo) {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual + 1].tipo === tipo;
    }

    peek() {
        return this.simbolos[this.atual];
    }

    voltar() {
        return this.simbolos[this.atual - 1];
    }

    seek(posicao) {
        return this.simbolos[this.atual + posicao];
    }

    estaNoFinal() {
        return this.peek().tipo === tiposDeSimbolos.EOF;
    }

    avancar() {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.voltar();
    }

    match(...argumentos) {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificar(tipoAtual)) {
                this.avancar();
                return true;
            }
        }

        return false;
    }

    primario() {
        if (this.match(tiposDeSimbolos.SUPER)) {
            const palavraChave = this.voltar();
            this.consumir(tiposDeSimbolos.DOT, "Esperado '.' após 'super'.");
            const metodo = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado nome do método da SuperClasse."
            );
            return new Expr.Super(palavraChave, metodo);
        }
        if (this.match(tiposDeSimbolos.LEFT_SQUARE_BRACKET)) {
            const valores = [];
            if (this.match(tiposDeSimbolos.RIGHT_SQUARE_BRACKET)) {
                return new Expr.Array([]);
            }
            while (!this.match(tiposDeSimbolos.RIGHT_SQUARE_BRACKET)) {
                const valor = this.atribuir();
                valores.push(valor);
                if (this.peek().tipo !== tiposDeSimbolos.RIGHT_SQUARE_BRACKET) {
                    this.consumir(
                        tiposDeSimbolos.COMMA,
                        "Esperado vírgula antes da próxima expressão."
                    );
                }
            }
            return new Expr.Array(valores);
        }
        if (this.match(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            const chaves = [];
            const valores = [];
            if (this.match(tiposDeSimbolos.CHAVE_DIREITA)) {
                return new Expr.Dicionario([], []);
            }
            while (!this.match(tiposDeSimbolos.CHAVE_DIREITA)) {
                let chave = this.atribuir();
                this.consumir(
                    tiposDeSimbolos.COLON,
                    "Esperado ':' entre chave e valor."
                );
                let valor = this.atribuir();

                chaves.push(chave);
                valores.push(valor);

                if (this.peek().tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                    this.consumir(
                        tiposDeSimbolos.COMMA,
                        "Esperado vírgula antes da próxima expressão."
                    );
                }
            }
            return new Expr.Dicionario(chaves, valores);
        }
        if (this.match(tiposDeSimbolos.FUNCAO)) return this.corpoDaFuncao("funcao");
        if (this.match(tiposDeSimbolos.FALSO)) return new Expr.Literal(false);
        if (this.match(tiposDeSimbolos.VERDADEIRO)) return new Expr.Literal(true);
        if (this.match(tiposDeSimbolos.NULO)) return new Expr.Literal(null);
        if (this.match(tiposDeSimbolos.ISTO)) return new Expr.Isto(this.voltar());
        if (this.match(tiposDeSimbolos.NUMERO, tiposDeSimbolos.TEXTO)) {
            return new Expr.Literal(this.voltar().literal);
        }
        if (this.match(tiposDeSimbolos.IDENTIFICADOR)) {
            return new Expr.Variavel(this.voltar());
        }
        if (this.match(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            let expr = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
            return new Expr.Grouping(expr);
        }
        if (this.match(tiposDeSimbolos.IMPORTAR)) return this.importStatement();

        throw this.erro(this.peek(), "Esperado expressão.");
    }

    finalizarChamada(callee) {
        const argumentos = [];
        if (!this.verificar(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (argumentos.length >= 255) {
                    error(this.peek(), "Não pode haver mais de 255 argumentos.");
                }
                argumentos.push(this.expressao());
            } while (this.match(tiposDeSimbolos.COMMA));
        }

        const parenteseDireito = this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os argumentos."
        );

        return new Expr.Call(callee, parenteseDireito, argumentos);
    }

    chamar() {
        let expr = this.primario();

        while (true) {
            if (this.match(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expr = this.finalizarChamada(expr);
            } else if (this.match(tiposDeSimbolos.DOT)) {
                let nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do método após '.'."
                );
                expr = new Expr.Get(expr, nome);
            } else if (this.match(tiposDeSimbolos.LEFT_SQUARE_BRACKET)) {
                const indice = this.expressao();
                let closeBracket = this.consumir(
                    tiposDeSimbolos.RIGHT_SQUARE_BRACKET,
                    "Esperado ']' após escrita do indice."
                );
                expr = new Expr.Subscript(expr, indice, closeBracket);
            } else {
                break;
            }
        }

        return expr;
    }

    unario() {
        if (this.match(tiposDeSimbolos.NEGACAO, tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.BIT_NOT)) {
            const operador = this.voltar();
            const direito = this.unario();
            return new Expr.Unary(operador, direito);
        }

        return this.chamar();
    }

    exponent() {
        let expr = this.unario();

        while (this.match(tiposDeSimbolos.STAR_STAR)) {
            const operador = this.voltar();
            const direito = this.unario();
            expr = new Expr.Binary(expr, operador, direito);
        }

        return expr;
    }

    multiplicar() {
        let expr = this.exponent();

        while (this.match(tiposDeSimbolos.SLASH, tiposDeSimbolos.STAR, tiposDeSimbolos.MODULUS)) {
            const operador = this.voltar();
            const direito = this.exponent();
            expr = new Expr.Binary(expr, operador, direito);
        }

        return expr;
    }

    adicionar() {
        let expr = this.multiplicar();

        while (this.match(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)) {
            const operador = this.voltar();
            const direito = this.multiplicar();
            expr = new Expr.Binary(expr, operador, direito);
        }

        return expr;
    }

    bitFill() {
        let expr = this.adicionar();

        while (this.match(tiposDeSimbolos.MENOR_MENOR, tiposDeSimbolos.MAIOR_MAIOR)) {
            const operador = this.voltar();
            const direito = this.adicionar();
            expr = new Expr.Binary(expr, operador, direito);
        }

        return expr;
    }

    bitE() {
        let expr = this.bitFill();

        while (this.match(tiposDeSimbolos.BIT_AND)) {
            const operador = this.voltar();
            const direito = this.bitFill();
            expr = new Expr.Binary(expr, operador, direito);
        }

        return expr;
    }

    bitOu() {
        let expr = this.bitE();

        while (this.match(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)) {
            const operador = this.voltar();
            const direito = this.bitE();
            expr = new Expr.Binary(expr, operador, direito);
        }

        return expr;
    }

    comparar() {
        let expr = this.bitOu();

        while (
            this.match(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.voltar();
            const direito = this.bitOu();
            expr = new Expr.Binary(expr, operador, direito);
        }

        return expr;
    }

    equality() {
        let expr = this.comparar();

        while (this.match(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
            const operador = this.voltar();
            const direito = this.comparar();
            expr = new Expr.Binary(expr, operador, direito);
        }

        return expr;
    }

    em() {
        let expr = this.equality();

        while (this.match(tiposDeSimbolos.EM)) {
            const operador = this.voltar();
            const direito = this.equality();
            expr = new Expr.Logical(expr, operador, direito);
        }

        return expr;
    }

    e() {
        let expr = this.em();

        while (this.match(tiposDeSimbolos.E)) {
            const operador = this.voltar();
            const direito = this.em();
            expr = new Expr.Logical(expr, operador, direito);
        }

        return expr;
    }

    ou() {
        let expr = this.e();

        while (this.match(tiposDeSimbolos.OU)) {
            const operador = this.voltar();
            const direito = this.e();
            expr = new Expr.Logical(expr, operador, direito);
        }

        return expr;
    }

    atribuir() {
        const expr = this.ou();

        if (this.match(tiposDeSimbolos.IGUAL) || this.match(tiposDeSimbolos.MAIS_IGUAL)) {
            const igual = this.voltar();
            const valor = this.atribuir();

            if (expr instanceof Expr.Variavel) {
                const nome = expr.nome;
                return new Expr.Assign(nome, valor);
            } else if (expr instanceof Expr.Get) {
                const get = expr;
                return new Expr.Set(get.objeto, get.nome, valor);
            } else if (expr instanceof Expr.Subscript) {
                return new Expr.Assignsubscript(expr.callee, expr.indice, valor);
            }
            this.erro(igual, "Tarefa de atribuição inválida");
        }

        return expr;
    }

    expressao() {
        return this.atribuir();
    }

    declaracaoMostrar() {
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const valor = this.expressao();

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );
        this.consumir(tiposDeSimbolos.SEMICOLON, "Esperado ';' após o valor.");

        return new Stmt.Escreva(valor);
    }

    expressionStatement() {
        const expr = this.expressao();
        this.consumir(tiposDeSimbolos.SEMICOLON, "Esperado ';' após expressão.");
        return new Stmt.Expressao(expr);
    }

    block() {
        const declaracoes = [];

        while (!this.verificar(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o bloco.");
        return declaracoes;
    }

    declaracaoSe() {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'.");
        const condicao = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do se.");

        const thenBranch = this.statement();

        const elifBranches = [];
        while (this.match(tiposDeSimbolos.SENAOSE)) {
            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'senaose'.");
            let elifCondition = this.expressao();
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' apóes codição do 'senaose."
            );

            const branch = this.statement();

            elifBranches.push({
                condition: elifCondition,
                branch
            });
        }

        let elseBranch = null;
        if (this.match(tiposDeSimbolos.SENAO)) {
            elseBranch = this.statement();
        }

        return new Stmt.Se(condicao, thenBranch, elifBranches, elseBranch);
    }

    whileStatement() {
        try {
            this.ciclos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'enquanto'.");
            const condicao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condicional.");
            const corpo = this.statement();

            return new Stmt.Enquanto(condicao, corpo);
        } finally {
            this.ciclos -= 1;
        }
    }

    forStatement() {
        try {
            this.ciclos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'para'.");

            let inicializador;
            if (this.match(tiposDeSimbolos.SEMICOLON)) {
                inicializador = null;
            } else if (this.match(tiposDeSimbolos.VAR)) {
                inicializador = this.declaracaoDeVariavel();
            } else {
                inicializador = this.expressionStatement();
            }

            let condicao = null;
            if (!this.verificar(tiposDeSimbolos.SEMICOLON)) {
                condicao = this.expressao();
            }

            this.consumir(
                tiposDeSimbolos.SEMICOLON,
                "Esperado ';' após valores da condicional"
            );

            let incrementar = null;
            if (!this.verificar(tiposDeSimbolos.PARENTESE_DIREITO)) {
                incrementar = this.expressao();
            }

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após cláusulas");

            const corpo = this.statement();

            return new Stmt.Para(inicializador, condicao, incrementar, corpo);
        } finally {
            this.ciclos -= 1;
        }
    }

    breakStatement() {
        if (this.ciclos < 1) {
            this.erro(this.voltar(), "'pausa' deve estar dentro de um loop.");
        }

        this.consumir(tiposDeSimbolos.SEMICOLON, "Esperado ';' após 'pausa'.");
        return new Stmt.Pausa();
    }

    declaracaoContinue() {
        if (this.ciclos < 1) {
            this.erro(this.voltar(), "'continua' precisa estar em um laço de repetição.");
        }

        this.consumir(tiposDeSimbolos.SEMICOLON, "Esperado ';' após 'continua'.");
        return new Stmt.Continua();
    }

    declaracaoRetorna() {
        const palavraChave = this.voltar();
        let valor = null;

        if (!this.verificar(tiposDeSimbolos.SEMICOLON)) {
            valor = this.expressao();
        }

        this.consumir(tiposDeSimbolos.SEMICOLON, "Esperado ';' após o retorno.");
        return new Stmt.Retorna(palavraChave, valor);
    }

    declaracaoEscolha() {
        try {
            this.ciclos += 1;

            this.consumir(
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                "Esperado '{' após 'escolha'."
            );
            const condicao = this.expressao();
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado '}' após a condição de 'escolha'."
            );
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' antes do escopo do 'escolha'."
            );

            const branches = [];
            let defaultBranch = null;
            while (!this.match(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
                if (this.match(tiposDeSimbolos.CASO)) {
                    let branchConditions = [this.expressao()];
                    this.consumir(
                        tiposDeSimbolos.COLON,
                        "Esperado ':' após o 'caso'."
                    );

                    while (this.verificar(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        branchConditions.push(this.expressao());
                        this.consumir(
                            tiposDeSimbolos.COLON,
                            "Esperado ':' após declaração do 'caso'."
                        );
                    }

                    const stmts = [];
                    do {
                        stmts.push(this.statement());
                    } while (
                        !this.verificar(tiposDeSimbolos.CASO) &&
                        !this.verificar(tiposDeSimbolos.PADRAO) &&
                        !this.verificar(tiposDeSimbolos.CHAVE_DIREITA)
                    );

                    branches.push({
                        conditions: branchConditions,
                        stmts
                    });
                } else if (this.match(tiposDeSimbolos.PADRAO)) {
                    if (defaultBranch !== null)
                        throw new ParserError(
                            "Você só pode ter um 'padrao' em cada declaração de 'escolha'."
                        );

                    this.consumir(
                        tiposDeSimbolos.COLON,
                        "Esperado ':' após declaração do 'padrao'."
                    );

                    const stmts = [];
                    do {
                        stmts.push(this.statement());
                    } while (
                        !this.verificar(tiposDeSimbolos.CASO) &&
                        !this.verificar(tiposDeSimbolos.PADRAO) &&
                        !this.verificar(tiposDeSimbolos.CHAVE_DIREITA)
                    );

                    defaultBranch = {
                        stmts
                    };
                }
            }

            return new Stmt.Escolha(condicao, branches, defaultBranch);
        } finally {
            this.ciclos -= 1;
        }
    }

    importStatement() {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");

        const caminho = this.expressao();

        let closeBracket = this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após declaração."
        );

        return new Stmt.Importar(caminho, closeBracket);
    }

    tryStatement() {
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'tente'.");

        let tryBlock = this.block();

        let catchBlock = null;
        if (this.match(tiposDeSimbolos.PEGUE)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'pegue'."
            );

            catchBlock = this.block();
        }

        let elseBlock = null;
        if (this.match(tiposDeSimbolos.SENAO)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'pegue'."
            );

            elseBlock = this.block();
        }

        let finallyBlock = null;
        if (this.match(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'pegue'."
            );

            finallyBlock = this.block();
        }

        return new Stmt.Tente(tryBlock, catchBlock, elseBlock, finallyBlock);
    }

    doStatement() {
        try {
            this.ciclos += 1;

            const doBranch = this.statement();

            this.consumir(
                tiposDeSimbolos.ENQUANTO,
                "Esperado declaração do 'enquanto' após o escopo do 'fazer'."
            );
            this.consumir(
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                "Esperado '(' após declaração 'enquanto'."
            );

            const whileCondition = this.expressao();

            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após declaração do 'enquanto'."
            );

            return new Stmt.Fazer(doBranch, whileCondition);
        } finally {
            this.ciclos -= 1;
        }
    }

    statement() {
        if (this.match(tiposDeSimbolos.FAZER)) return this.doStatement();
        if (this.match(tiposDeSimbolos.TENTE)) return this.tryStatement();
        if (this.match(tiposDeSimbolos.ESCOLHA)) return this.declaracaoEscolha();
        if (this.match(tiposDeSimbolos.RETORNA)) return this.declaracaoRetorna();
        if (this.match(tiposDeSimbolos.CONTINUA)) return this.declaracaoContinue();
        if (this.match(tiposDeSimbolos.PAUSA)) return this.breakStatement();
        if (this.match(tiposDeSimbolos.PARA)) return this.forStatement();
        if (this.match(tiposDeSimbolos.ENQUANTO)) return this.whileStatement();
        if (this.match(tiposDeSimbolos.SE)) return this.declaracaoSe();
        if (this.match(tiposDeSimbolos.ESCREVA)) return this.declaracaoMostrar();
        if (this.match(tiposDeSimbolos.CHAVE_ESQUERDA)) return new Stmt.Block(this.block());

        return this.expressionStatement();
    }

    declaracaoDeVariavel() {
        let nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome de variável.");
        let inicializador = null;
        if (this.match(tiposDeSimbolos.IGUAL) || this.match(tiposDeSimbolos.MAIS_IGUAL)) {
            inicializador = this.expressao();
        }

        this.consumir(
            tiposDeSimbolos.SEMICOLON,
            "Esperado ';' após a declaração da variável."
        );
        return new Stmt.Var(nome, inicializador);
    }

    funcao(kind) {
        const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${kind}.`);
        return new Stmt.Funcao(nome, this.corpoDaFuncao(kind));
    }

    corpoDaFuncao(kind) {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, `Esperado '(' após o nome ${kind}.`);

        let parametros = [];
        if (!this.verificar(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (parametros.length >= 255) {
                    this.erro(this.peek(), "Não pode haver mais de 255 parâmetros");
                }

                let paramObj = {};

                if (this.peek().tipo === tiposDeSimbolos.STAR) {
                    this.consumir(tiposDeSimbolos.STAR, null);
                    paramObj["tipo"] = "wildcard";
                } else {
                    paramObj["tipo"] = "standard";
                }

                paramObj['nome'] = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do parâmetro."
                );

                if (this.match(tiposDeSimbolos.IGUAL)) {
                    paramObj["default"] = this.primario();
                }

                parametros.push(paramObj);

                if (paramObj["tipo"] === "wildcard") break;
            } while (this.match(tiposDeSimbolos.COMMA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, `Esperado '{' antes do escopo do ${kind}.`);

        const corpo = this.block();

        return new Expr.Funcao(parametros, corpo);
    }

    declaracaoDeClasse() {
        const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome da classe.");

        let superClasse = null;
        if (this.match(tiposDeSimbolos.HERDA)) {
            this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome da SuperClasse.");
            superClasse = new Expr.Variavel(this.voltar());
        }

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo da classe.");

        const metodos = [];
        while (!this.verificar(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            metodos.push(this.funcao("método"));
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o escopo da classe.");
        return new Stmt.Classe(nome, superClasse, metodos);
    }

    declaracao() {
        try {
            if (
                this.verificar(tiposDeSimbolos.FUNCAO) &&
                this.verificarProximo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.consumir(tiposDeSimbolos.FUNCAO, null);
                return this.funcao("funcao");
            }
            if (this.match(tiposDeSimbolos.VAR)) return this.declaracaoDeVariavel();
            if (this.match(tiposDeSimbolos.CLASSE)) return this.declaracaoDeClasse();

            return this.statement();
        } catch (error) {
            this.sincronizar();
            return null;
        }
    }

    analisar() {
        const declaracoes = [];
        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }

        return declaracoes
    }
};
