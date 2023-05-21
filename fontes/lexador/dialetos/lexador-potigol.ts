import { RetornoLexador } from "../../interfaces/retornos";
import { ErroLexador } from "../erro-lexador";
import { LexadorBaseLinhaUnica } from "../lexador-base-linha-unica";

import tiposDeSimbolos from '../../tipos-de-simbolos/potigol';
import { palavrasReservadas } from "./palavras-reservadas/potigol";

/**
 * Lexador para o dialeto Potigol.
 * Este dialeto é sensível a tamanho de caixa. `Inteiro` é aceito. `inteiro` não.
 */
export class LexadorPotigol extends LexadorBaseLinhaUnica {
    protected logicaComumCaracteres(delimitador: string) {
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

        const valor = this.codigo.substring(this.inicioSimbolo + 1, this.atual);
        return valor;
    }

    analisarCaracter() {
        const valor = this.logicaComumCaracteres("'");
        this.adicionarSimbolo(tiposDeSimbolos.CARACTERE, valor);
    }

    analisarTexto(): void {
        const valor = this.logicaComumCaracteres('"');
        this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor);
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

        const numeroCompleto = this.codigo.substring(this.inicioSimbolo, this.atual);

        this.adicionarSimbolo(
            real ? tiposDeSimbolos.REAL : tiposDeSimbolos.INTEIRO,
            parseFloat(numeroCompleto));
    }

    avancarParaProximaLinha(): void {
        while (this.codigo[this.atual] !== '\n') {
            this.atual++;
        }
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo = this.codigo.substring(this.inicioSimbolo, this.atual);
        const tipo = codigo in palavrasReservadas ? palavrasReservadas[codigo] : tiposDeSimbolos.IDENTIFICADOR;

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
            /* case '{':
                this.adicionarSimbolo(tiposDeSimbolos.CHAVE_ESQUERDA);
                this.avancar();
                break;
            case '}':
                this.adicionarSimbolo(tiposDeSimbolos.CHAVE_DIREITA);
                this.avancar();
                break; */
            case ':':
                this.adicionarSimbolo(tiposDeSimbolos.DOIS_PONTOS);
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
                this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                /* if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOS_IGUAL);
                    this.avancar();
                } else if (this.simboloAtual() === '-') {
                    this.adicionarSimbolo(tiposDeSimbolos.DECREMENTAR);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                } */
                break;
            case '+':
                this.inicioSimbolo = this.atual;
                this.avancar();
                this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                /* if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIS_IGUAL);
                    this.avancar();
                } else if (this.simboloAtual() === '+') {
                    this.adicionarSimbolo(tiposDeSimbolos.INCREMENTAR);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                } */

                break;
            case '*':
                this.inicioSimbolo = this.atual;
                this.avancar();
                this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                break;
            case '^':
                this.inicioSimbolo = this.atual;
                this.avancar();
                this.adicionarSimbolo(tiposDeSimbolos.EXPONENCIACAO);
                break;
            case '=':
                this.inicioSimbolo = this.atual;
                this.avancar();
                this.adicionarSimbolo(tiposDeSimbolos.IGUAL);
                /* if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL_IGUAL);
                    this.avancar();
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL);
                } */

                break;
            case '#':
                this.avancarParaProximaLinha();
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
             */

            case '<':
                this.avancar();
                switch (this.simboloAtual()) {
                    case '=':
                        this.adicionarSimbolo(tiposDeSimbolos.MENOR_IGUAL);
                        this.avancar();
                        break;
                    case '>':
                        this.adicionarSimbolo(tiposDeSimbolos.DIFERENTE);
                        this.avancar();
                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.MENOR);
                        break;
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
                this.inicioSimbolo = this.atual;
                this.avancar();
                this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                /* switch (this.simboloAtual()) {
                    case '/':
                        this.avancarParaProximaLinha();
                        break;
                    case '*':
                        this.encontrarFimComentarioAsterisco();
                        break;
                    case '=':
                        this.adicionarSimbolo(tiposDeSimbolos.DIVISAO_IGUAL);
                        this.avancar();s
                        break;
                    default:
                        
                        break;
                } */

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
                this.analisarTexto();
                this.avancar();
                break;

            case "'":
                this.avancar();
                this.analisarCaracter();
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

        this.codigo = codigo.join('\n') || '';
        this.hashArquivo = hashArquivo;

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