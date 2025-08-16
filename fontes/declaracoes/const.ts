import { Construto, Decorador } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de constante.
 */
export class Const extends Declaracao {
    simbolo: SimboloInterface;
    inicializador: Construto;
    tipo: string;
    tipoExplicito: boolean;

    constructor(
        simbolo: SimboloInterface,
        inicializador: Construto,
        tipo: string = 'qualquer',
        tipoExplicito: boolean = false,
        decoradores: Decorador[] = []
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo, decoradores);
        this.simbolo = simbolo;
        this.inicializador = inicializador;

        if (tipo !== 'qualquer') {
            this.tipo = tipo;
        } else {
            this.tipo = inicializador?.tipo || tipo;
        }

        this.tipoExplicito = tipoExplicito;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoConst(this);
    }
}
