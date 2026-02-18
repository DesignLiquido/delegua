import { ErroInterpretadorInterface } from '../erros/erro-interpretador-interface';
import { ResultadoParcialInterpretadorInterface } from '../resultado-parcial-interpretador-interface';

export interface RetornoExecucaoInterface {
    erros: Array<ErroInterpretadorInterface>;
    resultado: Array<ResultadoParcialInterpretadorInterface>;
}
