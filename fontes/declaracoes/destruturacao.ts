import { Construto } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { TiposDadosInterface } from '../interfaces/tipos-dados-interface';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de destruturação.
 */
export class Destruturacao extends Declaracao {
    simbolo: SimboloInterface;
    identificadores: SimboloInterface[];

    constructor(simbolo: SimboloInterface, identificadores: SimboloInterface[]) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.identificadores = identificadores;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoDestruturacao(this);
    }
}
