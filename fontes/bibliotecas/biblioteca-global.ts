import { ErroEmTempoDeExecucao } from '../excecoes';
import { ObjetoDeleguaClasse } from '../estruturas/objeto-delegua-classe';
import { FuncaoPadrao } from '../estruturas/funcao-padrao';
import { DeleguaClasse } from '../estruturas/delegua-classe';
import { InterpretadorInterface, VariavelInterface } from '../interfaces';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import { DeleguaFuncao } from '../estruturas';

export default function (interpretador: InterpretadorInterface, pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) {
    const todosEmCondicao = async function (
        vetor: VariavelInterface | any,
        funcaoCondicional: VariavelInterface | any
    ) {
        if (vetor === null || vetor === undefined)
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função todosEmCondicao() não pode ser nulo.'
                )
            );

        const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
        const valorFuncaoCondicional = funcaoCondicional.hasOwnProperty('valor')
            ? funcaoCondicional.valor
            : funcaoCondicional;
        if (!Array.isArray(valorVetor)) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função todosEmCondicao() deve ser um vetor.'
                )
            );
        }

        if (valorFuncaoCondicional.constructor.name !== 'DeleguaFuncao') {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função todosEmCondicao() deve ser uma função.'
                )
            );
        }

        for (let indice = 0; indice < valorVetor.length; ++indice) {
            if (!(await valorFuncaoCondicional.chamar(interpretador, [valorVetor[indice]]))) return false;
        }

        return true;
    };

    // Retorna um número aleatório entre 0 e 1.
    pilhaEscoposExecucao.definirVariavel(
        'aleatorio',
        new FuncaoPadrao(1, function () {
            return Math.random();
        })
    );

    // Retorna um número aleatório de acordo com o parâmetro passado.
    // Mínimo(inclusivo) - Máximo(exclusivo)
    pilhaEscoposExecucao.definirVariavel(
        'aleatorioEntre',
        new FuncaoPadrao(1, async function (minimo: VariavelInterface | number, maximo: VariavelInterface | number) {
            // eslint-disable-next-line prefer-rest-params
            if (!arguments[0]) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(this.simbolo, 'A função recebe ao menos um parâmetro.')
                );
            }

            const valorMinimo = minimo.hasOwnProperty('valor') ? (minimo as VariavelInterface).valor : minimo;

            if (arguments.length === 1) {
                if (typeof valorMinimo !== 'number') {
                    return Promise.reject(new ErroEmTempoDeExecucao(this.simbolo, 'O parâmetro deve ser um número.'));
                }

                return Math.floor(Math.random() * (0 - valorMinimo)) + valorMinimo;
            }

            if (arguments.length > 2) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(this.simbolo, 'A quantidade de parâmetros máxima para esta função é 2.')
                );
            }

            const valorMaximo = maximo.hasOwnProperty('valor') ? (maximo as VariavelInterface).valor : maximo;

            if (typeof valorMinimo !== 'number' || typeof valorMaximo !== 'number') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(this.simbolo, 'Os dois parâmetros devem ser do tipo número.')
                );
            }

            return Promise.resolve(Math.floor(Math.random() * (valorMaximo - valorMinimo)) + valorMinimo);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'algum',
        new FuncaoPadrao(2, async function (vetor: VariavelInterface | any, funcaoPesquisa: VariavelInterface | any) {
            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

            const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor') ? funcaoPesquisa.valor : funcaoPesquisa;

            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
                    )
                );
            }

            for (let indice = 0; indice < valorVetor.length; ++indice) {
                if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
                    return true;
                }
            }

            return false;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'encontrar',
        new FuncaoPadrao(1, async function (vetor: VariavelInterface | any, funcaoPesquisa: VariavelInterface | any) {
            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

            const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor') ? funcaoPesquisa.valor : funcaoPesquisa;

            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
                    )
                );
            }

            for (let indice = 0; indice < valorVetor.length; ++indice) {
                if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
                    return valorVetor[indice];
                }
            }

            return null;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'encontrarUltimo',
        new FuncaoPadrao(1, async function (vetor: VariavelInterface | any, funcaoPesquisa: VariavelInterface | any) {
            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

            const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor') ? funcaoPesquisa.valor : funcaoPesquisa;

            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
                    )
                );
            }

            for (let indice = valorVetor.length - 1; indice >= 0; --indice) {
                if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
                    return valorVetor[indice];
                }
            }
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'encontrarIndice',
        new FuncaoPadrao(2, async function (vetor: VariavelInterface | any, funcaoPesquisa: VariavelInterface | any) {
            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

            const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor') ? funcaoPesquisa.valor : funcaoPesquisa;

            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
                    )
                );
            }

            for (let indice = 0; indice < valorVetor.length; ++indice) {
                if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
                    return indice;
                }
            }

            return -1;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'encontrarUltimoIndice',
        new FuncaoPadrao(2, async function (vetor: VariavelInterface | any, funcaoPesquisa: VariavelInterface | any) {
            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

            const valorFuncaoPesquisa = funcaoPesquisa.hasOwnProperty('valor') ? funcaoPesquisa.valor : funcaoPesquisa;

            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoPesquisa.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
                    )
                );
            }

            for (let indice = valorVetor.length - 1; indice >= 0; --indice) {
                if (await valorFuncaoPesquisa.chamar(interpretador, [valorVetor[indice]])) {
                    return indice;
                }
            }
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'incluido',
        new FuncaoPadrao(2, async function (vetor: VariavelInterface | any, valor: VariavelInterface | any) {
            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

            const valorValor = valor.hasOwnProperty('valor') ? valor.valor : valor;

            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
                    )
                );
            }

            for (let indice = 0; indice < valorVetor.length; ++indice) {
                if (valorVetor[indice] == valorValor) {
                    return true;
                }
            }

            return false;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'inteiro',
        new FuncaoPadrao(1, async function (numero: VariavelInterface | any) {
            if (numero === null || numero === undefined) return Promise.resolve(0);

            const valor = numero.hasOwnProperty('valor') ? numero.valor : numero;

            if (isNaN(valor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Valor não parece ser um número. Somente números ou textos com números podem ser convertidos para inteiro.'
                    )
                );
            }

            if (!/^(-)?\d+(\.\d+)?$/.test(valor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Valor não parece estar estruturado como um número (texto vazio, falso ou não definido). Somente números ou textos com números podem ser convertidos para inteiro.'
                    )
                );
            }

            return Promise.resolve(parseInt(valor));
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'mapear',
        new FuncaoPadrao(1, async function (vetor: VariavelInterface | any, funcaoMapeamento: VariavelInterface | any) {
            if (vetor === null || vetor === undefined)
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função mapear() não pode ser nulo.'
                    )
                );

            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

            const valorFuncaoMapeamento = funcaoMapeamento.hasOwnProperty('valor')
                ? funcaoMapeamento.valor
                : funcaoMapeamento;

            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função mapear() deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoMapeamento.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função mapear() deve ser uma função.'
                    )
                );
            }

            const resultados = [];
            for (let indice = 0; indice < valorVetor.length; ++indice) {
                resultados.push(await valorFuncaoMapeamento.chamar(interpretador, [valorVetor[indice]]));
            }

            return resultados;
        })
    );

    pilhaEscoposExecucao.definirVariavel('todos', new FuncaoPadrao(2, todosEmCondicao));

    pilhaEscoposExecucao.definirVariavel('todosEmCondicao', new FuncaoPadrao(2, todosEmCondicao));

    pilhaEscoposExecucao.definirVariavel(
        'filtrarPor',
        new FuncaoPadrao(1, async function (vetor: VariavelInterface | any, funcaoFiltragem: VariavelInterface | any) {
            if (vetor === null || vetor === undefined)
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função filtrarPor() não pode ser nulo.'
                    )
                );

            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
            const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
                ? funcaoFiltragem.valor
                : funcaoFiltragem;
            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função filtrarPor() deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função filtrarPor() deve ser uma função.'
                    )
                );
            }

            const resultados = [];
            for (let indice = 0; indice < valorVetor.length; ++indice) {
                (await valorFuncaoFiltragem.chamar(interpretador, [valorVetor[indice]])) &&
                    resultados.push(await valorFuncaoFiltragem.chamar(interpretador, [valorVetor[indice]]));
            }

            return resultados;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'primeiroEmCondicao',
        new FuncaoPadrao(2, async function (vetor: VariavelInterface | any, funcaoFiltragem: VariavelInterface | any) {
            if (vetor === null || vetor === undefined)
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função primeiroEmCondicao() não pode ser nulo.'
                    )
                );

            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;

            const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
                ? funcaoFiltragem.valor
                : funcaoFiltragem;
            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função primeiroEmCondicao() deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função primeiroEmCondicao() deve ser uma função.'
                    )
                );
            }

            const resultados = [];
            for (let indice = 0; indice < valorVetor.length; ++indice) {
                (await valorFuncaoFiltragem.chamar(interpretador, [valorVetor[indice]])) &&
                    resultados.push(await valorFuncaoFiltragem.chamar(interpretador, [valorVetor[indice]]));
            }

            return resultados[0];
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'paraCada',
        new FuncaoPadrao(2, async function (vetor: VariavelInterface | any, funcaoFiltragem: VariavelInterface | any) {
            if (vetor === null || vetor === undefined)
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função paraCada() não pode ser nulo.'
                    )
                );

            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
            const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
                ? funcaoFiltragem.valor
                : funcaoFiltragem;
            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função paraCada() deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função paraCada() deve ser uma função.'
                    )
                );
            }

            for (let indice = 0; indice < valorVetor.length; ++indice) {
                await valorFuncaoFiltragem.chamar(interpretador, [valorVetor[indice]]);
            }
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'ordenar',
        new FuncaoPadrao(1, async function (vetor: VariavelInterface | Array<any>) {
            if (vetor === null || vetor === undefined)
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função ordenar() não pode ser nulo.'
                );

            const objeto = vetor.hasOwnProperty('valor') ? (vetor as VariavelInterface).valor : vetor;

            if (!Array.isArray(objeto)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(this.simbolo, 'Valor inválido. Objeto inserido não é um vetor.')
                );
            }

            let trocado: boolean;
            const tamanho = objeto.length;
            do {
                trocado = false;
                for (let i = 0; i < tamanho - 1; i++) {
                    if (objeto[i] > objeto[i + 1]) {
                        [objeto[i], objeto[i + 1]] = [objeto[i + 1], objeto[i]];
                        trocado = true;
                    }
                }
            } while (trocado);
            return Promise.resolve(objeto);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'real',
        new FuncaoPadrao(1, async function (numero: VariavelInterface | any) {
            if (numero === null || numero === undefined) return Promise.resolve(parseFloat('0'));

            const valor = numero.hasOwnProperty('valor') ? numero.valor : numero;
            if (!/^(-)?\d+(\.\d+)?$/.test(valor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Valor não parece estar estruturado como um número (texto/valor vazio, falso ou não definido). Somente números ou textos com números podem ser convertidos para real.'
                    )
                );
            }
            return Promise.resolve(parseFloat(valor));
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'reduzir',
        new FuncaoPadrao(3, async function (
            vetor: VariavelInterface | any,
            funcaoReducao: VariavelInterface | any,
            padrao: VariavelInterface | any = null
        ) {
            const valorVetor = vetor.hasOwnProperty('valor') ? vetor.valor : vetor;
            const valorFuncaoReducao = funcaoReducao.hasOwnProperty('valor') ? funcaoReducao.valor : funcaoReducao;
            const valorPadrao = padrao.hasOwnProperty('valor') ? padrao.valor : padrao;

            if (!Array.isArray(valorVetor)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.'
                    )
                );
            }

            if (valorFuncaoReducao.constructor.name !== 'DeleguaFuncao') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        this.simbolo,
                        'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.'
                    )
                );
            }

            let resultado = valorPadrao;
            let inicio = 0;

            if (!resultado) {
                resultado = vetor[0];
                inicio = 1;
            }

            for (let index = inicio; index < vetor.length; ++index) {
                resultado = await valorFuncaoReducao.chamar(interpretador, [resultado, vetor[index]]);
            }

            return resultado;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'tamanho',
        new FuncaoPadrao(1, async function (objeto: any) {
            const valorObjeto = objeto.hasOwnProperty('valor') ? objeto.valor : objeto;

            if (typeof valorObjeto === 'number') {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(this.simbolo, 'Função global tamanho() não funciona com números.')
                );
            }

            if (valorObjeto instanceof ObjetoDeleguaClasse) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(this.simbolo, 'Função global tamanho não funciona com objetos complexos.')
                );
            }

            if (valorObjeto instanceof DeleguaFuncao) {
                return Promise.resolve(valorObjeto.declaracao.parametros.length);
            }

            if (valorObjeto instanceof FuncaoPadrao) {
                return Promise.resolve(valorObjeto.valorAridade);
            }

            if (valorObjeto instanceof DeleguaClasse) {
                const metodos = valorObjeto.metodos;
                let tamanho = 0;

                if (metodos.inicializacao && metodos.inicializacao.eInicializador) {
                    tamanho = metodos.inicializacao.declaracao.parametros.length;
                }

                return Promise.resolve(tamanho);
            }

            return Promise.resolve(valorObjeto.length);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'texto',
        new FuncaoPadrao(1, async function (valorOuVariavel: VariavelInterface | any) {
            return Promise.resolve(
                `${valorOuVariavel.hasOwnProperty('valor') ? valorOuVariavel.valor : valorOuVariavel}`
            );
        })
    );

    return pilhaEscoposExecucao;
}
