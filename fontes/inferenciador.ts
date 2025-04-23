import { Simbolo } from './lexador';
import tipoDeDadosPrimitivos from './tipos-de-dados/primitivos';
import tipoDeDadosDelegua from './tipos-de-dados/delegua';
import tiposDeSimbolos from './tipos-de-simbolos/delegua';
import { TipoDadosElementar } from './tipo-dados-elementar';
import { Construto } from './construtos';
export type TipoInferencia =
    | 'cadeia'
    | 'caracter'
    | 'dicionário'
    | 'função'
    | 'lógico'
    | 'lógico[]'
    | 'longo'
    | 'longo[]'
    | 'módulo'
    | 'nulo'
    | 'número'
    | 'número[]'
    | 'objeto'
    | 'símbolo'
    | 'texto'
    | 'texto[]'
    | 'vazio'
    | 'vetor';

export enum TipoNativoSimbolo {
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

function inferirVetor(vetor: Array<any>): TipoInferencia {
    const tiposEmVetor = new Set(vetor.map((elemento) => elemento.constructor.name));
    if (tiposEmVetor.size > 1) {
        return 'vetor';
    }

    const tipoVetor = tiposEmVetor.values().next().value;
    switch (tipoVetor) {
        case 'bigint':
            return 'longo[]';
        case 'boolean':
            return 'lógico[]';
        case 'number':
            return 'número[]';
        case 'string':
            return 'texto[]';
        case 'object':
            const tiposObjetosEmVetor = new Set(vetor.map((elemento) => (elemento as any).tipo));
            if (tiposObjetosEmVetor.size > 1) {
                return 'vetor';
            }

            return `${tiposObjetosEmVetor.values().next().value}[]` as TipoInferencia;
        case 'Literal':
            // TODO: Não sei se é seguro inferir pelo primeiro valor do vetor.
            return `${vetor[0].tipo}[]` as TipoInferencia;
        default:
            return 'vetor';
    }
}

export function inferirTipoVariavel(
    variavel: any
): TipoInferencia | TipoNativoSimbolo {
    if (variavel === null) {
        return 'nulo';
    }

    const tipo = variavel.constructor.name;
    switch (tipo) {
        case 'String':
        case 'string':
            return 'texto';
        case 'Number':
        case 'number':
            return 'número';
        case 'bigint':
            return 'longo';
        case 'Boolean':
        case 'boolean':
            return 'lógico';
        case 'undefined':
            return 'nulo';
        case 'Object':
        case 'object':
            if (variavel === null) return 'nulo';
            return 'dicionário';
        case 'Array':
        case 'Vetor':
            return inferirVetor(variavel as Array<any>);
        case 'DeleguaFuncao':
            return 'função';
        case 'DeleguaModulo':
            return 'módulo';
        case 'Classe':
            return 'objeto';
        case 'Simbolo': // TODO: Repensar.
            const simbolo = variavel as Simbolo;
            switch (simbolo.tipo) {
                case tipoDeDadosPrimitivos.BOOLEANO:
                    return TipoNativoSimbolo.BOOLEANO;
                case tiposDeSimbolos.ENQUANTO:
                    return TipoNativoSimbolo.ENQUANTO;
                case tiposDeSimbolos.ESCREVA:
                    return TipoNativoSimbolo.ESCREVA;
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                    return TipoNativoSimbolo.FUNCAO;
                case tiposDeSimbolos.LEIA:
                    return TipoNativoSimbolo.LEIA;
                case tiposDeSimbolos.PARA:
                    return TipoNativoSimbolo.PARA;
                case tiposDeSimbolos.RETORNA:
                    return TipoNativoSimbolo.RETORNA;
                case tiposDeSimbolos.SE:
                    return TipoNativoSimbolo.SE;
                case tipoDeDadosPrimitivos.TEXTO:
                    return TipoNativoSimbolo.TEXTO;
                case tipoDeDadosDelegua.VAZIO:
                    return TipoNativoSimbolo.VAZIO;
            }
        case 'function':
        case 'FuncaoPadrao':
            return 'função';
        case 'symbol':
            return 'símbolo';
    }
}

export function tipoInferenciaParaTipoDadosElementar(tipoInferencia: TipoInferencia): TipoDadosElementar {
    switch (tipoInferencia) {
        // TODO: Colocar exceções aqui.
        default:
            return tipoInferencia as TipoDadosElementar;
    }
}
