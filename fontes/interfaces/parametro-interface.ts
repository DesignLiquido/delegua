import { SimboloInterface } from './simbolo-interface';
import { TiposDadosInterface } from './tipos-dados-interface';

export interface ParametroInterface {
    abrangencia: 'padrao' | 'multiplo';
    nome: SimboloInterface;
    tipo?: TiposDadosInterface;
    valorPadrao?: any;
}
