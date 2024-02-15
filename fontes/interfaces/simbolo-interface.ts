export interface SimboloInterface<TTipo = string> {
    lexema: string;
    tipo: TTipo;
    literal: string;
    linha: number;
    hashArquivo: number;
}
