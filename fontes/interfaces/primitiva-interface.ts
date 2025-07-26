import { InformacaoVariavelOuConstante } from '../informacao-variavel-ou-constante';

export interface PrimitivaInterface {
    tipoRetorno: string;
    argumentos: InformacaoVariavelOuConstante[];
    implementacao: Function;
    // TODO: Por enquanto todos os métodos de primitivas possuem
    // apenas uma assinatura. Futuramente, substituir `assinaturaFormato`
    // por `assinaturas`.
    assinaturaFormato?: string;
    documentacao?: string;
    exemploCodigo?: string;
}
