import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

// TODO: Localizar dialeto que usa este construto e mover
// esta classe para ele.
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
