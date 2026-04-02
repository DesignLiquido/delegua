import { Declaracao } from '../declaracoes';

import { RetornoAnalisadorSemantico } from './retornos/retorno-analisador-semantico';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface AnalisadorSemanticoInterface extends VisitanteComumInterface {
    definirClassesExternasConhecidas?(classesExternasConhecidas: string[]): void;
    analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemantico>;
}
