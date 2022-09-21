import { EspacoVariaveis } from "../espaco-variaveis";
import { Declaracao } from "../declaracoes";

export interface EscopoExecucao {
    declaracoes: Declaracao[];
    declaracaoAtual: number;
    ambiente: EspacoVariaveis;
}
