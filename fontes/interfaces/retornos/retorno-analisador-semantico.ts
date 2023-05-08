import { ErroAnalisadorSemantico } from "../erros";

export interface RetornoAnalisadorSemantico {
    erros: ErroAnalisadorSemantico[];
    resultado: string[];
}
