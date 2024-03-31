import { QualTipo } from '../construtos';

import { VisitanteComumInterface } from './visitante-comum-interface';

// TODO: Depreciado. Remover após remover `QualTipo`.
export interface InterpretadorInterfacePotigol extends VisitanteComumInterface {
    visitarExpressaoQualTipo(expressao: QualTipo): Promise<string>;
}
