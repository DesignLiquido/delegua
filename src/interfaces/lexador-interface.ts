export interface LexadorInterface {
    Delegua: any;
    simbolos: any;
    codigo: any;
    inicioSimbolo: number;
    atual: number;
    linha: number;

    eDigito(caractere: any): boolean;
    eAlfabeto(caractere: any): boolean;
    eAlfabetoOuDigito(caractere: any): boolean;
    eFinalDoCodigo(): boolean;
    avancar(): void;
    adicionarSimbolo(tipo: any, literal: any): void;
    proximoIgualA(esperado: any): boolean;
    simboloAtual(): any;
    proximoSimbolo(): any;
    simboloAnterior(): any;
    analisarTexto(texto: string): void;
    analisarNumero(): void;
    identificarPalavraChave(): void;
    analisarToken(): void;
    mapear(codigo?: string[]): any;
}
