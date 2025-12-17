import { AcessoMetodo, AcessoMetodoOuPropriedade, AcessoPropriedade, AcessoIntervaloVariavel, TuplaN, Literal } from "../../../construtos";
import { inferirTipoVariavel } from "../../../inferenciador";
import { InterpretadorInterface, SimboloInterface, VariavelInterface } from "../../../interfaces";
import { RetornoQuebra } from "../../../quebras";
import { DeleguaModulo, MetodoPrimitiva, ObjetoDeleguaClasse } from "../../estruturas";
import { ErroEmTempoDeExecucao } from "../../../excecoes";

import primitivasDicionario from "../../../bibliotecas/dialetos/pitugues/primitivas-dicionario";
import primitivasNumero from "../../../bibliotecas/dialetos/pitugues/primitivas-numero";
import primitivasTexto from "../../../bibliotecas/dialetos/pitugues/primitivas-texto";
import primitivasVetor from "../../../bibliotecas/dialetos/pitugues/primitivas-vetor";

import tipoDeDadosPrimitivos from '../../../tipos-de-dados/primitivos';
import tipoDeDadosPitugues from '../../../tipos-de-dados/dialetos/pitugues';

export async function visitarExpressaoAcessoMetodo(
    interpretador: InterpretadorInterface,
    expressao: AcessoMetodo
): Promise<any> {
    const nomeObjeto = (interpretador as any).resolverNomeObjectoAcessado(expressao.objeto);

    let variavelObjeto: VariavelInterface = await interpretador.avaliar(expressao.objeto);

    // Este caso acontece quando há encadeamento de métodos.
    // Por exemplo, `objeto1.metodo1().metodo2()`.
    // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
    // valor dele primeiro.
    if (variavelObjeto.constructor && variavelObjeto.constructor === RetornoQuebra) {
        variavelObjeto = (variavelObjeto as RetornoQuebra).valor;
    }

    const objeto = interpretador.resolverValor(variavelObjeto);

    if (objeto.constructor === ObjetoDeleguaClasse) {
        return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomeMetodo) || null;
    }

    // Objeto simples do JavaScript, ou dicionário de Delégua.
    if (objeto.constructor === Object) {
        if (expressao.nomeMetodo in primitivasDicionario) {
            const metodoDePrimitivaDicionario: Function =
                primitivasDicionario[expressao.nomeMetodo].implementacao;
            return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaDicionario, expressao.nomeMetodo, 'dicionário');
        }

        return objeto[expressao.nomeMetodo] || null;
    }

    // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
    // Normalmente executam quando uma biblioteca é importada, e estamos tentando
    // obter alguma propriedade ou método desse objeto.

    // Caso 1: Função tradicional do JavaScript.
    if (typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.FUNCAO) {
        return objeto[expressao.nomeMetodo];
    }

    // Caso 2: Objeto tradicional do JavaScript.
    if (typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.OBJETO) {
        return objeto[expressao.nomeMetodo];
    }

    // A partir daqui, presume-se que o objeto é uma das estruturas
    // de Delégua.
    if (objeto instanceof DeleguaModulo) {
        return objeto.componentes[expressao.nomeMetodo] || null;
    }

    let tipoObjeto = variavelObjeto.tipo;
    if (tipoObjeto === null || tipoObjeto === undefined) {
        tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
    }

    // Como internamente um dicionário de Delégua é simplesmente um objeto de
    // JavaScript, as primitivas de dicionário, especificamente, são tratadas
    // mais acima.
    switch (tipoObjeto) {
        case tipoDeDadosPitugues.INTEIRO:
        case tipoDeDadosPitugues.NUMERO:
        case tipoDeDadosPitugues.NÚMERO:
            const metodoDePrimitivaNumero: Function =
                primitivasNumero[expressao.nomeMetodo].implementacao;
            if (metodoDePrimitivaNumero) {
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaNumero, expressao.nomeMetodo, tipoObjeto);
            }
            break;
        case tipoDeDadosPitugues.TEXTO:
            const metodoDePrimitivaTexto: Function =
                primitivasTexto[expressao.nomeMetodo].implementacao;
            if (metodoDePrimitivaTexto) {
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaTexto, expressao.nomeMetodo, 'texto');
            }
            break;
        case tipoDeDadosPitugues.VETOR:
        case tipoDeDadosPitugues.VETOR_NUMERO:
        case tipoDeDadosPitugues.VETOR_NÚMERO:
        case tipoDeDadosPitugues.VETOR_TEXTO:
            const metodoDePrimitivaVetor: Function =
                primitivasVetor[expressao.nomeMetodo].implementacao;
            if (metodoDePrimitivaVetor) {
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaVetor, expressao.nomeMetodo, tipoObjeto);
            }
            break;
    }

    return Promise.reject(
        new ErroEmTempoDeExecucao(
            {
                hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
                linha: interpretador.linhaDeclaracaoAtual,
            } as SimboloInterface,
            `Método para objeto ou primitiva não encontrado: ${expressao.nomeMetodo}.`,
            expressao.linha
        )
    );
}

/**
 * Casos que ocorrem aqui:
 *
 * - Quando o método ou propriedade é ou 'qualquer', ou vetor
 *   de 'qualquer' ('qualquer[]'), e uma primitiva é usada.
 * - Quando o objeto é uma classe definida em código.
 * @param {AcessoMetodoOuPropriedade} expressao A expressão de acesso a método ou propriedade.
 * @returns A primitiva encontrada.
 */
export async function visitarExpressaoAcessoMetodoOuPropriedade(
    interpretador: InterpretadorInterface,
    expressao: AcessoMetodoOuPropriedade
): Promise<any> {
    const nomeObjeto = (interpretador as any).resolverNomeObjectoAcessado(expressao.objeto);
    let variavelObjeto: VariavelInterface = await interpretador.avaliar(expressao.objeto);

    // Este caso acontece quando há encadeamento de métodos.
    // Por exemplo, `objeto1.metodo1().metodo2()`.
    // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
    // valor dele primeiro.
    if (variavelObjeto.constructor === RetornoQuebra) {
        const retornoQuebra = variavelObjeto as RetornoQuebra;
        variavelObjeto = retornoQuebra.valor;
    }

    const objeto = interpretador.resolverValor(variavelObjeto, true);

    if (objeto.constructor === ObjetoDeleguaClasse) {
        return (objeto as ObjetoDeleguaClasse).obter(expressao.simbolo);
    }

    // Objeto simples do JavaScript, ou dicionário de Delégua.
    if (objeto.constructor === Object) {
        if (expressao.simbolo.lexema in primitivasDicionario) {
            const metodoDePrimitivaDicionario: Function =
                primitivasDicionario[expressao.simbolo.lexema].implementacao;
            return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaDicionario, expressao.simbolo.lexema, 'dicionário');
        }

        return objeto[expressao.simbolo.lexema];
    }

    // String do JavaScript, ou seja, primitiva de texto.
    if (objeto.constructor === String) {
        if (!(expressao.simbolo.lexema in primitivasTexto)) {
            throw new ErroEmTempoDeExecucao(
                expressao.simbolo,
                `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo texto.`
            );
        }

        const metodoDePrimitivaTexto: Function =
            primitivasTexto[expressao.simbolo.lexema].implementacao;
        return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaTexto, expressao.simbolo.lexema, 'texto');
    }

    // A partir daqui, presume-se que o objeto é uma das estruturas
    // de Delégua.
    if (objeto instanceof DeleguaModulo) {
        return objeto.componentes[expressao.simbolo.lexema] || null;
    }

    let tipoObjeto = variavelObjeto.tipo;
    if (tipoObjeto === null || tipoObjeto === undefined) {
        tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
    }

    // Como internamente um dicionário de Delégua é simplesmente um objeto de
    // JavaScript, as primitivas de dicionário, especificamente, são tratadas
    // mais acima.
    switch (tipoObjeto) {
        case tipoDeDadosPitugues.INTEIRO:
        case tipoDeDadosPitugues.NUMERO:
        case tipoDeDadosPitugues.NÚMERO:
            if (!(expressao.simbolo.lexema in primitivasNumero)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simbolo,
                    `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                );
            }

            const metodoDePrimitivaNumero: Function =
                primitivasNumero[expressao.simbolo.lexema].implementacao;
            if (metodoDePrimitivaNumero) {
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaNumero, expressao.simbolo.lexema, tipoObjeto);
            }
            break;
        case tipoDeDadosPitugues.TEXTO:
            if (!(expressao.simbolo.lexema in primitivasTexto)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simbolo,
                    `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                );
            }

            const metodoDePrimitivaTexto: Function =
                primitivasTexto[expressao.simbolo.lexema].implementacao;
            if (metodoDePrimitivaTexto) {
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaTexto, expressao.simbolo.lexema, 'texto');
            }
            break;
        case tipoDeDadosPitugues.VETOR:
        case tipoDeDadosPitugues.VETOR_INTEIRO:
        case tipoDeDadosPitugues.VETOR_LOGICO:
        case tipoDeDadosPitugues.VETOR_LÓGICO:
        case tipoDeDadosPitugues.VETOR_NUMERO:
        case tipoDeDadosPitugues.VETOR_NÚMERO:
        case tipoDeDadosPitugues.VETOR_QUALQUER:
        case tipoDeDadosPitugues.VETOR_TEXTO:
            if (!(expressao.simbolo.lexema in primitivasVetor)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simbolo,
                    `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                );
            }

            const metodoDePrimitivaVetor: Function =
                primitivasVetor[expressao.simbolo.lexema].implementacao;
            if (metodoDePrimitivaVetor) {
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaVetor, expressao.simbolo.lexema, tipoObjeto);
            }
            break;
    }

    // Objeto de uma classe JavaScript regular (ou seja, com construtor e propriedades)
    // que possua a propriedade.
    // Exemplos: classes de LinConEs, como `RetornoComando`, ou bibliotecas globais com objetos próprios.
    if (objeto.hasOwnProperty && objeto.hasOwnProperty(expressao.simbolo.lexema)) {
        return objeto[expressao.simbolo.lexema];
    }

    // Último caso: objeto simples, sem construtor, sem protótipo. Exemplo: {'a': 1, 'b': 2}
    if (typeof objeto[expressao.simbolo.lexema] !== 'undefined') {
        return objeto[expressao.simbolo.lexema];
    }

    return Promise.reject(
        new ErroEmTempoDeExecucao(
            null,
            `Método ou propriedade para objeto ou primitiva não encontrado: ${expressao.simbolo.lexema}.`,
            expressao.linha
        )
    );
}

export async function visitarExpressaoAcessoPropriedade(
    interpretador: InterpretadorInterface,
    expressao: AcessoPropriedade
): Promise<any> {
    const nomeObjeto = (interpretador as any).resolverNomeObjectoAcessado(expressao.objeto);
    let variavelObjeto: VariavelInterface = await interpretador.avaliar(expressao.objeto);

    // Este caso acontece quando há encadeamento de métodos.
    // Por exemplo, `objeto1.metodo1().metodo2()`.
    // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
    // valor dele primeiro.
    if (variavelObjeto.constructor && variavelObjeto.constructor === RetornoQuebra) {
        variavelObjeto = (variavelObjeto as RetornoQuebra).valor;
    }

    const objeto = interpretador.resolverValor(variavelObjeto);

    // Outro caso que `instanceof` simplesmente não funciona para casos em Liquido,
    // então testamos também o nome do construtor.
    if (
        objeto instanceof ObjetoDeleguaClasse ||
        (objeto.constructor === ObjetoDeleguaClasse)
    ) {
        return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomePropriedade) || null;
    }

    // Objeto simples do JavaScript, ou dicionário de Delégua.
    if (objeto.constructor === Object) {
        if (expressao.nomePropriedade in primitivasDicionario) {
            const metodoDePrimitivaDicionario: Function =
                primitivasDicionario[expressao.nomePropriedade].implementacao;
            return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaDicionario, expressao.nomePropriedade, 'dicionário');
        }

        return objeto[expressao.nomePropriedade] || null;
    }

    // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
    // Normalmente executam quando uma biblioteca é importada, e estamos tentando
    // obter alguma propriedade ou método desse objeto.

    // Caso 1: Função tradicional do JavaScript.
    if (typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.FUNCAO) {
        return objeto[expressao.nomePropriedade];
    }

    // Caso 2: Objeto tradicional do JavaScript.
    if (typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.OBJETO) {
        return objeto[expressao.nomePropriedade];
    }

    // A partir daqui, presume-se que o objeto é uma das estruturas
    // de Delégua.
    if (objeto instanceof DeleguaModulo) {
        return objeto.componentes[expressao.nomePropriedade] || null;
    }

    let tipoObjeto = variavelObjeto.tipo;
    if (tipoObjeto === null || tipoObjeto === undefined) {
        tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
    }

    return Promise.reject(
        new ErroEmTempoDeExecucao(
            null,
            `Propriedade para objeto ou primitiva não encontrado: ${expressao.nomePropriedade}.`,
            expressao.linha
        )
    );
}

export async function resolverInterpolacoes(
    interpretador: InterpretadorInterface,
    textoOriginal: string,
    linha: number
): Promise<any[]> {
    const regexInterpolacao: RegExp = /\$\{[a-zA-Z_][a-zA-Z0-9_]*\}/g;
    const variaveis = textoOriginal.match(regexInterpolacao);

    if (!variaveis) return [];

    const resultadosAvaliacaoSintatica = variaveis.map((s) => {
        // s tem a forma "${identificador}" — removemos apenas os dois primeiros e o último caractere
        const expressaoInterpolacao: string = s.slice(2, -1);

        let microLexador = (interpretador as any).microLexador.mapear(expressaoInterpolacao);
        const resultadoMicroAvaliadorSintatico = (interpretador as any).microAvaliadorSintatico.analisar(
            microLexador,
            linha
        );

        return {
            expressaoInterpolacao,
            resultadoMicroAvaliadorSintatico,
        };
    });

    const resolucoesPromises = await Promise.all(
        resultadosAvaliacaoSintatica
            .flatMap((r) => r.resultadoMicroAvaliadorSintatico.declaracoes)
            .map((d) => interpretador.avaliar(d))
    );

    return resolucoesPromises.map((item, indice) => ({
        expressaoInterpolacao: resultadosAvaliacaoSintatica[indice].expressaoInterpolacao,
        valor: item,
    }));
}

export async function visitarExpressaoAcessoIntervaloVariavel(
    interpretador: InterpretadorInterface,
    expressao: AcessoIntervaloVariavel
): Promise<any> {
    const resultadoEntidade = await interpretador.avaliar(expressao.entidadeChamada);
    const objeto = interpretador.resolverValor(resultadoEntidade);

    let tamanho = 0;
    if (objeto instanceof TuplaN) {
        tamanho = objeto.elementos.length;
    } else if (Array.isArray(objeto) || typeof objeto === 'string') {
        tamanho = objeto.length;
    } else {
        throw new ErroEmTempoDeExecucao(
            expressao.simboloFechamento,
            'Acesso por intervalo só é suportado em vetores, textos e tuplas.',
            expressao.linha
        );
    }

    let inicio = 0;
    if (expressao.indiceInicio) {
        const resInicio = await interpretador.avaliar(expressao.indiceInicio);
        inicio = interpretador.resolverValor(resInicio);
        if (inicio < 0) inicio = tamanho + inicio;
    }

    let fim = tamanho;
    if (expressao.indiceFim) {
        const resFim = await interpretador.avaliar(expressao.indiceFim);
        fim = interpretador.resolverValor(resFim);
        if (fim < 0) fim = tamanho + fim;
    }

    if (objeto instanceof TuplaN) {
        const novosElementos = objeto.elementos.slice(inicio, fim);
        return new TuplaN(objeto.hashArquivo, objeto.linha, novosElementos);
    }

    return objeto.slice(inicio, fim);
}

export async function visitarExpressaoTuplaN(
    interpretador: InterpretadorInterface,
    expressao: TuplaN
): Promise<any> {
    const elementos = [];

    for (let i = 0; i < expressao.elementos.length; i++) {
        const res = await interpretador.avaliar(expressao.elementos[i]);
        elementos.push(interpretador.resolverValor(res));
    }

    const elementosComoConstrutos = elementos.map(valor =>
        new Literal(expressao.hashArquivo, expressao.linha, valor)
    );

    return new TuplaN(expressao.hashArquivo, expressao.linha, elementosComoConstrutos);
}
