import { SimboloInterface } from "../simbolo-interface";

export interface ErroAnalisadorSemantico {
    simbolo?: SimboloInterface;
    mensagem?: string;
    erroInterno?: any;
    linha?: number;
    hashArquivo?: number;
}
