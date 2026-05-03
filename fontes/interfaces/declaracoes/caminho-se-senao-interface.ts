import { Declaracao } from '../../declaracoes';
import { ConstrutoInterface } from '../construtos/construto-interface';

export interface CaminhoSeSenaoInterface {
    condicao: ConstrutoInterface;
    caminho: Declaracao;
}
