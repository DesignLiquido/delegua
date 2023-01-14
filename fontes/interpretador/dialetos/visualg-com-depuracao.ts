import { Construto } from "../../construtos";
import { EscrevaMesmaLinha, Escreva } from "../../declaracoes";
import { ImportadorInterface } from "../../interfaces";
import { InterpretadorComDepuracao } from "../interpretador-com-depuracao";

export class InterpretadorVisuAlgComDepuracao extends InterpretadorComDepuracao {
    constructor(
        importador: ImportadorInterface,
        diretorioBase: string,
        funcaoDeRetorno: Function = null
    ) {
        super(importador, diretorioBase, funcaoDeRetorno);
    }

    private async avaliarArgumentosEscrevaVisuAlg(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor')
                        ? resultadoAvaliacao.valor
                        : resultadoAvaliacao;

            formatoTexto += `${this.paraTexto(valor)}`;
        }

        return formatoTexto;
    }

    /**
     * Execução de uma escrita na saída padrão, sem quebras de linha.
     * Implementada para alguns dialetos, como VisuAlg.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscrevaVisuAlg(declaracao.argumentos);
            process.stdout.write(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }

    /**
     * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
     * alguma função para escrever numa página Web.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarExpressaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscrevaVisuAlg(declaracao.argumentos);
            this.funcaoDeRetorno(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }
}