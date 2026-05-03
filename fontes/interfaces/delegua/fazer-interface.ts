import { Bloco } from '../../declaracoes';
import { ConstrutoInterface } from '../construtos';

export interface FazerInterface {
    linha: number;
    hashArquivo: number;
    caminhoFazer: Bloco;
    condicaoEnquanto: ConstrutoInterface;
}
