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
    argumentos: Construto[];
    tipo?: string;
    numeroArgumentosEsperados?: number;

    constructor(simbolo: SimboloInterface, argumentos: Construto[], numeroArgumentosEsperados?: number) {
        super(simbolo.linha, simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.id = uuidv4();
        this.argumentos = argumentos;
        this.numeroArgumentosEsperados = numeroArgumentosEsperados;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLeiaMultiplo(this);
    }
}
