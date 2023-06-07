import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { FuncaoDeclaracao } from './funcao';
import { PropriedadeClasse } from './propriedade-classe';

export class Classe extends Declaracao {
    simbolo: SimboloInterface;
    superClasse: any;
    metodos: FuncaoDeclaracao[];
    propriedades: PropriedadeClasse[];

    constructor(
        simbolo: SimboloInterface, 
        superClasse: any, 
        metodos: FuncaoDeclaracao[], 
        propriedades: PropriedadeClasse[] = []
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.superClasse = superClasse;
        this.metodos = metodos;
        this.propriedades = propriedades;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoClasse(this);
    }
}
