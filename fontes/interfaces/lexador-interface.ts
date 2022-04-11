import { RetornoLexador } from "../lexador/retorno-lexador";
import { SimboloInterface } from "./simbolo-interface";

export interface LexadorInterface {
    simbolos: SimboloInterface[];
    codigo: string[];
    inicioSimbolo: number;
    atual: number;
    linha: number;

    eDigito(caractere: string): boolean;
    eAlfabeto(caractere: string): boolean;
    eAlfabetoOuDigito(caractere: string): boolean;
    eFinalDoCodigo(): boolean;
    avancar(): void;
    adicionarSimbolo(tipo: any, literal: any): void;
    proximoIgualA(esperado: any): boolean;
    simboloAtual(): string;
    proximoSimbolo(): string;
    simboloAnterior(): string;
    analisarTexto(texto: string): void;
    analisarNumero(): void;
    identificarPalavraChave(): void;
    analisarToken(): void;
    mapear(codigo?: string[]): RetornoLexador;
}
