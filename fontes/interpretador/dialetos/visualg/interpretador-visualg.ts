import { Construto, Variavel } from '../../../construtos';
import { Escreva, EscrevaMesmaLinha, Fazer, Leia } from '../../../declaracoes';
import { InterpretadorBase } from '../..';
import { ContinuarQuebra, Quebra } from '../../../quebras';
import { registrarBibliotecaNumericaVisuAlg } from '../../../bibliotecas/dialetos/visualg/numerica';
import { VariavelInterface } from '../../../interfaces';
import { inferirTipoVariavel } from '../../inferenciador';

import tiposDeSimbolos from '../../../tipos-de-simbolos/visualg';
import { registrarBibliotecaCaracteresVisuAlg } from '../../../bibliotecas/dialetos/visualg';

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
    async visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
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

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        for (let argumento of expressao.argumentos) {
            const promessaLeitura: Function = () => new Promise((resolucao) =>
                this.interfaceEntradaSaida.question(this.mensagemPrompt, (resposta: any) => {
                    this.mensagemPrompt = '> ';
                    resolucao(resposta);
                })
            );

            const valorLido = await promessaLeitura();
            this.pilhaEscoposExecucao.atribuirVariavel((<Variavel>argumento).simbolo, valorLido);
        }
    }

    /**
     * Método de visita de expressão binária.
     * Reintroduzido pelas particularidades do VisuAlg.
     * @param expressao A expressão binária.
     * @returns O resultado da resolução da expressão.
     */
    async visitarExpressaoBinaria(expressao: any): Promise<any> {
        try {
            const esquerda: VariavelInterface | any = await this.avaliar(expressao.esquerda);
            const direita: VariavelInterface | any = await this.avaliar(expressao.direita);

            let valorEsquerdo: any = esquerda?.hasOwnProperty('valor') ? esquerda.valor : esquerda;
            let valorDireito: any = direita?.hasOwnProperty('valor') ? direita.valor : direita;

            // No VisuAlg, uma variável pode resolver para função porque funções não precisam ter parênteses.
            // Esta parte evita o problema.
            if (valorEsquerdo && valorEsquerdo.hasOwnProperty('funcao')) {
                valorEsquerdo = valorEsquerdo.funcao();
            }

            if (valorDireito && valorDireito.hasOwnProperty('funcao')) {
                valorDireito = valorDireito.funcao();
            }

            const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo')
                ? esquerda.tipo
                : inferirTipoVariavel(esquerda);
            const tipoDireito: string = direita?.hasOwnProperty('tipo') ? direita.tipo : inferirTipoVariavel(direita);

            switch (expressao.operador.tipo) {
                case tiposDeSimbolos.EXPONENCIACAO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Math.pow(valorEsquerdo, valorDireito);

                case tiposDeSimbolos.MAIOR:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) > Number(valorDireito);

                case tiposDeSimbolos.MAIOR_IGUAL:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) >= Number(valorDireito);

                case tiposDeSimbolos.MENOR:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) < Number(valorDireito);

                case tiposDeSimbolos.MENOR_IGUAL:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) <= Number(valorDireito);

                case tiposDeSimbolos.SUBTRACAO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) - Number(valorDireito);

                case tiposDeSimbolos.ADICAO:
                    if (tipoEsquerdo === 'número' && tipoDireito === 'número') {
                        return Number(valorEsquerdo) + Number(valorDireito);
                    } else {
                        return String(valorEsquerdo) + String(valorDireito);
                    }

                case tiposDeSimbolos.DIVISAO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) / Number(valorDireito);

                case tiposDeSimbolos.DIVISAO_INTEIRA:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

                case tiposDeSimbolos.MULTIPLICACAO:
                    if (tipoEsquerdo === 'texto' || tipoDireito === 'texto') {
                        // Sem ambos os valores resolvem como texto, multiplica normal.
                        // Se apenas um resolve como texto, o outro repete o 
                        // texto n vezes, sendo n o valor do outro.
                        if (tipoEsquerdo === 'texto' && tipoDireito === 'texto') {
                            return Number(valorEsquerdo) * Number(valorDireito);    
                        } 
                        
                        if (tipoEsquerdo === 'texto') {
                            return valorEsquerdo.repeat(Number(valorDireito));
                        }

                        return valorDireito.repeat(Number(valorEsquerdo));
                    }
                    
                    return Number(valorEsquerdo) * Number(valorDireito);

                case tiposDeSimbolos.MODULO:
                    this.verificarOperandosNumeros(expressao.operador, esquerda, direita);
                    return Number(valorEsquerdo) % Number(valorDireito);

                case tiposDeSimbolos.DIFERENTE:
                    return !this.eIgual(valorEsquerdo, valorDireito);

                case tiposDeSimbolos.IGUAL:
                    return this.eIgual(valorEsquerdo, valorDireito);
            }
        } catch (erro: any) {
            return Promise.reject(erro);
        }
    }
}
