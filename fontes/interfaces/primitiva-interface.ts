import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';

export interface PrimitivaInterface {
    tipoRetorno: string;
    argumentos: InformacaoElementoSintatico[];
    implementacao: Function;
    // TODO: Por enquanto todos os métodos de primitivas possuem
    // apenas uma assinatura. Futuramente, substituir `assinaturaFormato`
    // por `assinaturas`.
    assinaturaFormato?: string;
    documentacao?: string;
    exemploCodigo?: string;
}
