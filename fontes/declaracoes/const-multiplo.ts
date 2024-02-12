import { Construto } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { TipoDadosElementar } from '../tipo-dados-elementar';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de múltiplas constantes.
 */
export class ConstMultiplo extends Declaracao {
    simbolos: SimboloInterface[];
    inicializador: Construto;
    tipo: TipoDadosElementar;

    constructor(simbolos: SimboloInterface[], inicializador: Construto, tipo: TipoDadosElementar = undefined) {
        super(Number(simbolos[0].linha), simbolos[0].hashArquivo);
        this.simbolos = simbolos;
        this.inicializador = inicializador;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoConstMultiplo(this);
    }
}
