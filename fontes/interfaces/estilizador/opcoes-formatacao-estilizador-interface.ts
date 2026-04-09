export type DelimitadorTextoEstilizador = 'aspas-simples' | 'aspas-duplas' | 'preservar';

export interface OpcoesFormatacaoEstilizadorInterface {
    delimitadorTexto?: DelimitadorTextoEstilizador;
    quebraLinha?: string;
    tamanhoIndentacao?: number;
    maximoCaracteresPorLinha?: number;
}
