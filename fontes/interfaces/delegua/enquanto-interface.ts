import { Bloco } from '../../declaracoes';
import { ConstrutoInterface } from '../construtos';

export interface EnquantoInterface {
    linha: number;
    hashArquivo: number;
    condicao: ConstrutoInterface;
    corpo: Bloco;
}
