import { InterpretadorInterface } from '../../../interfaces';
import { Interpretador } from '../../interpretador';
import carregarBibliotecaGlobalPrisma from '../../../bibliotecas/dialetos/prisma/biblioteca-global';
import { Binario, Unario } from '../../../construtos';

/**
 * Interpretador específico para o dialeto Prisma da linguagem Delégua.
 * Carrega as funções nativas (embutidos) do Prisma durante a construção.
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

    override async visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        if (expressao.operador.tipo === 'NAO') {
            const operando = await this.avaliar(expressao.operando);
            const valor = this.resolverValor(operando);
            return !this.eVerdadeiro(valor);
        }

        if (expressao.operador.tipo === 'COMPRIMENTO') {
            const operando = await this.avaliar(expressao.operando);
            const valor = this.resolverValor(operando);
            if (typeof valor === 'string') return valor.length;
            if (Array.isArray(valor)) return valor.length;
            if (typeof valor === 'object' && valor !== null) return Object.keys(valor).length;
            return 0;
        }

        return super.visitarExpressaoUnaria(expressao);
    }

    override async visitarExpressaoBinaria(expressao: Binario): Promise<any> {
        if (expressao.operador.tipo === 'CONCATENACAO') {
            const esquerda = this.resolverValor(await this.avaliar(expressao.esquerda));
            const direita = this.resolverValor(await this.avaliar(expressao.direita));
            const esqStr = esquerda !== null && esquerda !== undefined ? String(esquerda) : '';
            const dirStr = direita !== null && direita !== undefined ? String(direita) : '';
            return esqStr + dirStr;
        }

        return super.visitarExpressaoBinaria(expressao);
    }
}
