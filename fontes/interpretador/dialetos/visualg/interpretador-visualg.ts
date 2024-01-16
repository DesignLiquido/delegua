import { AcessoIndiceVariavel, Binario, Construto, FimPara, Logico, Variavel } from '../../../construtos';
import { Const, Escreva, EscrevaMesmaLinha, Fazer, Leia, Para } from '../../../declaracoes';
import { InterpretadorBase } from '../..';
import { ContinuarQuebra, Quebra, SustarQuebra } from '../../../quebras';
import { registrarBibliotecaNumericaVisuAlg } from '../../../bibliotecas/dialetos/visualg/numerica';
import { registrarBibliotecaCaracteresVisuAlg } from '../../../bibliotecas/dialetos/visualg';

import * as comum from './comum';
import { VariavelInterface } from '../../../interfaces';
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { DeleguaClasse, DeleguaFuncao, DeleguaModulo, ObjetoDeleguaClasse } from '../../../estruturas';
import tipoDeDadosPrimitivos from '../../../tipos-de-dados/primitivos'

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

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoAtribuicaoPorIndice(expressao: any): Promise<any> {
        const { indice1, indice2 } = expressao.indice;
        const promises = await Promise.all([
            this.avaliar(expressao.objeto),
            this.avaliar(indice1),
            this.avaliar(indice2),
            this.avaliar(expressao.valor),
        ]);

        let objeto = promises[0];
        let indicePrimario = promises[1];
        let indiceSecundario = promises[2];
        const valor = promises[3];

        objeto = objeto.hasOwnProperty('valor') ? objeto.valor : objeto;
        indicePrimario = indicePrimario.hasOwnProperty('valor') ? indicePrimario.valor : indicePrimario;
        indiceSecundario = indiceSecundario?.hasOwnProperty('valor') ? indiceSecundario.valor : indiceSecundario;

        if (Array.isArray(objeto)) {
            if (indicePrimario < 0 && objeto.length !== 0) {
                while (indicePrimario < 0) {
                    indicePrimario += objeto.length;
                }
            }

            while (objeto.length < indicePrimario) {
                objeto.push(null);
            }

            if (indiceSecundario) {
                if (indiceSecundario < 0 && objeto.length !== 0) {
                    while (indiceSecundario < 0) {
                        indiceSecundario += objeto.length;
                    }
                }
    
                while (objeto.length < indiceSecundario) {
                    objeto.push(null);
                }
                
                objeto[indicePrimario][indiceSecundario] = valor;
            } else {
                objeto[indicePrimario] = valor;
            }
        } else if (
            objeto.constructor === Object ||
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DeleguaClasse ||
            objeto instanceof DeleguaModulo
        ) {
            objeto[indicePrimario] = valor;
        } else {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.objeto.nome,
                    'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
                    expressao.linha
                )
            );
        }
    }

    async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel | any): Promise<any> {
        const { indice1, indice2 } = expressao.indice;
        const promises = await Promise.all([this.avaliar(expressao.entidadeChamada), this.avaliar(indice1), this.avaliar(indice2)]);

        const variavelObjeto: VariavelInterface = promises[0];
        const _indice1 = promises[1];
        const _indice2 = promises[2];

        const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;
        let valorIndice1 = _indice1.hasOwnProperty('valor') ? _indice1.valor : _indice1;
        let valorIndice2 = _indice2?.hasOwnProperty('valor') ? _indice2.valor : _indice2;

        if (Array.isArray(objeto)) {
            if (!Number.isInteger(valorIndice1)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar um vetor.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice1 < 0 && objeto.length !== 0) {
                while (valorIndice1 < 0) {
                    valorIndice1 += objeto.length;
                }
            }
            if (valorIndice2 && valorIndice2 < 0 && objeto.length !== 0) {
                while (valorIndice2 < 0) {
                    valorIndice2 += objeto.length;
                }
            }

            if (valorIndice1 >= objeto.length || (valorIndice2 && valorIndice2 >= objeto.length)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice do vetor fora do intervalo.',
                        expressao.linha
                    )
                );
            }
            if (valorIndice2) {
                return objeto[valorIndice1][valorIndice2];    
            }
            return objeto[valorIndice1];
        } else if (
            objeto.constructor === Object ||
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DeleguaClasse ||
            objeto instanceof DeleguaModulo
        ) {
            return objeto[valorIndice1] || null;
        } else if (typeof objeto === tipoDeDadosPrimitivos.TEXTO) {
            if (!Number.isInteger(valorIndice1)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar um vetor.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice1 < 0 && objeto.length !== 0) {
                while (valorIndice1 < 0) {
                    valorIndice1 += objeto.length;
                }
            }

            if (valorIndice1 >= objeto.length) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(expressao.simboloFechamento, 'Índice fora do tamanho.', expressao.linha)
                );
            }
            return objeto.charAt(valorIndice1);
        } else {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.entidadeChamada.nome,
                    'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
                    expressao.linha
                )
            );
        }
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
        for (let argumento of expressao.argumentos) {
            const promessaLeitura: Function = () =>
                new Promise((resolucao) =>
                    this.interfaceEntradaSaida.question(this.mensagemPrompt, (resposta: any) => {
                        this.mensagemPrompt = '> ';
                        resolucao(resposta);
                    })
                );

            const valorLido = await promessaLeitura();
            await comum.atribuirVariavel(this, argumento, valorLido);
        }
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        if (declaracao.inicializador !== null) {
            await this.avaliar(declaracao.inicializador);
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
}
