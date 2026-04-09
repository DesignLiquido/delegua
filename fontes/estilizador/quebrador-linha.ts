/**
 * Operadores lógicos reconhecidos como pontos de quebra.
 * Inclui as formas em português geradas pelo FormatadorDelegua.
 */
const OPERADORES_LOGICOS = [' && ', ' || ', ' e ', ' ou ', ' em '];

/**
 * Operadores binários multi-caractere reconhecidos como pontos de quebra.
 */
const OPERADORES_BINARIOS_MULTI = [' == ', ' != ', ' >= ', ' <= '];

/**
 * Verifica se a posição `pos` está dentro de um literal de texto na linha.
 * Suporta aspas simples e duplas, respeitando escapes com `\`.
 */
function estaEmString(linha: string, pos: number): boolean {
    let emString = false;
    let delimitador = '';

    for (let i = 0; i < pos; i++) {
        const c = linha[i];

        if (emString) {
            if (c === '\\') {
                i++; // pula o próximo caractere (escape)
                continue;
            }
            if (c === delimitador) {
                emString = false;
                delimitador = '';
            }
        } else {
            if (c === '"' || c === "'") {
                emString = true;
                delimitador = c;
            }
        }
    }

    return emString;
}

/**
 * Retorna o prefixo de espaços/tabs no início da linha.
 */
function obterIndentacao(linha: string): string {
    const match = linha.match(/^(\s*)/);
    return match ? match[1] : '';
}

/**
 * Encontra todos os pontos de quebra válidos em uma linha, retornando os índices
 * onde a próxima linha de continuação deve começar (já avançado o espaço separador).
 *
 * Estratégia (em ordem de prioridade aplicada pela posição na linha):
 *  - Após vírgulas fora de strings
 *  - Antes de operadores lógicos fora de strings
 *  - Antes de operadores binários multi-char fora de strings
 *
 * Retorna os índices ordenados do menor para o maior.
 */
function encontrarPontosDeQuebra(linha: string): number[] {
    const pontos = new Set<number>();

    for (let i = 0; i < linha.length; i++) {
        if (estaEmString(linha, i)) continue;

        const c = linha[i];

        // Após vírgula: a continuação começa logo depois (pulando o espaço separador)
        if (c === ',') {
            let pos = i + 1;
            if (pos < linha.length && linha[pos] === ' ') pos++;
            pontos.add(pos);
            continue;
        }

        // Antes de operadores lógicos: quebra logo antes do operador
        for (const op of OPERADORES_LOGICOS) {
            if (linha.slice(i).startsWith(op)) {
                pontos.add(i + 1); // mantém o espaço antes do operador na linha anterior
                break;
            }
        }

        // Antes de operadores binários multi-char
        for (const op of OPERADORES_BINARIOS_MULTI) {
            if (linha.slice(i).startsWith(op)) {
                pontos.add(i + 1);
                break;
            }
        }
    }

    return Array.from(pontos).sort((a, b) => a - b);
}

/**
 * Quebra uma única linha em múltiplas, tentando manter cada segmento
 * dentro de `maximo` caracteres usando uma estratégia gulosa.
 *
 * Para cada segmento, encontra o último ponto de quebra que ainda mantém
 * o conteúdo dentro do limite. Se não houver ponto de quebra viável,
 * usa o primeiro disponível (evitando truncamento arbitrário de tokens).
 *
 * Se a linha não puder ser melhorada (apenas 1 segmento), retorna a original intacta.
 */
function quebrarLinha(linha: string, maximo: number, indentacaoContinuacao: string): string[] {
    if (linha.length <= maximo) return [linha];

    const pontos = encontrarPontosDeQuebra(linha);
    if (pontos.length === 0) return [linha];

    const segmentos: string[] = [];
    let inicio = 0;

    while (inicio < linha.length) {
        const prefixo = segmentos.length === 0 ? '' : indentacaoContinuacao;
        const restante = linha.slice(inicio);

        // O conteúdo restante cabe no limite → termina
        if ((prefixo + restante.trimEnd()).length <= maximo) {
            segmentos.push(prefixo + restante.trimEnd());
            break;
        }

        // Filtra apenas pontos à frente de `inicio`
        const pontosDisponiveis = pontos.filter((p) => p > inicio);
        if (pontosDisponiveis.length === 0) {
            // Nenhum ponto restante; empurra o resto sem quebrar
            segmentos.push(prefixo + restante.trimEnd());
            break;
        }

        // Encontra o maior ponto que ainda mantém o segmento dentro do limite
        let melhorPonto = -1;
        for (const ponto of pontosDisponiveis) {
            const conteudo = linha.slice(inicio, ponto).trimEnd();
            if ((prefixo + conteudo).length <= maximo) {
                melhorPonto = ponto;
            } else {
                break; // pontos estão ordenados; excedeu o limite → para
            }
        }

        if (melhorPonto === -1) {
            // Nenhum ponto cabe → usa o primeiro disponível (soft break forçado)
            melhorPonto = pontosDisponiveis[0];
        }

        const conteudo = linha.slice(inicio, melhorPonto).trimEnd();
        segmentos.push(prefixo + conteudo);

        // Avança `inicio` pulando o espaço separador, se houver
        inicio = melhorPonto;
        if (inicio < linha.length && linha[inicio] === ' ') {
            inicio++;
        }
    }

    // Se não houve melhoria real, preserva a linha original
    if (segmentos.length <= 1) return [linha];

    return segmentos;
}

/**
 * Aplica quebra de linha por limite de colunas a um bloco de código já formatado.
 *
 * Cada linha que ultrapasse `maximoCaracteres` é dividida em múltiplas linhas
 * em pontos semanticamente seguros (após vírgulas, antes de operadores lógicos
 * e binários), respeitando o conteúdo de strings literais.
 *
 * Quando não existe ponto de quebra viável, a linha é preservada intacta
 * ("soft break" — nunca trunca tokens arbitrariamente).
 */
export class QuebradorDeLinha {
    constructor(
        private readonly maximoCaracteres: number,
        private readonly tamanhoIndentacao: number,
        private readonly separadorLinha: string
    ) {}

    quebrar(codigo: string): string {
        const linhas = codigo.split(this.separadorLinha);
        const resultado: string[] = [];

        for (const linha of linhas) {
            if (linha.length <= this.maximoCaracteres) {
                resultado.push(linha);
            } else {
                const indentacaoBase = obterIndentacao(linha);
                const indentacaoContinuacao = indentacaoBase + ' '.repeat(this.tamanhoIndentacao);
                resultado.push(...quebrarLinha(linha, this.maximoCaracteres, indentacaoContinuacao));
            }
        }

        return resultado.join(this.separadorLinha);
    }
}
