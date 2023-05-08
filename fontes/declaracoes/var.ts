import { Construto } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { TiposDadosInterface } from '../interfaces/tipos-dados-interface';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de variável.
 */
export class Var extends Declaracao {
    simbolo: SimboloInterface;
    inicializador: Construto;
    tipo: TiposDadosInterface;

    constructor(simbolo: SimboloInterface, inicializador: Construto, tipo: TiposDadosInterface = undefined) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.inicializador = inicializador;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoVar(this);
    }
}
