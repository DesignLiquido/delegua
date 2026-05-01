import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export abstract class Tupla implements ConstrutoInterface {
    tipo?: string;
    linha: number;
    hashArquivo: number;
    valor?: any;

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoTupla(this);
    }

    abstract paraTexto(): string;
    abstract paraTextoSaida(): string;
}
