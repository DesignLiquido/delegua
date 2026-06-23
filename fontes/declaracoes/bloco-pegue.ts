import { SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class BlocoPegue {
    parametro?: SimboloInterface;
    tipoExcecao?: SimboloInterface;
    corpo: Declaracao[];

    constructor(parametro?: SimboloInterface, tipoExcecao?: SimboloInterface, corpo: Declaracao[] = []) {
        this.parametro = parametro;
        this.tipoExcecao = tipoExcecao;
        this.corpo = corpo;
    }
}
