import { Leia } from "../../../declaracoes";
import { visitarExpressaoLeiaComum } from "./comum";
import { InterpretadorComDepuracao } from "../../interpretador-com-depuracao";

export class InterpretadorPortugolStudioComDepuracao extends InterpretadorComDepuracao {
    mensagemPrompt: string;

    constructor(diretorioBase: string, funcaoDeRetorno: Function = null, funcaoDeRetornoMesmaLinha: Function = null) {
        super(diretorioBase, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.mensagemPrompt = '> ';
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        return visitarExpressaoLeiaComum(
            this.interfaceEntradaSaida, 
            this.pilhaEscoposExecucao,
            expressao);
    }
}