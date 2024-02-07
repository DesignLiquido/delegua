import { AcessoElementoMatriz, AtribuicaoPorIndicesMatriz, Binario, Construto, FimPara, Logico, Variavel } from '../../../construtos';
import { Aleatorio, CabecalhoPrograma, Const, Escreva, EscrevaMesmaLinha, Fazer, Leia, Para } from '../../../declaracoes';
import { InterpretadorBase } from '../..';
import { ContinuarQuebra, Quebra, SustarQuebra } from '../../../quebras';
import { registrarBibliotecaNumericaVisuAlg } from '../../../bibliotecas/dialetos/visualg/numerica';
import { registrarBibliotecaCaracteresVisuAlg } from '../../../bibliotecas/dialetos/visualg';
import * as comum from './comum';

/**
 * O Interpretador VisuAlg possui algumas diferenças em relação ao
 * Interpretador Delégua quanto à escrita na saída.
 * Para N argumentos, Delégua inclui um espaço entre cada argumento.
 * Já VisuAlg imprime todos os argumentos concatenados.
 */
export class InterpretadorVisuAlg extends InterpretadorBase {
    mensagemPrompt: string;

    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.mensagemPrompt = '> ';

        registrarBibliotecaNumericaVisuAlg(this, this.pilhaEscoposExecucao);
        registrarBibliotecaCaracteresVisuAlg(this, this.pilhaEscoposExecucao);
    }

    async visitarDeclaracaoInicioAlgoritmo(declaracao: CabecalhoPrograma): Promise<any> {
        return comum.visitarDeclaracaoInicioAlgoritmo(this, declaracao);
    }

    async visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        return comum.visitarDeclaracaoCabecalhoPrograma(this, declaracao);
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> {
        return await comum.visitarExpressaoAcessoElementoMatriz(this, expressao);
    }

    async visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: AtribuicaoPorIndicesMatriz): Promise<any> {
        return await comum.visitarExpressaoAtribuicaoPorIndicesMatriz(this, expressao);
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
     *
     * Como `readline.question` sobrescreve o que foi escrito antes, aqui
     * definimos `this.mensagemPrompt` para uso com `leia`.
     * No VisuAlg é muito comum usar `escreva()` seguido de `leia()` para
     * gerar um prompt na mesma linha.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscrevaVisuAlg(declaracao.argumentos);
            this.mensagemPrompt = formatoTexto;
            this.funcaoDeRetornoMesmaLinha(formatoTexto);
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

    async visitarExpressaoFimPara(declaracao: FimPara): Promise<any> {
        if (!this.eVerdadeiro(await this.avaliar(declaracao.condicaoPara))) {
            const escopoPara = this.pilhaEscoposExecucao.pilha[this.pilhaEscoposExecucao.pilha.length - 2];
            escopoPara.declaracaoAtual++;

            escopoPara.emLacoRepeticao = false;
            return new SustarQuebra();
        }

        if (declaracao.incremento === null || declaracao.incremento === undefined) {
            return;
        }

        await this.executar(declaracao.incremento);
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        return comum.visitarExpressaoLeia(this, expressao, this.mensagemPrompt);
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        if (declaracao.inicializador !== null) {
            await this.avaliar(declaracao.inicializador as any);
            await comum.resolverIncrementoPara(this, declaracao);
        }

        let retornoExecucao: any;
        let retornoIncremento: any;
        while (!(retornoExecucao instanceof Quebra) && !(retornoIncremento instanceof Quebra)) {
            if (declaracao.condicao !== null && !this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                break;
            }

            try {
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }

            if (declaracao.incrementar !== null) {
                retornoIncremento = await this.avaliar(declaracao.incrementar);
            }
        }

        return retornoExecucao;
    }

    async visitarExpressaoBinaria(expressao: Binario | any): Promise<any> {
        return comum.visitarExpressaoBinaria(this, expressao);
    }

    async visitarExpressaoLogica(expressao: Logico): Promise<any> {
        return comum.visitarExpressaoLogica(this, expressao);
    }

    async visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        return comum.visitarDeclaracaoAleatorio(this, declaracao);
    }
}
