import { Construto } from '../../construtos';
import { Bloco } from '../../declaracoes';

export interface FazerInterface {
    linha: number;
    hashArquivo: number;
    caminhoFazer: Bloco;
    condicaoEnquanto: Construto;
}
