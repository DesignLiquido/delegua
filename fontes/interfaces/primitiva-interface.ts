import { InformacaoVariavelOuConstante } from "../informacao-variavel-ou-constante";

export interface PrimitivaInterface {
    tipoRetorno: string;
    argumentos: InformacaoVariavelOuConstante[];
    implementacao: Function;
}
