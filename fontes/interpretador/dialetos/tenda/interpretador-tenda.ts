import { InterpretadorInterface } from '../../../interfaces';
import { InterpretadorBase } from '../../interpretador-base';
import { AcessoMetodoOuPropriedade } from '../../../construtos';
import carregarBibliotecaGlobalTenda from '../../../bibliotecas/dialetos/tenda/biblioteca-global';

const NAMESPACES_TENDA = new Set(['Lista', 'Matemática', 'Saída', 'Texto', 'Data']);

export class InterpretadorTenda extends InterpretadorBase implements InterpretadorInterface {
    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        carregarBibliotecaGlobalTenda(this, this.pilhaEscoposExecucao);
    }
    /**
     * Sobrescrita para que os namespaces do Tenda (Lista, Matemática, etc.) não sejam
     * confundidos com dicionários de Delégua. Assim, métodos como `contém` não são
     * interceptados pelas primitivas de dicionário.
     */
    async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        const nomeObjeto = this.resolverNomeObjectoAcessado(expressao.objeto);
        if (NAMESPACES_TENDA.has(nomeObjeto)) {
            const variavelObjeto = await this.avaliar(expressao.objeto);
            const objeto = this.resolverValor(variavelObjeto);
            return objeto[expressao.simbolo.lexema];
        }
        return super.visitarExpressaoAcessoMetodoOuPropriedade(expressao);
    }
}
