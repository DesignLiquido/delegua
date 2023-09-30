import { Construto, Literal } from '../../construtos';
import { InterpretadorInterfaceBirl } from '../interpretador-interface-birl';

export interface InterpretadorBirlInterface extends InterpretadorInterfaceBirl {
    resolveQuantidadeDeInterpolacoes(expressao: Literal): Promise<RegExpMatchArray>;
    verificaTipoDaInterpolação(dados: { tipo: string; valor: any }): Promise<boolean>;
    substituirValor(stringOriginal: string, novoValor: number | string | any, simboloTipo: string): Promise<string>;
    avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string>;
}
