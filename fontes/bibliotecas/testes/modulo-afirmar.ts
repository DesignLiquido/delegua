import { InterpretadorInterface, SimboloInterface } from '../../interfaces';
import { ErroDeAssertiva } from '../../excecoes/erro-de-assertiva';
import { FuncaoPadrao } from '../../interpretador/estruturas/funcao-padrao';
import { DeleguaModulo } from '../../interpretador/estruturas/modulo';

function simboloAtual(interpretador: InterpretadorInterface): SimboloInterface {
    return {
        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
        linha: interpretador.linhaDeclaracaoAtual,
    } as SimboloInterface;
}

export function construirModuloAfirmar(): DeleguaModulo {
    const modulo = new DeleguaModulo('afirmar');

    modulo.componentes['igual'] = new FuncaoPadrao(
        2,
        function (interpretador: InterpretadorInterface, valorTestado: any, obtidoTestado: any) {
            const esperado = interpretador.resolverValor(valorTestado);
            const obtido = interpretador.resolverValor(obtidoTestado);
            if (esperado !== obtido) {
                return Promise.reject(
                    new ErroDeAssertiva(
                        simboloAtual(interpretador),
                        `Esperava ${String(esperado)}, mas obteve ${String(obtido)}.`,
                        esperado,
                        obtido
                    )
                );
            }
        }
    );

    modulo.componentes['diferente'] = new FuncaoPadrao(
        2,
        function (interpretador: InterpretadorInterface, valorATestado: any, valorBTestado: any) {
            const valorA = interpretador.resolverValor(valorATestado);
            const valorB = interpretador.resolverValor(valorBTestado);
            if (valorA === valorB) {
                return Promise.reject(
                    new ErroDeAssertiva(
                        simboloAtual(interpretador),
                        `Esperava valores diferentes, mas ambos são ${String(valorA)}.`,
                        undefined,
                        valorA
                    )
                );
            }
        }
    );

    modulo.componentes['verdadeiro'] = new FuncaoPadrao(
        1,
        function (interpretador: InterpretadorInterface, valorTestado: any) {
            const valor = interpretador.resolverValor(valorTestado);
            if (!valor) {
                return Promise.reject(
                    new ErroDeAssertiva(
                        simboloAtual(interpretador),
                        `Esperava verdadeiro, mas obteve ${String(valor)}.`,
                        true,
                        valor
                    )
                );
            }
        }
    );

    modulo.componentes['falso'] = new FuncaoPadrao(
        1,
        function (interpretador: InterpretadorInterface, valorTestado: any) {
            const valor = interpretador.resolverValor(valorTestado);
            if (valor) {
                return Promise.reject(
                    new ErroDeAssertiva(
                        simboloAtual(interpretador),
                        `Esperava falso, mas obteve ${String(valor)}.`,
                        false,
                        valor
                    )
                );
            }
        }
    );

    modulo.componentes['nulo'] = new FuncaoPadrao(
        1,
        function (interpretador: InterpretadorInterface, valorTestado: any) {
            const valor = interpretador.resolverValor(valorTestado);
            if (valor !== null && valor !== undefined) {
                return Promise.reject(
                    new ErroDeAssertiva(
                        simboloAtual(interpretador),
                        `Esperava nulo, mas obteve ${String(valor)}.`,
                        null,
                        valor
                    )
                );
            }
        }
    );

    modulo.componentes['erro'] = new FuncaoPadrao(
        1,
        async function (interpretador: InterpretadorInterface, funcaoTestada: any) {
            const funcao = interpretador.resolverValor(funcaoTestada);
            let erroLancado = false;
            try {
                await funcao.chamar(interpretador, [], null);
            } catch (_) {
                erroLancado = true;
            }
            if (!erroLancado) {
                return Promise.reject(
                    new ErroDeAssertiva(
                        simboloAtual(interpretador),
                        'Esperava que a função lançasse um erro, mas ela completou sem erros.'
                    )
                );
            }
        }
    );

    return modulo;
}
