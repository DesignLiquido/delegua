import { InterpretadorInterface } from '../interfaces';

export interface Construto {
    linha: number;
    hashArquivo: number;
    valor?: any;
    aceitar(visitante: InterpretadorInterface): Promise<any>;
}
