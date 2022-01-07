const tiposDeSimbolos = require("./tiposDeSimbolos");

const palavrasReservadas = {
    e: tiposDeSimbolos.E,
    em: tiposDeSimbolos.EM,
    classe: tiposDeSimbolos.CLASSE,
    senao: tiposDeSimbolos.SENAO,
    falso: tiposDeSimbolos.FALSO,
    para: tiposDeSimbolos.PARA,
    funcao: tiposDeSimbolos.FUNCAO,
    se: tiposDeSimbolos.SE,
    senaose: tiposDeSimbolos.SENAOSE,
    nulo: tiposDeSimbolos.NULO,
    ou: tiposDeSimbolos.OU,
    escreva: tiposDeSimbolos.ESCREVA,
    retorna: tiposDeSimbolos.RETORNA,
    super: tiposDeSimbolos.SUPER,
    isto: tiposDeSimbolos.ISTO,
    verdadeiro: tiposDeSimbolos.VERDADEIRO,
    var: tiposDeSimbolos.VAR,
    fazer: tiposDeSimbolos.FAZER,
    enquanto: tiposDeSimbolos.ENQUANTO,
    pausa: tiposDeSimbolos.PAUSA,
    continua: tiposDeSimbolos.CONTINUA,
    escolha: tiposDeSimbolos.ESCOLHA,
    caso: tiposDeSimbolos.CASO,
    padrao: tiposDeSimbolos.PADRAO,
    importar: tiposDeSimbolos.IMPORTAR,
    tente: tiposDeSimbolos.TENTE,
    pegue: tiposDeSimbolos.PEGUE,
    finalmente: tiposDeSimbolos.FINALMENTE,
    herda: tiposDeSimbolos.HERDA
};

class Simbolo {
    constructor(tipo, lexeme, literal, linha) {
        this.tipo = tipo;
        this.lexeme = lexeme;
        this.literal = literal;
        this.linha = linha;
    }

    toString() {
        return this.tipo + " " + this.lexeme + " " + this.literal;
    }
}

/**
 * O Lexador é responsável por transformar o código em uma coleção de tokens de linguagem.
 * Cada token de linguagem é representado por um tipo, um lexema e informações da linha de código em que foi expresso.
 * Também é responsável por mapear as palavras reservadas da linguagem, que não podem ser usadas por outras
 * estruturas, tais como nomes de variáveis, funções, literais, classes e assim por diante.
 */
module.exports = class Lexer {
    constructor(codigo, Delegua) {
        this.Delegua = Delegua;
        this.codigo = codigo;

        this.simbolos = [];

        this.inicio = 0;
        this.atual = 0;
        this.linha = 1;
    }

    eDigito(caractere) {
        return caractere >= "0" && caractere <= "9";
    }

    eAlfabeto(caractere) {
        return (caractere >= "a" && caractere <= "z") || (caractere >= "A" && caractere <= "Z") || caractere == "_";
    }

    eAlfabetoOuDigito(caractere) {
        return this.eDigito(caractere) || this.eAlfabeto(caractere);
    }

    eFinalDoCodigo() {
        return this.atual >= this.codigo.length;
    }

    avancar() {
        this.atual += 1;
        return this.codigo[this.atual - 1];
    }

    adicionarSimbolo(tipo, literal = null) {
        const texto = this.codigo.substring(this.inicio, this.atual);
        this.simbolos.push(new Simbolo(tipo, texto, literal, this.linha));
    }

    match(esperado) {
        if (this.eFinalDoCodigo()) {
            return false;
        }

        if (this.codigo[this.atual] !== esperado) {
            return false;
        }

        this.atual += 1;
        return true;
    }

    peek() {
        if (this.eFinalDoCodigo()) return "\0";
        return this.codigo.charAt(this.atual);
    }

    peekNext() {
        if (this.atual + 1 >= this.codigo.length) return "\0";
        return this.codigo.charAt(this.atual + 1);
    }

    voltar() {
        return this.codigo.charAt(this.atual - 1);
    }

    analisarTexto(texto = '"') {
        while (this.peek() !== texto && !this.eFinalDoCodigo()) {
            if (this.peek() === "\n") this.linha = +1;
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.Delegua.lexerError(
                this.linha,
                this.voltar(),
                "Texto não finalizado."
            );
            return;
        }

        this.avancar();

        const valor = this.codigo.substring(this.inicio + 1, this.atual - 1);
        this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor);
    }

    analisarNumero() {
        while (this.eDigito(this.peek())) {
            this.avancar();
        }

        if (this.peek() == "." && this.eDigito(this.peekNext())) {
            this.avancar();

            while (this.eDigito(this.peek())) {
                this.avancar();
            }
        }

        const numeroCompleto = this.codigo.substring(this.inicio, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.NUMERO, parseFloat(numeroCompleto));
    }

    identificarPalavraChave() {
        while (this.eAlfabetoOuDigito(this.peek())) {
            this.avancar();
        }

        const codigo = this.codigo.substring(this.inicio, this.atual);
        const tipo = codigo in palavrasReservadas ? palavrasReservadas[codigo] : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
    }

    scanToken() {
        const caractere = this.avancar();

        switch (caractere) {
            case "[":
                this.adicionarSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO);
                break;
            case "]":
                this.adicionarSimbolo(tiposDeSimbolos.COLCHETE_DIREITO);
                break;
            case "(":
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO);
                break;
            case ")":
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO);
                break;
            case "{":
                this.adicionarSimbolo(tiposDeSimbolos.CHAVE_ESQUERDA);
                break;
            case "}":
                this.adicionarSimbolo(tiposDeSimbolos.CHAVE_DIREITA);
                break;
            case ",":
                this.adicionarSimbolo(tiposDeSimbolos.COMMA);
                break;
            case ".":
                this.adicionarSimbolo(tiposDeSimbolos.DOT);
                break;
            case "-":
                if (this.match("=")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_IGUAL);
                }
                this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                break;
            case "+":
                if (this.match("=")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIS_IGUAL);
                }
                this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                break;
            case ":":
                this.adicionarSimbolo(tiposDeSimbolos.COLON);
                break;
            case ";":
                this.adicionarSimbolo(tiposDeSimbolos.SEMICOLON);
                break;
            case "%":
                this.adicionarSimbolo(tiposDeSimbolos.MODULUS);
                break;
            case "*":
                if (this.peek() === "*") {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.STAR_STAR);
                    break;
                }
                this.adicionarSimbolo(tiposDeSimbolos.STAR);
                break;
            case "!":
                this.adicionarSimbolo(
                    this.match("=") ? tiposDeSimbolos.DIFERENTE : tiposDeSimbolos.NEGACAO
                );
                break;
            case "=":
                this.adicionarSimbolo(
                    this.match("=") ? tiposDeSimbolos.IGUAL_IGUAL : tiposDeSimbolos.IGUAL
                );
                break;

            case "&":
                this.adicionarSimbolo(tiposDeSimbolos.BIT_AND);
                break;

            case "~":
                this.adicionarSimbolo(tiposDeSimbolos.BIT_NOT);
                break;

            case "|":
                this.adicionarSimbolo(tiposDeSimbolos.BIT_OR);
                break;

            case "^":
                this.adicionarSimbolo(tiposDeSimbolos.BIT_XOR);
                break;

            case "<":
                if (this.match("=")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_IGUAL);
                } else if (this.match("<")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_MENOR);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR);
                }
                break;

            case ">":
                if (this.match("=")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_IGUAL);
                } else if (this.match(">")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_MAIOR);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR);
                }
                break;

            case "/":
                if (this.match("/")) {
                    while (this.peek() != "\n" && !this.eFinalDoCodigo()) this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.SLASH);
                }
                break;

            // Esta sessão ignora espaços em branco na tokenização
            case " ":
            case "\r":
            case "\t":
                break;

            // tentativa de pulhar linha com \n que ainda não funciona
            case "\n":
                this.linha += 1;
                break;

            case '"':
                this.analisarTexto('"');
                break;

            case "'":
                this.analisarTexto("'");
                break;

            default:
                if (this.eDigito(caractere)) this.analisarNumero();
                else if (this.eAlfabeto(caractere)) this.identificarPalavraChave();
                else this.Delegua.lexerError(this.linha, caractere, "Caractere inesperado.");
        }
    }

    scan() {
        while (!this.eFinalDoCodigo()) {
            this.inicio = this.atual;
            this.scanToken();
        }

        this.simbolos.push(new Simbolo(tiposDeSimbolos.EOF, "", null, this.linha));
        
        return this.simbolos;
    }
};