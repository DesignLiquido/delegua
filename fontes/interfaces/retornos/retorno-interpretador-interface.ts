import { ErroInterpretadorInterface } from '../erros/erro-interpretador-interface';
import { ResultadoParcialInterpretadorInterface } from '../resultado-parcial-interpretador-interface';

export interface RetornoInterpretadorInterface {
    erros: ErroInterpretadorInterface[];
    resultado: ResultadoParcialInterpretadorInterface[];
}
