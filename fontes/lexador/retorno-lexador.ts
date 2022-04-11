import { SimboloInterface } from "../interfaces";
import { ErroLexador } from "./erro-lexador";

export interface RetornoLexador {
    simbolos: SimboloInterface[];
    erros: ErroLexador[];
}