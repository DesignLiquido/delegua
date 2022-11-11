import { Construto } from '../construtos';
import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Var extends Declaracao {
    simbolo: SimboloInterface;
    inicializador: Construto;

    constructor(simbolo: SimboloInterface, inicializador: Construto) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.inicializador = inicializador;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoVar(this);
    }
}
