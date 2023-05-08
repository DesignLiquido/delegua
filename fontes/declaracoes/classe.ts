import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
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

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoClasse(this);
    }
}
