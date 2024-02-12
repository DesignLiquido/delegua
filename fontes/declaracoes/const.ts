import { Construto } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { TipoDadosElementar } from '../tipo-dados-elementar';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de constante.
 */
export class Const extends Declaracao {
    simbolo: SimboloInterface;
    inicializador: Construto;
    tipo: TipoDadosElementar;

    constructor(simbolo: SimboloInterface, inicializador: Construto, tipo: TipoDadosElementar = undefined) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.inicializador = inicializador;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoConst(this);
    }
}
