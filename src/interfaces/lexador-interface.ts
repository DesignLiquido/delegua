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
    igualA(esperado: any): boolean;
    simboloAtual(): any;
    proximoSimbolo(): any;
    voltar(): any;
    analisarTexto(texto: string): void;
    analisarNumero(): void;
    identificarPalavraChave(): void;
    analisarToken(): void;
    mapear(codigo?: any): any;
}
