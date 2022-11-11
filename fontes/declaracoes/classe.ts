import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Classe extends Declaracao {
    simbolo: SimboloInterface;
    superClasse: any;
    metodos: any;

    constructor(simbolo: SimboloInterface, superClasse: any, metodos: any) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoClasse(this);
    }
}
