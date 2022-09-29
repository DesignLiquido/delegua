import { SimboloInterface } from "./simbolo-interface";

export interface ParametroInterface {
    tipo: 'estrela' | 'padrao';
    nome: SimboloInterface;
    valorPadrao: any;
}
