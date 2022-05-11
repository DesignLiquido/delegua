import { ErroAvaliadorSintatico } from "../avaliador-sintatico";
import { ErroInterpretador } from "../interpretador";
import { ErroLexador } from "../lexador/erro-lexador";

export interface RetornoExecutarInterface {
    erros: Array<ErroAvaliadorSintatico | ErroLexador | ErroInterpretador>;
    resultado: Array<String>;
}