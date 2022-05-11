import hrtime from 'browser-process-hrtime';

import { LexadorInterface, SimboloInterface } from "../../interfaces";
import tiposDeSimbolos from "./tipos-de-simbolos-eguap";
import { Simbolo } from "../simbolo";
import palavrasReservadas from "../palavras-reservadas";
import { ErroLexador } from "../erro-lexador";
import { RetornoLexador } from "../retorno-lexador";
import { Pragma } from "./pragma";

/**
 * O Lexador é responsável por transformar o código em uma coleção de tokens de linguagem.
 * Cada token de linguagem é representado por um tipo, um lexema e informações da linha de código em que foi expresso.
 * Também é responsável por mapear as palavras reservadas da linguagem, que não podem ser usadas por outras
 * estruturas, tais como nomes de variáveis, funções, literais, classes e assim por diante.
 * 
 * Este lexador é diferente dos demais, porque também produz uma estrutura de dados de pragmas, que explica, 
 * por exemplo quantos espaços há na frente de cada linha. Assim como a linguagem Python, os blocos de 
 * escopo são definidos pelo número de espaços à frente do código. 
 */
export class LexadorEguaP implements LexadorInterface {
    codigo: string[];
    simbolos: SimboloInterface[];
    erros: ErroLexador[];
    pragmas: { [linha: number]: Pragma };

    inicioSimbolo: number;
    atual: number;
    linha: number;
    performance: boolean;

    constructor(performance: boolean = false) {
        this.performance = performance;

        this.simbolos = [];
        this.erros = [];
        this.pragmas = {};

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
        if (this.linha > this.codigo.length - 1) return true;
        return this.linha == this.codigo.length - 1 &&
            this.codigo[this.codigo.length - 1].length <= this.atual;
    }

    avancar(): void {
        this.atual += 1;

        if (this.eFinalDaLinha() && !this.eUltimaLinha()) {
            this.linha++;
            this.atual = 0;
            // this.logicaEmLinhaIniciada = false;
            this.analisarIndentacao();
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
        throw new Error("Method not implemented.");
    }

    simboloAtual(): string {
        if (this.eFinalDaLinha()) return '\0';
        if (this.linha > this.codigo.length - 1) return '\0';
        return this.codigo[this.linha].charAt(this.atual);
    }

    proximoSimbolo(): string {
        if (this.atual + 1 >= this.codigo[this.linha].length) return '\0';
        return this.codigo[this.linha].charAt(this.atual + 1);
    }

    simboloAnterior(): string {
        return this.codigo[this.linha].charAt(this.atual - 1);
    }

    analisarTexto(delimitador: string = '"'): void {
        const linhaPrimeiroCaracter: number = this.linha;
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

        const textoCompleto = this.codigo[this.linha].substring(
            this.inicioSimbolo + 1,
            this.atual
        );

        this.simbolos.push(
            new Simbolo(
                tiposDeSimbolos.TEXTO, 
                textoCompleto, 
                textoCompleto, 
                linhaPrimeiroCaracter + 1
            )
        );
    }

    analisarNumero(): void {
        const linhaPrimeiroDigito: number = this.linha;
        while (this.eDigito(this.simboloAtual()) && this.linha === linhaPrimeiroDigito) {
            this.avancar();
        }

        if (this.simboloAtual() == '.' && this.eDigito(this.proximoSimbolo())) {
            this.avancar();

            while (this.eDigito(this.simboloAtual())) {
                this.avancar();
            }
        }

        let numeroCompleto: string;
        if (linhaPrimeiroDigito < this.linha) {
            const linhaNumero: string = this.codigo[linhaPrimeiroDigito];
            numeroCompleto = linhaNumero.substring(
                this.inicioSimbolo,
                linhaNumero.length
            );
        } else {
            numeroCompleto = this.codigo[this.linha].substring(
                this.inicioSimbolo,
                this.atual
            );
        }
        
        this.simbolos.push(
            new Simbolo(
                tiposDeSimbolos.NUMERO, 
                numeroCompleto, 
                parseFloat(numeroCompleto), 
                linhaPrimeiroDigito + 1
            )
        );
    }

    identificarPalavraChave(): void {
        const linhaPrimeiroCaracter: number = this.linha;
        while (this.eAlfabetoOuDigito(this.simboloAtual()) && this.linha === linhaPrimeiroCaracter) {
            this.avancar();
        }

        let textoPalavraChave: string;
        if (linhaPrimeiroCaracter < this.linha) {
            const linhaPalavraChave: string = this.codigo[linhaPrimeiroCaracter];
            textoPalavraChave = linhaPalavraChave.substring(
                this.inicioSimbolo,
                linhaPalavraChave.length
            );
        } else {
            textoPalavraChave = this.codigo[this.linha].substring(
                this.inicioSimbolo,
                this.atual
            );
        }

        const tipo: string =
            textoPalavraChave in palavrasReservadas
                ? palavrasReservadas[textoPalavraChave]
                : tiposDeSimbolos.IDENTIFICADOR;

        this.simbolos.push(
            new Simbolo(
                tipo, 
                textoPalavraChave, 
                null, 
                linhaPrimeiroCaracter + 1
            )
        );
    }

    analisarIndentacao(): void {
        let espacos = 0;
        while (['\t', ' '].includes(this.simboloAtual()) && !this.eFinalDoCodigo()) {
            espacos++;
            this.avancar();
        }

        this.pragmas[this.linha + 1] = { linha: this.linha + 1, espacosIndentacao: espacos };
    }

    avancarParaProximaLinha(): void {
        this.linha++;
        this.atual = 0;
        this.analisarIndentacao();
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case ' ':
            case '\t':
                this.avancar();

                break;
            case '\r':
            case '\n':
            case '\0':
            case ';':
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

            case '#':
                this.avancarParaProximaLinha();
                break;

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

            case '/':
                this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                this.avancar();
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
        const inicioMapeamento: [number, number] = hrtime();
        this.simbolos = [];
        this.erros = [];
        this.pragmas = {};

        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;

        this.codigo = codigo || [''];
        // Análise de indentação da primeira linha.
        this.analisarIndentacao();

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
            pragmas: this.pragmas
        } as RetornoLexador;
    }
}
