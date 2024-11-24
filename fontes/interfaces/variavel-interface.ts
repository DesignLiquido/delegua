import { TIPO_NATIVO, TipoInferencia } from '../interpretador';

export interface VariavelInterface {
    valor: any;
    tipo: TipoInferencia | TIPO_NATIVO;
    subtipo?: 'texto' | 'número' | 'longo' | 'lógico';
    imutavel: boolean;
    nomeReferencia?: string;
}
