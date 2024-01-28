import {
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    AtribuicaoPorIndicesMatriz,
    Binario,
    Construto,
    FimPara,
    Literal,
    Logico,
    Unario,
    Variavel,
} from '../../../construtos';
import { Aleatorio, Expressao, Leia, Para } from '../../../declaracoes';
import { Simbolo } from '../../../lexador';
import { SimboloInterface, VariavelInterface } from '../../../interfaces';
import { inferirTipoVariavel } from '../../inferenciador';

import tiposDeSimbolos from '../../../tipos-de-simbolos/visualg';
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { InterpretadorBase } from '../../interpretador-base';

export async function atribuirVariavel(
    interpretador: InterpretadorBase,
    expressao: Construto,
    valor: any
): Promise<any> {
    if (expressao instanceof Variavel) {
        interpretador.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valor);
        return;
    }

    if (expressao instanceof AcessoIndiceVariavel) {
        const promises = await Promise.all([
            interpretador.avaliar(expressao.entidadeChamada),
            interpretador.avaliar(expressao.indice),
        ]);

        let alvo = promises[0];
        let indice = promises[1];
        const subtipo = alvo.hasOwnProperty('subtipo') ? alvo.subtipo : undefined;

        if (alvo.hasOwnProperty('valor')) {
            alvo = alvo.valor;
        }

        if (indice.hasOwnProperty('valor')) {
            indice = indice.valor;
        }

        let valorResolvido;
        switch (subtipo) {
            case 'texto':
                valorResolvido = String(valor);
                break;
            case 'número':
                valorResolvido = Number(valor);
                break;
            case 'lógico':
                valorResolvido = Boolean(valor);
                break;
            default:
                valorResolvido = valor;
                break;
        }

        alvo[indice] = valorResolvido;
    }
}

async function avaliar(interpretador: InterpretadorBase, expressao: Construto): Promise<any> {
    return await expressao.aceitar(interpretador);
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
    if (tipoDireita === 'número' && tipoEsquerda === 'número') return;
    throw new ErroEmTempoDeExecucao(operador, 'Operadores precisam ser números.', operador.linha);
}

/**
 * Método de visita de expressão binária.
 * Reintroduzido pelas particularidades do VisuAlg.
 * @param expressao A expressão binária.
 * @returns O resultado da resolução da expressão.
 */
export async function visitarExpressaoBinaria(
    interpretador: InterpretadorBase,
    expressao: Binario | any
): Promise<any> {
    try {
        const promises = await Promise.all([
            avaliar(interpretador, expressao.esquerda),
            avaliar(interpretador, expressao.direita),
        ]);

        const esquerda: VariavelInterface | any = promises[0];
        const direita: VariavelInterface | any = promises[1];

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
            case tiposDeSimbolos.EXPONENCIACAO:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Math.pow(valorEsquerdo, valorDireito);

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

            case tiposDeSimbolos.DIVISAO_INTEIRA:
                verificarOperandosNumeros(expressao.operador, esquerda, direita);
                return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

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

export async function visitarExpressaoLogica(interpretador: InterpretadorBase, expressao: Logico): Promise<any> {
    const esquerda = await avaliar(interpretador, expressao.esquerda);

    // se um estado for verdadeiro, retorna verdadeiro
    if (expressao.operador.tipo === tiposDeSimbolos.OU) {
        if (eVerdadeiro(esquerda)) return esquerda;
    }

    // se a primeira variável é verdadeiro, retorna a segunda invertida
    if (expressao.operador.tipo === tiposDeSimbolos.XOU) {
        const valorDireito = await avaliar(interpretador, expressao.direita);
        return eVerdadeiro(esquerda) !== eVerdadeiro(valorDireito);
    }

    // se um estado for falso, retorna falso
    if (expressao.operador.tipo === tiposDeSimbolos.E) {
        if (!eVerdadeiro(esquerda)) return esquerda;
    }

    return await avaliar(interpretador, expressao.direita);
}

/* Isso existe porque o laço `para` do VisuAlg pode ter o passo positivo ou negativo
 * dependendo dos operandos de início e fim, que só são possíveis de determinar
 * em tempo de execução.
 * Quando um dos operandos é uma variável, tanto a condição do laço quanto o
 * passo são considerados indefinidos aqui.
 */
export async function resolverIncrementoPara(interpretador: InterpretadorBase, declaracao: Para): Promise<any> {
    if (declaracao.resolverIncrementoEmExecucao) {
        const promises = await Promise.all([
            avaliar(interpretador, (declaracao.condicao as any).esquerda),
            avaliar(interpretador, (declaracao.condicao as any).direita),
        ]);
        const operandoEsquerdo = promises[0];
        const operandoDireito = promises[1];
        const valorAtualEsquerdo = operandoEsquerdo.hasOwnProperty('valor') ? operandoEsquerdo.valor : operandoEsquerdo;
        const valorAtualDireito = operandoDireito.hasOwnProperty('valor') ? operandoDireito.valor : operandoDireito;

        if (valorAtualEsquerdo < valorAtualDireito) {
            (declaracao.condicao as any).operador = new Simbolo(
                tiposDeSimbolos.MENOR_IGUAL,
                '',
                '',
                Number(declaracao.linha),
                declaracao.hashArquivo
            );
            (declaracao.incrementar as FimPara).condicaoPara.operador = new Simbolo(
                tiposDeSimbolos.MENOR,
                '',
                '',
                Number(declaracao.linha),
                declaracao.hashArquivo
            );
            ((declaracao.incrementar as FimPara).incremento as Expressao).expressao.valor.direita = new Literal(
                declaracao.hashArquivo,
                Number(declaracao.linha),
                1
            );
        } else {
            (declaracao.condicao as any).operador = new Simbolo(
                tiposDeSimbolos.MAIOR_IGUAL,
                '',
                '',
                Number(declaracao.linha),
                declaracao.hashArquivo
            );
            (declaracao.incrementar as FimPara).condicaoPara.operador = new Simbolo(
                tiposDeSimbolos.MAIOR,
                '',
                '',
                Number(declaracao.linha),
                declaracao.hashArquivo
            );
            ((declaracao.incrementar as FimPara).incremento as Expressao).expressao.valor.direita = new Unario(
                declaracao.hashArquivo,
                new Simbolo(tiposDeSimbolos.SUBTRACAO, '-', undefined, declaracao.linha, declaracao.hashArquivo),
                new Literal(declaracao.hashArquivo, Number(declaracao.linha), 1),
                'ANTES'
            );
        }
    }
}

export async function visitarExpressaoAcessoElementoMatriz(interpretador: InterpretadorBase, expressao: AcessoElementoMatriz): Promise<any> {
    const promises = await Promise.all([
        avaliar(interpretador, expressao.entidadeChamada),
        avaliar(interpretador, expressao.indicePrimario),
        avaliar(interpretador, expressao.indiceSecundario),
    ]);

    const variavelObjeto: VariavelInterface = promises[0];
    const indicePrimario = promises[1];
    const indiceSecundario = promises[2];

    const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;
    let valorIndicePrimario = indicePrimario.hasOwnProperty('valor') ? indicePrimario.valor : indicePrimario;
    let valorIndiceSecundario = indiceSecundario.hasOwnProperty('valor') ? indiceSecundario.valor : indiceSecundario;

    if (Array.isArray(objeto)) {
        if (!Number.isInteger(valorIndicePrimario) || !Number.isInteger(valorIndiceSecundario)) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Somente inteiros podem ser usados para indexar um vetor.',
                    expressao.linha
                )
            );
        }

        if (valorIndicePrimario < 0 && objeto.length !== 0) {
            while (valorIndicePrimario < 0) {
                valorIndicePrimario += objeto.length;
            }
        }
        if (valorIndiceSecundario < 0 && objeto.length !== 0) {
            while (valorIndiceSecundario < 0) {
                valorIndiceSecundario += objeto.length;
            }
        }

        if (valorIndicePrimario >= objeto.length || valorIndiceSecundario >= objeto.length) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice do vetor fora do intervalo.',
                    expressao.linha
                )
            );
        }
        return objeto[valorIndicePrimario][valorIndiceSecundario];
    }
    return Promise.reject(
        new ErroEmTempoDeExecucao(
            expressao.entidadeChamada.valor,
            'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
            expressao.linha
        )
    );
}

export async function visitarExpressaoAtribuicaoPorIndicesMatriz(interpretador: InterpretadorBase, expressao: AtribuicaoPorIndicesMatriz): Promise<any> {
    const promises = await Promise.all([
        avaliar(interpretador, expressao.objeto),
        avaliar(interpretador, expressao.indicePrimario),
        avaliar(interpretador, expressao.indiceSecundario),
        avaliar(interpretador, expressao.valor),
    ]);

    let objeto = promises[0];
    let indicePrimario = promises[1];
    let indiceSecundario = promises[2];
    const valor = promises[3];

    objeto = objeto.hasOwnProperty('valor') ? objeto.valor : objeto;
    indicePrimario = indicePrimario.hasOwnProperty('valor') ? indicePrimario.valor : indicePrimario;
    indiceSecundario = indiceSecundario.hasOwnProperty('valor') ? indiceSecundario.valor : indiceSecundario;

    if (Array.isArray(objeto)) {
        if (indicePrimario < 0 && objeto.length !== 0) {
            while (indicePrimario < 0) {
                indicePrimario += objeto.length;
            }
        }
        if (indiceSecundario < 0 && objeto.length !== 0) {
            while (indiceSecundario < 0) {
                indiceSecundario += objeto.length;
            }
        }

        while (objeto.length < indicePrimario || objeto.length < indiceSecundario) {
            objeto.push(null);
        }

        objeto[indicePrimario][indiceSecundario] = valor;
        return Promise.resolve();
    }
    return Promise.reject(
        new ErroEmTempoDeExecucao(
            expressao.objeto.nome,
            'Somente listas, dicionários, classes e objetos podem ser mudados por sobrescrita.',
            expressao.linha
        )
    );
}

export async function visitarDeclaracaoAleatorio(interpretador: InterpretadorBase, expressao: Aleatorio): Promise<any> {
    let retornoExecucao: any;
    try {
        retornoExecucao = await interpretador.executar(expressao.corpo);

    } catch (error) {
        interpretador.erros.push({
            erroInterno: error,
            linha: expressao.linha,
            hashArquivo: expressao.hashArquivo,
        });
        return Promise.reject(error)
    }

    return retornoExecucao;
}


export async function visitarExpressaoLeia(interpretador: InterpretadorBase, expressao: Leia, mensagemPrompt: string): Promise<any> {
    // Verifica se a leitura deve ser interrompida antes de prosseguir
    if (!expressao.eParaInterromper) {
        for (let argumento of expressao.argumentos) {
            const promessaLeitura: Function = () =>
                new Promise((resolucao) =>
                    interpretador.interfaceEntradaSaida.question(mensagemPrompt, (resposta: any) => {
                        mensagemPrompt = '> ';
                        resolucao(resposta);
                    })
                );
            const valorLido = await promessaLeitura();
            await atribuirVariavel(interpretador, argumento, valorLido);
        }
    }
}
