import { Classe, Funcao, Var } from "../../declaracoes";
import { RetornoResolverDeclaracao } from "./retorno-resolver-declaracao";

export type RetornoDeclaracao =
    | Var
    | Funcao
    | Classe
    | RetornoResolverDeclaracao;
