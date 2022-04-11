import { performance } from 'perf_hooks';
import { LexadorInterface, SimboloInterface } from "../interfaces";
import tiposDeSimbolos from "../tiposDeSimbolos";
import { ErroLexador } from "./erro-lexador";
import { RetornoLexador } from "./retorno-lexador";

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
    herda: tiposDeSimbolos.HERDA,
};

class Simbolo implements SimboloInterface {
    lexema: string;
    tipo: string;
    literal: string;
    linha: number;    

    constructor(tipo: string, lexema: string, literal: string, linha: number) {
        this.tipo = tipo;
        this.lexema = lexema;
        this.literal = literal;
        this.linha = linha;
    }

    paraTexto(): string {
        return this.tipo + " " + this.lexema + " " + this.literal;
    }
}

/**
 * O Lexador é responsável por transformar o código em uma coleção de tokens de linguagem.
 * Cada token de linguagem é representado por um tipo, um lexema e informações da linha de código em que foi expresso.
 * Também é responsável por mapear as palavras reservadas da linguagem, que não podem ser usadas por outras
 * estruturas, tais como nomes de variáveis, funções, literais, classes e assim por diante.
 */
export class Lexador implements LexadorInterface {
    codigo: string[];
    simbolos: SimboloInterface[];
    erros: ErroLexador[];
    inicioSimbolo: number;
    atual: number;
    linha: number;
    performance: boolean;

    constructor(performance: boolean = false) {
        this.performance = performance;

        this.simbolos = [];
        this.erros = [];

        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
    }

    eDigito(caractere: string): boolean {
        return caractere >= '0' && caractere <= '9';
    }

    eAlfabeto(caractere: string): boolean {
        const acentuacoes = [
            'á',
            'Á',
            'ã',
            'Ã',
            'â',
            'Â',
            'à',
            'À',
            'é',
            'É',
            'ê',
            'Ê',
            'í',
            'Í',
            'ó',
            'Ó',
            'õ',
            'Õ',
            'ô',
            'Ô',
            'ú',
            'Ú',
            'ç',
            'Ç',
            '_',
        ];

        return (
            (caractere >= 'a' && caractere <= 'z') ||
            (caractere >= 'A' && caractere <= 'Z') ||
            acentuacoes.includes(caractere)
        );
    }

    eAlfabetoOuDigito(caractere: any): boolean {
        return this.eDigito(caractere) || this.eAlfabeto(caractere);
    }

    eFinalDaLinha(): boolean {
        return this.atual >= this.codigo[this.linha].length;
    }

    /**
     * Indica se o código está na última linha.
     * @returns Verdadeiro se contador de linhas está na última linha.
     *          Falso caso contrário.
     */
    eUltimaLinha(): boolean {
        return this.linha >= this.codigo.length - 1;
    }

    eFinalDoCodigo(): boolean {
        return this.eUltimaLinha() && 
            this.codigo[this.codigo.length - 1].length <= this.atual;
    }

    avancar(): void {
        this.atual += 1;

        if (this.eFinalDaLinha() && !this.eUltimaLinha()) {
            this.linha++;
            this.atual = 0;
        }
    }

    adicionarSimbolo(tipo: any, literal: any = null): void {
        const texto: string = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );
        this.simbolos.push(new Simbolo(tipo, texto, literal, this.linha + 1));
    }

    proximoIgualA(esperado: any): boolean {
        if (this.eFinalDaLinha()) {
            return false;
        }

        if (this.codigo[this.linha][this.atual + 1] !== esperado) {
            return false;
        }

        return true;
    }

    simboloAtual(): string {
        if (this.eFinalDaLinha()) return '\0';
        return this.codigo[this.linha].charAt(this.atual);
    }

    avancarParaProximaLinha(): void {
        this.linha++;
        this.atual = 0;
    }

    proximoSimbolo(): string {
        if (this.atual + 1 >= this.codigo[this.linha].length) return '\0';
        return this.codigo[this.linha].charAt(this.atual + 1);
    }

    simboloAnterior(): string {
        return this.codigo[this.linha].charAt(this.atual - 1);
    }

    analisarTexto(delimitador: string = '"'): void {
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: 'Texto não finalizado.'
            } as ErroLexador);
            return;
        }

        const valor = this.codigo[this.linha].substring(
            this.inicioSimbolo + 1,
            this.atual
        );
        this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor);
    }

    analisarNumero(): void {
        while (this.eDigito(this.simboloAtual())) {
            this.avancar();
        }

        if (this.simboloAtual() == '.' && this.eDigito(this.proximoSimbolo())) {
            this.avancar();

            while (this.eDigito(this.simboloAtual())) {
                this.avancar();
            }
        }

        const numeroCompleto = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );
        this.adicionarSimbolo(
            tiposDeSimbolos.NUMERO,
            parseFloat(numeroCompleto)
        );
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo: string = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );
        const tipo: string =
            codigo in palavrasReservadas
                ? palavrasReservadas[codigo]
                : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
    }

    encontrarFimComentarioAsterisco(): void {
        while (!this.eUltimaLinha()) { 
            this.avancar();
            if (this.simboloAtual() === '*' && this.proximoSimbolo() === '/') {
                this.avancar();
                this.avancar();
                break;
            }
        }
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case '[':
                this.adicionarSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO);
                this.avancar();
                break;
            case ']':
                this.adicionarSimbolo(tiposDeSimbolos.COLCHETE_DIREITO);
                this.avancar();
                break;
            case '(':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO);
                this.avancar();
                break;
            case ')':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO);
                this.avancar();
                break;
            case '{':
                this.adicionarSimbolo(tiposDeSimbolos.CHAVE_ESQUERDA);
                this.avancar();
                break;
            case '}':
                this.adicionarSimbolo(tiposDeSimbolos.CHAVE_DIREITA);
                this.avancar();
                break;
            case ',':
                this.adicionarSimbolo(tiposDeSimbolos.VIRGULA);
                this.avancar();
                break;
            case '.':
                this.adicionarSimbolo(tiposDeSimbolos.PONTO);
                this.avancar();
                break;
            case '-':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOS_IGUAL);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                }
                
                break;
            case '+':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIS_IGUAL);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                }
                
                break;
            case ':':
                this.adicionarSimbolo(tiposDeSimbolos.DOIS_PONTOS);
                this.avancar();
                break;
            
            case '%':
                this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                this.avancar();
                break;
            case '*':
                this.inicioSimbolo = this.atual;
                this.avancar();
                if (this.simboloAtual() === '*') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.EXPONENCIACAO);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                }

                break;
            case '!':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.DIFERENTE);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.NEGACAO);
                }
                
                break;
            case '=':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL_IGUAL);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL);
                }
                
                break;

            case '&':
                this.adicionarSimbolo(tiposDeSimbolos.BIT_AND);
                this.avancar();
                break;

            case '~':
                this.adicionarSimbolo(tiposDeSimbolos.BIT_NOT);
                this.avancar();
                break;

            case '|':
                this.adicionarSimbolo(tiposDeSimbolos.BIT_OR);
                this.avancar();
                break;

            case '^':
                this.adicionarSimbolo(tiposDeSimbolos.BIT_XOR);
                this.avancar();
                break;

            case '<':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_IGUAL);
                    this.avancar();
                } else if (this.simboloAtual() === '<') {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_MENOR);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR);
                }
                break;

            case '>':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_IGUAL);
                    this.avancar();
                } else if (this.simboloAtual() === '>') {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_MAIOR);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR);
                }
                break;

            case '/':
                this.avancar();
                if (this.simboloAtual() == '/') {
                    this.avancarParaProximaLinha();
                } else if (this.simboloAtual() === '*') {
                    this.encontrarFimComentarioAsterisco();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                }
                break;

            // Esta sessão ignora espaços em branco na tokenização.
            // Ponto-e-vírgula é opcional em Delégua, então pode apenas ser ignorado.
            case ' ':
            case '\0':
            case '\r':
            case '\t':
            case ';':
                this.avancar();
                break;

            case '"':
                this.avancar();
                this.analisarTexto('"');
                this.avancar();
                break;

            case "'":
                this.avancar();
                this.analisarTexto("'");
                this.avancar();
                break;

            default:
                if (this.eDigito(caractere)) this.analisarNumero();
                else if (this.eAlfabeto(caractere))
                    this.identificarPalavraChave();
                else {
                    this.erros.push({
                        linha: this.linha + 1,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.'
                    } as ErroLexador);
                    this.avancar();
                }
        }
    }

    mapear(codigo?: string[]): RetornoLexador {
        const inicioMapeamento: number = performance.now();
        this.erros = [];
        this.simbolos = [];

        this.codigo = codigo || [''];

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        const fimMapeamento: number = performance.now();
        if (this.performance) {
            console.log(`[Lexador] Tempo para mapeamento: ${fimMapeamento - inicioMapeamento}ms`);
        }
        
        return { 
            simbolos: this.simbolos,
            erros: this.erros
        } as RetornoLexador;
    }
}
