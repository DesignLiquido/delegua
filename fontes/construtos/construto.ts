export interface Construto {
    linha: number;
    hashArquivo?: number;
    valor?: any;
    aceitar(visitante: any): Promise<any>;
}
