import { Construto } from '../construtos';
import { uuidv4 } from '../geracao-identificadores';
import { VisitanteComumInterface } from '../interfaces'
import { Declaracao } from './declaracao';

/**
 * Declaração que pede a leitura de uma informação da entrada
 * configurada no início da aplicação.
 */
export class Leia extends Declaracao {
    id: string;
    argumentos: Construto[];

    constructor(linha: number, hashArquivo: number, argumentos: Construto[]) {
        super(linha, hashArquivo);
        this.id = uuidv4();
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLeia(this);
    }
}
