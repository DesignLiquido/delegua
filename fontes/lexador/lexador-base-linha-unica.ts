import { LexadorInterface, SimboloInterface } from '../interfaces';
import { RetornoLexador } from '../interfaces/retornos';
import { ErroLexador } from './erro-lexador';
import { Simbolo } from './simbolo';

export abstract class LexadorBaseLinhaUnica implements LexadorInterface {
    simbolos: SimboloInterface[];
    codigo: string;
    inicioSimbolo: number;
    atual: number;
    linha: number;
    erros: ErroLexador[];
    hashArquivo: number;

    constructor() {
        this.simbolos = [];
        this.erros = [];

        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
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

    eFinalDoCodigo(): boolean {
        return this.atual >= this.codigo.length;
    }

    eFinalDaLinha(): boolean {
        if (this.codigo.length === this.linha) {
            return true;
        }
        return this.atual >= this.codigo[this.linha].length;
    }

    avancar(): string {
        this.atual += 1;
        return this.codigo[this.atual - 1];
    }

    adicionarSimbolo(tipo: any, literal?: any): void {
        const texto: string = this.codigo.substring(this.inicioSimbolo, this.atual);
        this.simbolos.push(new Simbolo(tipo, literal || texto, literal, this.linha + 1, this.hashArquivo));
    }

    simboloAtual(): string {
        if (this.eFinalDoCodigo()) return '\0';
        return this.codigo.charAt(this.atual);
    }

    proximoSimbolo(): string {
        if (this.atual + 1 >= this.codigo.length) return '\0';
        return this.codigo.charAt(this.atual + 1);
    }

    simboloAnterior(): string {
        return this.codigo.charAt(this.atual - 1);
    }

    abstract analisarTexto(delimitador: string): void;

    abstract analisarNumero(): void;

    abstract identificarPalavraChave(): void;

    abstract analisarToken(): void;

    abstract mapear(codigo: string[], hashArquivo: number): RetornoLexador;
}
