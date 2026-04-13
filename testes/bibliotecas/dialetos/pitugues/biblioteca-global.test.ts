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
    somar,
    aleatorio_entre,
    aleatorio,
    algum,
    arredondar,
    encontrar,
    encontrar_indice,
    encontrar_ultimo,
    encontrar_ultimo_indice,
    enumerar,
    filtrar_por,
    incluido,
    inteiro,
    intervalo,
    numero,
    para_cada,
    real,
    texto,
    todos,
} from '../../../../fontes/bibliotecas/dialetos/pitugues/biblioteca-global';
import { FuncaoPadrao } from '../../../../fontes/interpretador/estruturas/funcao-padrao';
import { RetornoQuebra } from '../../../../fontes/quebras';
import { DeleguaFuncao } from '../../../../fontes/interpretador/estruturas/delegua-funcao';
import { DescritorTipoClasse } from '../../../../fontes/interpretador/estruturas/descritor-tipo-classe';
import { ObjetoDeleguaClasse } from '../../../../fontes/interpretador/estruturas/objeto-delegua-classe';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { Literal, TuplaN } from '../../../../fontes/construtos';
import { AvaliadorSintaticoPitugues } from "../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-pitugues";
import { InterpretadorPitugues } from "../../../../fontes/interpretador/dialetos/pitugues/interpretador-pitugues";
import { LexadorPitugues } from "../../../../fontes/lexador/dialetos/lexador-pitugues";

describe('biblioteca-global (pituguês)', () => {
    let lexador: LexadorPitugues;
    let avaliadorSintatico: AvaliadorSintaticoPitugues;
    let interpretador: InterpretadorPitugues;
    
    beforeEach(() => {
        lexador = new LexadorPitugues();
        avaliadorSintatico = new AvaliadorSintaticoPitugues();
        interpretador = new InterpretadorPitugues(process.cwd());
    });
    
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
        it('Aceita VariavelInterface como vetor', async () => {
            const interpretador = criarInterpretadorMock();
            const arr = { valor: [3, 1, 2] };
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
            const resultado = await reduzir(interpretador as any, arr as any, func as any, { valor: 0 } as any);
            expect(resultado).toBe(6);
        });
        it('Aceita VariavelInterface como função', async () => {
            const interpretador = criarInterpretadorMock();
            const arr = [3, 1, 2];
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
            const resultado = await reduzir(interpretador as any, arr as any, { valor: func } as any, { valor: 0 } as any);
            expect(resultado).toBe(6);
        });
        
        it('usa valorInicial quando for VariavelInterface igual a null (com propriedade valor)', async () => {
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
    
    describe('todos', () => {
        it('rejeita quando primeiro parâmetro for nulo', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(todos(interpretador, null as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.',
            });
        });
        it('Com vetor de números', async () => {
            const interpretador = criarInterpretadorMock();
            interpretador.resolverValor = jest.fn(v => v);
            interpretador.eVerdadeiro = jest.fn(v => !!v);
            const resultado = await todos(interpretador, [1, 2, 3]);
            expect(resultado).toBe(true);
        });
        it('Com vetor contendo um elemento falso', async () => {
            const interpretador = criarInterpretadorMock();
            interpretador.resolverValor = jest.fn(v => v);
            interpretador.eVerdadeiro = jest.fn(v => !!v);
            const resultado = await todos(interpretador, [1, 0, 3, null as any]);
            expect(resultado).toBe(false);
        });
        it('deve iterar sobre valores de um objeto', async () => {
            const interpretador = criarInterpretadorMock();
            interpretador.resolverValor = jest.fn(v => v);
            interpretador.eVerdadeiro = jest.fn(v => !!v);
            const resultado = await todos(
                interpretador as any,
                { a: true, b: true } as any
            );
            
            expect(resultado).toBe(true);
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
        it('deve aceitar iterável como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            
            interpretador.resolverValor = jest.fn(v => v);
            interpretador.eVerdadeiro = jest.fn(v => !!v);
            
            const func = new FuncaoPadrao(1, (_interpretador: any, n: number) => n % 2 === 0);
            
            const resultado = await todos_em_condicao(interpretador, { valor: [2, 3, 4] }, func);
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
        it('rejeita quando primeiro parâmetro não for vetor', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(primeiro_em_condicao(interpretador, 'não é vetor' as any, {} as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O primeiro parâmetro da função primeiroEmCondicao() deve ser um vetor.',
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
            const fp = new FuncaoPadrao(4, function () { });
            await expect(tamanho(interpretador, fp as any)).resolves.toBe(4);
        });
        
        it('retorna quantidade de parâmetros de DeleguaFuncao', async () => {
            const interpretador = criarInterpretadorMock();
            const deleguaFuncao = new DeleguaFuncao('fn', { parametros: [1, 2, 3] } as any);
            await expect(tamanho(interpretador, deleguaFuncao as any)).resolves.toBe(3);
        });
        
        it('retorna tamanho do inicializador em DescritorTipoClasse quando presente', async () => {
            const interpretador = criarInterpretadorMock();
            const descritor = new DescritorTipoClasse(undefined, undefined, {
                inicializacao: { eInicializador: true, declaracao: { parametros: [1, 2] } as any } as any,
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
        it('deve aceitar vetor como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const idx = await tamanho(
                interpretador as any,
                { valor: [1, 2] } as any
            );
            
            expect(idx).toBe(2);
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
            
            const resultado = await mapear(interpretador, [1, 2], fakeFunc);
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
            
            const resultado = await mapear(interpretador, [1, 2], fakeFunc);
            expect(resultado).toEqual(['a', 'b']);
        });
        it('mapear rejeita quando argumentos inválidos', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(mapear(interpretador as any, null as any, {} as any)).rejects.toBeDefined();
            await expect(mapear(interpretador as any, [1, 2] as any, {} as any)).rejects.toBeDefined();
        });
        it('mapear rejeita quando segundo argumento não é função', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(mapear(interpretador as any, [1, 2] as any, {} as any)).rejects.toBeDefined();
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
            const arr = [3, 1, 2];
            const resultado = await ordenar(interpretador, arr as any);
            expect(resultado).toEqual([1, 2, 3]);
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
        
        it('ordenar lança quando vetor é null', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(ordenar(interpretador as any, null as any)).rejects.toBeDefined();
        });
        it('Aceita VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            const arr = { valor: [3, 1, 2] };
            const resultado = await ordenar(interpretador as any, arr as any);
            expect(resultado).toEqual([1, 2, 3]);
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
        it('Com diferença de tamanho entre vetores', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await maximo(interpretador as any, [[1], [1, 2]] as any);
            expect(resultado).toEqual([1, 2]);
        });
        it('Rejeita quando argumento é null', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(maximo(interpretador, null as any)).rejects.toMatchObject({
                mensagem: 'Parâmetro inválido. O parâmetro da função maximo() não pode ser nulo.',
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
        it('minimo rejeita quando argumento não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(minimo(interpretador as any, 'not array' as any)).rejects.toBeDefined();
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
    describe('aleatorio_entre', () => {
        
        it('Deve retornar número dentro do intervalo especificado', async () => {
            const interpretador = criarInterpretadorMock();
            const min = 5;
            const max = 15;
            const resultado = await aleatorio_entre(interpretador, min as any, max as any);
            expect(resultado).toBeGreaterThanOrEqual(min);
            expect(resultado).toBeLessThan(max);
        });
        it('Deve rejeitar se não for passado número como parâmetro', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(aleatorio_entre(interpretador, '5' as any, 15 as any)).rejects.toMatchObject({
                mensagem: 'Os dois parâmetros devem ser do tipo número.',
            });
        });
        
        
        it('aleatorio_entre com dois argumentos executa o branch de 2 argumentos', async () => {
            const interpretador = criarInterpretadorMock();
            const res = await (aleatorio_entre as any)(interpretador as any, 3 as any);
            expect(typeof res).toBe('number');
        });
        
        it('aleatorio_entre com mais de 3 argumentos rejeita', async () => {
            const interpretador = criarInterpretadorMock();
            await expect((aleatorio_entre as any)(interpretador as any, 1 as any, 2 as any, 3 as any, 4 as any)).rejects.toMatchObject({
                mensagem: 'A quantidade de parâmetros máxima para esta função é 2.',
            });
        });
        it('Deve rejeitar se valor mínimo não for número', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(aleatorio_entre(interpretador, 'min' as any, 10 as any)).rejects.toMatchObject({
                mensagem: 'Os dois parâmetros devem ser do tipo número.',
            });
        })
        
        it('deve aceitar VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            const minimo = { valor: 2 };
            const maximo = { valor: 5 };
            
            const resultado = await aleatorio_entre(interpretador, minimo as any, maximo as any);
            expect(resultado).toBeGreaterThanOrEqual(2);
            expect(resultado).toBeLessThan(5);
        });
    });
    
    
    describe('aleatorio', () => {
        it('retorna número entre 0 e 1', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await aleatorio(interpretador as any);
            expect(typeof resultado).toBe('number');
            expect(resultado).toBeGreaterThanOrEqual(0);
            expect(resultado).toBeLessThanOrEqual(1);
        });
    });
    
    describe('algum', () => {
        it('retorna true quando algum elemento satisfaz', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
            
            const resultado = await algum(interpretador, [1, 2], fakeFunc);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(2);
        });
        
        it('retorna false quando nenhum satisfaça', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);
            const resultado = await algum(interpretador, [1, 2, 3], fakeFunc);
            expect(resultado).toBe(false);
        });
        it('rejeita quando primeiro argumento não é array', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            await expect(algum(interpretador as any, 'not array' as any, fakeFunc)).rejects.toBeDefined();
        });
        
        it('rejeita quando segundo argumento não é função', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(algum(interpretador as any, [1, 2, 3] as any, {} as any)).rejects.toBeDefined();
        });
        
        it('chama função para cada elemento até encontrar true', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
            const resultado = await algum(interpretador, [1, 2, 3], fakeFunc);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(2);
        });
        
        it('retorna false quando nenhum elemento satisfaz a condição', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);
            const resultado = await algum(interpretador, [1, 2, 3, 4, 5], fakeFunc);
            expect(resultado).toBe(false);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(5);
        });
        
        it('itera sobre todos os elementos até algum retornar true', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            // Mock que retorna false para 3 primeiras chamadas, true na última
            fakeFunc.chamar = jest.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
            const resultado = await algum(interpretador, [1, 2, 3, 4], fakeFunc);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(4);
        });
        it('Deve aceitar vetor como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(true);
            const resultado = await algum(interpretador as any, { valor: [1, 2, 3] } as any, fakeFunc);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(1);
        });
        it('Deve aceitar função como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(true);
            const resultado = await algum(interpretador as any, [1, 2, 3] as any, { valor: fakeFunc } as any);
            expect(resultado).toBe(true);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('arredondar', () => {
        it('arredonda para N casas decimais', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await arredondar(interpretador as any, 1.2345 as any, 2 as any);
            expect(resultado).toBe(1.23);
        });
        it('arredondar rejeita quando numero é null ou tipo inválido', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(arredondar(interpretador as any, null as any, 2 as any)).rejects.toBeDefined();
            await expect(arredondar(interpretador as any, 'x' as any, 2 as any)).rejects.toBeDefined();
        });
        
    });
    describe('encontrar', () => {
        it('encontra primeiro elemento que satisfaz', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
            
            const valor = await encontrar(interpretador, [1, 2, 3], fakeFunc);
            
            expect(valor).toBe(2);
        });
        
        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            
            await expect(
                encontrar(interpretador as any, 1 as any, {} as any)
            ).rejects.toBeDefined();
        });
        
        it('aceita wrapper {valor: ...} nos parâmetros', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const valor = await encontrar(
                interpretador as any,
                { valor: [1, 2] } as any,
                { valor: fakeFunc } as any
            );
            
            expect(valor).toBe(1);
        });
        
        it('rejeita quando segundo parâmetro não é função', async () => {
            const interpretador = criarInterpretadorMock();
            
            await expect(
                encontrar(interpretador as any, [1, 2, 3], {} as any)
            ).rejects.toBeDefined();
        });
        
        it('retorna o elemento quando encontra na primeira iteração', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const resultado = await encontrar(interpretador, [10, 20, 30], fakeFunc);
            
            expect(resultado).toBe(10);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(1);
        });
        
        it('retorna null quando nenhum elemento satisfaz', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);
            
            const resultado = await encontrar(interpretador, [1, 2, 3], fakeFunc);
            
            expect(resultado).toBeNull();
        });
    });
    
    describe('encontrar_indice', () => {
        it('encontra o índice do primeiro elemento que satisfaz', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
            
            const idx = await encontrar_indice(interpretador, [1, 2, 3], fakeFunc);
            
            expect(idx).toBe(1);
        });
        
        it('retorna -1 quando não encontra', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);
            
            const idx = await encontrar_indice(interpretador, [1, 2, 3], fakeFunc);
            
            expect(idx).toBe(-1);
        });
        
        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            
            await expect(
                encontrar_indice(interpretador as any, 1 as any, {} as any)
            ).rejects.toBeDefined();
        });
        
        it('rejeita quando segundo parâmetro não é função', async () => {
            const interpretador = criarInterpretadorMock();
            
            await expect(
                encontrar_indice(interpretador as any, [1, 2, 3], {} as any)
            ).rejects.toBeDefined();
        });
        
        it('deve aceitar vetor como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const idx = await encontrar_indice(
                interpretador as any,
                { valor: [1, 2] } as any,
                { valor: fakeFunc } as any
            );
            
            expect(idx).toBe(0);
        });
        
        it('deve aceitar função como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const idx = await encontrar_indice(
                interpretador as any,
                [1, 2],
                { valor: fakeFunc } as any
            );
            
            expect(idx).toBe(0);
        });
    });
    describe('encontrar_ultimo', () => {
        it('encontra último elemento que satisfaz', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const valor = await encontrar_ultimo(
                interpretador,
                [1, 2, 3, 4],
                fakeFunc
            );
            
            expect(valor).toBe(4);
        });
        
        it('retorna null quando nenhum elemento satisfaz', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);
            
            const resultado = await encontrar_ultimo(
                interpretador,
                [1, 2, 3, 4],
                fakeFunc
            );
            
            expect(resultado).toBeNull();
        });
        
        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            
            await expect(
                encontrar_ultimo(interpretador as any, 1 as any, {} as any)
            ).rejects.toBeDefined();
        });
        
        it('rejeita quando segundo parâmetro não é função', async () => {
            const interpretador = criarInterpretadorMock();
            
            await expect(
                encontrar_ultimo(interpretador as any, [1, 2, 3], {} as any)
            ).rejects.toBeDefined();
        });
        
        
        it('deve aceitar vetor como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const idx = await encontrar_ultimo(
                interpretador as any,
                { valor: [1, 2] } as any,
                { valor: fakeFunc } as any
            );
            
            expect(idx).toBe(2);
        });
        
        it('deve aceitar função como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const idx = await encontrar_ultimo(
                interpretador as any,
                [1, 2],
                { valor: fakeFunc } as any
            );
            
            expect(idx).toBe(2);
        });
    });
    describe('encontrar_ultimo_indice', () => {
        it('encontra o índice do último elemento que satisfaz', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const idx = await encontrar_ultimo_indice(
                interpretador,
                [1, 2, 3, 4],
                fakeFunc
            );
            
            expect(idx).toBe(3);
        });
        
        it('retorna null quando não encontra', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValue(false);
            
            const idx = await encontrar_ultimo_indice(
                interpretador,
                [1, 2, 3],
                fakeFunc
            );
            
            expect(idx).toBeNull();
        });
        
        it('rejeita quando primeiro parâmetro não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            
            await expect(
                encontrar_ultimo_indice(interpretador as any, 1 as any, {} as any)
            ).rejects.toBeDefined();
        });
        
        it('rejeita quando segundo parâmetro não é função', async () => {
            const interpretador = criarInterpretadorMock();
            
            await expect(
                encontrar_ultimo_indice(interpretador as any, [1, 2, 3], {} as any)
            ).rejects.toBeDefined();
        });
        
        it('deve aceitar vetor como VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockResolvedValueOnce(true);
            
            const idx = await encontrar_ultimo_indice(
                interpretador as any,
                { valor: [1, 2] } as any,
                { valor: fakeFunc } as any
            );
            
            expect(idx).toBe(1);
        });
    });
    
    describe('filtrar_por', () => {
        it('filtra valores conforme função de filtragem', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
            .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra(true) })
            .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra(false) })
            .mockResolvedValueOnce({ valorRetornado: new RetornoQuebra(true) });
            
            const resultado = await filtrar_por(interpretador, [1, 2, 3], fakeFunc);
            expect(resultado).toEqual([1, 3]);
            expect(fakeFunc.chamar).toHaveBeenCalledTimes(3);
        });
        
        it('filtrar_por trata informacoesValor nulo e wrapper params', async () => {
            const interpretador = criarInterpretadorMock();
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn()
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ valorRetornado: { valor: true } });
            
            const resultado = await filtrar_por(interpretador as any, { valor: [5, 6] } as any, { valor: fakeFunc } as any);
            expect(resultado).toEqual([6]);
        });
        it('filtrar_por rejeita quando segundo parâmetro não é função', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(filtrar_por(interpretador as any, [1, 2] as any, {} as any)).rejects.toBeDefined();
        });
        
        it('filtrar_por rejeita quando vetor é nulo', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(filtrar_por(interpretador as any, null as any, {} as any)).rejects.toBeDefined();
        });
        
        it('filtrar_por rejeita quando vetor é undefined', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(filtrar_por(interpretador as any, undefined as any, {} as any)).rejects.toBeDefined();
        });
        
        it('filtrar_por rejeita quando primeiro parâmetro não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(filtrar_por(interpretador as any, 'not array' as any, {} as any)).rejects.toBeDefined();
        });
        
        
    });
    
    describe('incluido', () => {
        it('detecta inclusão de valor simples', async () => {
            const interpretador = criarInterpretadorMock();
            expect(await incluido(interpretador, [1, 2, 3], 2)).toBe(true);
            expect(await incluido(interpretador, [1, 2, 3], 4)).toBe(false);
        });
        
        it('incluido rejeita quando primeiro parâmetro não é vetor e aceita wrapper', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(incluido(interpretador as any, 1 as any, 2 as any)).rejects.toBeDefined();
            expect(await incluido(interpretador as any, { valor: [1, 2] } as any, { valor: 2 } as any)).toBe(true);
        });
        
    });
    
    describe('inteiro', () => {
        it('inteiro rejeita quando texto passa isNaN mas não passa regex', async () => {
            const interpretador = criarInterpretadorMock();
            // String "abc" passará isNaN (não é número) mas falhará no regex /^(-)?\d+(\.\d+)?$/
            await expect(inteiro(interpretador as any, 'abc' as any)).rejects.toBeDefined();
        });
        
        it('inteiro rejeita quando texto passa isNaN mas não passa regex (invalid format)', async () => {
            const interpretador = criarInterpretadorMock();
            // String "12.34.56" passará isNaN mas falhará no regex
            await expect(inteiro(interpretador as any, '12.34.56' as any)).rejects.toBeDefined();
        });
        
        it('converte para inteiro corretamente', async () => {
            const interpretador = criarInterpretadorMock();
            expect(await inteiro(interpretador as any, '42' as any)).toBe(42);
            expect(await inteiro(interpretador as any, 7 as any)).toBe(7);
        });
        
        it('inteiro trata null/undefined e erros de validação', async () => {
            const interpretador = criarInterpretadorMock();
            expect(await inteiro(interpretador as any, null as any)).toBe(0);
            await expect(inteiro(interpretador as any, 'abc' as any)).rejects.toBeDefined();
            await expect(inteiro(interpretador as any, NaN as any)).rejects.toBeDefined();
            
        });
        it('inteiro aceita VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            expect(await inteiro(interpretador as any, { valor: '42' } as any)).toBe(42);
        });
        it('Rejeita quando for passado uma string vazia', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(inteiro(interpretador as any, '' as any)).rejects.
            toMatchObject({ mensagem: 'Valor não parece estar estruturado como um número (texto vazio, falso ou não definido). Somente números ou textos com números podem ser convertidos para inteiro.' })
        })
    });
    describe('numero', () => {
        it('converte para número com parte decimal', async () => {
            const interpretador = criarInterpretadorMock();
            expect(await numero(interpretador as any, '3.14' as any)).toBe(3.14);
            expect(await real(interpretador as any, '2.5' as any)).toBe(2.5);
        });
        it('Converte null para número', async () => {
            const interpretador = criarInterpretadorMock();
            expect(await numero(interpretador as any, null as any)).toBe(0);
            expect(await real(interpretador as any, null as any)).toBe(0);
        });
        it('Aceita VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            expect(await numero(interpretador as any, { valor: '3.14' } as any)).toBe(3.14);
            expect(await real(interpretador as any, { valor: '2.5' } as any)).toBe(2.5);
        })
        
    });
    describe('real', () => {
        it('deve converter número válido', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await real(interpretador, 10);
            expect(resultado).toBe(10);
        });
        
        it('deve converter string numérica', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await real(interpretador, '10.5' as any);
            expect(resultado).toBe(10.5);
        });
        
        it('deve aceitar VariavelInterface', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await real(interpretador, { valor: '20.3' } as any);
            expect(resultado).toBe(20.3);
        });
        
        it('deve rejeitar valor que não parece número', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(real(interpretador, 'abc' as any)).rejects.toBeDefined();
        });
        
        it('deve rejeitar valor com formato inválido', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(real(interpretador, '10a' as any)).rejects.toBeDefined();
        });
        
        it('quando número é null', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(real(interpretador, null as any)).resolves
        });
        
        it('quando número é undefined', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(real(interpretador, undefined as any)).resolves
        });
    });
    describe('intervalo', () => {
        
        it('Cria intervalo correto (somente com fim)', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await intervalo(interpretador as any, 5 as any);
            expect(resultado).toEqual([0, 1, 2, 3, 4]);
        });
        it('cria intervalo correto (inicio inclusivo, fim exclusivo)', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await intervalo(interpretador as any, 1 as any, 5 as any);
            expect(resultado).toEqual([1, 2, 3, 4]);
        });
        it('Rejeita quando parâmetros não são números', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(intervalo(interpretador as any, '1' as any, 5 as any)).rejects.toMatchObject({
                mensagem: 'Os parâmetros de início e fim devem ser do tipo número ou inteiro.'
            });
        });
        it('Cria intervalo correto (com passo)', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await intervalo(interpretador as any, 1 as any, 10 as any, 3 as any);
            expect(resultado).toEqual([1, 4, 7]);
        });
        it('Rejeita quando passo não é número', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(intervalo(interpretador as any, 1 as any, 10 as any, '3' as any)).rejects.toMatchObject({
                mensagem: 'O parâmetro de passo deve ser do tipo número ou inteiro.'
            });
        });
        it('Rejeita quando passo é zero', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(intervalo(interpretador as any, 1 as any, 10 as any, 0 as any)).rejects.toMatchObject({
                mensagem: 'O passo não pode ser zero.'
            });
        });
        it('Cria intervalo quando passo é negativo', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await intervalo(interpretador as any, 10 as any, 1 as any, -3 as any);
            expect(resultado).toEqual([10, 7, 4]);
        });
        it('Rejeita quando fim não é número', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(intervalo(interpretador as any, '10' as any)).rejects.toMatchObject({
                mensagem: 'O parâmetro deve ser do tipo número ou inteiro.'
            });
        });
    });
    
    describe('para_cada', () => {
        it('chama função para cada elemento', async () => {
            const interpretador = criarInterpretadorMock();
            const calls: any[] = [];
            const fakeFunc = Object.create(DeleguaFuncao.prototype) as any;
            fakeFunc.chamar = jest.fn().mockImplementation(async (_i: any, args: any[]) => calls.push(args[0]));
            
            await para_cada(interpretador as any, [9, 8, 7], fakeFunc as any);
            expect(calls).toEqual([9, 8, 7]);
        });
        
        it('para_cada rejeita quando segundo parâmetro não é função', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(para_cada(interpretador as any, [1, 2] as any, {} as any)).rejects.toBeDefined();
        });
        it('para_cada rejeita quando primeiro parametro nulo', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(para_cada(interpretador as any, null as any, {} as any)).rejects.toBeDefined();
        });
        
    });
    describe('enumerar', () => {
        it('retorna vetor de pares [índice, valor]', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await enumerar(interpretador as any, [9, 8, 7]);
            expect(resultado).toEqual([{ indice: 0, valor: 9 }, { indice: 1, valor: 8 }, { indice: 2, valor: 7 }]);
        });
        it('enumerar rejeita quando primeiro parâmetro não é vetor', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(enumerar(interpretador as any, null as any)).rejects.toBeDefined();
        });
        it('enumerar com início personalizado', async () => {
            const interpretador = criarInterpretadorMock();
            const resultado = await enumerar(interpretador as any, [9, 8, 7], 1);
            expect(resultado).toEqual([{ indice: 1, valor: 8 }, { indice: 2, valor: 7 }]);
        });
        it('enumerar com início personalizado rejeita quando início não é número', async () => {
            const interpretador = criarInterpretadorMock();
            await expect(enumerar(interpretador as any, [9, 8, 7], '1' as any)).rejects.toBeDefined();
        });
        it('trivial', async () => {
            
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
    
    describe('texto', () => {
        it('converte valores para string', async () => {
            const interpretador = criarInterpretadorMock();
            expect(await texto(interpretador as any, 123)).toBe('123');
            expect(await texto(interpretador as any, { valor: 'x' } as any)).toBe('x');
        });
    });
})




