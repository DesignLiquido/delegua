import { SimboloInterface } from '../simbolo-interface';
import { CorrecaoSugeridaInterface } from './correcao-sugerida-interface';

export interface DiagnosticoAnalisadorSemanticoInterface {
    simbolo?: SimboloInterface;
    simboloRelacionado?: SimboloInterface;
    mensagem?: string;
    codigoDiagnostico?: string;
    linha?: number;
    hashArquivo?: number;
    severidade: DiagnosticoSeveridade;
    colunaInicio?: number;
    colunaFim?: number;
    correcoes?: CorrecaoSugeridaInterface[];
}

export enum DiagnosticoSeveridade {
    ERRO = 0,
    AVISO = 1,
    INFORMACAO = 2,
    SUGESTAO = 3,
}
