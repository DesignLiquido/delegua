import { Construto } from "../../construtos";
import { Declaracao } from "../../declaracoes";

export interface CaminhoEscolha {
    condicoes: Construto[];
    declaracoes: Declaracao[];
}
