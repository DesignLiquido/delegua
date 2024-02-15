import { ErroInterpretador } from "../erros/erro-interpretador";

export interface RetornoExecucaoInterface {
    erros: Array<ErroInterpretador>;
    resultado: Array<string>;
}
