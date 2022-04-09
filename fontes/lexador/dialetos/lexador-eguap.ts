import { Delegua } from "../../delegua";
import { LexadorInterface, SimboloInterface } from "../../interfaces";
import tiposDeSimbolos from "./tipos-de-simbolos-eguap";
import { Simbolo } from "../simbolo";
import palavrasReservadas from "../palavras-reservadas";

export class LexadorEguaP implements LexadorInterface {
    Delegua: Delegua;
    codigo: string[];
    simbolos: SimboloInterface[];
    inicioSimbolo: number;
    atual: number;
    linha: number;
    logicaEmLinhaIniciada: boolean;
    performance: boolean;

    constructor(Delegua: Delegua, performance: boolean = false) {
        this.Delegua = Delegua;
        this.performance = performance;

        this.simbolos = [];

        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
        this.logicaEmLinhaIniciada = false;
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
        return this.linha == this.codigo.length - 1 ||
            this.codigo[this.codigo.length - 1].length <= this.atual;
    }

    avancar(): void {
        this.atual += 1;

        if (this.eFinalDaLinha() && !this.eUltimaLinha()) {
            this.linha++;
            this.atual = 0;
            this.logicaEmLinhaIniciada = false;
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
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.Delegua.erroNoLexador(
                this.linha,
                this.simboloAnterior(),
                'Texto não finalizado.'
            );
            return;
        }

        const valor = this.codigo[this.linha].substring(
            this.inicioSimbolo + 1,
            this.atual
        );
        this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor);
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

        const numeroCompleto = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );
        this.adicionarSimbolo(
            tiposDeSimbolos.NUMERO,
            parseFloat(numeroCompleto)
        );
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

    analisarIndentacao(): void {
        let espacos = 0;
        while (['\t', ' '].includes(this.simboloAtual()) && !this.eFinalDoCodigo()) {
            espacos++;
            this.avancar();
        }

        this.adicionarSimbolo(tiposDeSimbolos.ESPACO_INDENTACAO, espacos);
    }

    avancarParaProximaLinha(): void {
        this.linha++;
        this.atual = 0;
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case ' ':
            case '\t':
                if (!this.logicaEmLinhaIniciada) {
                    this.analisarIndentacao();
                } else {
                    this.avancar();
                }
                
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
                this.logicaEmLinhaIniciada = true;
                if (this.eDigito(caractere)) this.analisarNumero();
                else if (this.eAlfabeto(caractere))
                    this.identificarPalavraChave();
                else {
                    this.Delegua.erroNoLexador(
                        this.linha + 1,
                        caractere,
                        'Caractere inesperado.'
                    );
                    this.avancar();
                }
        }
    }

    mapear(codigo?: string[]): SimboloInterface[] {
        const inicioMapeamento: number = performance.now();
        this.simbolos = [];
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;

        this.codigo = codigo || [''];

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        const fimMapeamento: number = performance.now();
        if (this.performance) {
            console.log(`[Lexador] Tempo para mapeamento: ${fimMapeamento - inicioMapeamento}ms`);
        }
        
        return this.simbolos;
    }
}
