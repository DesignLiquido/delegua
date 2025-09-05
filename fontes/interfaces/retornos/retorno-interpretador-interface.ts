import { ErroInterpretador } from '../erros/erro-interpretador';
import { ResultadoParcialInterpretadorInterface } from '../resultado-parcial-interpretador-interface';

export interface RetornoInterpretadorInterface {
    erros: ErroInterpretador[];
    resultado: ResultadoParcialInterpretadorInterface[];
}
