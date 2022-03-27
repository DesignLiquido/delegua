export interface LexadorInterface {
    Delegua: any;
    codigo: any;
    simbolos: any;
    inicio: any;
    atual: any;
    linha: any;

    eDigito(caractere: any): boolean;
    eAlfabeto(caractere: any): boolean;
    eAlfabetoOuDigito(caractere: any): boolean;
    eFinalDoCodigo(): boolean;
    avancar(): void;
    adicionarSimbolo(tipo: any, literal: any): void;
    correspondeA(esperado: any): boolean;
    caracterAtual(): any;
    proximoCaracter(): any;
    voltar(): any;
    analisarTexto(texto: string): void;
    analisarNumero(): void;
    identificarPalavraChave(): void;
    classificarToken(): void;
    mapear(codigo?: any): any;
}
