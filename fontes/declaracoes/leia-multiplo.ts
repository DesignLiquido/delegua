import { Literal } from 'estree';
import { Construto } from '../construtos';
import { uuidv4 } from '../geracao-identificadores';
import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Declaração que pede a leitura de várias informações pela entrada
 * configurada no início da aplicação (por exemplo, o console).
 */
export class LeiaMultiplo extends Declaracao {
    simbolo: SimboloInterface;
    id: string;

    argumento: Construto;

    constructor(simbolo: SimboloInterface, argumento: Construto) {
        super(simbolo.linha, simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.id = uuidv4();
        this.argumento = argumento;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLeiaMultiplo(this);
    }
}
