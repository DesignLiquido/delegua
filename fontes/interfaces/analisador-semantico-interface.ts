import { Declaracao } from '../declaracoes';

import { RetornoAnalisadorSemanticoInterface } from './retornos/retorno-analisador-semantico-interface';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface AnalisadorSemanticoInterface extends VisitanteComumInterface {
    definirClassesExternasConhecidas?(classesExternasConhecidas: string[]): void;
    analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemanticoInterface>;
}
