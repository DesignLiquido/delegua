import { RetornoLexador } from "../../interfaces/retornos";
import { LexadorBase } from "../lexador-base";
import { ErroLexador } from "../erro-lexador";

import tiposDeSimbolos from "../../tipos-de-simbolos/visualg";
import palavrasReservadas from "./palavras-reservadas/visualg";
import { Simbolo } from "../simbolo";

export class LexadorVisuAlg extends LexadorBase {

    analisarNumero(): void {
        throw new Error("Method not implemented.");
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

        const valor = this.codigo[this.linha].substring(
            this.inicioSimbolo + 1,
            this.atual
        );
        this.adicionarSimbolo(tiposDeSimbolos.CARACTERE, valor);
    }

    identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo: string = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );
        const tipo: string =
            codigo in palavrasReservadas
                ? palavrasReservadas[codigo]
                : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
    }

    adicionarSimbolo(tipo: string, literal: any = null): void {
        const texto: string = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );
        this.simbolos.push(
            new Simbolo(
                tipo,
                literal || texto,
                literal,
                this.linha + 1,
                -1
            )
        );
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            // Esta sessão ignora espaços em branco na tokenização.
            // Ponto-e-vírgula é opcional em Delégua, então pode apenas ser ignorado.
            case ' ':
            case '\0':
            case '\r':
            case '\t':
            case ';':
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
        this.linha = 1;

        this.codigo = codigo || [''];

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