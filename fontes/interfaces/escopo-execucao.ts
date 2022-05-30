import { Ambiente } from "../ambiente";
import { Declaracao } from "../declaracoes";

export interface EscopoExecucao {
    declaracoes: Declaracao[];
    declaracaoAtual: number;
    ambiente: Ambiente;
}
