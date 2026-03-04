export interface CorrecaoSugeridaInterface {
    titulo: string; // "Alterar tipo para 'número'"
    textoOriginal: string; // "qualquer"
    textoSubstituto: string; // "número"
    linha: number;
    colunaInicio: number;
    colunaFim: number;
}
