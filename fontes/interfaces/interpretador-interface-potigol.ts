import { QualTipo } from '../construtos';

import { VisitanteComumInterface } from './visitante-comum-interface';

export interface InterpretadorInterfacePotigol extends VisitanteComumInterface { 
    visitarExpressaoQualTipo(expressao: QualTipo): Promise<string>;
}
