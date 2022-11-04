import { ErroInterpretador } from '../../interpretador/erro-interpretador';

export interface RetornoInterpretador {
    erros: ErroInterpretador[];
    resultado: string[];
}
