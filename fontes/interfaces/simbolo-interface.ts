export interface SimboloInterface<TTipo = string> {
    lexema: string;
    tipo: TTipo;
    literal: any;
    linha: number;
    hashArquivo: number;
    colunaInicio?: number;
    colunaFim?: number;
    delimitadorTexto?: "'" | '"';
}
