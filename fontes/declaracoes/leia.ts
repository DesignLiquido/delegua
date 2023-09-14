import { Construto } from '../construtos';
import { uuidv4 } from '../geracao-identificadores';
import { SimboloInterface, VisitanteComumInterface } from '../interfaces'
import { Declaracao } from './declaracao';

/**
 * Declaração que pede a leitura de uma informação pela entrada
 * configurada no início da aplicação (por exemplo, o console).
 */
export class Leia extends Declaracao {
    simbolo: SimboloInterface;
    id: string;
    argumentos: Construto[];
    tipo?: string;

    constructor(simbolo: SimboloInterface, argumentos: Construto[]) {
        super(simbolo.linha, simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.id = uuidv4();
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLeia(this);
    }
}
