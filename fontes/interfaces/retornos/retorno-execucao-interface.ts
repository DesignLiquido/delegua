import { ErroInterpretador } from "../../interpretador";

export interface RetornoExecucaoInterface {
    erros: Array<ErroInterpretador>;
    resultado: Array<string>;
}
