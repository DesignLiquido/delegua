import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Representa a declaração de início do algoritmo, que é o ponto de entrada do programa.
 * Usado por dialetos como Portugol Studio, Portugol IPT e VisusAlg. 
 */
export class InicioAlgoritmo extends Declaracao {
    constructor(linha: number, hashArquivo: number) {
        super(linha, hashArquivo);
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return visitante.visitarDeclaracaoInicioAlgoritmo(this);
    }

    paraTexto(): string {
        return `<início-algoritmo />`;
    }
}
