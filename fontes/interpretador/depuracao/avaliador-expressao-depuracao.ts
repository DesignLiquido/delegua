import {
    Atribuir,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Leia,
} from '../../construtos';
import { Declaracao } from '../../declaracoes';
import { inferirTipoVariavel } from '../../inferenciador';
import { ConstrutoInterface } from '../../interfaces/construtos';
import { ResultadoAvaliacao } from '../../interfaces/depuracao';
import { InterpretadorComDepuracao } from './interpretador-com-depuracao';

/**
 * Verifica se uma expressão tem efeitos colaterais que não devem ser executados
 * durante a avaliação de expressões no painel de depuração.
 * @param expressao A expressão a ser verificada.
 * @returns `true` se a expressão tem efeitos colaterais, `false` caso contrário.
 */
function temEfeitosColaterais(expressao: ConstrutoInterface | Declaracao): boolean {
    // Atribuições modificam o estado
    if (
        expressao instanceof Atribuir ||
        expressao instanceof AtribuicaoPorIndice ||
        expressao instanceof AtribuicaoPorIndicesMatriz
    ) {
        return true;
    }

    // Leia requer entrada do usuário
    if (expressao instanceof Leia) {
        return true;
    }

    // Chamadas de função podem ter efeitos colaterais
    // Por enquanto, permitimos chamadas (comentar esta linha se quiser bloquear)
    // if (expressao instanceof Chamada) {
    //     return true;
    // }

    return false;
}

/**
 * Avaliador de expressões para depuração.
 *
 * Este avaliador é usado para avaliar expressões no painel de depuração do VSCode
 * (watch panel) de forma segura, sem modificar o estado da execução do programa.
 *
 * Utiliza a infraestrutura existente do interpretador (MicroLexador, MicroAvaliadorSintatico)
 * e delega a avaliação para o InterpretadorComDepuracao, garantindo que expressões com
 * efeitos colaterais sejam bloqueadas.
 *
 * Exemplo de uso:
 * ```typescript
 * const avaliador = new AvaliadorExpressaoDepuracao(interpretador);
 * const resultado = await avaliador.avaliarExpressao('variavel + 10');
 * if (resultado.sucesso) {
 *     console.log(`Valor: ${resultado.valor}, Tipo: ${resultado.tipo}`);
 * } else {
 *     console.error(`Erro: ${resultado.erro}`);
 * }
 * ```
 */
export class AvaliadorExpressaoDepuracao {
    constructor(private interpretador: InterpretadorComDepuracao) {}

    /**
     * Avalia uma expressão em formato de texto e retorna seu resultado.
     *
     * Este método:
     * 1. Usa o MicroLexador para tokenizar a expressão
     * 2. Usa o MicroAvaliadorSintatico para gerar a AST
     * 3. Valida se a expressão não tem efeitos colaterais
     * 4. Delega a avaliação para o interpretador
     * 5. Resolve e formata o valor resultante
     *
     * @param expressaoTexto A expressão em formato de texto (ex: "variavel + 10")
     * @param permitirEfeitosColaterais Se `true`, permite expressões com efeitos colaterais.
     *                                   Padrão: `false` (somente leitura).
     * @returns Uma Promise que resolve para um ResultadoAvaliacao com o resultado ou erro.
     */
    async avaliarExpressao(
        expressaoTexto: string,
        permitirEfeitosColaterais = false
    ): Promise<ResultadoAvaliacao> {
        try {
            const retornoLexador = this.interpretador.microLexador.mapear(expressaoTexto);

            if (retornoLexador.simbolos.length === 0) {
                return {
                    sucesso: false,
                    erro: 'Expressão vazia ou inválida',
                };
            }

            const retornoAvaliadorSintatico = this.interpretador.microAvaliadorSintatico.analisar(
                retornoLexador,
                -1
            );

            if (retornoAvaliadorSintatico.declaracoes.length === 0) {
                return {
                    sucesso: false,
                    erro: 'Não foi possível analisar a expressão',
                };
            }

            if (retornoAvaliadorSintatico.declaracoes.length > 1) {
                return {
                    sucesso: false,
                    erro: 'Múltiplas expressões não são permitidas',
                };
            }

            const expressao = retornoAvaliadorSintatico.declaracoes[0];

            // Validar se não tem efeitos colaterais (opcional)
            if (!permitirEfeitosColaterais && temEfeitosColaterais(expressao)) {
                return {
                    sucesso: false,
                    erro: 'Expressões com efeitos colaterais não são permitidas no painel de depuração',
                };
            }

            const resultadoBruto = await this.interpretador.avaliar(expressao);
            const valorResolvido = this.interpretador.resolverValor(resultadoBruto);
            const tipo = inferirTipoVariavel(valorResolvido);

            return {
                sucesso: true,
                valor: valorResolvido,
                tipo: tipo,
            };
        } catch (erro: any) {
            return {
                sucesso: false,
                erro: erro.message || String(erro),
            };
        }
    }

    /**
     * Formata o valor de uma expressão para exibição no painel de depuração.
     * Converte o valor para uma representação textual legível.
     *
     * @param valor O valor a ser formatado.
     * @returns Uma string representando o valor.
     */
    formatarValorParaExibicao(valor: any): string {
        return this.interpretador.paraTexto(valor);
    }

    /**
     * Avalia uma expressão e retorna diretamente seu valor formatado para exibição.
     * Atalho para `avaliarExpressao()` seguido de `formatarValorParaExibicao()`.
     *
     * @param expressaoTexto A expressão em formato de texto.
     * @param permitirEfeitosColaterais Se `true`, permite expressões com efeitos colaterais.
     * @returns Uma Promise que resolve para uma string com o valor formatado ou mensagem de erro.
     */
    async avaliarEFormatar(
        expressaoTexto: string,
        permitirEfeitosColaterais = false
    ): Promise<string> {
        const resultado = await this.avaliarExpressao(expressaoTexto, permitirEfeitosColaterais);

        if (resultado.sucesso) {
            return this.formatarValorParaExibicao(resultado.valor);
        } else {
            return `Erro: ${resultado.erro}`;
        }
    }
}
