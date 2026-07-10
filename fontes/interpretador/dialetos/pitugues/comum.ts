import {
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    TuplaN,
    Literal,
} from '../../../construtos';
import { inferirTipoVariavel } from '../../../inferenciador';
import { InterpretadorInterface, SimboloInterface, VariavelInterface } from '../../../interfaces';
import { RetornoQuebra } from '../../../quebras';
import { DeleguaModulo, MetodoPrimitiva, ObjetoDeleguaClasse } from '../../estruturas';
import { ErroEmTempoDeExecucao } from '../../../excecoes';

import primitivasDicionario from '../../../bibliotecas/dialetos/pitugues/primitivas-dicionario';
import primitivasNumero from '../../../bibliotecas/dialetos/pitugues/primitivas-numero';
import primitivasTexto from '../../../bibliotecas/dialetos/pitugues/primitivas-texto';
import primitivasVetor from '../../../bibliotecas/dialetos/pitugues/primitivas-vetor';
import primitivasTupla from '../../../bibliotecas/dialetos/pitugues/primitivas-tupla';

import tipoDeDadosPrimitivos from '../../../tipos-de-dados/primitivos';

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

    if (objeto instanceof ObjetoDeleguaClasse) {
        return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomeMetodo) || null;
    }

    let tipoObjeto = variavelObjeto.tipo;
    if (tipoObjeto === null || tipoObjeto === undefined) {
        tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
    }

    if (Array.isArray(objeto)) {
        tipoObjeto = 'vetor';
    } else if (objeto instanceof TuplaN || objeto.constructor === TuplaN) {
        tipoObjeto = 'tupla';
    } else if (objeto.constructor === Object) {
        tipoObjeto = 'dicionário';
    } else if (objeto.constructor === String) {
        tipoObjeto = 'texto';
    }

    const primitiva = resolverPrimitiva(interpretador, tipoObjeto, expressao.nomeMetodo);
    if (primitiva) {
        return new MetodoPrimitiva(
            nomeObjeto,
            objeto,
            primitiva.implementacao,
            expressao.nomeMetodo,
            tipoObjeto
        );
    }

    // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
    // Normalmente executam quando uma biblioteca é importada, e estamos tentando
    // obter alguma propriedade ou método desse objeto.
    if (
        typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.FUNCAO ||
        typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.OBJETO
    ) {
        return objeto[expressao.nomeMetodo];
    }

    // A partir daqui, presume-se que o objeto é uma das estruturas
    // de Delégua.
    if (objeto instanceof DeleguaModulo) {
        return objeto.componentes[expressao.nomeMetodo] || null;
    }

    if (objeto.hasOwnProperty && objeto.hasOwnProperty(expressao.nomeMetodo)) {
        return objeto[expressao.nomeMetodo];
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

    if (objeto instanceof ObjetoDeleguaClasse) {
        return await objeto.obter(expressao.simbolo, interpretador as any);
    }

    let tipoObjeto = variavelObjeto.tipo;
    if (tipoObjeto === null || tipoObjeto === undefined) {
        tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
    }

    if (Array.isArray(objeto)) {
        tipoObjeto = 'vetor';
    } else if (objeto instanceof TuplaN || objeto.constructor === TuplaN) {
        tipoObjeto = 'tupla';
    } else if (objeto.constructor === Object) {
        tipoObjeto = 'dicionário';
    } else if (objeto.constructor === String) {
        tipoObjeto = 'texto';
    }

    const primitiva = resolverPrimitiva(interpretador, tipoObjeto, expressao.simbolo.lexema);
    if (primitiva) {
        return new MetodoPrimitiva(
            nomeObjeto,
            objeto,
            primitiva.implementacao,
            expressao.simbolo.lexema,
            tipoObjeto
        );
    }

    // Fallback para propriedades simples do objeto
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

    if (objeto instanceof ObjetoDeleguaClasse) {
        return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomePropriedade) || null;
    }

    let tipoObjeto = variavelObjeto.tipo;
    if (tipoObjeto === null || tipoObjeto === undefined) {
        tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
    }

    if (Array.isArray(objeto)) {
        tipoObjeto = 'vetor';
    } else if (objeto instanceof TuplaN || objeto.constructor === TuplaN) {
        tipoObjeto = 'tupla';
    } else if (objeto.constructor === Object) {
        tipoObjeto = 'dicionário';
    } else if (objeto.constructor === String) {
        tipoObjeto = 'texto';
    }

    const primitiva = resolverPrimitiva(interpretador, tipoObjeto, expressao.nomePropriedade);
    if (primitiva) {
        return new MetodoPrimitiva(
            nomeObjeto,
            objeto,
            primitiva.implementacao,
            expressao.nomePropriedade,
            tipoObjeto
        );
    }

    // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
    // Normalmente executam quando uma biblioteca é importada, e estamos tentando
    // obter alguma propriedade ou método desse objeto.
    if (
        typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.FUNCAO ||
        typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.OBJETO
    ) {
        return objeto[expressao.nomePropriedade];
    }

    // A partir daqui, presume-se que o objeto é uma das estruturas
    // de Delégua.
    if (objeto instanceof DeleguaModulo) {
        return objeto.componentes[expressao.nomePropriedade] || null;
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
        const resultadoMicroAvaliadorSintatico = (
            interpretador as any
        ).microAvaliadorSintatico.analisar(microLexador, linha);

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

// Reexportado a partir do módulo base para que dialetos que importam
// `comum` deste arquivo continuem funcionando sem alteração.
export { visitarExpressaoAcessoIntervaloVariavel } from '../../comum';

export async function visitarExpressaoTuplaN(
    interpretador: InterpretadorInterface,
    expressao: TuplaN
): Promise<any> {
    const elementos = [];

    for (let i = 0; i < expressao.elementos.length; i++) {
        const res = await interpretador.avaliar(expressao.elementos[i]);
        elementos.push(interpretador.resolverValor(res));
    }

    const elementosComoConstrutos = elementos.map(
        (valor) => new Literal(expressao.hashArquivo, expressao.linha, valor)
    );

    return new TuplaN(expressao.hashArquivo, expressao.linha, elementosComoConstrutos);
}

function resolverPrimitiva(
    interpretador: InterpretadorInterface,
    tipo: string,
    nomeMetodo: string
) {
    const viaMapa = (interpretador as any).obterPrimitiva?.(tipo, nomeMetodo);
    if (viaMapa) return viaMapa;

    const modulos: Record<string, any> = {
        dicionário: primitivasDicionario,
        número: primitivasNumero,
        numero: primitivasNumero,
        texto: primitivasTexto,
        vetor: primitivasVetor,
        tupla: primitivasTupla,
    };

    return modulos[tipo]?.[nomeMetodo] ?? undefined;
}
