import { Declaracao } from '../declaracoes';

import { RetornoAnalisadorSemantico } from './retornos/retorno-analisador-semantico';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface AnalisadorSemanticoInterface extends VisitanteComumInterface {
    analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico;
}
