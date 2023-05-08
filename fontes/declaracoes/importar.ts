import { Literal } from '../construtos';
import { VisitanteComumInterface } from '../interfaces'
import { Declaracao } from './declaracao';

export class Importar extends Declaracao {
    caminho: Literal;
    simboloFechamento: any;

    constructor(caminho: Literal, simboloFechamento: any) {
        super(caminho.linha, caminho.hashArquivo);
        this.caminho = caminho;
        this.simboloFechamento = simboloFechamento;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoImportar(this);
    }
}
