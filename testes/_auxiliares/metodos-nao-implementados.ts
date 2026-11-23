/**
 * Obtém os nomes dos métodos de um protótipo cuja implementação
 * apenas sinaliza que o método não está implementado.
 * Usado para verificar que construções não suportadas por um dialeto
 * ou tradutor falham de forma explícita.
 */
export function obterMetodosNaoImplementados(prototipo: any): string[] {
    return Object.getOwnPropertyNames(prototipo).filter((nome) => {
        if (nome === 'constructor') return false;
        const descritor = Object.getOwnPropertyDescriptor(prototipo, nome);
        if (!descritor || typeof descritor.value !== 'function') return false;
        return String(descritor.value).includes('Método não implementado');
    });
}

/**
 * Executa o método e devolve a mensagem de erro lançada (de forma síncrona ou assíncrona).
 */
export async function obterErroDeMetodo(instancia: any, nomeMetodo: string): Promise<string | undefined> {
    try {
        await instancia[nomeMetodo]({});
        return undefined;
    } catch (erro: any) {
        return erro?.message ?? String(erro);
    }
}
