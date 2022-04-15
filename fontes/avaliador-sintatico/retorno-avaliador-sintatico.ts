import { Declaracao } from "../declaracoes";
import { ErroAvaliadorSintatico } from "./erro-avaliador-sintatico";

export interface RetornoAvaliadorSintatico {
    declaracoes: Declaracao[];
    erros: ErroAvaliadorSintatico[]
}