import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';

export interface PrimitivaInterface {
    tipoRetorno: string;
    argumentos: InformacaoElementoSintatico[];
    implementacao: Function;
    assinaturaFormato?: string;
    documentacao?: string;
    exemploCodigo?: string;
    subtiposSuportados?: string[];
}
