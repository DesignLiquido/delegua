import primitivasVetor from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-vetor';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { DeleguaFuncaoMock } from '../../../_mocks/delegua-funcao.mock';

describe('Primitivas de Vetor (Pituguês)', () => {
    describe('limpar', () => {
        it('deve remover todos os elementos do vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            await primitivasVetor.limpar.implementacao(
                interpretador,
                vetor
            );

            expect(vetor).toEqual([]);
        });

        it('não deve quebrar se o vetor já estiver vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            await primitivasVetor.limpar.implementacao(
                interpretador,
                vetor
            );

            expect(vetor).toEqual([]);
        });
    });

    describe('ordenar', () => {
        it('deve ordenar números em ordem ascendente sem função comparadora', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [4, 2, 12, 5];

            const resultado = await primitivasVetor.ordenar.implementacao(
                interpretador,
                vetor.slice(),
                undefined
            );

            expect(resultado).toEqual([2, 4, 5, 12]);
        });

        it('deve ordenar textos lexicograficamente quando não são todos números', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = ['aaa', 'a', 'aba', 'abb', 'abc'];

            const resultado = await primitivasVetor.ordenar.implementacao(
                interpretador,
                vetor.slice(),
                undefined
            );

            expect(resultado).toEqual(['a', 'aaa', 'aba', 'abb', 'abc']);
        });

        it('deve ordenar usando função comparadora quando fornecida e atribuir variável quando nome for passado', async () => {
            const interpretador: any = criarInterpretadorMock();
            // spy na função de atribuirVariavel para garantir que foi chamada
            interpretador.pilhaEscoposExecucao.atribuirVariavel = jest.fn();

            const vetor = [3, 1, 2];
            // comparador que retorna a - b (mantém ordem ascendente)
            const funcaoComparadora = new DeleguaFuncaoMock((a: number, b: number) => a - b);

            const resultado = await primitivasVetor.ordenar.implementacao(
                interpretador,
                vetor.slice(),
                funcaoComparadora as any
            );

            expect(resultado).toEqual([1, 2, 3]);
        });
    });

    describe('indice', () => {
        it('deve retornar o índice do elemento se ele existir', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = ['a', 'b', 'c'];

            const resultado = await primitivasVetor.indice.implementacao(
                interpretador,
                vetor,
                'b'
            );

            expect(resultado).toBe(1);
        });

        it('deve retornar -1 se o elemento não existir', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.indice.implementacao(
                interpretador,
                vetor,
                99
            );

            expect(resultado).toBe(-1);
        });
        it('deve falhar quando o indice for nulo', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            await expect(
                primitivasVetor.indice.implementacao(
                    interpretador,
                    vetor,
                    'nulo'
                )
            ).rejects.toBe(-1);
        });
    });

    describe('inserir', () => {
        it('deve inserir elemento na posição indicada e deslocar os demais', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 4];

            const resultado = await primitivasVetor.inserir.implementacao(
                interpretador,
                vetor,
                2,
                3
            );

            expect(resultado).toEqual([1, 2, 3, 4]);
            expect(vetor).toEqual([1, 2, 3, 4]);
        });

        it('deve inserir no início do vetor (índice 0)', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [2, 3];

            await primitivasVetor.inserir.implementacao(
                interpretador,
                vetor,
                0,
                1
            );

            expect(vetor).toEqual([1, 2, 3]);
        });
    });

    describe('adicionar', () => {
        it('deve adicionar um elemento ao vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.adicionar.implementacao(
                interpretador,
                vetor,
                4
            );

            expect(resultado).toEqual([1, 2, 3, 4]);
            expect(vetor).toEqual([1, 2, 3, 4]);
        });

        it('deve adicionar múltiplos elementos ao vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            await primitivasVetor.adicionar.implementacao(interpretador, vetor, 1);
            await primitivasVetor.adicionar.implementacao(interpretador, vetor, 'texto');
            await primitivasVetor.adicionar.implementacao(interpretador, vetor, true);

            expect(vetor).toEqual([1, 'texto', true]);
        });
    });

    describe('concatenar', () => {
        it('deve concatenar dois vetores', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.concatenar.implementacao(
                interpretador,
                vetor,
                [4, 5, 6]
            );

            expect(resultado).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('deve concatenar com um vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.concatenar.implementacao(
                interpretador,
                vetor,
                []
            );

            expect(resultado).toEqual([1, 2, 3]);
        });

        it('não deve modificar o vetor original', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            await primitivasVetor.concatenar.implementacao(
                interpretador,
                vetor,
                [4, 5]
            );

            expect(vetor).toEqual([1, 2, 3]);
        });
    });

    describe('estender', () => {
        it('deve estender o vetor com elementos de outro vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2];

            const resultado = await primitivasVetor.estender.implementacao(
                interpretador,
                vetor,
                [3, 4, 5]
            );

            expect(resultado).toEqual([1, 2, 3, 4, 5]);
        });

        it('deve estender com múltiplos vetores', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1];

            const resultado = await primitivasVetor.estender.implementacao(
                interpretador,
                vetor,
                [2, 3],
                [4, 5]
            );

            expect(resultado).toEqual([1, 2, 3, 4, 5]);
        });

        it('deve estender com chaves de um dicionário', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];
            const dicionario = { a: 1, b: 2, c: 3 };

            const resultado = await primitivasVetor.estender.implementacao(
                interpretador,
                vetor,
                dicionario
            );

            expect(resultado.sort()).toEqual(['a', 'b', 'c']);
        });

        it('deve rejeitar se nenhum argumento for passado', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            await expect(
                primitivasVetor.estender.implementacao(interpretador, vetor)
            ).rejects.toThrow('pelo menos um argumento');
        });

        it('deve rejeitar se argumento não for iterável', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            await expect(
                primitivasVetor.estender.implementacao(interpretador, vetor, 42)
            ).rejects.toThrow('deve ser um vetor ou um dicionário');
        });
    });

    describe('fatiar', () => {
        it('deve fatiar o vetor do início até uma posição', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3, 4, 5];

            const resultado = await primitivasVetor.fatiar.implementacao(
                interpretador,
                vetor,
                1,
                4
            );

            expect(resultado).toEqual([2, 3, 4]);
        });

        it('deve fatiar a partir de uma posição até o final', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3, 4, 5];

            const resultado = await primitivasVetor.fatiar.implementacao(
                interpretador,
                vetor,
                2
            );

            expect(resultado).toEqual([3, 4, 5]);
        });

        it('deve retornar uma cópia do vetor quando sem argumentos', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.fatiar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toEqual([1, 2, 3]);
            expect(resultado).not.toBe(vetor);
        });

        it('deve retornar vetor vazio ao fatiar além do comprimento', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.fatiar.implementacao(
                interpretador,
                vetor,
                5,
                10
            );

            expect(resultado).toEqual([]);
        });
    });

    describe('juntar', () => {
        it('deve juntar elementos com separador específico', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.juntar.implementacao(
                interpretador,
                vetor,
                ':'
            );

            expect(resultado).toBe('1:2:3');
        });

        it('deve juntar com separador padrão (vírgula)', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = ['a', 'b', 'c'];

            const resultado = await primitivasVetor.juntar.implementacao(
                interpretador,
                vetor,
                ','
            );

            expect(resultado).toBe('a,b,c');
        });

        it('deve juntar vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            const resultado = await primitivasVetor.juntar.implementacao(
                interpretador,
                vetor,
                ','
            );

            expect(resultado).toBe('');
        });
    });

    describe('remover', () => {
        it('deve remover um elemento do vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.remover.implementacao(
                interpretador,
                vetor,
                2
            );

            expect(resultado).toEqual([1, 3]);
        });

        it('deve remover apenas a primeira ocorrência', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 2, 3];

            await primitivasVetor.remover.implementacao(
                interpretador,
                vetor,
                2
            );

            expect(vetor).toEqual([1, 2, 3]);
        });

        it('não deve fazer nada se o elemento não existir', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.remover.implementacao(
                interpretador,
                vetor,
                99
            );

            expect(resultado).toEqual([1, 2, 3]);
        });
    });

    describe('remover_primeiro', () => {
        it('deve remover o primeiro elemento e retorná-lo', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.remover_primeiro.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBe(1);
            expect(vetor).toEqual([2, 3]);
        });

        it('deve retornar undefined para vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            const resultado = await primitivasVetor.remover_primeiro.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBeUndefined();
        });
    });

    describe('remover_ultimo', () => {
        it('deve remover o último elemento e retorná-lo', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.remover_ultimo.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBe(3);
            expect(vetor).toEqual([1, 2]);
        });

        it('deve retornar undefined para vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            const resultado = await primitivasVetor.remover_ultimo.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBeUndefined();
        });
    });

    describe('somar', () => {
        it('deve somar números do vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3, 4, 5];

            const resultado = await primitivasVetor.somar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBe(15);
        });

        it('deve retornar 0 para vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            const resultado = await primitivasVetor.somar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBe(0);
        });

        it('deve somar números negativos', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [10, -5, 3, -2];

            const resultado = await primitivasVetor.somar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBe(6);
        });

        it('deve somar objetos com propriedade valor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [
                { valor: 5 },
                { valor: 10 },
                { valor: 15 }
            ];

            const resultado = await primitivasVetor.somar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBe(30);
        });

        it('deve somar vetor misto com números e objetos', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, { valor: 5 }, 3, { valor: 10 }];

            const resultado = await primitivasVetor.somar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBe(19);
        });

        it('deve retornar 0 para vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            const resultado = await primitivasVetor.somar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toBe(0);
        });
    });

    describe('clonar', () => {
        it('deve retornar uma cópia exata do vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3, 4, 5];

            const resultado = await primitivasVetor.clonar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toEqual([1, 2, 3, 4, 5]);
        });

        it('não deve referenciar o vetor original na memória', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.clonar.implementacao(
                interpretador,
                vetor
            );

            resultado.push(4);

            expect(resultado).toEqual([1, 2, 3, 4]);
            expect(vetor).toEqual([1, 2, 3]);
            expect(resultado).not.toBe(vetor);
        });

        it('deve clonar um vetor vazio', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor: any[] = [];

            const resultado = await primitivasVetor.clonar.implementacao(
                interpretador,
                vetor
            );

            expect(resultado).toEqual([]);
            expect(resultado).not.toBe(vetor);
        });
    });

    describe('remover_todos', () => {
        it('deve remover todas as ocorrências do elemento no vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3, 2, 4, 2];

            const resultado = await primitivasVetor.remover_todos.implementacao(
                interpretador,
                vetor,
                2
            );

            expect(resultado).toEqual([1, 3, 4]);
            expect(vetor).toEqual([1, 3, 4]);
        });

        it('não deve fazer nada se o elemento não existir no vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [1, 2, 3];

            const resultado = await primitivasVetor.remover_todos.implementacao(
                interpretador,
                vetor,
                99
            );

            expect(resultado).toEqual([1, 2, 3]);
            expect(vetor).toEqual([1, 2, 3]);
        });

        it('deve remover elementos de tipos diferentes corretamente (textos)', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = ['banana', 'maçã', 'banana', 'uva'];

            await primitivasVetor.remover_todos.implementacao(
                interpretador,
                vetor,
                'banana'
            );

            expect(vetor).toEqual(['maçã', 'uva']);
        });

        it('deve esvaziar o vetor completamente se todos os elementos forem o alvo da remoção', async () => {
            const interpretador = criarInterpretadorMock();
            const vetor = [5, 5, 5, 5];

            await primitivasVetor.remover_todos.implementacao(
                interpretador,
                vetor,
                5
            );

            expect(vetor).toEqual([]);
        });
    });
});
