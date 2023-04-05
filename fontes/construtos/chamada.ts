import { InterpretadorInterface } from '../interfaces';
import { Construto } from './construto';
import { uuidv4 } from '../geracao-identificadores';

/**
 * Chamada de funções, métodos, etc.
 */
export class Chamada implements Construto {
    id: string;
    linha: number;
    hashArquivo?: number;

    entidadeChamada: Construto;
    argumentos: any[];
    parentese: any;

    constructor(hashArquivo: number, entidadeChamada: Construto, parentese: any, argumentos: any[]) {
        this.id = uuidv4();
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoDeChamada(this);
    }
}
