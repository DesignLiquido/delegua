import { SimboloInterface } from './simbolo-interface';

export interface ParametroInterface {
    abrangencia: 'padrao' | 'multiplo';
    nome: SimboloInterface;
    valorPadrao?: any;
}
