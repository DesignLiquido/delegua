import { TipoInferencia } from '../inferenciador';

export interface VariavelHipoteticaInterface {
    tipo: TipoInferencia | undefined;
    subtipo?: 'texto' | 'número' | 'inteiro' | 'longo' | 'lógico';
    imutavel: boolean;
    valor?: any;
    valorDefinido: boolean;
}
