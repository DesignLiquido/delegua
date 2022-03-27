import { Delegua } from "../delegua";
import { LexadorInterface } from "../interfaces";
import tiposDeSimbolos from "../tiposDeSimbolos";
import { Simbolo } from "./simbolo";

const palavrasReservadas = {
    e: tiposDeSimbolos.E,
    em: tiposDeSimbolos.EM,
    classe: tiposDeSimbolos.CLASSE,
    senao: tiposDeSimbolos.SENAO,
    senão: tiposDeSimbolos.SENÃO,
    falso: tiposDeSimbolos.FALSO,
    para: tiposDeSimbolos.PARA,
    funcao: tiposDeSimbolos.FUNCAO,
    função: tiposDeSimbolos.FUNÇÃO,
    se: tiposDeSimbolos.SE,
    senaose: tiposDeSimbolos.SENAOSE,
    senãose: tiposDeSimbolos.SENÃOSE,
    nulo: tiposDeSimbolos.NULO,
    ou: tiposDeSimbolos.OU,
    escreva: tiposDeSimbolos.ESCREVA,
    retorna: tiposDeSimbolos.RETORNA,
    super: tiposDeSimbolos.SUPER,
    isto: tiposDeSimbolos.ISTO,
    verdadeiro: tiposDeSimbolos.VERDADEIRO,
    var: tiposDeSimbolos.VARIAVEL,
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

/**
 * O Lexador é responsável por transformar o código em uma coleção de tokens de linguagem.
 * Cada token de linguagem é representado por um tipo, um lexema e informações da linha de código em que foi expresso.
 * Também é responsável por mapear as palavras reservadas da linguagem, que não podem ser usadas por outras
 * estruturas, tais como nomes de variáveis, funções, literais, classes e assim por diante.
 */
export class Lexador implements LexadorInterface {
    Delegua: any;
    codigo: any;
    simbolos: any;
    inicio: number;
    atual: number;
    linha: number;

    constructor(Delegua: Delegua, codigo?: any) {
        this.Delegua = Delegua;
        this.codigo = codigo;

        this.simbolos = [];

        this.inicio = 0;
        this.atual = 0;
        this.linha = 1;
    }

    eDigito(caractere: any) {
        return caractere >= "0" && caractere <= "9";
    }

    eAlfabeto(caractere: any) {
        const acentuacoes = ["á", "Á", "ã", "Ã", "â", "Â", "à", "À", "é", "É", "ê", "Ê", "í", "Í", "ó", "Ó", "õ", "Õ", "ô", "Ô", "ú", "Ú", "ç", "Ç", "_"];
        return (caractere >= "a" && caractere <= "z") || (caractere >= "A" && caractere <= "Z") || acentuacoes.includes(caractere);
    }

    eAlfabetoOuDigito(caractere: any) {
        return this.eDigito(caractere) || this.eAlfabeto(caractere);
    }

    eFinalDoCodigo() {
        return this.atual >= this.codigo.length;
    }

    avancar() {
        this.atual += 1;
        return this.codigo[this.atual - 1];
    }

    adicionarSimbolo(tipo: any, literal: any = null) {
        const texto = this.codigo.substring(this.inicio, this.atual);
        this.simbolos.push(new Simbolo(tipo, texto, literal, this.linha));
    }

    correspondeA(esperado: any) {
        if (this.eFinalDoCodigo()) {
            return false;
        }

        if (this.codigo[this.atual] !== esperado) {
            return false;
        }

        this.atual += 1;
        return true;
    }

    caracterAtual() {
        if (this.eFinalDoCodigo()) return "\0";
        return this.codigo.charAt(this.atual);
    }

    proximoCaracter() {
        if (this.atual + 1 >= this.codigo.length) return "\0";
        return this.codigo.charAt(this.atual + 1);
    }

    voltar() {
        return this.codigo.charAt(this.atual - 1);
    }

    analisarTexto(texto: string = '"') {
        while (this.caracterAtual() !== texto && !this.eFinalDoCodigo()) {
            if (this.caracterAtual() === "\n") this.linha = +1;
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.Delegua.erroNoLexador(
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
        while (this.eDigito(this.caracterAtual())) {
            this.avancar();
        }

        if (this.caracterAtual() == "." && this.eDigito(this.proximoCaracter())) {
            this.avancar();

            while (this.eDigito(this.caracterAtual())) {
                this.avancar();
            }
        }

        const numeroCompleto = this.codigo.substring(this.inicio, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.NUMERO, parseFloat(numeroCompleto));
    }

    identificarPalavraChave() {
        while (this.eAlfabetoOuDigito(this.caracterAtual())) {
            this.avancar();
        }

        const codigo = this.codigo.substring(this.inicio, this.atual);
        const tipo = codigo in palavrasReservadas ? palavrasReservadas[codigo] : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
    }

    classificarToken() {
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
                this.adicionarSimbolo(tiposDeSimbolos.VIRGULA);
                break;
            case ".":
                this.adicionarSimbolo(tiposDeSimbolos.PONTO);
                break;
            case "-":
                this.adicionarSimbolo(this.correspondeA("=") ? tiposDeSimbolos.MENOS_IGUAL : tiposDeSimbolos.SUBTRACAO);
                break;
            case "+":
                this.adicionarSimbolo(this.correspondeA("=") ? tiposDeSimbolos.MAIS_IGUAL : tiposDeSimbolos.ADICAO);
                break;
            case ":":
                this.adicionarSimbolo(tiposDeSimbolos.DOIS_PONTOS);
                break;
            case ";":
                // Ponto-e-vírgula é opcional em Delégua, então nem precisa ser considerado
                // nas etapas seguintes.
                break;
            case "%":
                this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                break;
            case "*":
                if (this.caracterAtual() === "*") {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.EXPONENCIACAO);
                    break;
                }
                else if (this.correspondeA("/")) {
                    while (!this.eFinalDoCodigo()) this.avancar();
                    break;
                }
                else{
                    this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                    break;
                }
            case "!":
                this.adicionarSimbolo(
                    this.correspondeA("=") ? tiposDeSimbolos.DIFERENTE : tiposDeSimbolos.NEGACAO
                );
                break;
            case "=":
                this.adicionarSimbolo(
                    this.correspondeA("=") ? tiposDeSimbolos.IGUAL_IGUAL : tiposDeSimbolos.IGUAL
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
                if (this.correspondeA("=")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_IGUAL);
                } else if (this.correspondeA("<")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_MENOR);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR);
                }
                break;

            case ">":
                if (this.correspondeA("=")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_IGUAL);
                } else if (this.correspondeA(">")) {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_MAIOR);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR);
                }
                break;

            case "/":
                if (this.correspondeA("/")) {
                    while (this.caracterAtual() !== "\n" && !this.eFinalDoCodigo()) this.avancar();
                }
                else if(this.correspondeA("*")){
                    while (!this.eFinalDoCodigo()) this.avancar();
                }
                else {
                    this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
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
                else this.Delegua.erroNoLexador(this.linha, caractere, "Caractere inesperado.");
        }
    }

    mapear(codigo?: any) {
        this.simbolos = [];
        this.inicio = 0;
        this.atual = 0;
        this.linha = 1;
        
        this.codigo = codigo || '';

        while (!this.eFinalDoCodigo()) {
            this.inicio = this.atual;
            this.classificarToken();
        }

        return this.simbolos;
    }
};