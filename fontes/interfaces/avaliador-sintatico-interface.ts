import { ErroAvaliadorSintatico } from '../avaliador-sintatico/erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from './retornos/retorno-avaliador-sintatico';
import { RetornoLexador } from './retornos/retorno-lexador';

export interface AvaliadorSintaticoInterface<TSimbolo, TDeclaracao> {
    simbolos: TSimbolo[];
    erros: ErroAvaliadorSintatico[];

    atual: number;
    blocos: number;

    analisar(retornoLexador: RetornoLexador<TSimbolo>, hashArquivo: number): RetornoAvaliadorSintatico<TDeclaracao>;
}
