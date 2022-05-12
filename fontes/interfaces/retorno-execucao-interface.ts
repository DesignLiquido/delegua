import { ErroAvaliadorSintatico } from "../avaliador-sintatico";
import { ErroInterpretador } from "../interpretador";
import { ErroLexador } from "../lexador/erro-lexador";

export interface RetornoExecucaoInterface {
    erros: {
        avaliadorSintatico: Array<ErroAvaliadorSintatico>
        lexador: Array<ErroLexador>
        interpretador: Array<ErroInterpretador>
    }
    resultado: Array<String>;
}