import { Construto } from '../construtos';
import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de variável.
 */
export class Var extends Declaracao {
    simbolo: SimboloInterface;
    inicializador: Construto;
    tipo: 'texto' | 'numero' | 'longo' | 'lógico' | 'nulo' | 'vetor' | 'módulo' | 'dicionário' | 'função' | 'símbolo' | undefined

    constructor(
        simbolo: SimboloInterface, 
        inicializador: Construto,
        tipo: 'texto' | 'numero' | 'longo' | 'lógico' | 'nulo' | 'vetor' | 'módulo' | 'dicionário' | 'função' | 'símbolo' | undefined = undefined
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.inicializador = inicializador;
        this.tipo = tipo;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarDeclaracaoVar(this);
    }
}
