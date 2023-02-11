import { Variavel } from "../../../construtos";
import { Leia } from "../../../declaracoes";
import { InterpretadorBase } from "../../interpretador-base";

export class InterpretadorPortugolStudio extends InterpretadorBase {
    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno);
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        const mensagem = '> ';
        for (let argumento of expressao.argumentos) {
            const promessaLeitura: Function = () => new Promise((resolucao) =>
                this.interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                    resolucao(resposta);
                })
            );

            const valorLido = await promessaLeitura();
            this.pilhaEscoposExecucao.definirVariavel((<Variavel>argumento).simbolo.lexema, valorLido);
        }
    }
}