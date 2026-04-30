import { ErroAvaliadorSintatico } from "../../avaliador-sintatico";
import { RetornoAvaliadorSintatico, RetornoLexador } from "../retornos";
import { SimboloInterface } from "../simbolo-interface";

export interface AvaliadorSintaticoInterface<TSimbolo, TDeclaracao> {
    simbolos: TSimbolo[];
    erros: ErroAvaliadorSintatico[];

    atual: number;
    blocos: number;

    erro(
        simbolo: SimboloInterface,
        mensagemDeErro: string,
        codigoDiagnostico?: string,
        simboloRelacionado?: SimboloInterface
    ): ErroAvaliadorSintatico;
    analisar(
        retornoLexador: RetornoLexador<TSimbolo>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<TDeclaracao>>;
}
