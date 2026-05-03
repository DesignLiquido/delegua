import { Declaracao } from '../../declaracoes';
import { ConstrutoInterface } from './construto-interface';

export interface CaminhoEscolha {
    condicoes: ConstrutoInterface[];
    declaracoes: Declaracao[];
}
