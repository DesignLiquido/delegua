import { RetornoLexador } from '../../interfaces/retornos';
import { ErroLexador } from '../erro-lexador';
import { LexadorBaseLinhaUnica } from '../lexador-base-linha-unica';
import { Simbolo } from '../simbolo';

import tiposDeSimbolos from '../../tipos-de-simbolos/birl';
import { palavrasReservadas } from './palavras-reservadas/birl';
import { SimboloInterface } from '../../interfaces';

export class LexadorBirl extends LexadorBaseLinhaUnica {
    adicionarSimbolo(tipo: string, lexema: string = '', literal: any = null): void {
        this.simbolos.push(new Simbolo(tipo, lexema, literal, this.linha, this.hashArquivo));
    }

    proximoIgualA(esperado: string): boolean {
        if (this.eFinalDoCodigo()) {
            return false;
        }

        if (this.codigo[this.atual] !== esperado) {
            return false;
        }

        this.atual += 1;
        return true;
    }

    analisarTexto(delimitador: string): void {
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: 'Caractere não finalizado',
            } as ErroLexador);
            return;
        }

        const valor = this.codigo.substring(this.inicioSimbolo + 1, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor, valor);
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
        const numeroCompleto = this.codigo.substring(this.inicioSimbolo, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.NUMERO, numeroCompleto, parseFloat(numeroCompleto));
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo: string = this.codigo.substring(this.inicioSimbolo, this.atual);

        const codigoMinusculo = codigo.toLowerCase();

        const tipo: string =
            codigoMinusculo in palavrasReservadas ? palavrasReservadas[codigoMinusculo] : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo, codigo, codigo);
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case ',':
                this.adicionarSimbolo(tiposDeSimbolos.VIRGULA, ',', null);
                this.avancar();
                break;
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
            case '(':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO, '(', null);
                this.avancar();
                break;
            case ')':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')', null);
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
            case '&':
                this.avancar();
                if (this.simboloAtual() === '&') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.E);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.PONTEIRO);
                }
                break;
            case '+':
                this.avancar();
                if (this.simboloAtual() === '+') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.INCREMENTAR);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                }
                break;
            case '-':
                this.avancar();
                if (this.simboloAtual() === '-') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.DECREMENTAR);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                }
                break;
            case '|':
                this.avancar();
                if (this.simboloAtual() === '|') {
                    this.avancar();
                    this.adicionarSimbolo(tiposDeSimbolos.OU);
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.OU);
                }
                break;
            case '*':
                this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                this.avancar();
                break;
            case '/':
                this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                this.avancar();
                break;
            case '%':
                this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                this.avancar();
                break;
            case "'":
                this.analisarTexto("'");
                this.avancar();
                break;
            case '"':
                this.avancar();
                this.analisarTexto('"');
                this.avancar();
                break;
            case ';':
                this.adicionarSimbolo(tiposDeSimbolos.PONTO_E_VIRGULA, ';', null);
                this.avancar();
                break;
            case '?':
                this.adicionarSimbolo(tiposDeSimbolos.INTERROGACAO, '?', null);
                this.avancar();
                break;

            case '\n':
                this.adicionarSimbolo(tiposDeSimbolos.QUEBRA_LINHA, null, null);
                this.avancar();
                this.linha++;
                break;
            case ' ':
            case '\0':
            case '\r':
            case '\t':
            case '':
                this.avancar();
                break;
            default:
                if (this.eDigito(caractere)) this.analisarNumero();
                else if (this.eAlfabeto(caractere)) this.identificarPalavraChave();
                else {
                    this.erros.push({
                        linha: this.linha,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.',
                    } as ErroLexador);
                    this.avancar();
                }
                break;
        }
    }

    InjetaUmItemDentroDaLista(item: string, posicao: number): string[] {
        let codigoComeco: string[];
        let codigoPosPosição: string[];

        for (let i in this.codigo as any) {
            if (Number(i) === posicao) {
                let iterador: number = Number(i);
                while (iterador <= this.codigo.length) {
                    codigoPosPosição.push(this.codigo[iterador]);
                    iterador += 1;
                }
                break;
            }
            codigoComeco.push(this.codigo[i]);
        }

        return [...codigoComeco, ...codigoPosPosição];
    }
    mapear(codigo: string[], hashArquivo: number = -1): RetornoLexador<SimboloInterface> {
        this.erros = [];
        this.simbolos = [];
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 1;
        this.hashArquivo = hashArquivo;

        this.codigo = codigo.join('\n') || '';

        this.codigo += '\n';

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros,
        } as RetornoLexador<SimboloInterface>;
    }
}
