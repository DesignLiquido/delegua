export interface EscopoVariavel {
    nome: string;
    tipo: string;
    imutavel: boolean;
    valor?: any;
    inicializada: boolean;
    usada: boolean;
    hashArquivo: number;
    linha: number;
}
