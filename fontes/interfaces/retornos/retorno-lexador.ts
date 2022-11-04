import { SimboloInterface } from '..';
import { Pragma } from '../../lexador/dialetos/pragma';
import { ErroLexador } from '../../lexador/erro-lexador';

export interface RetornoLexador {
    simbolos: SimboloInterface[];
    erros: ErroLexador[];
    pragmas?: { [linha: number]: Pragma };
}
