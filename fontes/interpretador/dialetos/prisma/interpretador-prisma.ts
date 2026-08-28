import { InterpretadorInterface } from '../../../interfaces';
import { Interpretador } from '../../interpretador';
import carregarBibliotecaGlobalPrisma from '../../../bibliotecas/dialetos/prisma/biblioteca-global';
import { Binario, Unario } from '../../../construtos';
import { encadear } from '../../encadear';

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

    override visitarExpressaoUnaria(expressao: Unario): any {
        if (expressao.operador.tipo === 'NAO') {
            return encadear(this.avaliar(expressao.operando), (operando) => {
                const valor = this.resolverValor(operando);
                return !this.eVerdadeiro(valor);
            });
        }

        if (expressao.operador.tipo === 'COMPRIMENTO') {
            return encadear(this.avaliar(expressao.operando), (operando) => {
                const valor = this.resolverValor(operando);
                if (typeof valor === 'string') return valor.length;
                if (Array.isArray(valor)) return valor.length;
                if (typeof valor === 'object' && valor !== null) return Object.keys(valor).length;
                return 0;
            });
        }

        return super.visitarExpressaoUnaria(expressao);
    }

    override visitarExpressaoBinaria(expressao: Binario): any {
        if (expressao.operador.tipo === 'CONCATENACAO') {
            return encadear(this.avaliar(expressao.esquerda), (esquerdaBruta) => {
                const esquerda = this.resolverValor(esquerdaBruta);
                return encadear(this.avaliar(expressao.direita), (direitaBruta) => {
                    const direita = this.resolverValor(direitaBruta);
                    const esqStr = esquerda !== null && esquerda !== undefined ? String(esquerda) : '';
                    const dirStr = direita !== null && direita !== undefined ? String(direita) : '';
                    return esqStr + dirStr;
                });
            });
        }

        return super.visitarExpressaoBinaria(expressao);
    }
}
