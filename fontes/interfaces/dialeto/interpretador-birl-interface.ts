import { Construto, Literal } from "../../construtos";
import { InterpretadorInterface } from "../interpretador-interface";

export interface InterpretadorBirlInterface extends InterpretadorInterface {
    resolveQuantidadeDeInterpolacoes(expressao: Literal): Promise<RegExpMatchArray>;
    verificaTipoDaInterpolação(dados: {tipo: string, valor: any}): Promise<boolean>;
    substituirValor(stringOriginal: string, novoValor: number | string | any, simboloTipo: string): Promise<string>;
    avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string>;
}