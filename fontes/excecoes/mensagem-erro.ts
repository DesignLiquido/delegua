/**
 * Obtém a mensagem de erro de forma padronizada, independentemente do tipo de erro.
 *
 * Apenas erros do ecossistema Delégua (que possuem a propriedade `mensagem`)
 * têm sua mensagem extraída diretamente. Demais erros e valores são convertidos
 * para string via `String()`, que para erros nativos do JavaScript produz o
 * formato "NomeDoErro: mensagem" (ex: "Error: algo deu errado").
 *
 * O uso de `unknown` como tipo do parâmetro garante que a função seja segura
 * para qualquer valor que venha de `catch` blocks ou da propriedade `erroInterno`
 * (tipada como `any`), sem perder informações por type narrowing excessivo.
 *
 * @param erro O valor a ser convertido em mensagem (qualquer tipo)
 * @returns A mensagem de erro como string
 */
export function obterMensagemErro(erro: unknown): string {
    if (
        typeof erro === 'object'
        && erro !== null
        && 'mensagem' in erro
    ) {
        const mensagem = (erro as Record<string, unknown>).mensagem;

        if (
            typeof mensagem === 'string'
            && mensagem
        ) {
            return mensagem;
        }
    }

    return String(erro);
}
