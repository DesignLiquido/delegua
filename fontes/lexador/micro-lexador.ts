import { SimboloInterface } from '../interfaces';
import { RetornoLexador } from '../interfaces/retornos';
import { ErroLexador } from './erro-lexador';

import { palavrasReservadasMicroGramatica as palavrasReservadas } from './palavras-reservadas';
import { Simbolo } from './simbolo';

import tiposDeSimbolos from '../tipos-de-simbolos/microgramaticas/delegua';

/**
 * O MicroLexador funciona apenas dentro de interpolações de texto.
 * Portanto, seus tipos de símbolos e palavras reservadas são
 * bastante reduzidos em relação ao lexador normal.
 */
export class MicroLexador {
    simbolos: SimboloInterface[];
    erros: ErroLexador[];
    inicioSimbolo: number;
    atual: number;
    codigo: string;

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

    eFinalDoCodigo(): boolean {
        return this.codigo.length <= this.atual;
    }

    adicionarSimbolo(tipo: string, literal: any = null): void {
        const texto: string = this.codigo.substring(this.inicioSimbolo, this.atual);
        this.simbolos.push(new Simbolo(tipo, literal || texto, literal, 1, -1));
    }

    analisarTexto(delimitador = '"'): void {
        while (this.codigo[this.atual] !== delimitador && !this.eFinalDoCodigo()) {
            this.atual++;
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: 1,
                caractere: this.codigo[this.atual - 1],
                mensagem: 'Texto não finalizado.',
            } as ErroLexador);
            return;
        }

        const valor = this.codigo.substring(this.inicioSimbolo + 1, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor);
    }

    analisarNumero(): void {
        while (this.eDigito(this.codigo[this.atual])) {
            this.atual++;
        }

        if (this.codigo[this.atual] == '.' && this.eDigito(this.codigo[this.atual + 1])) {
            this.atual++;

            while (this.eDigito(this.codigo[this.atual])) {
                this.atual++;
            }
        }

        const numeroCompleto = this.codigo.substring(this.inicioSimbolo, this.atual);

        this.adicionarSimbolo(tiposDeSimbolos.NUMERO, parseFloat(numeroCompleto));
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.codigo[this.atual])) {
            this.atual++;
        }

        const codigo: string = this.codigo.substring(this.inicioSimbolo, this.atual);

        const tipo: string = codigo in palavrasReservadas ? palavrasReservadas[codigo] : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
    }

    analisarToken(): void {
        const caractere = this.codigo[this.atual];

        switch (caractere) {
            case '(':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO);
                this.atual++;
                break;
            case ')':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO);
                this.atual++;
                break;
            case ',':
                this.adicionarSimbolo(tiposDeSimbolos.VIRGULA);
                this.atual++;
                break;
            case '+':
                this.atual++;
                if (this.codigo[this.atual] === '+') {
                    this.adicionarSimbolo(tiposDeSimbolos.INCREMENTAR);
                    this.atual++;
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                }

                break;
            case '-':
                this.atual++;
                if (this.codigo[this.atual] === '-') {
                    this.adicionarSimbolo(tiposDeSimbolos.DECREMENTAR);
                    this.atual++;
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                }

                break;
            case '*':
                this.atual++;
                switch (this.codigo[this.atual]) {
                    case '*':
                        this.atual++;
                        this.adicionarSimbolo(tiposDeSimbolos.EXPONENCIACAO);
                        break;
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                        break;
                }

                break;
            case '/':
                this.atual++;
                this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                break;
            case '%':
                this.atual++;
                this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                break;
            case '\\':
                this.atual++;
                this.adicionarSimbolo(tiposDeSimbolos.DIVISAO_INTEIRA);
                break;
            case ' ':
            case '\0':
            case '\r':
            case '\t':
                this.atual++;
                break;
            case '"':
                this.atual++;
                this.analisarTexto('"');
                this.atual++;
                break;

            case "'":
                this.atual++;
                this.analisarTexto("'");
                this.atual++;
                break;
            default:
                if (this.eDigito(caractere)) this.analisarNumero();
                else if (this.eAlfabeto(caractere)) this.identificarPalavraChave();
                else {
                    this.erros.push({
                        linha: 1,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.',
                    } as ErroLexador);
                    this.atual++;
                }
        }
    }

    /**
     * Lê apenas uma linha de código e a transforma em símbolos.
     * @param codigo O código
     */
    mapear(codigo: string): RetornoLexador<SimboloInterface> {
        this.codigo = codigo;
        this.erros = [];
        this.simbolos = [];
        this.atual = 0;
        this.inicioSimbolo = 0;

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
