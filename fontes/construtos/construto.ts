import { VisitanteComumInterface } from '../interfaces';

export interface Construto {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo?: string;
    aceitar(visitante: VisitanteComumInterface): Promise<any>;
    paraTexto(): string;
    paraTextoSaida(): string;
}
