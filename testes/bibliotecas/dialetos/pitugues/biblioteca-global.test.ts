import {
    reduzir,
    todos_em_condicao,
    primeiro_em_condicao,
    tupla,
    tamanho,
} from '../../../../fontes/bibliotecas/dialetos/pitugues/biblioteca-global';
import { FuncaoPadrao } from '../../../../fontes/interpretador/estruturas/funcao-padrao';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';

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
                mensagem: 'Parâmetro inválido. O primeiro parâmetro da função todosEmCondicao() não pode ser nulo.',
            });
        });

        it('rejeita quando segundo parâmetro não for função DeleguaFuncao', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(todos_em_condicao(interpretador, [1, 2], {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O segundo parâmetro da função todosEmCondicao() deve ser uma função.',
            });
        });

        it('retorna verdadeiro quando todos satisfazem condição', async () => {
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

            const func = new DeleguaFuncao((n: number) => n % 2 === 0);
            const resultado = await todos_em_condicao(interpretador, [2, 4, 6], func as any);
            expect(resultado).toBe(true);
        });

        it('retorna falso quando pelo menos um elemento não satisfaz condição', async () => {
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

            const func = new DeleguaFuncao((n: number) => n % 2 === 0);
            const resultado = await todos_em_condicao(interpretador, [2, 3, 4], func as any);
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

        it('retorna Dupla para vetor de tamanho 2', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tupla(interpretador, [1, 2]);
            expect(resultado.constructor.name).toBe('Dupla');
        });

        it('retorna Trio para vetor de tamanho 3', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await tupla(interpretador, [1, 2, 3]);
            expect(resultado.constructor.name).toBe('Trio');
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
    });
});
