import { Construto, Decorador } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { TipoDadosElementar } from '../tipo-dados-elementar';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de variável.
 */
export class Var extends Declaracao {
    simbolo: SimboloInterface;
    inicializador: Construto;
    tipo: string;
    tipoExplicito: boolean;
    referencia: boolean;
    desestruturacao: boolean;

    constructor(
        simbolo: SimboloInterface,
        inicializador: Construto,
        tipo: string = 'qualquer',
        decoradores: Decorador[] = []
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo, decoradores);
        this.simbolo = simbolo;
        this.inicializador = inicializador;

        if (tipo !== 'qualquer') {
            this.tipo = tipo;
            this.tipoExplicito = true;
        } else {
            this.tipo = inicializador?.tipo || tipo;
            this.tipoExplicito = false;
        }
        
        this.referencia = false;
        this.desestruturacao = false;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoVar(this);
    }
}
