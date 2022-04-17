import { SimboloInterface } from "../interfaces";
import { Pragma } from "./dialetos/pragma";
import { ErroLexador } from "./erro-lexador";

export interface RetornoLexador {
    simbolos: SimboloInterface[];
    erros: ErroLexador[];
    pragmas?: { [linha: number]: Pragma };
}