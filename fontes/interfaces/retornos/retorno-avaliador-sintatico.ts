import { Declaracao } from "../../declaracoes";
import { ErroAvaliadorSintatico } from "../../avaliador-sintatico/erro-avaliador-sintatico";

export interface RetornoAvaliadorSintatico {
    declaracoes: Declaracao[];
    erros: ErroAvaliadorSintatico[]
}