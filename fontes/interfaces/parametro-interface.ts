import { SimboloInterface } from './simbolo-interface';
import { TiposDadosInterface } from './tipos-dados-interface';

interface TipoDadoParametroInterface {
    nome: string;
    tipo: TiposDadosInterface;
    tipoInvalido?: string;
}
export interface ParametroInterface {
    abrangencia: 'padrao' | 'multiplo';
    nome: SimboloInterface;
    tipoDado?: TipoDadoParametroInterface;
    valorPadrao?: any;
    referencia?: boolean;
}
