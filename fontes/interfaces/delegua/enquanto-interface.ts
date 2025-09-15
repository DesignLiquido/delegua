import { Construto } from "../../construtos";
import { Bloco } from "../../declaracoes";

export interface EnquantoInterface {
    linha: number;
    hashArquivo: number;
    condicao: Construto;
    corpo: Bloco;
}
