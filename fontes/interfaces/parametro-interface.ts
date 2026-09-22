import { SimboloInterface } from './simbolo-interface';

export interface ParametroInterface {
    abrangencia: 'padrao' | 'multiplo';
    nome: SimboloInterface;
    tipoDado: string;
    valorPadrao?: any;
    referencia?: boolean;
    /** Parâmetro declarado com `constante`: não pode ser reatribuído dentro da função. */
    imutavel?: boolean;
    /** Parâmetro declarado com `fixo`: o valor recebido (vetor/objeto) é congelado, impedindo mutação mesmo por alias. */
    fixo?: boolean;
}
