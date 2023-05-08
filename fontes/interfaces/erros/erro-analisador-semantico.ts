import { SimboloInterface } from "../simbolo-interface";

export interface ErroAnalisadorSemantico {
    simbolo?: SimboloInterface;
    mensagem?: string;
    linha?: number;
    hashArquivo?: number;
}
