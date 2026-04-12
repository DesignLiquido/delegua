import { Construto } from "../../construtos";
import { Declaracao } from "../../declaracoes";

export interface CaminhoSeSenao {
    condicao: Construto;
    caminho: Declaracao;
}
