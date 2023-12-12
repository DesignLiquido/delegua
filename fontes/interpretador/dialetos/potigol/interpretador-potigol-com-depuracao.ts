import { registrarBibliotecaGlobalPotigol } from '../../../bibliotecas/dialetos/potigol/biblioteca-global';
import { AcessoMetodoOuPropriedade } from '../../../construtos';
import { InterpretadorComDepuracao } from '../../interpretador-com-depuracao';

import * as comum from './comum';

export class InterpretadorPotigolComDepuracao extends InterpretadorComDepuracao {
    constructor(diretorioBase: string, funcaoDeRetorno: Function = null, funcaoDeRetornoMesmaLinha: Function = null) {
        super(diretorioBase, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.expandirPropriedadesDeObjetosEmEspacoVariaveis = true;
        this.regexInterpolacao = /{(.*?)}/g;

        registrarBibliotecaGlobalPotigol(this, this.pilhaEscoposExecucao);
    }

    protected async resolverInterpolacoes(textoOriginal: string, linha: number): Promise<any[]> {
        return comum.resolverInterpolacoes(this, textoOriginal, linha);
    }

    protected retirarInterpolacao(texto: string, variaveis: any[]): string {
        return comum.retirarInterpolacao(texto, variaveis);
    }

    async visitarExpressaoAcessoMetodo(expressao: AcessoMetodoOuPropriedade): Promise<any> {
        return comum.visitarExpressaoAcessoMetodo(this, expressao);
    }
}
