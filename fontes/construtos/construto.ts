import { VisitanteComumInterface } from '../interfaces';

export interface Construto {
    linha: number;
    hashArquivo: number;
    valor?: any;
    aceitar(visitante: VisitanteComumInterface): Promise<any>;
}
