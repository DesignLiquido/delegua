import { Bloco, Declaracao, Retorna, Se } from '../declaracoes';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';
import { AvaliadorSintaticoInterface, PrimitivaInterface, SimboloInterface } from '../interfaces';

function* buscarRetornosEmBloco(construtoBloco: Bloco): Generator<Retorna> {
    for (const declaracao of construtoBloco.declaracoes) {
        if (declaracao.constructor === Retorna) {
            yield declaracao as Retorna;
        }
    }
}

function* buscarRetornosEmSe(construtoSe: Se): Generator<Retorna> {
    const blocoEntao: Bloco = construtoSe.caminhoEntao as Bloco;
    for (const declaracao of buscarRetornosEmBloco(blocoEntao)) {
        if (declaracao.constructor === Retorna) {
            yield declaracao;
        }
    }

    if (!construtoSe.caminhoSenao) return;
    switch (construtoSe.caminhoSenao.constructor) {
        case Bloco:
            const blocoSenao: Bloco = construtoSe.caminhoSenao as Bloco;

            for (const declaracao of blocoSenao.declaracoes) {
                if (declaracao.constructor === Retorna) {
                    yield declaracao as Retorna;
                }
            }
            break;
        case Se:
            const senaoSe: Se = construtoSe.caminhoSenao as Se;
            for (const declaracao of buscarRetornosEmSe(senaoSe)) {
                if (declaracao.constructor === Retorna) {
                    yield declaracao as Retorna;
                }
            }
            break;
    }
}

export function buscarRetornos(declaracao: Declaracao): Retorna[] {
    let retornasEncontrados: Retorna[] = [];
    switch (declaracao.constructor) {
        case Retorna:
            retornasEncontrados.push(declaracao as Retorna);
            break;
        case Se:
            for (const retorna of buscarRetornosEmSe(declaracao as Se)) {
                retornasEncontrados.push(retorna);
            }
            break;
        default:
            break;
    }

    return retornasEncontrados;
}

export function logicaDescobertaRetornoFuncao(
    avaliadorSintatico: AvaliadorSintaticoInterface<SimboloInterface, Declaracao>,
    declaracoesDaFuncao: Declaracao[],
    tipoRetorno: string,
    definicaoExplicitaDeTipo: boolean,
    simboloParaErros: SimboloInterface
): string {
    let expressoesRetorna: Retorna[] = [];
    for (const declaracao of declaracoesDaFuncao) {
        expressoesRetorna = expressoesRetorna.concat(buscarRetornos(declaracao));
    }

    if (tipoRetorno === 'vazio' && expressoesRetorna.length > 0) {
        // Filtra retornos que têm tipo conhecido e diferente de 'vazio'.
        // 'qualquer' é excluído pois o tipo não pode ser determinado em tempo de análise sintática.
        const retornosNaoVazios = expressoesRetorna.filter(
            (e) => e.tipo !== 'vazio' && e.tipo !== 'qualquer'
        );
        if (retornosNaoVazios.length > 0) {
            throw avaliadorSintatico.erro(
                retornosNaoVazios[0].simboloChave,
                `Função declara explicitamente 'vazio', mas usa expressão 'retorna' com tipo de retorno diferente de vazio.`
            );
        }
    }

    const tiposRetornos = new Set(
        expressoesRetorna.filter((e) => e.tipo !== 'qualquer').map((e) => e.tipo)
    );
    let retornaChamadoExplicitamente = tiposRetornos.size > 0;
    // Verifica se há retornos com valores (incluindo retornos 'qualquer')
    let temRetornosComValor = expressoesRetorna.some(
        (e) => e.valor !== null && e.valor !== undefined
    );

    if (tiposRetornos.size > 1 && tipoRetorno !== 'qualquer') {
        let tiposEncontrados = Array.from(tiposRetornos).reduce(
            (acumulador, valor) => (acumulador += valor + ', '),
            ''
        );
        tiposEncontrados = tiposEncontrados.slice(0, -2);
        throw avaliadorSintatico.erro(
            simboloParaErros,
            `Função retorna valores com mais de um tipo. Tipo esperado: ${tipoRetorno}. Tipos encontrados: ${tiposEncontrados}.`
        );
    }

    tiposRetornos.delete('qualquer');

    if (tipoRetorno === 'qualquer') {
        if (tiposRetornos.size > 0) {
            // Se o tipo de retorno é 'qualquer', seja implícito ou explícito,
            // o avaliador sintático pode restringir o tipo baseado nos construtos
            // de retornos encontrados nos blocos internos da função.
            const tipoRetornoDeduzido = tiposRetornos.values().next().value;
            tipoRetorno = tipoRetornoDeduzido;
        } else if (!temRetornosComValor && !definicaoExplicitaDeTipo) {
            // Ou, se não há retornos com valores, e não foi definido um tipo
            // explícito com 'qualquer', o tipo inferido é 'vazio'.
            tipoRetorno = 'vazio';
        }
    }

    return tipoRetorno;
}

export function registrarPrimitiva(
    primitivasConhecidas: {
        [nomeModuloOuClasse: string]: { [nomePrimitiva: string]: InformacaoElementoSintatico };
    },
    tipo: string,
    catalogoPrimitivas: { [nome: string]: PrimitivaInterface }
) {
    primitivasConhecidas[tipo] = {};
    for (const [nomePrimitiva, dadosPrimitiva] of Object.entries(catalogoPrimitivas)) {
        primitivasConhecidas[tipo][nomePrimitiva] = new InformacaoElementoSintatico(
            nomePrimitiva,
            dadosPrimitiva.tipoRetorno,
            true,
            dadosPrimitiva.argumentos
        );
    }
}
