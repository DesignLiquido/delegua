import {
    reduzir,
    todos_em_condicao,
    primeiro_em_condicao,
    tupla,
    vetor,
    tamanho,
    mapear,
    maximo,
    minimo,
    ordenar,
    somar
} from '../../../../fontes/bibliotecas/dialetos/pitugues/biblioteca-global';
import { FuncaoPadrao } from '../../../../fontes/interpretador/estruturas/funcao-padrao';
import { RetornoQuebra } from '../../../../fontes/quebras';
import { DeleguaFuncao } from '../../../../fontes/interpretador/estruturas/delegua-funcao';
import { DescritorTipoClasse } from '../../../../fontes/interpretador/estruturas/descritor-tipo-classe';
import { ObjetoDeleguaClasse } from '../../../../fontes/interpretador/estruturas/objeto-delegua-classe';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { Literal, TuplaN } from '../../../../fontes/construtos';

describe('biblioteca-global (pituguês)', () => {
    describe('reduzir', () => {
        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(reduzir(interpretador, 1 as any, {} as any, 0)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O primeiro parâmetro da função deve ser um vetor.',
            });
        });

        it('rejeita quando segundo parâmetro não é função DeleguaFuncao', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(reduzir(interpretador, [1, 2, 3], {} as any, 0)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.',
            });
        });

        it('reduz corretamente quando valor inicial é passado', async () => {
            const interpretador = criarInterpretadorMock();

            class DeleguaFuncao {
                private fn: (...args: any[]) => any;
                constructor(fn: (...args: any[]) => any) {
                    this.fn = fn;
                }
                async chamar(_interpretador: any, argumentos: any[]) {
                    return this.fn(...argumentos);
                }
            }

            const func = new DeleguaFuncao((acc: number, n: number) => acc + n);
            const resultado = await reduzir(interpretador, [1, 2, 3], func as any, 10 as any);

            expect(resultado).toBe(16);
        });

        it('reduz corretamente quando nenhum valor inicial é passado', async () => {
            const interpretador = criarInterpretadorMock();

            class DeleguaFuncao {
                private fn: (...args: any[]) => any;
                constructor(fn: (...args: any[]) => any) {
                    this.fn = fn;
                }
                async chamar(_interpretador: any, argumentos: any[]) {
                    return this.fn(...argumentos);
                }
            }

            const func = new DeleguaFuncao((acc: number, n: number) => acc + n);
            const resultado = await reduzir(interpretador, [1, 2, 3], func as any, null as any);

            expect(resultado).toBe(6);
        });

            it('rejeita quando vetor vazio e nenhum valor inicial é passado', async () => {
                const interpretador = criarInterpretadorMock();

                class DeleguaFuncao {
                    private fn: (...args: any[]) => any;
                    constructor(fn: (...args: any[]) => any) {
                        this.fn = fn;
                    }
                    async chamar(_interpretador: any, argumentos: any[]) {
                        return this.fn(...argumentos);
                    }
                }

                const func = new DeleguaFuncao((acc: any, n: any) => acc + n);
                await expect(reduzir(interpretador, [], func as any, null as any)).rejects.toMatchObject({
                    mensagem: 'Não é possível reduzir um vetor vazio sem valor inicial.',
                });
            });

            it('usa valor inicial quando este for zero (falsy) e vetor vazio', async () => {
                const interpretador = criarInterpretadorMock();

                class DeleguaFuncao {
                    private fn: (...args: any[]) => any;
                    constructor(fn: (...args: any[]) => any) {
                        this.fn = fn;
                    }
                    async chamar(_interpretador: any, argumentos: any[]) {
                        return this.fn(...argumentos);
                    }
                }

                const func = new DeleguaFuncao((acc: any, n: any) => acc + n);
                const resultado = await reduzir(interpretador, [], func as any, 0 as any);

                expect(resultado).toBe(0);
            });

            it('usa valorInicial quando for VariavelInterface (com propriedade valor)', async () => {
                const interpretador = criarInterpretadorMock();

                class DeleguaFuncao {
                    private fn: (...args: any[]) => any;
                    constructor(fn: (...args: any[]) => any) {
                        this.fn = fn;
                    }
                    async chamar(_interpretador: any, argumentos: any[]) {
                        return this.fn(...argumentos);
                    }
                }

                const func = new DeleguaFuncao((acc: number, n: number) => acc + n);
                const resultado = await reduzir(
                    interpretador,
                    [1, 2],
                    func as any,
                    { valor: 5 } as any
                );

                expect(resultado).toBe(8);
            });
    });

    describe('todos_em_condicao', () => {
        it('rejeita quando primeiro parâmetro for nulo', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(todos_em_condicao(interpretador, null as any, {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.',
            });
        });

        it('rejeita quando segundo parâmetro não for função DeleguaFuncao', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(todos_em_condicao(interpretador, [1, 2], {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O segundo parâmetro deve ser uma função.',
            });
        });

        it('retorna verdadeiro quando todos satisfazem condição', async () => {
            const interpretador = criarInterpretadorMock();

            interpretador.resolverValor = jest.fn(v => v);
            interpretador.eVerdadeiro = jest.fn(v => !!v);

            const func = new FuncaoPadrao(1, (_interpretador: any, n: number) => n % 2 === 0);

            const resultado = await todos_em_condicao(interpretador, [2, 4, 6], func);
            expect(resultado).toBe(true);
        });

        it('retorna falso quando pelo menos um elemento não satisfaz condição', async () => {
            const interpretador = criarInterpretadorMock();

            interpretador.resolverValor = jest.fn(v => v);
            interpretador.eVerdadeiro = jest.fn(v => !!v);

            const func = new FuncaoPadrao(1, (_interpretador: any, n: number) => n % 2 === 0);

            const resultado = await todos_em_condicao(interpretador, [2, 3, 4], func);
            expect(resultado).toBe(false);
        });
    });

    describe('primeiro_em_condicao', () => {
        it('rejeita quando vetor for nulo', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(primeiro_em_condicao(interpretador, null as any, {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O primeiro parâmetro da função primeiroEmCondicao() não pode ser nulo.',
            });
        });

        it('rejeita quando segundo parâmetro não for função DeleguaFuncao', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(primeiro_em_condicao(interpretador, [1, 2], {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O segundo parâmetro da função primeiroEmCondicao() deve ser uma função.',
            });
        });

        it('retorna o primeiro valor não-nulo retornado pela função', async () => {
            const interpretador = criarInterpretadorMock();

            class DeleguaFuncao {
                private fn: (...args: any[]) => any;
                constructor(fn: (...args: any[]) => any) {
                    this.fn = fn;
                }
                async chamar(_interpretador: any, argumentos: any[]) {
                    return this.fn(...argumentos);
                }
            }

            const func = new DeleguaFuncao((n: number) => (n > 1 ? `v${n}` : null));
            const resultado = await primeiro_em_condicao(interpretador, [1, 2, 3], func as any);
            expect(resultado).toBe('v2');
        });

        it('retorna undefined quando nenhum elemento satisfaz', async () => {
            const interpretador = criarInterpretadorMock();

            class DeleguaFuncao {
                private fn: (...args: any[]) => any;
                constructor(fn: (...args: any[]) => any) {
                    this.fn = fn;
                }
                async chamar(_interpretador: any, argumentos: any[]) {
                    return this.fn(...argumentos);
                }
            }

            const func = new DeleguaFuncao(() => null);
            const resultado = await primeiro_em_condicao(interpretador, [1, 2, 3], func as any);
            expect(resultado).toBeUndefined();
        });
    });

    describe('tupla', () => {
        it('rejeita quando argumento não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(tupla(interpretador, 1 as any)).rejects.toMatchObject({
                mensagem: 'Argumento de função nativa `tupla` não parece ser um vetor.',
            });
        });

        it('Transforma vetor em tupla', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tupla(interpretador, [1, 2, 3, 4, 5]);
            expect(resultado.constructor.name).toBe('TuplaN')
            expect(resultado.paraTextoSaida()).toBe('(1, 2, 3, 4, 5)')
        });

        it('Transforma vetor com um único elemento em tupla', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tupla(interpretador, [1]);
            expect(resultado.constructor.name).toBe('TuplaN');
            expect(resultado.paraTextoSaida()).toBe('(1)')
        });

        it('cria tupla com tipos misturados', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tupla(interpretador, [1, 'texto', true, null]);
            expect(resultado.constructor.name).toBe('TuplaN');
            expect(resultado.paraTextoSaida()).toBe("(1, 'texto', true, null)");
        });
    });

    describe('vetor', () => {
        it('Rejeita quando argumento não é uma tupla', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(vetor(interpretador, 1 as any)).rejects.toMatchObject({
                mensagem: 'Argumento de função nativa `vetor` não parece ser uma tupla.'
            });
        });

        it('Transforma tupla em vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const elementosTupla = [
                new Literal(0, 1, 1, 'número'),
                new Literal(0, 1, 2, 'número'),
                new Literal(0, 1, 3, 'número'),
                new Literal(0, 1, 4, 'número'),
                new Literal(0, 1, 5, 'número'),
            ];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);
            const resultado = await vetor(interpretador, entradaTupla);

            expect(resultado.constructor.name).toBe('Array')
            expect(resultado).toEqual([1, 2, 3, 4, 5])
        });

        it('Transforma tupla com um único elemento em vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const elementosTupla = [
                new Literal(0, 1, 1, 'número'),
            ];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);
            const resultado = await vetor(interpretador, entradaTupla);

            expect(resultado.constructor.name).toBe('Array');
            expect(resultado).toEqual([1]);
        });

        it('Cria vetor com tipos misturados', async () => {
            const interpretador = criarInterpretadorMock();
            const elementosTupla = [
                new Literal(0, 1, 1, 'número'),
                new Literal(0, 1, "texto", 'texto'),
                new Literal(0, 1, true, 'qualquer'),
                new Literal(0, 1, null, 'nulo'),
            ];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);
            const resultado = await vetor(interpretador, entradaTupla);

            expect(resultado.constructor.name).toBe('Array');
            expect(resultado).toEqual([1, "texto", true, null]);
        });
    });

    describe('tamanho', () => {
        it('rejeita quando argumento for número', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(tamanho(interpretador, 123 as any)).rejects.toMatchObject({
                mensagem: 'Função global tamanho() não funciona com números.',
            });
        });

        it('retorna tamanho de texto', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(tamanho(interpretador, 'abcd' as any)).resolves.toBe(4);
        });

        it('retorna valorAridade de FuncaoPadrao', async () => {
            const interpretador = criarInterpretadorMock();
            const fp = new FuncaoPadrao(4, function () {});
            await expect(tamanho(interpretador, fp as any)).resolves.toBe(4);
        });

        it('retorna quantidade de parâmetros de DeleguaFuncao', async () => {
            const interpretador = criarInterpretadorMock();
            const deleguaFuncao = new DeleguaFuncao('fn', { parametros: [1,2,3] } as any);
            await expect(tamanho(interpretador, deleguaFuncao as any)).resolves.toBe(3);
        });

        it('retorna tamanho do inicializador em DescritorTipoClasse quando presente', async () => {
            const interpretador = criarInterpretadorMock();
            const descritor = new DescritorTipoClasse(undefined, undefined, {
                inicializacao: { eInicializador: true, declaracao: { parametros: [1,2] } as any } as any,
            } as any);

            await expect(tamanho(interpretador, descritor as any)).resolves.toBe(2);
        });

        it('retorna 0 para DescritorTipoClasse sem inicializador', async () => {
            const interpretador = criarInterpretadorMock();
            const descritor = new DescritorTipoClasse();
            await expect(tamanho(interpretador, descritor as any)).resolves.toBe(0);
        });

        it('rejeita quando argumento é ObjetoDeleguaClasse', async () => {
            const interpretador = criarInterpretadorMock();
            const descritor = new DescritorTipoClasse();
            const objeto = new ObjetoDeleguaClasse(descritor);

            await expect(tamanho(interpretador, objeto as any)).rejects.toMatchObject({
                mensagem: 'Função global tamanho não funciona com objetos complexos.',
            });
        });
    });

    describe('mapear', () => {
        it('rejeita quando primeiro parâmetro for nulo', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(mapear(interpretador, null as any, {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O primeiro parâmetro da função mapear() não pode ser nulo.',
            });
        });

        it('ignora retornos sem valorRetornado e sem RetornoQuebra', async () => {
            const interpretador = criarInterpretadorMock();

            // cria um objeto cujo construtor é o real DeleguaFuncao (via prototype)
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue({});

            const resultado = await mapear(interpretador, [1,2], fakeFunc);
            expect(resultado).toEqual([]);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(2);
        });

        it('ignora quando valorRetornado não é RetornoQuebra', async () => {
            const interpretador = criarInterpretadorMock();

            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue({ valorRetornado: {} });

            const resultado = await mapear(interpretador, [1], fakeFunc);
            expect(resultado).toEqual([]);
        });

        it('retorna valores quando valorRetornado é RetornoQuebra', async () => {
            const interpretador = criarInterpretadorMock();

            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest
                .fn()
                .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra('a') })
                .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra('b') });

            const resultado = await mapear(interpretador, [1,2], fakeFunc);
            expect(resultado).toEqual(['a','b']);
        });
    });

    describe('ordenar', () => {
        it('rejeita quando argumento não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(ordenar(interpretador, 123 as any)).rejects.toMatchObject({
                mensagem: 'Valor inválido. Objeto inserido não é um vetor.',
            });
        });

        it('ordena corretamente um vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const arr = [3,1,2];
            const resultado = await ordenar(interpretador, arr as any);
            expect(resultado).toEqual([1,2,3]);
        });

        it('ordena vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await ordenar(interpretador, [] as any);
            expect(resultado).toEqual([]);
        });

        it('ordena vetor com um elemento', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await ordenar(interpretador, [5] as any);
            expect(resultado).toEqual([5]);
        });

        it('ordena vetor com elementos duplicados', async () => {
            const interpretador = criarInterpretadorMock();
            const arr = [3, 1, 2, 1, 3];
            const resultado = await ordenar(interpretador, arr as any);
            expect(resultado).toEqual([1, 1, 2, 3, 3]);
        });

        it('ordena vetor de textos', async () => {
            const interpretador = criarInterpretadorMock();
            const arr = ['zebra', 'apple', 'banana'];
            const resultado = await ordenar(interpretador, arr as any);
            expect(resultado).toEqual(['apple', 'banana', 'zebra']);
        });
    });

    describe('tamanho', () => {
        it('retorna tamanho de vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tamanho(interpretador, [1, 2, 3]);
            expect(resultado).toBe(3);
        });

        it('retorna tamanho de texto', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tamanho(interpretador, 'teste');
            expect(resultado).toBe(5);
        });

        it('retorna tamanho de vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tamanho(interpretador, []);
            expect(resultado).toBe(0);
        });

        it('retorna tamanho de texto vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tamanho(interpretador, '');
            expect(resultado).toBe(0);
        });

        it('rejeita quando argumento não é vetor nem texto', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(tamanho(interpretador, 123)).rejects.toMatchObject({
                mensagem: 'Função global tamanho() não funciona com números.',
            });
        });
    });

    describe('maximo', () => {
        it('Deve retornar o maior número de um vetor simples', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await maximo(interpretador, [1, 10, 5, -2]);
            expect(resultado).toBe(10);
        });

        it('Deve retornar o maior vetor lexicograficamente (vetor de vetores)', async () => {
            const interpretador = criarInterpretadorMock();
            // [1, 3] é maior que [1, 2]
            const resultado = await maximo(interpretador, [[1, 2], [1, 3]]);
            expect(resultado).toEqual([1, 3]);
        });

        it('Deve funcionar com números negativos e decimais', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await maximo(interpretador, [-10.5, -5.2, -20.0]);
            expect(resultado).toBe(-5.2);
        });

        it('Deve rejeitar se o parâmetro não for um vetor', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(maximo(interpretador, 123 as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função maximo() deve ser um vetor.',
            });
        });

        it('Deve rejeitar vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(maximo(interpretador, [])).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O vetor não pode estar vazio.',
            });
        });

        it('Deve rejeitar tipos misturados incompatíveis (número vs vetor)', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(maximo(interpretador, [1, [2]])).rejects.toMatchObject({
                mensagem: 'Não é possível comparar elementos de tipos diferentes dentro do vetor (ex: números com vetores).',
            });
        });
    });

    describe('minimo', () => {
        it('Deve retornar o menor número de um vetor simples', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await minimo(interpretador, [10, 2, 20]);
            expect(resultado).toBe(2);
        });

        it('Deve retornar o menor vetor lexicograficamente', async () => {
            const interpretador = criarInterpretadorMock();
            // [0, 5] é menor que [1, 0]
            const resultado = await minimo(interpretador, [[1, 0], [0, 5]]);
            expect(resultado).toEqual([0, 5]);
        });

        it('Deve funcionar com um único elemento', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await minimo(interpretador, [42]);
            expect(resultado).toBe(42);
        });

        it('Deve rejeitar se o parâmetro for nulo', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(minimo(interpretador, null as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função minimo() não pode ser nulo.',
            });
        });

        it('Deve rejeitar vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(minimo(interpretador, [])).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O vetor não pode estar vazio.',
            });
        });

        it('Deve rejeitar tipos misturados (texto vs número)', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(minimo(interpretador, [1, [2]])).rejects.toMatchObject({
                mensagem: 'Não é possível comparar elementos de tipos diferentes dentro do vetor (ex: números com vetores).',
            });
        });
    });

    describe('somar', () => {
        it('Deve somar corretamente inteiros positivos', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await somar(interpretador, [1, 2, 3]);
            expect(resultado).toBe(6);
        });

        it('Deve retornar 0 para vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await somar(interpretador, []);
            expect(resultado).toBe(0);
        });

        it('Deve somar decimais e negativos', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await somar(interpretador, [10.5, -0.5, 2]);
            expect(resultado).toBe(12);
        });

        it('Deve rejeitar se o parâmetro não for vetor (ex: número)', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(somar(interpretador, 123 as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função somar() deve ser um vetor.',
            });
        });

        it('Deve rejeitar se o parâmetro for nulo', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(somar(interpretador, null as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função somar() não pode ser nulo.',
            });
        });

        it('Deve rejeitar se vetor contiver elementos não numéricos', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(somar(interpretador, [1, '2'])).rejects.toMatchObject({
                mensagem: 'A função somar() aceita apenas vetores contendo números.',
            });
        });
    });
});
