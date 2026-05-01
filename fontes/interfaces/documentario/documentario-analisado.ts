import { ParametroDocInterface } from './parametro-doc';
import { RetornaDocInterface } from './retorna-doc';

export interface DocumentarioAnalisadoInterface {
    descricao: string;
    parametros: ParametroDocInterface[];
    retorna?: RetornaDocInterface;
    exemplo?: string;
    depreciado?: string;
    veja: string[];
}
