import { LexadorInterface, SimboloInterface } from "../../interfaces";
import { RetornoLexador } from "../../interfaces/retornos";
import { ErroLexador } from "../erro-lexador";
import { Simbolo } from "../simbolo";

import { palavrasReservadas } from "./palavras-reservadas/portugol-ipt";
import tiposDeSimbolos from "../../tipos-de-simbolos/portugol-ipt";

export class LexadorPortugolIpt implements LexadorInterface {
    simbolos: SimboloInterface[];
    erros: ErroLexador[];
    hashArquivo: number;
    
    codigo: string[];
    inicioSimbolo: number;
    atual: number;
    linha: number;

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

    eFinalDoCodigo(): boolean {
        if (this.linha > this.codigo.length - 1) 
            return true;

        return this.linha == this.codigo.length - 1 && 
            this.codigo[this.codigo.length - 1].length <= this.atual;
    }

    /**
     * Indica se o código está na última linha.
     * @returns Verdadeiro se contador de linhas está na última linha.
     *          Falso caso contrário.
     */
    private eUltimaLinha(): boolean {
        return this.linha >= this.codigo.length - 1;
    }

    avancar(): string | void {
        this.atual += 1;

        if (this.eFinalDaLinha() && !this.eUltimaLinha()) {
            this.linha++;
            this.atual = 0;
        }
    }

    adicionarSimbolo(tipo: any, literal?: any): void {
        const texto: string = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        this.simbolos.push(new Simbolo(tipo, literal || texto, literal, this.linha + 1, this.hashArquivo));
    }

    private eFinalDaLinha(): boolean {
        return this.atual >= this.codigo[this.linha].length;
    }

    simboloAtual(): string {
        if (this.eFinalDaLinha()) return '\0';
        if (this.linha > this.codigo.length - 1) return '\0';
        return this.codigo[this.linha].charAt(this.atual);
    }

    proximoSimbolo(): string {
        if (this.atual + 1 >= this.codigo[this.linha].length) 
            return '\0';
        return this.codigo[this.linha].charAt(this.atual + 1);
    }

    simboloAnterior(): string {
        return this.codigo[this.linha].charAt(this.atual - 1);
    }

    analisarTexto(delimitador: string): void {
        const linhaPrimeiroCaracter: number = this.linha;
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

        const textoCompleto = this.codigo[this.linha].substring(this.inicioSimbolo + 1, this.atual);

        this.simbolos.push(
            new Simbolo(
                tiposDeSimbolos.TEXTO,
                textoCompleto,
                textoCompleto,
                linhaPrimeiroCaracter + 1,
                this.hashArquivo
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
            numeroCompleto = linhaNumero.substring(this.inicioSimbolo, linhaNumero.length);
        } else {
            numeroCompleto = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        }

        this.simbolos.push(
            new Simbolo(
                tiposDeSimbolos.INTEIRO,
                numeroCompleto,
                parseFloat(numeroCompleto),
                linhaPrimeiroDigito + 1,
                this.hashArquivo
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
            textoPalavraChave = linhaPalavraChave.substring(this.inicioSimbolo, linhaPalavraChave.length);
        } else {
            textoPalavraChave = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        }

        const tipo: string =
            textoPalavraChave in palavrasReservadas
                ? palavrasReservadas[textoPalavraChave]
                : tiposDeSimbolos.IDENTIFICADOR;

        this.simbolos.push(new Simbolo(tipo, textoPalavraChave, null, linhaPrimeiroCaracter + 1, this.hashArquivo));
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case ';':
                // TODO: Ponto-e-vírgula não é exatamente tolerado em Portugol IPT.
                this.avancar();
                break;
            case ' ':
            case '\t':
            case '\0':
                this.avancar();
                break;
            case '\r':
            case '\n':
                this.adicionarSimbolo(tiposDeSimbolos.QUEBRA_LINHA);
                this.avancar();
                break;
            case '"':
                this.avancar();
                this.analisarTexto('"');
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
                    /* case '>':
                        this.adicionarSimbolo(tiposDeSimbolos.DIFERENTE);
                        this.avancar();
                        break; */
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.MENOR);
                        break;
                }

                break;
            case '>':
                this.avancar();
                switch (this.simboloAtual()) {
                    case '=':
                        this.adicionarSimbolo(tiposDeSimbolos.MAIOR_IGUAL);
                        this.avancar();
                        break;
                    /* case '>':
                        this.adicionarSimbolo(tiposDeSimbolos.DIFERENTE);
                        this.avancar();
                        break; */
                    default:
                        this.adicionarSimbolo(tiposDeSimbolos.MAIOR);
                        break;
                }

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
        this.simbolos = [];
        this.erros = [];

        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;

        this.codigo = codigo || [''];
        this.hashArquivo = hashArquivo;

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros
        } as RetornoLexador;
    }
}