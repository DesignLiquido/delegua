import hrtime from 'browser-process-hrtime';

import { LexadorInterface, SimboloInterface } from '../interfaces';
import { ErroLexador } from './erro-lexador';
import { RetornoLexador } from '../interfaces/retornos/retorno-lexador';
import { Simbolo } from './simbolo';

import { palavrasReservadas } from './palavras-reservadas';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * O Lexador é responsável por transformar o código em uma coleção de tokens de linguagem.
 * Cada token de linguagem é representado por um tipo, um lexema e informações da linha de código em que foi expresso.
 * Também é responsável por mapear as palavras reservadas da linguagem, que não podem ser usadas por outras
 * estruturas, tais como nomes de variáveis, funções, literais, classes e assim por diante.
 */
export class Lexador implements LexadorInterface<SimboloInterface> {
    codigo: string[];
    hashArquivo: number;
    simbolos: SimboloInterface[];
    erros: ErroLexador[];
    inicioSimbolo: number;
    atual: number;
    linha: number;
    performance: boolean;

    constructor(performance = false) {
        this.performance = performance;

        this.simbolos = [];
        this.erros = [];

        this.hashArquivo = -1;
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
        if (this.codigo.length === this.linha) {
            return true;
        }
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
        return this.eUltimaLinha() && this.codigo[this.codigo.length - 1].length <= this.atual;
    }

    avancar(): void {
        this.atual += 1;
        if (this.eFinalDaLinha() && !this.eUltimaLinha()) {
            this.linha++;
            this.atual = 0;
        }
    }

    adicionarSimbolo(tipo: string, literal: any = null): void {
        const texto: string = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        this.simbolos.push(new Simbolo(tipo, literal || texto, literal, this.linha + 1, this.hashArquivo));
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
        return this.codigo[this.linha].charAt(this.atual + 1);
    }

    simboloAnterior(): string {
        return this.codigo[this.linha].charAt(this.atual - 1);
    }

    analisarTexto(delimitador = '"'): void {
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: 'Texto não finalizado.',
            } as ErroLexador);
            return;
        }

        const valor = this.codigo[this.linha].substring(this.inicioSimbolo + 1, this.atual);
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

        const numeroCompleto = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);

        this.adicionarSimbolo(tiposDeSimbolos.NUMERO, parseFloat(numeroCompleto));
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo: string = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);

        const tipo: string = codigo in palavrasReservadas ? palavrasReservadas[codigo] : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
    }

    encontrarFimComentarioAsterisco(): void {
        while (!this.eFinalDoCodigo()) {
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
                this.inicioSimbolo = this.atual;
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOS_IGUAL);
                    this.avancar();
                } else if (this.simboloAtual() === '-') {
                    this.adicionarSimbolo(tiposDeSimbolos.DECREMENTAR);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                }

                break;
            case '+':
                this.inicioSimbolo = this.atual;
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIS_IGUAL);
                    this.avancar();
                } else if (this.simboloAtual() === '+') {
                    this.adicionarSimbolo(tiposDeSimbolos.INCREMENTAR);
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
                this.inicioSimbolo = this.atual;
                this.avancar();
                switch (this.simboloAtual()) {
                    case '=':
                        this.avancar();
                        this.adicionarSimbolo(tiposDeSimbolos.MODULO_IGUAL);
                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                        break;
                }

                break;
            case '*':
                this.inicioSimbolo = this.atual;
                this.avancar();
                switch (this.simboloAtual()) {
                    case '*':
                        this.avancar();
                        this.adicionarSimbolo(tiposDeSimbolos.EXPONENCIACAO);
                        break;
                    case '=':
                        this.avancar();
                        this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO_IGUAL);
                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                        break;
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
                switch (this.simboloAtual()) {
                    case '/':
                        this.avancarParaProximaLinha();
                        break;
                    case '*':
                        this.encontrarFimComentarioAsterisco();
                        break;
                    case '=':
                        this.adicionarSimbolo(tiposDeSimbolos.DIVISAO_IGUAL);
                        this.avancar();
                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                        break;
                }

                break;

            case '\\':
                this.inicioSimbolo = this.atual;
                this.avancar();
                switch (this.simboloAtual()) {
                    case '=':
                        this.adicionarSimbolo(tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL);
                        this.avancar();
                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.DIVISAO_INTEIRA);
                        break;
                }

                break;

            // Esta sessão ignora espaços em branco na tokenização.

            case ' ':
            case '\0':
            case '\r':
            case '\t':
                this.avancar();
                break;

            // Ponto-e-vírgula é opcional em Delégua, mas em alguns casos pode ser
            // necessário. Por exemplo, declaração de `para` sem inicializador.
            case ';':
                this.adicionarSimbolo(tiposDeSimbolos.PONTO_E_VIRGULA);
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
                else if (this.eAlfabeto(caractere)) this.identificarPalavraChave();
                else {
                    this.erros.push({
                        linha: this.linha + 1,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.',
                    } as ErroLexador);
                    this.avancar();
                }
        }
    }

    mapear(codigo: string[], hashArquivo: number): RetornoLexador<SimboloInterface> {
        const inicioMapeamento: [number, number] = hrtime();
        this.erros = [];
        this.simbolos = [];
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;

        this.codigo = codigo || [''];
        this.hashArquivo = hashArquivo;

        for (let iterador = 0; iterador < this.codigo.length; iterador++) {
            this.codigo[iterador] += '\0';
        }

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        if (this.performance) {
            const deltaMapeamento: [number, number] = hrtime(inicioMapeamento);
            console.log(`[Lexador] Tempo para mapeamento: ${deltaMapeamento[0] * 1e9 + deltaMapeamento[1]}ns`);
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros,
        } as RetornoLexador<SimboloInterface>;
    }
}
