import hrtime from 'browser-process-hrtime';

import { LexadorInterface, SimboloInterface } from '../../interfaces';
import { Simbolo } from '../simbolo';
import { palavrasReservadas } from './palavras-reservadas/prisma';
import { ErroLexador } from '../erro-lexador';
import { RetornoLexador } from '../../interfaces/retornos/retorno-lexador';

import tiposDeSimbolos from '../../tipos-de-simbolos/prisma';

/**
 * O Lexador é responsável por transformar o código em uma coleção de tokens de linguagem.
 * Cada token de linguagem é representado por um tipo, um lexema e informações da linha de código em que foi expresso.
 * Também é responsável por mapear as palavras reservadas da linguagem, que não podem ser usadas por outras
 * estruturas, tais como nomes de variáveis, funções, literais, classes e assim por diante.
 * 
 * Este lexador é específico para o dialeto Prisma da linguagem Delégua.
 */
export class LexadorPrisma implements LexadorInterface<SimboloInterface> {
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

        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
    }

    eDigito(caractere: string): boolean {
        return caractere >= '0' && caractere <= '9';
    }

    eAlfabeto(caractere: string): boolean {
        const acentuacoes = [
            'á', 'Á', 'ã', 'Ã', 'â', 'Â', 'à', 'À',
            'é', 'É', 'ê', 'Ê', 'í', 'Í', 'ó', 'Ó',
            'õ', 'Õ', 'ô', 'Ô', 'ú', 'Ú', 'ç', 'Ç', '_',
        ];

        return (
            (caractere >= 'a' && caractere <= 'z') ||
            (caractere >= 'A' && caractere <= 'Z') ||
            acentuacoes.includes(caractere)
        );
    }

    eAlfabetoOuDigito(caractere: string): boolean {
        return this.eDigito(caractere) || this.eAlfabeto(caractere);
    }

    /**
     * Indica se o código está na última linha.
     * @returns Verdadeiro se contador de linhas está na última linha.
     *          Falso caso contrário.
     */
    eUltimaLinha(): boolean {
        return this.linha >= this.codigo.length - 1;
    }

    eFinalDaLinha(): boolean {
        return this.atual >= this.codigo[this.linha].length;
    }

    eFinalDoCodigo(): boolean {
        return this.eUltimaLinha() && this.eFinalDaLinha();
    }

    simboloAtual(): string {
        if (this.eFinalDaLinha()) {
            if (this.eUltimaLinha()) {
                return '\0';
            }

            return '\n';
        }

        return this.codigo[this.linha].charAt(this.atual);
    }

    proximoSimbolo(): string {
        if (this.atual + 1 >= this.codigo[this.linha].length) return '\n';
        return this.codigo[this.linha].charAt(this.atual + 1);
    }

    simboloAnterior(): string {
        if (this.atual === 0) return '\0';
        return this.codigo[this.linha].charAt(this.atual - 1);
    }

    avancar(): void {
        if (this.eFinalDaLinha() && !this.eUltimaLinha()) {
            this.linha++;
            this.atual = 0;
        } else {
            this.atual++;
        }
    }

    adicionarSimbolo(tipo: string, literal: any = null): void {
        const texto: string = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        this.simbolos.push(new Simbolo(tipo, texto, literal, this.linha + 1, this.hashArquivo));
    }

    analisarTexto(delimitador: string = '"'): void {
        const inicioTexto = this.linha;
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: inicioTexto + 1,
                caractere: delimitador,
                mensagem: 'Texto não finalizado.',
            } as ErroLexador);
            return;
        }

        const valor = this.codigo[this.linha].substring(this.inicioSimbolo + 1, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor);
        this.avancar();
    }

    lerTexto(): void {
        this.analisarTexto('"');
    }

    analisarNumero(): void {
        while (this.eDigito(this.simboloAtual())) {
            this.avancar();
        }

        if (this.simboloAtual() === '.' && this.eDigito(this.proximoSimbolo())) {
            this.avancar();
            while (this.eDigito(this.simboloAtual())) {
                this.avancar();
            }
        }

        const numero = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.NUMERO, Number(numero));
    }

    lerNumero(): void {
        this.analisarNumero();
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const textoPalavraChave: string = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        
        const tipo: string =
            textoPalavraChave in palavrasReservadas
                ? palavrasReservadas[textoPalavraChave]
                : tiposDeSimbolos.IDENTIFICADOR;

        this.simbolos.push(
            new Simbolo(tipo, textoPalavraChave, null, this.linha + 1, this.hashArquivo)
        );
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case ' ':
            case '\t':
            case '\r':
            case '\n':
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
            case '[':
                this.adicionarSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO);
                this.avancar();
                break;
            case ']':
                this.adicionarSimbolo(tiposDeSimbolos.COLCHETE_DIREITO);
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
            case ';':
                this.adicionarSimbolo(tiposDeSimbolos.PONTO_E_VIRGULA);
                this.avancar();
                break;
            case ':':
                this.adicionarSimbolo(tiposDeSimbolos.DOIS_PONTOS);
                this.avancar();
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
            case '!':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.DIFERENTE);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.NEGACAO);
                }
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
            case '+':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIS_IGUAL);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                }
                break;
            case '-':
                this.avancar();
                if (this.simboloAtual() === '>') {
                    this.adicionarSimbolo(tiposDeSimbolos.SETA);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                }
                break;
            case '*':
                this.avancar();
                if (this.simboloAtual() === '*') {
                    this.adicionarSimbolo(tiposDeSimbolos.EXPONENCIACAO);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                }
                break;
            case '/':
                this.avancar();
                if (this.simboloAtual() === '/') {
                    // Comentário de linha
                    while (this.simboloAtual() !== '\n' && !this.eFinalDoCodigo()) {
                        this.avancar();
                    }
                } else if (this.simboloAtual() === '*') {
                    // Comentário de bloco
                    this.avancar();
                    while (!this.eFinalDoCodigo()) {
                        if (this.simboloAtual() === '*' && this.proximoSimbolo() === '/') {
                            this.avancar();
                            this.avancar();
                            break;
                        }
                        this.avancar();
                    }
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                }
                break;
            case '%':
                this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                this.avancar();
                break;
            case '&':
                this.adicionarSimbolo(tiposDeSimbolos.BIT_AND);
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
            case '~':
                this.adicionarSimbolo(tiposDeSimbolos.BIT_NOT);
                this.avancar();
                break;
            case '"':
                this.avancar();
                this.analisarTexto('"');
                break;
            case "'":
                this.avancar();
                this.analisarTexto("'");
                break;
            default:
                if (this.eDigito(caractere)) {
                    this.analisarNumero();
                } else if (this.eAlfabeto(caractere)) {
                    this.identificarPalavraChave();
                } else {
                    this.erros.push({
                        linha: this.linha + 1,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.',
                    } as ErroLexador);
                    this.avancar();
                }
                break;
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

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        if (this.performance) {
            const deltaMapeamento: [number, number] = hrtime(inicioMapeamento);
            console.log(
                `[Lexador] Tempo para mapeamento: ${deltaMapeamento[0] * 1e9 + deltaMapeamento[1]}ns`
            );
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros,
        } as RetornoLexador<SimboloInterface>;
    }
}
