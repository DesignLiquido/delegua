import { RetornoAvaliadorSintatico } from "../interfaces/retornos/retorno-avaliador-sintatico";
import { RetornoLexador } from "../interfaces/retornos/retorno-lexador";

export interface RetornoImportador {
    nomeArquivo: string;
    hashArquivo: number;
    codigo: string[];
    retornoLexador: RetornoLexador;
    retornoAvaliadorSintatico: RetornoAvaliadorSintatico;
}
