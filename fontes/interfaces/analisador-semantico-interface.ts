import { Declaracao } from '../declaracoes';
import { Classe } from '../declaracoes/classe';

import { RetornoAnalisadorSemanticoInterface } from './retornos/retorno-analisador-semantico-interface';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface AnalisadorSemanticoInterface extends VisitanteComumInterface {
    registrarClassesExternas?(classes: Classe[]): void;
    analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemanticoInterface>;
}
