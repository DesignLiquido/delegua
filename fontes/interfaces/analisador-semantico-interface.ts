import { Construto } from '../construtos';
import {
    Declaracao
} from '../declaracoes';

import { RetornoAnalisadorSemantico } from './retornos/retorno-analisador-semantico';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface AnalisadorSemanticoInterface extends VisitanteComumInterface {
    avaliar(expressao: Construto | Declaracao): any;
    analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico;
}
