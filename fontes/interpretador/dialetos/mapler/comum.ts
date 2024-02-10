import { Binario, Construto, Logico } from '../../../construtos';
import { VisitanteComumInterface, SimboloInterface, VariavelInterface } from '../../../interfaces';
import { inferirTipoVariavel } from '../../inferenciador';

import tiposDeSimbolos from '../../../tipos-de-simbolos/mapler';
import { ErroEmTempoDeExecucao } from '../../../excecoes';

async function avaliar(visitante: VisitanteComumInterface, expressao: Construto): Promise<any> {
    return await expressao.aceitar(visitante);
}

function eIgual(esquerda: VariavelInterface | any, direita: VariavelInterface | any): boolean {
    if (esquerda === null && direita === null) return true;
    if (esquerda === null) return false;
    return esquerda === direita;
}

function eVerdadeiro(objeto: any): boolean {
    if (objeto === null) return false;
    if (typeof objeto === 'boolean') return Boolean(objeto);
    if (objeto.hasOwnProperty('valor')) {
        return Boolean(objeto.valor);
    }

    return true;
}

function verificarOperandosNumeros(
    operador: SimboloInterface,
    direita: VariavelInterface | any,
    esquerda: VariavelInterface | any
): void {
    const tipoDireita: string = direita.tipo ? direita.tipo : typeof direita === 'number' ? 'número' : String(NaN);
    const tipoEsquerda: string = esquerda.tipo ? esquerda.tipo : typeof esquerda === 'number' ? 'número' : String(NaN);
    const tiposNumericos = ['inteiro', 'numero', 'número', 'real'];
    if (tiposNumericos.includes(tipoDireita.toLowerCase()) && tiposNumericos.includes(tipoEsquerda.toLowerCase())) return;
    throw new ErroEmTempoDeExecucao(operador, 'Operadores precisam ser números.', operador.linha);
}

/**
 * Método de visita de expressão binária.
 * Reintroduzido pelas particularidades do VisuAlg.
 * @param expressao A expressão binária.
 * @returns O resultado da resolução da expressão.
 */
export async function visitarExpressaoBinaria(
    visitante: VisitanteComumInterface,
    expressao: Binario | any
): Promise<any> {
    try {
        const esquerda: VariavelInterface | any = await avaliar(visitante, expressao.esquerda);
        const direita: VariavelInterface | any = await avaliar(visitante, expressao.direita);

        let valorEsquerdo: any = esquerda?.hasOwnProperty('valor') ? esquerda.valor : esquerda;
        let valorDireito: any = direita?.hasOwnProperty('valor') ? direita.valor : direita;

        // No VisuAlg, uma variável pode resolver para função porque funções não precisam ter parênteses.
        // Esta parte evita o problema.
        if (valorEsquerdo && valorEsquerdo.hasOwnProperty('funcao')) {
            valorEsquerdo = valorEsquerdo.funcao();
        }

        if (valorDireito && valorDireito.hasOwnProperty('funcao')) {
            valorDireito = valorDireito.funcao();
        }

        const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo') ? esquerda.tipo : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita?.hasOwnProperty('tipo') ? direita.tipo : inferirTipoVariavel(direita);

        switch (expressao.operador.tipo) {
            // case tiposDeSimbolos.EXPONENCIACAO:
            //     verificarOperandosNumeros(expressao.operador, esquerda, direita);
            //     return Math.pow(valorEsquerdo, valorDireito);

            case tiposDeSimbolos.MAIOR:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) > Number(valorDireito);

            case tiposDeSimbolos.MAIOR_IGUAL:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) >= Number(valorDireito);

            case tiposDeSimbolos.MENOR:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) < Number(valorDireito);

            case tiposDeSimbolos.MENOR_IGUAL:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) <= Number(valorDireito);

            case tiposDeSimbolos.SUBTRACAO:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) - Number(valorDireito);

            case tiposDeSimbolos.ADICAO:
                if (tipoEsquerdo === 'número' && tipoDireito === 'número') {
                    return Number(valorEsquerdo) + Number(valorDireito);
                } else {
                    return String(valorEsquerdo) + String(valorDireito);
                }

            case tiposDeSimbolos.DIVISAO:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) / Number(valorDireito);

            // case tiposDeSimbolos.DIVISAO_INTEIRA:
            //     verificarOperandosNumeros(expressao.operador, esquerda, direita);
            //     return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

            case tiposDeSimbolos.MULTIPLICACAO:
                if (tipoEsquerdo === 'texto' || tipoDireito === 'texto') {
                    // Sem ambos os valores resolvem como texto, multiplica normal.
                    // Se apenas um resolve como texto, o outro repete o
                    // texto n vezes, sendo n o valor do outro.
                    if (tipoEsquerdo === 'texto' && tipoDireito === 'texto') {
                        return Number(valorEsquerdo) * Number(valorDireito);
                    }

                    if (tipoEsquerdo === 'texto') {
                        return valorEsquerdo.repeat(Number(valorDireito));
                    }

                    return valorDireito.repeat(Number(valorEsquerdo));
                }

                return Number(valorEsquerdo) * Number(valorDireito);

            case tiposDeSimbolos.MODULO:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Number(valorEsquerdo) % Number(valorDireito);

            case tiposDeSimbolos.DIFERENTE:
                return !eIgual(valorEsquerdo, valorDireito);

            case tiposDeSimbolos.IGUAL:
                return eIgual(valorEsquerdo, valorDireito);
        }
    } catch (erro: any) {
        return Promise.reject(erro);
    }
}

export async function visitarExpressaoLogica(interpretador: VisitanteComumInterface, expressao: Logico): Promise<any> {
    const esquerda = await avaliar(interpretador, expressao.esquerda);

    // se um estado for verdadeiro, retorna verdadeiro
    // if (expressao.operador.tipo === tiposDeSimbolos.OU) {
    //     if (eVerdadeiro(esquerda)) return esquerda;
    // }

    // se a primeira variável é verdadeiro, retorna a segunda invertida
    // if (expressao.operador.tipo === tiposDeSimbolos.XOU) {
    //     const valorDireito = await avaliar(interpretador, expressao.direita);
    //     return eVerdadeiro(esquerda) !== eVerdadeiro(valorDireito);
    // }

    // se um estado for falso, retorna falso
    // if (expressao.operador.tipo === tiposDeSimbolos.E) {
    //     if (!eVerdadeiro(esquerda)) return esquerda;
    // }

    return await avaliar(interpretador, expressao.direita);
}
