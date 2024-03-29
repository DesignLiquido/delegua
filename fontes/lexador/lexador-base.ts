import { LexadorInterface, SimboloInterface } from '../interfaces';
import { RetornoLexador } from '../interfaces/retornos';
import { ErroLexador } from './erro-lexador';
import { Simbolo } from './simbolo';

/**
 * Essa versão do Lexador Base é por padrão com comentários multilinha.
 * Em outras palavras, se o dialeto da linguagem terá comentários multilinha,
 * este Lexador Base deverá ser usado.
 */
export abstract class LexadorBase implements LexadorInterface<SimboloInterface> {
    erros: ErroLexador[];
    hashArquivo: number;

    simbolos: SimboloInterface[];
    codigo: string[];
    inicioSimbolo: number;
    atual: number;
    linha: number;

    constructor() {
        this.simbolos = [];
        this.erros = [];

        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
    }

    protected avancarParaProximaLinha(): void {
        this.linha++;
        this.atual = 0;
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
    protected eUltimaLinha(): boolean {
        return this.linha >= this.codigo.length - 1;
    }

    eFinalDoCodigo(): boolean {
        return this.eUltimaLinha() && this.codigo[this.codigo.length - 1].length <= this.atual;
    }

    eFinalDaLinha(): boolean {
        if (this.codigo.length === this.linha) {
            return true;
        }
        return this.atual >= this.codigo[this.linha].length;
    }

    protected encontrarFimComentarioAsterisco(): void {
        while (!this.eFinalDoCodigo()) {
            this.avancar();
            if (this.simboloAtual() === '*' && this.proximoSimbolo() === '/') {
                this.avancar();
                this.avancar();
                break;
            }
        }
    }

    avancar(): void {
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

    simboloAtual(): string {
        if (this.eFinalDoCodigo()) return '\0';
        return this.codigo[this.linha].charAt(this.atual);
    }

    proximoSimbolo(): string {
        if (this.atual + 1 >= this.codigo[this.linha].length) return '\0';
        return this.codigo[this.linha].charAt(this.atual + 1);
    }

    simboloAnterior(): string {
        return this.codigo[this.linha].charAt(this.atual - 1);
    }

    abstract analisarTexto(delimitador: string): void;

    abstract analisarNumero(): void;

    abstract identificarPalavraChave(): void;

    abstract analisarToken(): void;

    abstract mapear(codigo: string[], hashArquivo: number): RetornoLexador<SimboloInterface>;
}
