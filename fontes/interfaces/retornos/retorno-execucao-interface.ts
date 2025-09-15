import { ErroInterpretador } from '../erros/erro-interpretador';
import { ResultadoParcialInterpretadorInterface } from '../resultado-parcial-interpretador-interface';

export interface RetornoExecucaoInterface {
    erros: Array<ErroInterpretador>;
    resultado: Array<ResultadoParcialInterpretadorInterface>;
}
