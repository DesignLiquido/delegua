import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Logico implements Construto {
    linha: number;
    hashArquivo?: number;

    esquerda: any;
    operador: SimboloInterface;
    direita: any;

    constructor(hashArquivo: number, esquerda: any, operador: SimboloInterface, direita: any) {
        this.linha = esquerda.linha;
        this.hashArquivo = hashArquivo;

        this.esquerda = esquerda;
        this.operador = operador;
        this.direita = direita;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoLogica(this);
    }
}
