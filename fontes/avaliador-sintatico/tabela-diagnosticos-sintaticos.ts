import { EntradaTabelaDiagnosticoSintaticoInterface } from "../interfaces";

export const TABELA_ERROS_SINTATICOS: EntradaTabelaDiagnosticoSintaticoInterface[] = [
    {
        codigoDiagnostico: 'SINTATICO_IMPORTACAO_INVALIDA',
        descricao: 'Erro em declaracao de importacao.',
        padroesMensagem: [/importa(?:cao|\u00e7\u00e3o)/i, /importar/i],
    },
    {
        codigoDiagnostico: 'SINTATICO_IDENTIFICADOR_ESPERADO',
        descricao: 'Identificador esperado no ponto atual.',
        padroesMensagem: [/esperado.*identificador/i],
    },
    {
        codigoDiagnostico: 'SINTATICO_EXPRESSAO_ESPERADA',
        descricao: 'Expressao esperada no ponto atual.',
        padroesMensagem: [/esperado.*express(?:ao|\u00e3o)/i],
    },
    {
        codigoDiagnostico: 'SINTATICO_ERRO_GENERICO',
        descricao: 'Erro sintatico nao categorizado.',
        padroesMensagem: [],
    },
];

export const TABELA_AVISOS_SINTATICOS: EntradaTabelaDiagnosticoSintaticoInterface[] = [
    {
        codigoDiagnostico: 'SINTATICO_AVISO_GENERICO',
        descricao: 'Aviso sintatico nao categorizado.',
        padroesMensagem: [],
    },
];

export function inferirCodigoDiagnosticoSintatico(mensagem: string): string {
    for (const entrada of TABELA_ERROS_SINTATICOS) {
        if (!entrada.padroesMensagem.length) {
            continue;
        }

        if (entrada.padroesMensagem.some((regex) => regex.test(mensagem))) {
            return entrada.codigoDiagnostico;
        }
    }

    return 'SINTATICO_ERRO_GENERICO';
}
