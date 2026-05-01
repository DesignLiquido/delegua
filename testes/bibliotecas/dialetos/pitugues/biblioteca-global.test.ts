import {
    reduzir,
    tupla,
    vetor,
    tamanho,
    mapear,
    maximo,
    minimo,
    ordenar,
    somar,
    aleatorio,
    algum,
    encontrar,
    encontrar_indice,
    encontrar_ultimo,
    encontrar_ultimo_indice,
    enumerar,
    filtrar_por,
    incluido,
    inteiro,
    intervalo,
    para_cada,
    real,
    texto,
    todos,
} from '../../../../fontes/bibliotecas/dialetos/pitugues/biblioteca-global';
import {
    DeleguaFuncao,
    FuncaoPadrao,
    DescritorTipoClasse,
    ObjetoDeleguaClasse
} from '../../../../fontes/interpretador/estruturas';
import { RetornoQuebra } from '../../../../fontes/quebras';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { Literal, TuplaN } from '../../../../fontes/construtos';
import { AvaliadorSintaticoPitugues } from "../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-pitugues";
import { InterpretadorPitugues } from "../../../../fontes/interpretador/dialetos/pitugues/interpretador-pitugues";
import { LexadorPitugues } from "../../../../fontes/lexador/dialetos/lexador-pitugues";
import { VariavelInterface } from '../../../../fontes';
import { DeleguaFuncaoMock } from '../../../_mocks/delegua-funcao.mock';

describe('biblioteca-global (pituguês)', () => {
    let interpretadorMock: ReturnType<typeof criarInterpretadorMock>;

    beforeEach(() => {
        interpretadorMock = criarInterpretadorMock();
    });

    describe('reduzir', () => {
        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            await expect(reduzir(interpretadorMock, 1 as any, {} as any, 0)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O primeiro parâmetro da função deve ser um iterável.',
            });
        });

        it('rejeita quando segundo parâmetro não é função DeleguaFuncao', async () => {
            await expect(reduzir(interpretadorMock, [1, 2, 3], {} as any, 0)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O segundo parâmetro da função deve ser uma função.',
            });
        });

        it('reduz corretamente quando valor inicial é passado', async () => {
            const func = new DeleguaFuncaoMock(
                (acc: number, n: number) => acc + n
            );
            const resultado = await reduzir(
                interpretadorMock,
                [1, 2, 3],
                func as any,
                10 as any
            );

            expect(resultado).toBe(16);
        });

        it('reduz corretamente quando nenhum valor inicial é passado', async () => {
            const func = new DeleguaFuncaoMock(
                (acc: number, n: number) => acc + n
            );
            const resultado = await reduzir(
                interpretadorMock,
                [1, 2, 3],
                func as any,
                null as any
            );

            expect(resultado).toBe(6);
        });

        it('rejeita quando vetor vazio e nenhum valor inicial é passado', async () => {
            const func = new DeleguaFuncaoMock((acc: any, n: any) => acc + n);

            await expect(reduzir(
                interpretadorMock,
                [],
                func as any,
                null as any
            ))
                .rejects
                .toMatchObject({
                    mensagem: 'Não é possível reduzir um iterável vazio sem valor inicial.',
                });
        });

        it('usa valor inicial quando este for zero (falsy) e vetor vazio', async () => {
            const func = new DeleguaFuncaoMock((acc: any, n: any) => acc + n);
            const resultado = await reduzir(
                interpretadorMock,
                [],
                func as any,
                0 as any
            );

            expect(resultado).toBe(0);
        });

        it('usa valorInicial quando for VariavelInterface (com propriedade valor)', async () => {
            const func = new DeleguaFuncaoMock(
                (acc: number, n: number) => acc + n
            );
            const resultado = await reduzir(
                interpretadorMock,
                [1, 2],
                func as any,
                { valor: 5 } as any
            );

            expect(resultado).toBe(8);
        });

        it('Aceita VariavelInterface como vetor', async () => {
            const arr = { valor: [3, 1, 2] };
            const func = new DeleguaFuncaoMock(
                (acc: number, n: number) => acc + n
            );
            const resultado = await reduzir(
                interpretadorMock as any,
                arr as any,
                func as any,
                { valor: 0 } as any
            );

            expect(resultado).toBe(6);
        });

        it('Aceita VariavelInterface como função', async () => {
            const arr = [3, 1, 2];
            const func = new DeleguaFuncaoMock(
                (acc: number, n: number) => acc + n
            );
            const resultado = await reduzir(
                interpretadorMock as any,
                arr as any,
                { valor: func } as any,
                { valor: 0 } as any
            );

            expect(resultado).toBe(6);
        });

        it('usa valorInicial quando for VariavelInterface igual a null (com propriedade valor)', async () => {
            const func = new DeleguaFuncaoMock(
                (acc: number, n: number) => acc + n
            );
            const resultado = await reduzir(
                interpretadorMock,
                [1, 2],
                func as any,
                { valor: 5 } as any
            );

            expect(resultado).toBe(8);
        });
    });

    describe('todos', () => {
        it('rejeita quando primeiro parâmetro for nulo', async () => {
            await expect(todos(interpretadorMock, null as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função todos() não pode ser nulo.',
            });
        });

        it('rejeita quando segundo parâmetro não for função DeleguaFuncao', async () => {
            await expect(todos(interpretadorMock, [1, 2], {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O segundo parâmetro deve ser uma função.',
            });
        });

        it('Com vetor de números', async () => {
            interpretadorMock.resolverValor = jest.fn(v => v);
            interpretadorMock.eVerdadeiro = jest.fn(v => !!v);
            const resultado = await todos(interpretadorMock, [1, 2, 3]);
            expect(resultado).toBe(true);
        });

        it('Com vetor contendo um elemento falso', async () => {
            interpretadorMock.resolverValor = jest.fn(v => v);
            interpretadorMock.eVerdadeiro = jest.fn(v => !!v);
            const resultado = await todos(interpretadorMock, [1, 0, 3, null as any]);
            expect(resultado).toBe(false);
        });

        it('deve iterar sobre valores de um objeto', async () => {
            interpretadorMock.resolverValor = jest.fn(v => v);
            interpretadorMock.eVerdadeiro = jest.fn(v => !!v);
            const resultado = await todos(
                interpretadorMock as any,
                { a: true, b: true } as any
            );

            expect(resultado).toBe(true);
        });

        it('retorna verdadeiro quando todos satisfazem condição', async () => {
            interpretadorMock.resolverValor = jest.fn(v => v);
            interpretadorMock.eVerdadeiro = jest.fn(v => !!v);

            const func = new FuncaoPadrao(1, (_interpretador: any, n: number) => n % 2 === 0);

            const resultado = await todos(interpretadorMock, [2, 4, 6], func);

            expect(resultado).toBe(true);
        });

        it('retorna falso quando pelo menos um elemento não satisfaz condição', async () => {
            interpretadorMock.resolverValor = jest.fn(v => v);
            interpretadorMock.eVerdadeiro = jest.fn(v => !!v);

            const func = new FuncaoPadrao(1, (_interpretador: any, n: number) => n % 2 === 0);

            const resultado = await todos(interpretadorMock, [2, 3, 4], func);

            expect(resultado).toBe(false);
        });

        it('deve aceitar iterável como VariavelInterface', async () => {
            interpretadorMock.resolverValor = jest.fn(v => v);
            interpretadorMock.eVerdadeiro = jest.fn(v => !!v);

            const func = new FuncaoPadrao(1, (_interpretador: any, n: number) => n % 2 === 0);

            const resultado = await todos(interpretadorMock, { valor: [2, 3, 4] }, func);

            expect(resultado).toBe(false);
        });
    });

    describe('tupla', () => {
        it('rejeita quando argumento não é vetor', async () => {
            await expect(tupla(interpretadorMock, 1 as any)).rejects.toMatchObject({
                mensagem: 'O argumento passado para a função `tupla()` deve ser iterável.',
            });
        });

        it('Transforma vetor em tupla', async () => {
            const resultado = await tupla(interpretadorMock, [1, 2, 3, 4, 5]);

            expect(resultado.constructor.name).toBe('TuplaN')
            expect(resultado.paraTextoSaida()).toBe('(1, 2, 3, 4, 5)')
        });

        it('Transforma vetor com um único elemento em tupla', async () => {
            const resultado = await tupla(interpretadorMock, [1]);

            expect(resultado.constructor.name).toBe('TuplaN');
            expect(resultado.paraTextoSaida()).toBe('(1)')
        });

        it('cria tupla com tipos misturados', async () => {
            const resultado = await tupla(interpretadorMock, [1, 'texto', true, null]);

            expect(resultado.constructor.name).toBe('TuplaN');
            expect(resultado.paraTextoSaida()).toBe("(1, 'texto', true, null)");
        });
    });

    describe('vetor', () => {
        it('Rejeita quando argumento não é uma tupla', async () => {
            await expect(vetor(interpretadorMock, 1 as any)).rejects.toMatchObject({
                mensagem: 'O argumento passado para a função `vetor()` deve ser iterável.'
            });
        });

        it('Transforma tupla em vetor', async () => {
            const elementosTupla = [
                new Literal(0, 1, 1, 'número'),
                new Literal(0, 1, 2, 'número'),
                new Literal(0, 1, 3, 'número'),
                new Literal(0, 1, 4, 'número'),
                new Literal(0, 1, 5, 'número'),
            ];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);
            const resultado = await vetor(interpretadorMock, entradaTupla);

            expect(resultado.constructor.name).toBe('Array')
            expect(resultado).toEqual([1, 2, 3, 4, 5])
        });

        it('Transforma tupla com um único elemento em vetor', async () => {
            const elementosTupla = [
                new Literal(0, 1, 1, 'número'),
            ];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);
            const resultado = await vetor(interpretadorMock, entradaTupla);

            expect(resultado.constructor.name).toBe('Array');
            expect(resultado).toEqual([1]);
        });

        it('Cria vetor com tipos misturados', async () => {
            const elementosTupla = [
                new Literal(0, 1, 1, 'número'),
                new Literal(0, 1, "texto", 'texto'),
                new Literal(0, 1, true, 'qualquer'),
                new Literal(0, 1, null, 'nulo'),
            ];
            const entradaTupla = new TuplaN(0, 1, elementosTupla);
            const resultado = await vetor(interpretadorMock, entradaTupla);

            expect(resultado.constructor.name).toBe('Array');
            expect(resultado).toEqual([1, "texto", true, null]);
        });
    });

    describe('tamanho', () => {
        it('rejeita quando argumento for número', async () => {
            await expect(tamanho(interpretadorMock, 123 as any)).rejects.toMatchObject({
                mensagem: 'A função global tamanho() não funciona com números.',
            });
        });

        it('retorna tamanho de texto', async () => {
            await expect(tamanho(interpretadorMock, 'abcd' as any)).resolves.toBe(4);
        });

        it('retorna valorAridade de FuncaoPadrao', async () => {
            const fp = new FuncaoPadrao(4, function () { });

            await expect(tamanho(interpretadorMock, fp as any)).resolves.toBe(4);
        });

        it('retorna quantidade de parâmetros de DeleguaFuncao', async () => {
            const deleguaFuncao = new DeleguaFuncao('fn', { parametros: [1, 2, 3] } as any);

            await expect(tamanho(interpretadorMock, deleguaFuncao as any)).resolves.toBe(3);
        });

        it('retorna tamanho do inicializador em DescritorTipoClasse quando presente', async () => {
            const descritor = new DescritorTipoClasse(undefined, undefined, {
                inicializacao: { eInicializador: true, declaracao: { parametros: [1, 2] } as any } as any,
            } as any);

            await expect(tamanho(interpretadorMock, descritor as any)).resolves.toBe(2);
        });

        it('retorna 0 para DescritorTipoClasse sem inicializador', async () => {
            const descritor = new DescritorTipoClasse();

            await expect(tamanho(interpretadorMock, descritor as any)).resolves.toBe(0);
        });

        it('rejeita quando argumento é ObjetoDeleguaClasse', async () => {
            const descritor = new DescritorTipoClasse();
            const objeto = new ObjetoDeleguaClasse(descritor);

            await expect(tamanho(interpretadorMock, objeto as any)).rejects.toMatchObject({
                mensagem: 'A função global tamanho() não funciona com objetos complexos instanciados.',
            });
        });

        it('deve aceitar vetor como VariavelInterface', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const idx = await tamanho(
                interpretadorMock as any,
                { valor: [1, 2] } as any
            );

            expect(idx).toBe(2);
        });

        it('retorna tamanho de vetor', async () => {
            const resultado = await tamanho(interpretadorMock, [1, 2, 3]);
            expect(resultado).toBe(3);
        });

        it('retorna tamanho de texto', async () => {
            const resultado = await tamanho(interpretadorMock, 'teste');
            expect(resultado).toBe(5);
        });

        it('retorna tamanho de vetor vazio', async () => {
            const resultado = await tamanho(interpretadorMock, []);
            expect(resultado).toBe(0);
        });

        it('retorna tamanho de texto vazio', async () => {
            const resultado = await tamanho(interpretadorMock, '');
            expect(resultado).toBe(0);
        });

        it('rejeita quando argumento não é vetor nem texto', async () => {
            await expect(tamanho(interpretadorMock, 123)).rejects.toMatchObject({
                mensagem: 'A função global tamanho() não funciona com números.',
            });
        });
    });

    describe('mapear', () => {
        it('rejeita quando primeiro parâmetro for nulo', async () => {
            await expect(mapear(interpretadorMock, null as any, {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O primeiro parâmetro da função mapear() não pode ser nulo.',
            });
        });

        it('ignora retornos sem valorRetornado e sem RetornoQuebra', async () => {
            // cria um objeto cujo construtor é o real DeleguaFuncao (via prototype)
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue({});

            const resultado = await mapear(interpretadorMock, [1, 2], fakeFunc);

            expect(resultado).toEqual([]);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(2);
        });

        it('ignora quando valorRetornado não é RetornoQuebra', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue({ valorRetornado: {} });

            const resultado = await mapear(interpretadorMock, [1], fakeFunc);

            expect(resultado).toEqual([]);
        });

        it('retorna valores quando valorRetornado é RetornoQuebra', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest
                .fn()
                .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra('a') })
                .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra('b') });

            const resultado = await mapear(interpretadorMock, [1, 2], fakeFunc);

            expect(resultado).toEqual(['a', 'b']);
        });

        it('mapear rejeita quando argumentos inválidos', async () => {
            await expect(mapear(interpretadorMock as any, null as any, {} as any)).rejects.toBeDefined();
            await expect(mapear(interpretadorMock as any, [1, 2] as any, {} as any)).rejects.toBeDefined();
        });

        it('mapear rejeita quando segundo argumento não é função', async () => {
            await expect(mapear(interpretadorMock as any, [1, 2] as any, {} as any)).rejects.toBeDefined();
        });
    });

    describe('ordenar', () => {
        it('rejeita quando argumento não é vetor', async () => {
            await expect(ordenar(interpretadorMock, 123 as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. A função ordenar() espera um iterável.',
            });
        });

        it('ordena corretamente um vetor', async () => {
            const arr = [3, 1, 2];
            const resultado = await ordenar(interpretadorMock, arr as any);
            expect(resultado).toEqual([1, 2, 3]);
        });

        it('ordena vetor vazio', async () => {
            const resultado = await ordenar(interpretadorMock, [] as any);
            expect(resultado).toEqual([]);
        });

        it('ordena vetor com um elemento', async () => {
            const resultado = await ordenar(interpretadorMock, [5] as any);
            expect(resultado).toEqual([5]);
        });

        it('ordena vetor com elementos duplicados', async () => {
            const arr = [3, 1, 2, 1, 3];
            const resultado = await ordenar(interpretadorMock, arr as any);
            expect(resultado).toEqual([1, 1, 2, 3, 3]);
        });

        it('ordena vetor de textos', async () => {
            const arr = ['zebra', 'apple', 'banana'];
            const resultado = await ordenar(interpretadorMock, arr as any);
            expect(resultado).toEqual(['apple', 'banana', 'zebra']);
        });

        it('ordenar lança quando vetor é null', async () => {
            await expect(ordenar(interpretadorMock as any, null as any)).rejects.toBeDefined();
        });

        it('Aceita VariavelInterface', async () => {
            const arr = { valor: [3, 1, 2] };
            const resultado = await ordenar(interpretadorMock as any, arr as any);
            expect(resultado).toEqual([1, 2, 3]);
        });
    });

    describe('maximo', () => {
        it('Deve retornar o maior número de um vetor simples', async () => {
            const resultado = await maximo(interpretadorMock, [1, 10, 5, -2]);
            expect(resultado).toBe(10);
        });

        it('Deve retornar o maior vetor lexicograficamente (vetor de vetores)', async () => {
            // [1, 3] é maior que [1, 2]
            const resultado = await maximo(interpretadorMock, [[1, 2], [1, 3]]);
            expect(resultado).toEqual([1, 3]);
        });

        it('Deve funcionar com números negativos e decimais', async () => {
            const resultado = await maximo(interpretadorMock, [-10.5, -5.2, -20.0]);
            expect(resultado).toBe(-5.2);
        });

        it('Deve rejeitar se o parâmetro não for um vetor', async () => {
            await expect(maximo(interpretadorMock, 123 as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. A função maximo() espera um iterável.',
            });
        });

        it('Deve rejeitar vetor vazio', async () => {
            await expect(maximo(interpretadorMock, [])).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O iterável não pode estar vazio.',
            });
        });

        it('Deve rejeitar tipos misturados incompatíveis (número vs vetor)', async () => {
            await expect(maximo(interpretadorMock, [1, [2]])).rejects.toMatchObject({
                mensagem: 'Não é possível comparar elementos de tipos incompatíveis dentro do iterável.',
            });
        });

        it('Com diferença de tamanho entre vetores', async () => {
            const resultado = await maximo(interpretadorMock as any, [[1], [1, 2]] as any);
            expect(resultado).toEqual([1, 2]);
        });

        it('Rejeita quando argumento é null', async () => {
            await expect(maximo(interpretadorMock, null as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função maximo() não pode ser nulo.',
            });
        });
    });

    describe('minimo', () => {
        it('Deve retornar o menor número de um vetor simples', async () => {
            const resultado = await minimo(interpretadorMock, [10, 2, 20]);
            expect(resultado).toBe(2);
        });

        it('Deve retornar o menor vetor lexicograficamente', async () => {
            // [0, 5] é menor que [1, 0]
            const resultado = await minimo(interpretadorMock, [[1, 0], [0, 5]]);
            expect(resultado).toEqual([0, 5]);
        });

        it('Deve funcionar com um único elemento', async () => {
            const resultado = await minimo(interpretadorMock, [42]);
            expect(resultado).toBe(42);
        });

        it('Deve rejeitar se o parâmetro for nulo', async () => {
            await expect(minimo(interpretadorMock, null as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função minimo() não pode ser nulo.',
            });
        });

        it('Deve rejeitar vetor vazio', async () => {
            await expect(minimo(interpretadorMock, [])).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O iterável não pode estar vazio.',
            });
        });

        it('Deve rejeitar tipos misturados (texto vs número)', async () => {
            await expect(minimo(interpretadorMock, [1, [2]])).rejects.toMatchObject({
                mensagem: 'Não é possível comparar elementos de tipos incompatíveis dentro do iterável.',
            });
        });

        it('minimo rejeita quando argumento não é vetor', async () => {
            await expect(minimo(interpretadorMock, 123 as any)).rejects.toBeDefined();
        });
    });

    describe('somar', () => {
        it('Deve somar corretamente inteiros positivos', async () => {
            const resultado = await somar(interpretadorMock, [1, 2, 3]);
            expect(resultado).toBe(6);
        });

        it('Deve retornar 0 para vetor vazio', async () => {
            const resultado = await somar(interpretadorMock, []);
            expect(resultado).toBe(0);
        });

        it('Deve somar decimais e negativos', async () => {
            const resultado = await somar(interpretadorMock, [10.5, -0.5, 2]);
            expect(resultado).toBe(12);
        });

        it('Deve rejeitar se o parâmetro não for vetor (ex: número)', async () => {
            await expect(somar(interpretadorMock, 123 as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função somar() deve ser um iterável.',
            });
        });

        it('Deve rejeitar se o parâmetro for nulo', async () => {
            await expect(somar(interpretadorMock, null as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função somar() não pode ser nulo.',
            });
        });

        it('Deve rejeitar se vetor contiver elementos não numéricos', async () => {
            await expect(somar(interpretadorMock, [1, '2'])).rejects.toMatchObject({
                mensagem: 'A função somar() aceita apenas iteráveis contendo números.',
            });
        });
    });

    describe('aleatorio', () => {
        it('Deve retornar número entre 0 (inclusivo) e 1 (exclusivo)', async () => {
            const resultado = await aleatorio(interpretadorMock);

            expect(typeof resultado).toBe('number');
            expect(resultado).toBeGreaterThanOrEqual(0);
            expect(resultado).toBeLessThan(1);
        });

        it('Deve retornar número entre 0 e o máximo', async () => {
            const resultado = await aleatorio(interpretadorMock, 10 as any);

            expect(resultado).toBeGreaterThanOrEqual(0);
            expect(resultado).toBeLessThan(10);
        });

        it('Deve retornar número entre mínimo e máximo', async () => {
            const resultado = await aleatorio(
                interpretadorMock,
                5 as any,
                10 as any
            );

            expect(resultado).toBeGreaterThanOrEqual(5);
            expect(resultado).toBeLessThan(10);
        });

        it('Deve aceitar VariavelInterface como argumento', async () => {
            const resultado = await aleatorio(
                interpretadorMock,
                { valor: 2 } as VariavelInterface,
                { valor: 5 } as VariavelInterface
            );

            expect(resultado).toBeGreaterThanOrEqual(2);
            expect(resultado).toBeLessThan(5);
        });

        it('Deve rejeitar se o primeiro parâmetro não for número', async () => {
            await expect(aleatorio(interpretadorMock, 'min', 10))
                .rejects
                .toMatchObject({
                    mensagem: 'O primeiro parâmetro deve ser um número.',
                });
        })

        it('Deve rejeitar se o segundo parâmetro não for número', async () => {
            await expect(aleatorio(interpretadorMock, 5, '15'))
                .rejects
                .toMatchObject({
                    mensagem: 'O segundo parâmetro deve ser um número.',
                });
        });

        it('Deve rejeitar quando mais de 2 argumentos são passados', async () => {
            await expect(aleatorio(interpretadorMock, 1, 2, 3, 4))
                .rejects
                .toMatchObject({
                    mensagem: 'A função aceita no máximo 2 parâmetros.',
                });
        });
    });

    describe('algum', () => {
        it('retorna true quando algum elemento satisfaz', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true);

            const resultado = await algum(interpretadorMock, [1, 2], fakeFunc);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(2);
        });

        it('retorna false quando nenhum satisfaça', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);
            const resultado = await algum(interpretadorMock, [1, 2, 3], fakeFunc);
            expect(resultado).toBe(false);
        });

        it('rejeita quando primeiro argumento não é array', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            await expect(algum(interpretadorMock, 123 as any, fakeFunc)).rejects.toBeDefined();
        });

        it('rejeita quando segundo argumento não é função', async () => {
            await expect(algum(interpretadorMock as any, [1, 2, 3] as any, {} as any)).rejects.toBeDefined();
        });

        it('chama função para cada elemento até encontrar true', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true);
            const resultado = await algum(interpretadorMock, [1, 2, 3], fakeFunc);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(2);
        });

        it('retorna false quando nenhum elemento satisfaz a condição', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);
            const resultado = await algum(interpretadorMock, [1, 2, 3, 4, 5], fakeFunc);
            expect(resultado).toBe(false);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(5);
        });

        it('itera sobre todos os elementos até algum retornar true', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            // Mock que retorna false para 3 primeiras chamadas, true na última
            fakeFunc.chamar = jest.fn()
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true);
            const resultado = await algum(interpretadorMock, [1, 2, 3, 4], fakeFunc);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(4);
        });

        it('Deve aceitar vetor como VariavelInterface', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(true);
            const resultado = await algum(interpretadorMock as any, { valor: [1, 2, 3] } as any, fakeFunc);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(1);
        });

        it('Deve aceitar função como VariavelInterface', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(true);
            const resultado = await algum(interpretadorMock as any, [1, 2, 3] as any, { valor: fakeFunc } as any);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(1);
        });
    });

    describe('encontrar', () => {
        it('encontra primeiro elemento que satisfaz', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true);

            const valor = await encontrar(interpretadorMock, [1, 2, 3], fakeFunc);

            expect(valor).toBe(2);
        });

        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            await expect(
                encontrar(interpretadorMock as any, 1 as any, {} as any)
            ).rejects.toBeDefined();
        });

        it('aceita wrapper {valor: ...} nos parâmetros', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const valor = await encontrar(
                interpretadorMock as any,
                { valor: [1, 2] } as any,
                { valor: fakeFunc } as any
            );

            expect(valor).toBe(1);
        });

        it('rejeita quando segundo parâmetro não é função', async () => {
            await expect(
                encontrar(interpretadorMock as any, [1, 2, 3], {} as any)
            ).rejects.toBeDefined();
        });

        it('retorna o elemento quando encontra na primeira iteração', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const resultado = await encontrar(interpretadorMock, [10, 20, 30], fakeFunc);

            expect(resultado).toBe(10);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(1);
        });

        it('retorna null quando nenhum elemento satisfaz', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);

            const resultado = await encontrar(interpretadorMock, [1, 2, 3], fakeFunc);

            expect(resultado).toBeNull();
        });
    });

    describe('encontrar_indice', () => {
        it('encontra o índice do primeiro elemento que satisfaz', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true);

            const idx = await encontrar_indice(interpretadorMock, [1, 2, 3], fakeFunc);

            expect(idx).toBe(1);
        });

        it('retorna -1 quando não encontra', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);

            const idx = await encontrar_indice(interpretadorMock, [1, 2, 3], fakeFunc);

            expect(idx).toBe(-1);
        });

        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            await expect(
                encontrar_indice(interpretadorMock as any, 1 as any, {} as any)
            ).rejects.toBeDefined();
        });

        it('rejeita quando segundo parâmetro não é função', async () => {
            await expect(
                encontrar_indice(interpretadorMock as any, [1, 2, 3], {} as any)
            ).rejects.toBeDefined();
        });

        it('deve aceitar vetor como VariavelInterface', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const idx = await encontrar_indice(
                interpretadorMock as any,
                { valor: [1, 2] } as any,
                { valor: fakeFunc } as any
            );

            expect(idx).toBe(0);
        });

        it('deve aceitar função como VariavelInterface', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const idx = await encontrar_indice(
                interpretadorMock as any,
                [1, 2],
                { valor: fakeFunc } as any
            );

            expect(idx).toBe(0);
        });
    });

    describe('encontrar_ultimo', () => {
        it('encontra último elemento que satisfaz', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const valor = await encontrar_ultimo(
                interpretadorMock,
                [1, 2, 3, 4],
                fakeFunc
            );

            expect(valor).toBe(4);
        });

        it('retorna null quando nenhum elemento satisfaz', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);

            const resultado = await encontrar_ultimo(
                interpretadorMock,
                [1, 2, 3, 4],
                fakeFunc
            );

            expect(resultado).toBeNull();
        });

        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            await expect(
                encontrar_ultimo(interpretadorMock as any, 1 as any, {} as any)
            ).rejects.toBeDefined();
        });

        it('rejeita quando segundo parâmetro não é função', async () => {
            await expect(
                encontrar_ultimo(interpretadorMock as any, [1, 2, 3], {} as any)
            ).rejects.toBeDefined();
        });

        it('deve aceitar vetor como VariavelInterface', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const idx = await encontrar_ultimo(
                interpretadorMock as any,
                { valor: [1, 2] } as any,
                { valor: fakeFunc } as any
            );

            expect(idx).toBe(2);
        });

        it('deve aceitar função como VariavelInterface', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const idx = await encontrar_ultimo(
                interpretadorMock as any,
                [1, 2],
                { valor: fakeFunc } as any
            );

            expect(idx).toBe(2);
        });
    });

    describe('encontrar_ultimo_indice', () => {
        it('encontra o índice do último elemento que satisfaz', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const idx = await encontrar_ultimo_indice(
                interpretadorMock,
                [1, 2, 3, 4],
                fakeFunc
            );

            expect(idx).toBe(3);
        });

        it('retorna -1 quando não encontra', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);

            const idx = await encontrar_ultimo_indice(
                interpretadorMock,
                [1, 2, 3],
                fakeFunc
            );

            expect(idx).toBe(-1);
        });

        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            await expect(
                encontrar_ultimo_indice(interpretadorMock as any, 1 as any, {} as any)
            ).rejects.toBeDefined();
        });

        it('rejeita quando segundo parâmetro não é função', async () => {
            await expect(
                encontrar_ultimo_indice(interpretadorMock as any, [1, 2, 3], {} as any)
            ).rejects.toBeDefined();
        });

        it('deve aceitar vetor como VariavelInterface', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);

            const idx = await encontrar_ultimo_indice(
                interpretadorMock as any,
                { valor: [1, 2] } as any,
                { valor: fakeFunc } as any
            );

            expect(idx).toBe(1);
        });
    });

    describe('filtrar_por', () => {
        it('filtra valores conforme função de filtragem', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
                .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra(true) })
                .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra(false) })
                .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra(true) });

            const resultado = await filtrar_por(interpretadorMock, [1, 2, 3], fakeFunc);
            expect(resultado).toEqual([1, 3]);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(3);
        });

        it('filtrar_por trata informacoesValor nulo e wrapper params', async () => {
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ valorRetornado: { valor: true } });

            const resultado = await filtrar_por(interpretadorMock as any, { valor: [5, 6] } as any, { valor: fakeFunc } as any);
            expect(resultado).toEqual([6]);
        });

        it('filtrar_por rejeita quando segundo parâmetro não é função', async () => {
            await expect(filtrar_por(interpretadorMock as any, [1, 2] as any, {} as any)).rejects.toBeDefined();
        });

        it('filtrar_por rejeita quando vetor é nulo', async () => {
            await expect(filtrar_por(interpretadorMock as any, null as any, {} as any)).rejects.toBeDefined();
        });

        it('filtrar_por rejeita quando vetor é undefined', async () => {
            await expect(filtrar_por(interpretadorMock as any, undefined as any, {} as any)).rejects.toBeDefined();
        });

        it('filtrar_por rejeita quando primeiro parâmetro não é vetor', async () => {
            await expect(filtrar_por(interpretadorMock, 123 as any, {} as any)).rejects.toBeDefined();
        });
    });

    describe('incluido', () => {
        it('detecta inclusão de valor simples', async () => {
            expect(await incluido(interpretadorMock, [1, 2, 3], 2)).toBe(true);
            expect(await incluido(interpretadorMock, [1, 2, 3], 4)).toBe(false);
        });

        it('incluido rejeita quando primeiro parâmetro não é vetor e aceita wrapper', async () => {
            await expect(incluido(interpretadorMock as any, 1 as any, 2 as any)).rejects.toBeDefined();
            expect(await incluido(interpretadorMock as any, { valor: [1, 2] } as any, { valor: 2 } as any)).toBe(true);
        });
    });

    describe('inteiro', () => {
        it('inteiro rejeita quando texto passa isNaN mas não passa regex', async () => {
            // String "abc" passará isNaN (não é número) mas falhará no regex /^(-)?\d+(\.\d+)?$/
            await expect(inteiro(interpretadorMock as any, 'abc' as any)).rejects.toBeDefined();
        });

        it('inteiro rejeita quando texto passa isNaN mas não passa regex (invalid format)', async () => {
            // String "12.34.56" passará isNaN mas falhará no regex
            await expect(inteiro(interpretadorMock as any, '12.34.56' as any)).rejects.toBeDefined();
        });

        it('converte para inteiro corretamente', async () => {
            expect(await inteiro(interpretadorMock as any, '42' as any)).toBe(42);
            expect(await inteiro(interpretadorMock as any, 7 as any)).toBe(7);
        });

        it('inteiro trata null/undefined e erros de validação', async () => {
            await expect(inteiro(interpretadorMock, null)).rejects.toBeDefined();
            await expect(inteiro(interpretadorMock, 'abc' as any)).rejects.toBeDefined();
            await expect(inteiro(interpretadorMock, NaN as any)).rejects.toBeDefined();
        });

        it('inteiro aceita VariavelInterface', async () => {
            expect(await inteiro(interpretadorMock as any, { valor: '42' } as any)).toBe(42);
        });

        it('Rejeita quando for passado uma string vazia', async () => {
            await expect(inteiro(interpretadorMock as any, '' as any)).rejects.
                toMatchObject({ mensagem: 'Valor não parece estar estruturado como um número válido. Somente números ou textos com números podem ser convertidos na função inteiro().' });
        });
    });

    describe('real', () => {
        it('deve converter número válido', async () => {
            const resultado = await real(interpretadorMock, 10);
            expect(resultado).toBe(10);
        });

        it('deve converter string numérica', async () => {
            const resultado = await real(interpretadorMock, '10.5' as any);
            expect(resultado).toBe(10.5);
        });

        it('deve aceitar VariavelInterface', async () => {
            const resultado = await real(interpretadorMock, { valor: '20.3' } as any);
            expect(resultado).toBe(20.3);
        });

        it('deve rejeitar valor que não parece número', async () => {
            await expect(real(interpretadorMock, 'abc' as any)).rejects.toBeDefined();
        });

        it('deve rejeitar valor com formato inválido', async () => {
            await expect(real(interpretadorMock, '10a' as any)).rejects.toBeDefined();
        });

        it('quando número é null', async () => {
            await expect(real(interpretadorMock, null)).rejects.toBeDefined();
        });

        it('quando número é undefined', async () => {
            await expect(real(interpretadorMock, undefined)).rejects.toBeDefined();
        });
    });

    describe('intervalo', () => {
        it('Rejeita quando início não é número', async () => {
            await expect(intervalo(interpretadorMock, '1' as any, 5 as any)).rejects.toMatchObject({
                mensagem: 'O parâmetro de início deve ser do tipo número ou inteiro.'
            });
        });

        it('Rejeita quando início não é número (argumento único)', async () => {
            await expect(intervalo(interpretadorMock, '10' as any)).rejects.toMatchObject({
                mensagem: 'O parâmetro de início deve ser do tipo número ou inteiro.'
            });
        });

        it('Cria intervalo correto', async () => {
            const resultado = await intervalo(interpretadorMock, 5 as any);
            expect(resultado).toEqual([0, 1, 2, 3, 4]);
        });

        it('cria intervalo correto (inicio inclusivo, fim exclusivo)', async () => {
            const resultado = await intervalo(interpretadorMock as any, 1 as any, 5 as any);
            expect(resultado).toEqual([1, 2, 3, 4]);
        });

        it('Cria intervalo correto (com passo)', async () => {
            const resultado = await intervalo(interpretadorMock as any, 1 as any, 10 as any, 3 as any);
            expect(resultado).toEqual([1, 4, 7]);
        });

        it('Rejeita quando passo não é número', async () => {
            await expect(intervalo(interpretadorMock as any, 1 as any, 10 as any, '3' as any)).rejects.toMatchObject({
                mensagem: 'O parâmetro de passo deve ser do tipo número ou inteiro.'
            });
        });

        it('Rejeita quando passo é zero', async () => {
            await expect(intervalo(interpretadorMock as any, 1 as any, 10 as any, 0 as any)).rejects.toMatchObject({
                mensagem: 'O passo não pode ser zero.'
            });
        });

        it('Cria intervalo quando passo é negativo', async () => {
            const resultado = await intervalo(interpretadorMock as any, 10 as any, 1 as any, -3 as any);
            expect(resultado).toEqual([10, 7, 4]);
        });

        it('Rejeita quando fim não é número', async () => {
            await expect(intervalo(interpretadorMock, 1 as any, '10' as any)).rejects.toMatchObject({
                mensagem: 'O parâmetro de fim deve ser do tipo número ou inteiro.'
            });
        });
    });

    describe('para_cada', () => {
        it('chama função para cada elemento', async () => {
            const calls: any[] = [];
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockImplementation(async (_i: any, args: any[]) => calls.push(args[0]));

            await para_cada(interpretadorMock as any, [9, 8, 7], fakeFunc as any);
            expect(calls).toEqual([9, 8, 7]);
        });

        it('para_cada rejeita quando segundo parâmetro não é função', async () => {
            await expect(para_cada(interpretadorMock as any, [1, 2] as any, {} as any)).rejects.toBeDefined();
        });

        it('para_cada rejeita quando primeiro parametro nulo', async () => {
            await expect(para_cada(interpretadorMock as any, null as any, {} as any)).rejects.toBeDefined();
        });
    });

    describe('enumerar', () => {
        it('retorna vetor de pares [índice, valor]', async () => {
            const resultado = await enumerar(interpretadorMock, [9, 8, 7]);
            expect(resultado).toEqual([
                { indice: 0, valor: 9 },
                { indice: 1, valor: 8 },
                { indice: 2, valor: 7 }
            ]);
        });

        it('enumerar rejeita quando primeiro parâmetro não é vetor', async () => {
            await expect(enumerar(interpretadorMock as any, null as any)).rejects.toBeDefined();
        });

        it('enumerar com início personalizado', async () => {
            const resultado = await enumerar(interpretadorMock, [9, 8, 7], 1);
            expect(resultado).toEqual([
                { indice: 1, valor: 9 },
                { indice: 2, valor: 8 },
                { indice: 3, valor: 7 }
            ]);
        });

        it('enumerar com início personalizado rejeita quando início não é número', async () => {
            await expect(enumerar(interpretadorMock as any, [9, 8, 7], '1' as any)).rejects.toBeDefined();
        });
    });

    describe('texto', () => {
        it('converte valores para string', async () => {
            expect(await texto(interpretadorMock as any, 123)).toBe('123');
            expect(await texto(interpretadorMock as any, { valor: 'x' } as any)).toBe('x');
        });
    });

    describe('Testes de integração', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;
        let interpretador: InterpretadorPitugues;

        beforeAll(() => {
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
            interpretador = new InterpretadorPitugues(process.cwd());
        });

        it('enumerar - trivial', async () => {
            const codigo = [
                'para cada indice, letra em enumerar("pitugues"):',
                '    escreva(indice, letra)',
            ];

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });
});