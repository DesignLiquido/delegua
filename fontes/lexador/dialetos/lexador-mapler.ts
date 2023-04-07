import { RetornoLexador } from '../../interfaces/retornos';
import { LexadorBaseLinhaUnica } from '../lexador-base-linha-unica';
import { ErroLexador } from '../erro-lexador';

import tiposDeSimbolos from '../../tipos-de-simbolos/mapler';
import palavrasReservadas from './palavras-reservadas/mapler';

export class LexadorMapler extends LexadorBaseLinhaUnica {
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

        const numeroCompleto = this.codigo.substring(this.inicioSimbolo, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.NUMERO, parseFloat(numeroCompleto));
    }

    analisarTexto(delimitador: string): void {
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: 'Caractere não finalizado.',
            } as ErroLexador);
            return;
        }

        const valor = this.codigo.substring(this.inicioSimbolo + 1, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.CARACTERE, valor);
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo = this.codigo.substring(this.inicioSimbolo, this.atual).toLowerCase();
        if (codigo in palavrasReservadas) {
            this.adicionarSimbolo(
                palavrasReservadas[codigo],
                codigo
            );
        } else {
            this.adicionarSimbolo(tiposDeSimbolos.IDENTIFICADOR, codigo);
        }
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case '(':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO);
                this.avancar();
                break;
            case ')':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO);
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
            case ':':
                this.adicionarSimbolo(tiposDeSimbolos.DOIS_PONTOS);
                this.avancar();
                break;
            case '<':
                this.avancar();
                switch (this.simboloAtual()) {
                    case '-':
                        this.adicionarSimbolo(tiposDeSimbolos.SETA_ATRIBUICAO);
                        this.avancar();
                        break;
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
            case '=':
                this.adicionarSimbolo(tiposDeSimbolos.IGUAL);
                this.avancar();
                break;
            case ',':
                this.adicionarSimbolo(tiposDeSimbolos.VIRGULA);
                this.avancar();
                break;
            case ';':
                this.adicionarSimbolo(tiposDeSimbolos.PONTO_VIRGULA);
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
            case '%':
                this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                this.avancar();
                break;
            case '*':
                this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                this.avancar();
                break;
            case '/':
                this.avancar();
                switch (this.simboloAtual()) {
                    case '/':
                        while (this.simboloAtual() != '\n' && !this.eFinalDoCodigo()) this.avancar();
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
                this.avancar();
                break;

            case '\n':
                // this.adicionarSimbolo(tiposDeSimbolos.QUEBRA_LINHA);
                this.linha++;
                this.avancar();
                break;

            // case '"':
            //     this.avancar();
            //     this.analisarTexto('"');
            //     this.avancar();
            //     break;
            case '"':
                this.avancar();
                this.analisarTexto('"');
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
