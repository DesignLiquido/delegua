import { Construto, Variavel } from '../../../construtos';
import { Escreva, EscrevaMesmaLinha, Fazer, Leia } from '../../../declaracoes';
import { ImportadorInterface } from '../../../interfaces';
import { InterpretadorBase } from '../..';
import { ContinuarQuebra, Quebra } from '../../../quebras';

/**
 * O Interpretador VisuAlg possui algumas diferenças em relação ao
 * Interpretador Delégua quanto à escrita na saída.
 * Para N argumentos, Delégua inclui um espaço entre cada argumento.
 * Já VisuAlg imprime todos os argumentos concatenados.
 */
export class InterpretadorVisuAlg extends InterpretadorBase {
    constructor(
        importador: ImportadorInterface,
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null
    ) {
        super(importador, diretorioBase, performance, funcaoDeRetorno);
    }

    private async avaliarArgumentosEscrevaVisuAlg(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;

            formatoTexto += `${this.paraTexto(valor)}`;
        }

        return formatoTexto;
    }

    /**
     * No VisuAlg, o bloco de condição executa se falso.
     * Por isso a reimplementação aqui.
     * @param declaracao A declaração `Fazer`
     * @returns Só retorna em caso de erro na execução, e neste caso, o erro.
     */
    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        let retornoExecucao: any;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                return Promise.reject(erro);
            }
        } while (
            !(retornoExecucao instanceof Quebra) &&
            !this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto))
        );
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
    async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscrevaVisuAlg(declaracao.argumentos);
            this.funcaoDeRetorno(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        const mensagem = '> ';
        const argumento = (expressao.argumentos[0] as Variavel).simbolo.lexema;
        const promessaLeitura: Function = () => new Promise((resolucao) =>
            this.interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                resolucao(resposta);
            })
        );

        const valorLido = await promessaLeitura();
        this.pilhaEscoposExecucao.definirVariavel(argumento, valorLido);
    }
}
