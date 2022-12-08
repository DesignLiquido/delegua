import { Declaracao } from "../declaracoes";

export interface TradutorInterface {
    traduzir(declaracoes: Declaracao[]): any;
}
