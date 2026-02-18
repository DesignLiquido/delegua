import { SimboloInterface } from '..';

export interface ErroInterpretadorInterface {
    simbolo?: SimboloInterface;
    mensagem?: string;
    erroInterno?: any;
    linha?: number;
    hashArquivo?: number;
}
