import { ParametroDoc } from './parametro-doc';
import { RetornaDoc } from './retorna-doc';

export interface DocumentarioAnalisado {
    descricao: string;
    parametros: ParametroDoc[];
    retorna?: RetornaDoc;
    exemplo?: string;
    depreciado?: string;
    veja: string[];
}
