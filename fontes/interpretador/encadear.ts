/**
 * Encadeia a continuação de uma avaliação que pode ter resultado num valor direto ou numa
 * `Promise` — sem nunca forçar `await` quando não é necessário.
 *
 * A maior parte do interpretador é `async`/`await` mesmo para nós puramente computacionais
 * (aritmética, leitura de variável, literais) que nunca tocam I/O. Isso tem custo real: `await`
 * agenda ao menos uma microtarefa mesmo quando o valor `await`ado já não é uma `Promise` — uma
 * árvore de expressão com profundidade N paga N idas ao laço de microtarefas do V8, não 1.
 *
 * `encadear` permite escrever avaliadores que retornam ou o valor calculado diretamente
 * (síncrono, custo zero de microtarefa) ou uma `Promise` (quando alguma subexpressão realmente
 * precisou de operação assíncrona real — `leia()`, FFI, biblioteca que faz I/O) — nos dois casos
 * de forma transparente para quem consome o resultado com `await` (que sempre funciona, em
 * ambos os casos, só não é gratuito).
 *
 * @example
 * // Em vez de:
 * async function visitarExpressaoBinaria(expressao) {
 *     const esquerda = await avaliar(expressao.esquerda);
 *     const direita = await avaliar(expressao.direita);
 *     return esquerda + direita;
 * }
 * // Escreve-se:
 * function visitarExpressaoBinaria(expressao) {
 *     return encadear(avaliar(expressao.esquerda), (esquerda) =>
 *         encadear(avaliar(expressao.direita), (direita) => esquerda + direita)
 *     );
 * }
 * // Quando `esquerda`/`direita` resolvem de forma síncrona (o caso comum), a cadeia inteira
 * // roda sem nenhuma Promise alocada e sem nenhuma microtarefa agendada.
 *
 * @param valorOuPromise O resultado de uma avaliação anterior — um valor já resolvido, ou uma `Promise`.
 * @param continuacao Recebe o valor já resolvido e produz o próximo passo (valor ou nova `Promise`).
 */
export function encadear<T>(valorOuPromise: any, continuacao: (valor: any) => T): T {
    return valorOuPromise instanceof Promise
        ? (valorOuPromise.then(continuacao) as any)
        : continuacao(valorOuPromise);
}
