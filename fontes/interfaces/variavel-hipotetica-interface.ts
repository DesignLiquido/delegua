import { TipoDadosElementar } from '../tipo-dados-elementar';

export interface VariavelHipoteticaInterface {
    tipo: TipoDadosElementar;
    subtipo?: 'texto' | 'número' | 'inteiro' | 'longo' | 'lógico';
    imutavel: boolean;
    valor?: any;
}
