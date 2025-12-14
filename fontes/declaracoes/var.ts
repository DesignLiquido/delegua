import { Construto, Decorador } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
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
    escopo: 'local' | 'global' = 'local';

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
        this.referencia = false;
        this.desestruturacao = false;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoVar(this);
    }

    paraTexto(): string {
        return `<var nome=${this.simbolo.lexema} valor=${this.inicializador ? this.inicializador.paraTexto() : 'Nada'} />`;
    }
}
