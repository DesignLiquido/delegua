import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';
import { uuidv4 } from '../geracao-identificadores';

/**
 * Chamada de funções, métodos, etc.
 */
export class Chamada implements Construto {
    id: string;
    linha: number;
    hashArquivo: number;

    entidadeChamada: Construto;
    argumentos: Construto[];
    // TODO: Estudar retirar isso.
    parentese: any;

    constructor(
        hashArquivo: number, 
        entidadeChamada: Construto, 
        parentese: any, 
        argumentos: Construto[]
    ) {
        this.id = uuidv4();
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDeChamada(this);
    }
}
