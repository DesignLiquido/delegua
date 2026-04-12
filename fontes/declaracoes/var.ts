import { Construto, Decorador } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de variável.
 */
export class Var extends Declaracao {
    simbolo: SimboloInterface;
    inicializador: Construto | undefined;
    tipo: string;
    tipoOriginal: string; // Tipo originalmente especificado pelo usuário (antes da inferência)
    tipoExplicito: boolean;
    referencia: boolean;
    desestruturacao: boolean;
    escopo: 'local' | 'global' = 'local';

    constructor(
        simbolo: SimboloInterface,
        inicializador: Construto | undefined,
        tipo: string = 'qualquer',
        tipoExplicito: boolean = false,
        decoradores: Decorador[] = [],
        tipoOriginal?: string
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo, decoradores);
        this.simbolo = simbolo;
        this.inicializador = inicializador;
        // Preserva o tipo original especificado pelo usuário (antes de inferência do parser)
        this.tipoOriginal = tipoOriginal !== undefined ? tipoOriginal : tipo;

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
