import { Literal } from '../construtos';
import { InterpretadorInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Importar extends Declaracao {
    caminho: Literal;
    simboloFechamento: any;

    constructor(caminho: Literal, simboloFechamento: any) {
        super(caminho.linha, caminho.hashArquivo);
        this.caminho = caminho;
        this.simboloFechamento = simboloFechamento;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoImportar(this);
    }
}
