import { SimboloInterface } from './simbolo-interface';
import { TipoDadosElementar } from '../tipo-dados-elementar';

interface TipoDadoParametroInterface {
    nome: string;
    tipo: TipoDadosElementar;
    tipoInvalido?: string;
}
export interface ParametroInterface {
    abrangencia: 'padrao' | 'multiplo';
    nome: SimboloInterface;
    tipoDado?: TipoDadoParametroInterface;
    valorPadrao?: any;
    referencia?: boolean;
}
