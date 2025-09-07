import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export abstract class Tupla implements Construto {
    tipo?: string;
    linha: number;
    hashArquivo: number;
    valor?: any;

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoTupla(this);
    }

    abstract paraTexto(): string;
}
