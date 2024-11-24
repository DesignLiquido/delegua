import { Simbolo } from '../lexador';
import tipoDeDadosPrimitivos from '../tipos-de-dados/primitivos';
import tipoDeDadosDelegua from '../tipos-de-dados/delegua';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
export type TipoInferencia =
    | 'texto'
    | 'cadeia'
    | 'inteiro'
    | 'real'
    | 'vazio'
    | 'caracter'
    | 'número'
    | 'longo'
    | 'vetor'
    | 'dicionário'
    | 'nulo'
    | 'lógico'
    | 'função'
    | 'símbolo'
    | 'objeto'
    | 'módulo';

export enum TIPO_NATIVO {
    ESCREVA = '<palavra reservada escreva ajuda="palavra reservada usada para apresentar informações">',
    LEIA = '<palavra reservada leia ajuda="palavra reservada usada para entrada de dados">',
    FUNCAO = '<palavra reservada funcao ajuda="palavra reservada usada para criar funções">',
    SE = '<palavra reservada se ajuda="palavra reservada usada para estruturas condicionais">',
    ENQUANTO = '<palavra reservada enquanto ajuda="palavra reservada usada para loops enquanto">',
    PARA = '<palavra reservada para ajuda="palavra reservada usada para loops para">',
    RETORNA = '<palavra reservada retornar ajuda="palavra reservada usada para retornar valores em funções">',
    INTEIRO = '<palavra reservada inteiro ajuda="palavra reservada usada para definir variáveis do tipo inteiro">',
    TEXTO = '<palavra reservada texto ajuda="palavra reservada usada para definir variáveis do tipo texto">',
    BOOLEANO = '<palavra reservada booleano ajuda="palavra reservada usada para definir variáveis do tipo booleano">',
    VAZIO = '<palavra reservada vazio ajuda="palavra reservada usada para definir funções que não retornam valores">',
}

export function inferirTipoVariavel(
    variavel: string | number | Array<any> | boolean | null | undefined
): TipoInferencia | TIPO_NATIVO {
    const tipo = typeof variavel;
    switch (tipo) {
        case 'string':
            return 'texto';
        case 'number':
            return 'número';
        case 'bigint':
            return 'longo';
        case 'boolean':
            return 'lógico';
        case 'undefined':
            return 'nulo';
        case 'object':
            if (Array.isArray(variavel)) return 'vetor';
            if (variavel === null) return 'nulo';
            if (variavel.constructor.name === 'DeleguaFuncao') return 'função';
            if (variavel.constructor.name === 'DeleguaModulo') return 'módulo';
            if (variavel.constructor.name === 'Classe') return 'objeto';
            if (variavel.constructor.name === 'Simbolo') {
                if (typeof variavel === 'object') {
                    const simbolo = variavel as Simbolo;
                    if (simbolo.tipo === tiposDeSimbolos.ESCREVA) return TIPO_NATIVO.ESCREVA;
                    if (simbolo.tipo === tiposDeSimbolos.FUNCAO || simbolo.tipo === tiposDeSimbolos.FUNÇÃO)
                        return TIPO_NATIVO.FUNCAO;
                    if (simbolo.tipo === tiposDeSimbolos.LEIA) return TIPO_NATIVO.LEIA;
                    if (simbolo.tipo === tiposDeSimbolos.SE) return TIPO_NATIVO.SE;
                    if (simbolo.tipo === tiposDeSimbolos.ENQUANTO) return TIPO_NATIVO.ENQUANTO;
                    if (simbolo.tipo === tiposDeSimbolos.PARA) return TIPO_NATIVO.PARA;
                    if (simbolo.tipo === tiposDeSimbolos.RETORNA) return TIPO_NATIVO.RETORNA;
                    if (simbolo.tipo === tipoDeDadosPrimitivos.TEXTO) return TIPO_NATIVO.TEXTO;
                    if (simbolo.tipo === tipoDeDadosPrimitivos.BOOLEANO) return TIPO_NATIVO.BOOLEANO;
                    if (simbolo.tipo === tipoDeDadosDelegua.VAZIO) return TIPO_NATIVO.VAZIO;
                }
            }
            return 'dicionário';
        case 'function':
            return 'função';
        case 'symbol':
            return 'símbolo';
    }
}
