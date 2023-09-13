import { registrarBibliotecaGlobalPotigol } from "../../../bibliotecas/dialetos/potigol/biblioteca-global";
import { AcessoMetodo } from "../../../construtos";
import { InterpretadorComDepuracao } from "../../interpretador-com-depuracao";

import * as comum from './comum';

export class InterpretadorPotigolComDepuracao extends InterpretadorComDepuracao {
    constructor(
        diretorioBase: string,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.expandirPropriedadesDeObjetosEmEspacoVariaveis = true;

        registrarBibliotecaGlobalPotigol(this, this.pilhaEscoposExecucao);
    }

    async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        return comum.visitarExpressaoAcessoMetodo(this, expressao);
    }
}
