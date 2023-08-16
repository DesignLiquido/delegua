import { Pragma } from '../../lexador/dialetos/pragma';
import { ErroLexador } from '../../lexador/erro-lexador';

export interface RetornoLexador<T> {
    simbolos: T[];
    erros: ErroLexador[];
    pragmas?: { [linha: number]: Pragma };
}
