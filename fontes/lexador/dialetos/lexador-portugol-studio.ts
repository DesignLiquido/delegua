import { RetornoLexador } from '../../interfaces/retornos';
import { ErroLexador } from '../erro-lexador';
import { LexadorBase } from '../lexador-base';

import palavrasReservadas from './palavras-reservadas/portugol-studio';
import tiposDeSimbolos from '../../tipos-de-simbolos/portugol-studio';

/**
 * O Lexador é responsável por transformar o código em uma coleção de tokens de linguagem.
 * Cada token de linguagem é representado por um tipo, um lexema e informações da linha de código em que foi expresso.
 * Também é responsável por mapear as palavras reservadas da linguagem, que não podem ser usadas por outras
 * estruturas, tais como nomes de variáveis, funções, literais, classes e assim por diante.
 */
export class LexadorPortugolStudio extends LexadorBase {
    analisarTexto(delimitador: string): void {
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: 'Cadeia de caracteres não finalizada.',
            } as ErroLexador);
            return;
        }

        const valor = this.codigo[this.linha].substring(this.inicioSimbolo + 1, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.CADEIA, valor);
    }

    analisarNumero(): void {
        let real = false;
        while (this.eDigito(this.simboloAtual())) {
            this.avancar();
        }

        if (this.simboloAtual() == '.' && this.eDigito(this.proximoSimbolo())) {
            real = true;
            this.avancar();

            while (this.eDigito(this.simboloAtual())) {
                this.avancar();
            }
        }

        const numeroCompleto = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);

        this.adicionarSimbolo(
            real ? tiposDeSimbolos.REAL : tiposDeSimbolos.INTEIRO,
            parseFloat(numeroCompleto));
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo: string = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);

        const tipo: string = codigo in palavrasReservadas ? palavrasReservadas[codigo] : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
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
                this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                this.avancar();
                break;
            case '+':
                this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                this.avancar();
                break;

            /* case '%':
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

                break; */
            case '*':
                this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                this.avancar();
                break;
            /* case '!':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.DIFERENTE);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.NEGACAO);
                }

                break; */
            case '=':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL_IGUAL);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL);
                }

                break;

            /* case '&':
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
                break; */

            case '<':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_IGUAL);
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
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                        break;
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

    mapear(codigo: string[], hashArquivo: number): RetornoLexador {
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

        return {
            simbolos: this.simbolos,
            erros: this.erros,
        } as RetornoLexador;
    }
}
