import { SimboloInterface } from './simbolo-interface';

export interface ParametroInterface {
    tipo: 'padrao' | 'multiplo';
    nome: SimboloInterface;
    valorPadrao?: any;
}
