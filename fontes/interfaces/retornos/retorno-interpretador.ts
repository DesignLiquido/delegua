import { ErroInterpretador } from '../erros/erro-interpretador';

export interface RetornoInterpretador {
    erros: ErroInterpretador[];
    resultado: string[];
}
