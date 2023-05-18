import { SimboloInterface } from "../interfaces";
import { RetornoLexador } from "../interfaces/retornos";
import { ErroLexador } from "./erro-lexador";

import { palavrasReservadasMicroGramatica as palavrasReservadas }  from './palavras-reservadas';
import tiposDeSimbolos from "../tipos-de-simbolos/microgramaticas/delegua";
import { Simbolo } from "./simbolo";

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

    adicionarSimbolo(tipo: string, literal: any = null): void {
        const texto: string = this.codigo.substring(this.inicioSimbolo, this.atual);
        this.simbolos.push(new Simbolo(tipo, literal || texto, literal, 1, -1));
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
    mapear(codigo: string): RetornoLexador {
        this.codigo = codigo;
        this.erros = [];
        this.simbolos = [];
        this.atual = 0;
        this.inicioSimbolo = 0;

        while (this.atual < codigo.length) {
            this.analisarToken();
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros,
        } as RetornoLexador;
    }
}