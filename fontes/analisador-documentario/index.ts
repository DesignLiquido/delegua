import { DocumentarioAnalisadoInterface } from '../interfaces/documentario/documentario-analisado';

const REGEX_PARAMETRO = /^@(?:par[aâ]metro|param)\s+(?:\{([^}]+)\}\s+)?(\S+)\s*(.*)$/;
const REGEX_RETORNA = /^@(?:retorna)\s*(?:\{([^}]+)\}\s*)?(.*)$/;
const REGEX_EXEMPLO = /^@(?:exemplo)\s*(.*)$/;
const REGEX_DEPRECIADO = /^@depreciado\s*(.*)$/;
const REGEX_VEJA = /^@veja\s+(\S+).*$/;
const REGEX_TAG = /^@\w+/;

type Segmento = { tag: string; linhas: string[] };

function segmentar(linhas: string[]): Segmento[] {
    const segmentos: Segmento[] = [];
    let atual: Segmento = { tag: '', linhas: [] };

    for (const linha of linhas) {
        if (REGEX_TAG.test(linha)) {
            segmentos.push(atual);
            const tag = linha.match(/^@(\w+)/)?.[1] ?? '';
            atual = { tag, linhas: [linha] };
        } else {
            atual.linhas.push(linha);
        }
    }
    segmentos.push(atual);

    return segmentos;
}

export function analisarDocumentario(conteudo: string): DocumentarioAnalisadoInterface {
    const resultado: DocumentarioAnalisadoInterface = {
        descricao: '',
        parametros: [],
        veja: [],
    };

    const linhas = conteudo.split('\n');
    const segmentos = segmentar(linhas);

    for (const segmento of segmentos) {
        if (segmento.tag === '') {
            resultado.descricao = segmento.linhas.join('\n').trim();
            continue;
        }

        const primeiraLinha = segmento.linhas[0] ?? '';

        let m: RegExpMatchArray | null;

        m = primeiraLinha.match(REGEX_PARAMETRO);
        if (m) {
            resultado.parametros.push({
                tipo: m[1] || undefined,
                nome: m[2],
                descricao: m[3].trim(),
            });
            continue;
        }

        m = primeiraLinha.match(REGEX_RETORNA);
        if (m) {
            resultado.retorna = {
                tipo: m[1] || undefined,
                descricao: m[2].trim(),
            };
            continue;
        }

        m = primeiraLinha.match(REGEX_EXEMPLO);
        if (m) {
            const restoLinha = m[1].trim();
            const linhasExtras = segmento.linhas.slice(1).join('\n').trim();
            resultado.exemplo = restoLinha
                ? restoLinha + (linhasExtras ? '\n' + linhasExtras : '')
                : linhasExtras;
            continue;
        }

        m = primeiraLinha.match(REGEX_DEPRECIADO);
        if (m) {
            resultado.depreciado = m[1].trim();
            continue;
        }

        m = primeiraLinha.match(REGEX_VEJA);
        if (m) {
            resultado.veja.push(m[1].trim());
            continue;
        }

        // tag desconhecida: ignorada silenciosamente
    }

    return resultado;
}
