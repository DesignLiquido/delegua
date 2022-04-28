import { RetornoAvaliadorSintatico } from "../avaliador-sintatico/retorno-avaliador-sintatico";
import { RetornoLexador } from "../lexador/retorno-lexador";

export interface RetornoImportador {
    nomeArquivo: string;
    hashArquivo: number;
    codigo: string[];
    retornoLexador: RetornoLexador;
    retornoAvaliadorSintatico: RetornoAvaliadorSintatico;
}
