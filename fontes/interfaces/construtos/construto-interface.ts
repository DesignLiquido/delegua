import { VisitanteComumInterface } from '..';

export interface ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo?: string;
    aceitar(visitante: VisitanteComumInterface): Promise<any>;
    paraTexto(): string;
    paraTextoSaida(): string;
}
