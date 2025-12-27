import { ErroAvaliadorSintatico } from '../avaliador-sintatico/erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from './retornos/retorno-avaliador-sintatico';
import { RetornoLexador } from './retornos/retorno-lexador';
import { SimboloInterface } from './simbolo-interface';

export interface AvaliadorSintaticoInterface<TSimbolo, TDeclaracao> {
    simbolos: TSimbolo[];
    erros: ErroAvaliadorSintatico[];

    atual: number;
    blocos: number;

    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico;
    analisar(
        retornoLexador: RetornoLexador<TSimbolo>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<TDeclaracao>>;
}
