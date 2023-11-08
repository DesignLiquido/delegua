import { SimboloInterface } from '../simbolo-interface';

export interface DiagnosticoAnalisadorSemantico {
    simbolo?: SimboloInterface;
    mensagem?: string;
    linha?: number;
    hashArquivo?: number;
    severidade: DiagnosticoSeveridade;
}

export enum DiagnosticoSeveridade {
    ERRO = 0,
    AVISO = 1,
    INFORMACAO = 2,
    SUGESTAO = 3
}