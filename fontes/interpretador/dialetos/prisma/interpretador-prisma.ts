import { InterpretadorInterface } from '../../../interfaces';
import { Interpretador } from '../../interpretador';
import carregarBibliotecaGlobalPrisma from '../../../bibliotecas/dialetos/prisma/biblioteca-global';

/**
 * Interpretador específico para o dialeto Prisma da linguagem Delégua.
 * Carrega as funções nativas (built-ins) do Prisma durante a construção.
 */
export class InterpretadorPrisma extends Interpretador implements InterpretadorInterface {
    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        carregarBibliotecaGlobalPrisma(this, this.pilhaEscoposExecucao);
    }
}
