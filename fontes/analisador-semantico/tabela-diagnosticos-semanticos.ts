import { DiagnosticoSeveridade, EntradaTabelaDiagnosticoSemanticoInterface } from '../interfaces';

export const TABELA_ERROS_SEMANTICOS: EntradaTabelaDiagnosticoSemanticoInterface[] = [
    {
        codigoDiagnostico: 'SEMANTICO_TIPO_DESCONHECIDO',
        descricao: 'Tipo de dados desconhecido.',
        padroesMensagem: [/tipo de dados desconhecido/i],
    },
    {
        codigoDiagnostico: 'SEMANTICO_VARIAVEL_NAO_DECLARADA',
        descricao: 'Variavel nao declarada.',
        padroesMensagem: [/variavel\s+nao\s+declarada/i, /variavel\s+n(?:ao|\u00e3o)\s+declarada/i],
    },
    {
        codigoDiagnostico: 'SEMANTICO_TIPO_INCOMPATIVEL',
        descricao: 'Tipos incompativeis em atribuicao, chamada ou operacao.',
        padroesMensagem: [/tipo.*diferente/i, /tipo.*incompativel/i, /incompativeis/i],
    },
    {
        codigoDiagnostico: 'SEMANTICO_FUNCAO_PARAMETROS_INVALIDOS',
        descricao: 'Quantidade ou tipo de parametros invalida para funcao.',
        padroesMensagem: [/funcao.*espera.*parametr/i, /parametr.*diferente/i],
    },
    {
        codigoDiagnostico: 'SEMANTICO_METODO_NAO_ENCONTRADO',
        descricao: 'Metodo nao encontrado na classe.',
        padroesMensagem: [/m[eé]todo n[aã]o encontrado na classe/i],
    },
    {
        codigoDiagnostico: 'SEMANTICO_ERRO_GENERICO',
        descricao: 'Erro semantico nao categorizado.',
        padroesMensagem: [],
    },
];

export const TABELA_AVISOS_SEMANTICOS: EntradaTabelaDiagnosticoSemanticoInterface[] = [
    {
        codigoDiagnostico: 'SEMANTICO_VARIAVEL_NAO_UTILIZADA',
        descricao: 'Variavel declarada e nao utilizada.',
        padroesMensagem: [/nao utilizada/i, /n(?:ao|\u00e3o) utilizada/i],
    },
    {
        codigoDiagnostico: 'SEMANTICO_AVISO_GENERICO',
        descricao: 'Aviso semantico nao categorizado.',
        padroesMensagem: [],
    },
];

export function inferirCodigoDiagnosticoSemantico(
    mensagem: string,
    severidade: DiagnosticoSeveridade
): string {
    const tabela = severidade === DiagnosticoSeveridade.ERRO
        ? TABELA_ERROS_SEMANTICOS
        : severidade === DiagnosticoSeveridade.AVISO
            ? TABELA_AVISOS_SEMANTICOS
            : [];

    for (const entrada of tabela) {
        if (!entrada.padroesMensagem.length) {
            continue;
        }

        if (entrada.padroesMensagem.some((regex) => regex.test(mensagem))) {
            return entrada.codigoDiagnostico;
        }
    }

    if (severidade === DiagnosticoSeveridade.ERRO) {
        return 'SEMANTICO_ERRO_GENERICO';
    }

    if (severidade === DiagnosticoSeveridade.AVISO) {
        return 'SEMANTICO_AVISO_GENERICO';
    }

    return 'SEMANTICO_DIAGNOSTICO_GENERICO';
}
