import { SimboloInterface } from '../interfaces';

export interface ErroInterpretador {
    simbolo?: SimboloInterface;
    mensagem?: string;
    erroInterno?: any;
    linha?: number;
    hashArquivo?: number;
}
