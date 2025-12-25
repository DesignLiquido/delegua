import { LexadorPitugues } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPitugues } from '../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorPitugues } from '../../fontes/interpretador/dialetos/pitugues';

describe('Interpretador (Pituguês)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPitugues;
        let avaliadorSintatico: AvaliadorSintaticoPitugues;
        let interpretador: InterpretadorPitugues;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
            interpretador = new InterpretadorPitugues(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Cenários de sucesso', () => {
            describe('Atribuições', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear([
                        'a = 1',
                        'b, c = 1, 2'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                describe('Compreensão de listas', () => {
                    it('Trivial', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'lista = [1, 2, 3, 4, 5]',
                                'minhaListaCompreensao = [x para cada x em lista se x % 2 == 0] # Compreensão de listas para números pares',
                                'escreva(minhaListaCompreensao)',
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[2, 4]');
                    });

                    it('Com expressão para resolução', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'lista = [1, 2, 3, 4, 5]',
                                'minhaListaCompreensao = [x * 2 para cada x em lista se x % 2 == 0] # Compreensão de listas para números pares',
                                'escreva(minhaListaCompreensao)',
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[4, 8]');
                    });
                });

                it('Vetor', async () => {
                    const retornoLexador = lexador.mapear(['a = [1, 2, 3]'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário', async () => {
                    const retornoLexador = lexador.mapear(["a = {'a': 1, 'b': 2}"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                describe('Desempacotamento de Coleção', () => {
                    it('Desempacota vetor numeros (que possui [1, 2, 3]) em a, b, c', async () => {
                        const retornoLexador = lexador.mapear([
                            'numeros = [1, 2, 3]',
                            'a, b, c = numeros'
                        ], -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);

                        const a = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('a');
                        const b = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('b');
                        const c = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('c');

                        expect(a.valor).toBe(1);
                        expect(b.valor).toBe(2);
                        expect(c.valor).toBe(3);
                    });
                });

                describe('Fatiamento (Slicing)', () => {
                    describe('Vetores', () => {
                        it('Fatiamento com início e fim definidos [início:fim]', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [0, 1, 2, 3, 4, 5]
                                fatia = numeros[1:4]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual([1, 2, 3]);
                        });

                        it('Fatiamento sem fim definido [início:]', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [0, 1, 2, 3]
                                fatia = numeros[2:]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual([2, 3]);
                        });

                        it('Fatiamento sem início definido [:fim]', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [10, 20, 30, 40]
                                fatia = numeros[:2]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual([10, 20]);
                        });

                        it('Fatiamento sem início e fim definido [:]', async () => {
                            const retornoLexador = lexador.mapear([`
                                ciencias = ['física', 'química', 'matemática']
                                fatia = ciencias[:]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual(['física', 'química', 'matemática']);
                        });

                        it('Fatiamento com início negativo [-n:] (pega os últimos n itens)', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [0, 1, 2, 3, 4, 5]
                                fatia = numeros[-2:]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');
                            expect(variavelFatia.valor).toEqual([4, 5]);
                        });

                        it('Fatiamento com fim negativo [:-n] (exclui os últimos n itens)', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [0, 1, 2, 3, 4, 5]
                                fatia = numeros[:-2]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');
                            expect(variavelFatia.valor).toEqual([0, 1, 2, 3]);
                        });

                        it('Fatiamento com início e fim negativos [-x:-y]', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [0, 1, 2, 3, 4, 5]
                                fatia = numeros[-4:-1]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');
                            expect(variavelFatia.valor).toEqual([2, 3, 4]);
                        });

                        it('Fatiamento misto (positivo e negativo) [1:-1]', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [0, 1, 2, 3, 4, 5]
                                fatia = numeros[1:-1]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');
                            expect(variavelFatia.valor).toEqual([1, 2, 3, 4]);
                        });
                    });

                    describe('Textos', () => {
                        it('Fatiamento [início:fim]', async () => {
                            const retornoLexador = lexador.mapear([`
                                texto = 'Pituguês'
                                fatia = texto[1:4]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual('itu');
                        });

                        it('Fatiamento sem fim definido [início:]', async () => {
                            const retornoLexador = lexador.mapear([`
                                texto = 'Pituguês'
                                fatia = texto[2:]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual('tuguês');
                        });

                        it('Fatiamento sem início definido [:fim]', async () => {
                            const retornoLexador = lexador.mapear([`
                                texto = 'Pituguês'
                                fatia = texto[:2]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual('Pi');
                        });

                        it('Fatiamento sem início e fim definido [:]', async () => {
                            const retornoLexador = lexador.mapear([`
                                texto = 'Pituguês'
                                fatia = texto[:]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual('Pituguês');
                        });

                        it('Deve suportar início negativo [-n:] (pega os últimos n itens)', async () => {
                            const retornoLexador = lexador.mapear([`
                                texto = 'Pituguês'
                                fatia = texto[-2:]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');
                            expect(variavelFatia.valor).toEqual('ês');
                        });

                        it('Deve suportar fim negativo [:-n] (exclui os últimos n itens)', async () => {
                            const retornoLexador = lexador.mapear([`
                                texto = 'Pituguês'
                                fatia = texto[:-2]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');
                            expect(variavelFatia.valor).toEqual('Pitugu');
                        });

                        it('Deve suportar início e fim negativos [-x:-y]', async () => {
                            const retornoLexador = lexador.mapear([`
                                texto = 'Pituguês'
                                fatia = texto[-4:-1]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');
                            expect(variavelFatia.valor).toEqual('guê');
                        });

                        it('Deve suportar misto (positivo e negativo) [1:-1]', async () => {
                            const retornoLexador = lexador.mapear([`
                                texto = 'Pituguês'
                                fatia = texto[1:-1]
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');
                            expect(variavelFatia.valor).toEqual('ituguê');
                        });
                    });

                    describe('Tuplas', () => {
                        it('Deve fatiar tupla (slice simples) e retornar nova tupla', async () => {
                            const retornoLexador = lexador.mapear([`
                                original = (1, 2, 3, 4, 5)
                                fatia = original[1:4]
                                escreva(fatia)
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            expect(_saidas[0].toString()).toBe('(2, 3, 4)');
                        });

                        it('Deve fatiar tupla com início e fim definidos', async () => {
                            const retornoLexador = lexador.mapear([`
                                t = (0, 10, 20, 30, 40, 50, 60)
                                resultado = t[1:6]
                                escreva(resultado)
                            `], -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            expect(_saidas[0].toString()).toBe('(10, 20, 30, 40, 50)');
                        });

                        it('Deve fatiar com início negativo [-n:] (pega os últimos n itens)', async () => {
                            const codigo = [`
                                t = (10, 20, 30, 40, 50)
                                fatia = t[-2:]
                                escreva(fatia)
                            `];
                            const retornoLexador = lexador.mapear(codigo, -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            expect(_saidas[0].toString()).toBe('(40, 50)');
                        });

                        it('Deve fatiar com fim negativo [:-n] (exclui os últimos n itens)', async () => {
                            const codigo = [`
                                t = (10, 20, 30, 40, 50)
                                fatia = t[:-1]
                                escreva(fatia)
                            `];
                            const retornoLexador = lexador.mapear(codigo, -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            expect(_saidas[0].toString()).toBe('(10, 20, 30, 40)');
                        });

                        it('Deve fatiar com início e fim negativos [-x:-y]', async () => {
                            const codigo = [`
                                t = (10, 20, 30, 40, 50)
                                fatia = t[-3:-1]
                                escreva(fatia)
                            `];
                            const retornoLexador = lexador.mapear(codigo, -1);
                            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            expect(_saidas[0].toString()).toBe('(30, 40)');
                        });
                    });
                });
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(
                        ['a = [1, 2, 3];\nescreva(a[1])'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        ["a = {'a': 1, 'b': 2};\nescreva(a['b'])"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva() e imprima()', () => {
                it('Olá Mundo (escreva() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(['escreva(nulo)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Olá Mundo (imprima() e literal)', async () => {
                    const retornoLexador = lexador.mapear(["imprima('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', async () => {
                    const retornoLexador = lexador.mapear(['imprima(nulo)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('tupla() e vetor()', () => {
                // TODO: Corrigir erros de avaliação sintática.
                it.skip('Transformando tupla para vetor', async () => {
                    const retornoLexador = lexador.mapear([`
                        tupla = (1, 2, 3)
                        vetor = vetor(tupla)
                        escreva(vetor);
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toEqual([1, 2, 3]);
                });

                // TODO: `paraTextoSaida` em `trio` escreve a tupla como em Delégua.
                // Pensar numa forma de resolver para o Pituguês.
                it.skip('Transformando vetor para tupla', async () => {
                    const retornoLexador = lexador.mapear([`
                        vetor = [1, 2, 3]
                        tupla = tupla(vetor)
                        escreva(tupla);
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('(1, 2, 3)');
                });
            });

            describe('leia', () => {
                it('Trivial', async () => {
                    let _saida: string = '';
                    // Aqui vamos simular a resposta para uma variável de `leia()`.
                    const respostas = ['5'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const retornoLexador = lexador.mapear(
                        ['teste = leia("Insira algo:")', 'imprima(teste)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saida = saida;
                    };
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saida).toBeTruthy();
                    expect(_saida).toBe('5');
                });
            });

            describe('Operações matemáticas', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        ['escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Exponenciação encadeada', async () => {
                    const codigo = ['escreva(5 ** 2 ** 3)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("390625");
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro ou falso)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - e', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro e falso)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Operações lógicas - em', async () => {
                    const retornoLexador = lexador.mapear(['escreva(2 em [1, 2, 3])'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Contém', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'a = [1, 2, 3, 4, 5]',
                            'escreva(a contém 3)'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('verdadeiro');
                });

                it('Não contém', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'a = [2, 4, 6, 8, 10]',
                            'escreva(a não contém 3)'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('verdadeiro');
                });
            });

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', async () => {
                    const codigo = [
                        'se (1 < 2):',
                        "   escreva('Um menor que dois')",
                        'senao:',
                        "   escreva('Nunca será executado')",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', async () => {
                    const codigo = [
                        'se (1 > 2):',
                        "   escreva('Nunca acontece')",
                        'senão:',
                        "   escreva('Um não é maior que dois')",
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Laços de repetição', () => {
                it('Laços de repetição - enquanto', async () => {
                    const retornoLexador = lexador.mapear(
                        ['a = 0\nenquanto a < 10:\n    a = a + 1'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Laços de repetição - fazer ... enquanto', async () => {
                    const retornoLexador = lexador.mapear(
                        ['a = 0\nfazer:\n    a = a + 1\nenquanto a < 10'],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                describe('Para cada', () => {
                    it('Trivial', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'vetor = [1, 2, 3]',
                                'para cada elemento de vetor:',
                                '    escreva(elemento)',
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(3);
                        expect(_saidas[0]).toBe('1');
                        expect(_saidas[1]).toBe('2');
                        expect(_saidas[2]).toBe('3');
                    });
                });

                it('Iterando texto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'texto1 = "Texto"',
                            'para cada item em texto1:',
                            '    imprima(item)'
                        ], -1
                    );
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(5);
                    expect(_saidas[0]).toBe('T');
                    expect(_saidas[1]).toBe('e');
                    expect(_saidas[2]).toBe('x');
                    expect(_saidas[3]).toBe('t');
                    expect(_saidas[4]).toBe('o');
                });
            });

            describe('Classes', () => {
                it('Trivial', async () => {
                    const codigo = [
                        'classe Animal:',
                        '    função correr():',
                        "        escreva('Correndo Loucamente')",
                        'classe Cachorro(Animal):',
                        '    função latir():',
                        "        escreva('Au Au Au Au')",
                        'nomeDoCachorro = Cachorro()',
                        'nomeDoCachorro.correr()',
                        'nomeDoCachorro.latir()',
                        "escreva('Classe: OK!')",
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('Correndo Loucamente');
                    expect(_saidas[1]).toBe('Au Au Au Au');
                    expect(_saidas[2]).toBe('Classe: OK!');
                });

                it('Classes - declaração `super()` ', async () => {
                    const codigo = [
                        'classe Procurando:',
                        '    construtor():',
                        "        imprima('Amigo, onde está você?')",
                        'classe Amigo(Procurando):',
                        '    construtor():',
                        '        super()',
                        "        imprima('Amigo, estou aqui!')",
                        'amigo = Amigo()',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('Amigo, onde está você?');
                    expect(_saidas[1]).toBe('Amigo, estou aqui!');
                });
            });

            describe('Declaração e chamada de funções', () => {
                it('Trivial', async () => {
                    const codigo = ['funcao teste():', '    imprima("Teste")', 'teste()'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Teste');
                });

                it('Fibonacci', async () => {
                    const codigo = [
                        'função fibonacci(n):',
                        '    se n == 0:',
                        '       retorna 0',
                        '    se n == 1:',
                        '       retorna 1',
                        '    n1 = n - 1',
                        '    n2 = n - 2',
                        '    f1 = fibonacci(n1)',
                        '    f2 = fibonacci(n2)',
                        '    retorna f1 + f2',
                        'a = fibonacci(0)',
                        'escreva(a)',
                        'a = fibonacci(1)',
                        'escreva(a)',
                        'a = fibonacci(2)',
                        'escreva(a)',
                        'a = fibonacci(3)',
                        'escreva(a)',
                        'a = fibonacci(4)',
                        'escreva(a)',
                        'a = fibonacci(5)',
                        'escreva(a)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(6);
                    expect(_saidas[0]).toBe('0');
                    expect(_saidas[1]).toBe('1');
                    expect(_saidas[2]).toBe('1');
                    expect(_saidas[3]).toBe('2');
                    expect(_saidas[4]).toBe('3');
                    expect(_saidas[5]).toBe('5');
                });

                it('Uso de funções de ordem superior', async () => {
                    const codigo = [
                        'vetor = [1, 2, 3]',
                        'fn = funcao(valor):',
                        '    retorna valor * 2',
                        'escreva(mapear(vetor, fn))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('[2, 4, 6]');
                });
            });

            describe('Uso de bibliotecas', () => {
                it('dividir', async () => {
                    const codigo = [
                        'tex = "Eu sou um abacaxi"',
                        'div = tex.dividir(" ")',
                        'escreva(div)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe(`['Eu', 'sou', 'um', 'abacaxi']`);
                });

                it('mapear', async () => {
                    const codigo = [
                        'vetor = [1, 2, 3]',
                        'fn = funcao(valor):',
                        '    retorna valor * 2',
                        'escreva(mapear(vetor, fn))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('[2, 4, 6]');
                });
            });

            describe('Uso de primitivas de dicionário', () => {
                describe('itens', () => {
                    it('Trivial', async () => {
                        const codigo = [
                            "d = {'a': 1, 'b': 2, 'c': 3}",
                            'escreva(d.itens())',
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("[[\"a\",1], [\"b\",2], [\"c\",3]]");
                    });
                });
            });

            describe('Desempacotamento de dicionários com **', () => {
                describe('Casos de sucesso', () => {
                    it('Spread simples - {**dict}', async () => {
                        const codigo = [
                            "pessoa = {'nome': 'Fulano', 'sobrenome': 'de Tal'}",
                            "copia = {**pessoa}",
                            "escreva(copia['nome'])",
                            "escreva(copia['sobrenome'])"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(2);
                        expect(_saidas[0]).toBe('Fulano');
                        expect(_saidas[1]).toBe('de Tal');
                    });

                    it('Múltiplos spreads - {**dict1, **dict2}', async () => {
                        const codigo = [
                            "pessoa = {'nome': 'Fulano', 'sobrenome': 'de Tal'}",
                            "dados_da_pessoa = {'idade': 20, 'uf': 'SP'}",
                            "dados_completos = {**pessoa, **dados_da_pessoa}",
                            "escreva(dados_completos['nome'])",
                            "escreva(dados_completos['idade'])",
                            "escreva(dados_completos['uf'])"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(3);
                        expect(_saidas[0]).toBe('Fulano');
                        expect(_saidas[1]).toBe('20');
                        expect(_saidas[2]).toBe('SP');
                    });

                    it('Exemplo completo do Python - escreva(dados_completos)', async () => {
                        const codigo = [
                            "pessoa = {'nome': 'Fulano', 'sobrenome': 'de Tal'}",
                            "dados_da_pessoa = {'idade': 20, 'uf': 'SP'}",
                            "dados_completos = {**pessoa, **dados_da_pessoa}",
                            "escreva(dados_completos)"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);

                        // Validar que o dicionário mesclado contém todas as 4 chaves
                        const saida = _saidas[0];
                        expect(saida).toContain('nome');
                        expect(saida).toContain('Fulano');
                        expect(saida).toContain('sobrenome');
                        expect(saida).toContain('de Tal');
                        expect(saida).toContain('idade');
                        expect(saida).toContain('20');
                        expect(saida).toContain('uf');
                        expect(saida).toContain('SP');
                    });

                    it('Mix de spread e literal - {**dict, "nova_chave": valor}', async () => {
                        const codigo = [
                            "base = {'a': 1, 'b': 2}",
                            "extendido = {**base, 'c': 3, 'd': 4}",
                            "escreva(extendido['a'])",
                            "escreva(extendido['c'])",
                            "escreva(extendido['d'])"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(3);
                        expect(_saidas[0]).toBe('1');
                        expect(_saidas[1]).toBe('3');
                        expect(_saidas[2]).toBe('4');
                    });

                    it('Sobrescrita - chave posterior sobrescreve anterior', async () => {
                        const codigo = [
                            "original = {'x': 1, 'y': 2}",
                            "sobrescrito = {**original, 'x': 100}",
                            "escreva(sobrescrito['x'])",
                            "escreva(sobrescrito['y'])"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(2);
                        expect(_saidas[0]).toBe('100');
                        expect(_saidas[1]).toBe('2');
                    });

                    it('Dicionário vazio com spread', async () => {
                        const codigo = [
                            "vazio = {}",
                            "com_dados = {**vazio, 'a': 1}",
                            "escreva(com_dados['a'])"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('1');
                    });

                    it('Spread de spread - sobrescrita em múltiplos níveis', async () => {
                        const codigo = [
                            "d1 = {'a': 1, 'b': 2}",
                            "d2 = {'b': 20, 'c': 30}",
                            "d3 = {'c': 300, 'd': 400}",
                            "resultado = {**d1, **d2, **d3}",
                            "escreva(resultado['a'])",
                            "escreva(resultado['b'])",
                            "escreva(resultado['c'])",
                            "escreva(resultado['d'])"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(4);
                        expect(_saidas[0]).toBe('1');
                        expect(_saidas[1]).toBe('20');
                        expect(_saidas[2]).toBe('300');
                        expect(_saidas[3]).toBe('400');
                    });
                });

                describe('Casos de erro', () => {
                    it('Erro ao usar ** com não-dicionário (número)', async () => {
                        const codigo = [
                            "numero = 42",
                            "tentativa = {**numero}"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                        const mensagemErro = retornoInterpretador.erros[0].erroInterno?.mensagem || retornoInterpretador.erros[0].mensagem;
                        expect(mensagemErro).toContain('só pode ser usado com dicionários');
                    });

                    it('Erro ao usar ** com vetor', async () => {
                        const codigo = [
                            "vetor = [1, 2, 3]",
                            "tentativa = {**vetor}"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                        const mensagemErro = retornoInterpretador.erros[0].erroInterno?.mensagem || retornoInterpretador.erros[0].mensagem;
                        expect(mensagemErro).toContain('vetor');
                    });

                    it('Erro ao usar ** com texto', async () => {
                        const codigo = [
                            "texto = 'alguma string'",
                            "tentativa = {**texto}"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                        const mensagemErro = retornoInterpretador.erros[0].erroInterno?.mensagem || retornoInterpretador.erros[0].mensagem;
                        expect(mensagemErro).toContain('dicionários');
                    });

                    it('Erro ao usar ** com nulo', async () => {
                        const codigo = [
                            "nulo_var = nulo",
                            "tentativa = {**nulo_var}"
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                        const mensagemErro = retornoInterpretador.erros[0].erroInterno?.mensagem || retornoInterpretador.erros[0].mensagem;
                        expect(mensagemErro).toContain('nulo');
                    });
                });
            });

            describe('Uso de primitivas de número', () => {
                it('arredondarParaBaixo', async () => {
                    const codigo = ['n1 = 3.1415', 'escreva(n1.arredondar_para_baixo())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('3');
                });

                it('arredondarParaCima', async () => {
                    const codigo = ['n1 = 3.1415', 'escreva(n1.arredondar_para_cima())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('4');
                });
            });

            describe('Uso de primitivas de texto', () => {
                it('aparar', async () => {
                    const codigo = ['escreva("   texto com espaços        ".aparar())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('texto com espaços');
                });

                it('concatenar', async () => {
                    const codigo = [
                        't1 = "um texto"',
                        't2 = " concatenado com outro"',
                        'escreva(t1.concatenar(t2))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('um texto concatenado com outro');
                });

                it('encontrar_ultimo', async () => {
                    const codigo = [
                        'txt = "Mi casa, su casa."',
                        'escreva(txt.encontrar_ultimo(\'casa\'))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('12');
                });

                it('dividir', async () => {
                    const codigo = ['t1 = "um dois três"', 'escreva(t1.dividir(" "))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("['um', 'dois', 'três']");
                });

                it('inclui', async () => {
                    // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                    const respostas = ['A galinha botou', 'a'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const codigo = [
                        "frase = leia('Informe uma frase: ')",
                        "letra = leia('Qual letra quer encontrar? ')",
                        "teste = frase.inclui(letra)",
                        "imprima(teste)"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("verdadeiro");
                });

                it('maiusculo', async () => {
                    const codigo = ['t1 = "um dois três"', 'escreva(t1.maiusculo())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('UM DOIS TRÊS');
                });

                it('minusculo', async () => {
                    const codigo = ['t1 = "UM DOIS TRÊS"', 'escreva(t1.minusculo())'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('um dois três');
                });

                describe('particao / partição', () => {
                    it('Deve particionar texto com separador existente (particao)', async () => {
                        const codigo = [
                            'txt = "I could eat bananas all day".particao("bananas")\n',
                            'escreva(txt)'
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas[0]).toBe('("I could eat ", "bananas", " all day")');
                    });

                    it('Deve particionar texto com separador existente (particao)', async () => {
                        const codigo = [
                            'txt = "python-pitugues"',
                            'resultado = txt.particao("-")',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('("python", "-", "pitugues")');
                    });

                    it('Deve retornar tupla com campos vazios quando separador não existe', async () => {
                        const codigo = [
                            'txt = "fruta"',
                            'resultado = txt.particao("carro")',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('("fruta", "", "")');
                    });

                    it('eDve lidar com separador no início do texto (partição)', async () => {
                        const codigo = [
                            'txt = ".texto"',
                            'resultado = txt.partição(".")',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('("", ".", "texto")');
                    });

                    it('Deve lidar com separador no final do texto (partição)', async () => {
                        const codigo = [
                            'txt = "texto."',
                            'resultado = txt.partição(".")',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('("texto", ".", "")');
                    });

                    it('Deve particionar com separador de múltiplos caracteres (partição)', async () => {
                        const codigo = [
                            'txt = "isso--separador--texto"',
                            'resultado = txt.partição("--")',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('("isso", "--", "separador--texto")');
                    });
                });
            });

            describe('Uso de primitivas de vetor', () => {
                it('fatiar', async () => {
                    const codigo = [
                        'lista = ["Ser", "ou", "não", "ser"]',
                        'escreva(lista.fatiar(2))',
                        'escreva(lista.fatiar(1, 2))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe("['não', 'ser']");
                    expect(_saidas[1]).toBe("['ou']");
                });

                it('inclui', async () => {
                    const codigo = [
                        'lista = [1, 2, 3, 4, 5, 6]',
                        'lista2 = ["Ser", "ou", "não", "ser"]',
                        'escreva(lista.inclui(5))',
                        'escreva(lista2.inclui("ser"))',
                        'escreva(lista2.inclui("abc"))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(3);
                    expect(_saidas[0]).toBe('verdadeiro');
                    expect(_saidas[1]).toBe('verdadeiro');
                    expect(_saidas[2]).toBe('falso');
                });

                it('substituir', async () => {
                    const codigo = [
                        't = "Ser ou não ser, eis a questão"',
                        'escreva(t.substituir("Ser", "Salmão"));',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Salmão ou não ser, eis a questão');
                });

                it('subtexto', async () => {
                    const codigo = [
                        't = "Ser ou não ser, eis a questão"',
                        'escreva(t.subtexto(4, 10))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('ou não');
                });

                it('encontre - índice inicial encontrado', async () => {
                    const codigo = [
                        't = "Ser ou não ser, eis a questão"',
                        'escreva(t.encontrar("ser"))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('11');
                });

                it('encontre - subtexto não encontrado', async () => {
                    const codigo = [
                        't = "Ser ou não ser, eis a questão"',
                        'escreva(t.encontrar("abacaxi"))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('-1');
                });

                it('encontre - com índice inicial', async () => {
                    const codigo = [
                        't = "Ser ou não ser, eis a questão"',
                        'escreva(t.encontrar("ou", 4))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('4');
                });

                it('encontre - índice inicial após última ocorrência', async () => {
                    const codigo = [
                        't = "Ser ou não ser, eis a questão"',
                        'escreva(t.encontrar("Ser", 5))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('-1');
                });

                it('encontre - primeira ocorrência no início', async () => {
                    const codigo = ['t = "abcabc"', 'escreva(t.encontrar("abc"))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('0');
                });

                it('SE ternário', async () => {
                    const codigo = [
                        'a = 10',
                        'b = 20',
                        'maior = a se a > b senão b',
                        'escreva(maior)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('20');
                });

                describe('paraTupla', () => {
                    it('paraTupla', async () => {
                        const codigo = [
                            'lista = [1, 2, 3]',
                            'tupla = lista.paraTupla()',
                            'escreva(tupla)'
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoAvaliadorSintatico).toBeTruthy();
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('(1, 2, 3)');
                    });

                    it('paraTupla - vetor vazio', async () => {
                        const codigo = [
                            'lista = []',
                            'tupla = lista.paraTupla()',
                            'escreva(tupla)'
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoAvaliadorSintatico).toBeTruthy();
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('()');
                    });
                });
            });

            describe('Uso de primitivas de tupla', () => {
                describe('paraVetor', () => {
                    it('paraVetor - uso simples', async () => {
                        const codigo = [
                            'tupla = (1, 2, 3)',
                            'lista = tupla.paraVetor()',
                            'escreva(lista)'
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoAvaliadorSintatico).toBeTruthy();
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[1, 2, 3]');
                    });

                    it('paraVetor - tupla vazia', async () => {
                        const codigo = [
                            'tupla = ()',
                            'vetor = tupla.paraVetor()',
                            'escreva(vetor)'
                        ];

                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoAvaliadorSintatico).toBeTruthy();
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[]');
                    });
                });
            });

            describe('Interpolação (f-strings)', () => {
                it('Interpolação simples de variável', async () => {
                    const codigo = [
                        'nome = "Maria"',
                        'escreva(f"Olá, {nome}!")'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Olá, Maria!');
                });

                it('Interpolação com operação matemática', async () => {
                    const codigo = [
                        'escreva(f"O resultado é {2 * 8}")'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('O resultado é 16');
                });

                it('Aspas simples', async () => {
                    const codigo = [
                        "x = 10",
                        "escreva(f'Valor: {x}')"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Valor: 10');
                });
            });

            describe('Tuplas', () => {
                it('Verifica se a exibição da tupla no terminal é entre parênteses ao invés de chaves', async () => {
                    const codigo = [
                        't = (10, 20, 30)',
                        'escreva(t)'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0].toString()).toBe('(10, 20, 30)');
                })

                it('Deve criar uma tupla e acessar índice individual', async () => {
                    const codigo = [
                        't = (10, 20, 30)',
                        'escreva(t[1])'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('20');
                });

                it('Deve permitir acesso de elemento da tupla através de índice negativo', async () => {
                    const retornoLexador = lexador.mapear([`
                       t = (1, 2, 3)
                       escreva(t[-1])
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('3');
                });

                it('Deve suportar tupla com diferentes tipos de dados (Inteiro, Texto, Booleano, Real)', async () => {
                    const retornoLexador = lexador.mapear([
                        't = (1, "pituguês", verdadeiro, 2.5)',
                        'escreva(t)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('(1, pituguês, true, 2.5)');
                });

                it('Deve iniciar uma tupla vazia', async () => {
                    const retornoLexador = lexador.mapear([
                        'vazia = ()',
                        'escreva(vazia)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('()');
                });

                it('Deve permitir tuplas aninhadas (tupla dentro de tupla)', async () => {
                    const retornoLexador = lexador.mapear([`
                        t = ((1, 2), (3, 4))
                        item = t[0]
                        escreva(item)
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('(1, 2)');
                });
            });

            it('Deve repetir string quando lado ESQUERDO é texto ("Olá" * 5)', async () => {
                const retornoLexador = lexador.mapear([`
                    resultado = "Olá" * 5
                    escreva(resultado)
                `], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes,
                    true
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toBe('OláOláOláOláOlá');
            });

            it('Deve repetir string quando lado DIREITO é texto (3 * "Pituguês")', async () => {
                const retornoLexador = lexador.mapear([`
                    resultado = 3 * "Pituguês"
                    escreva(resultado)
                `], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes,
                    true
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toBe('PituguêsPituguêsPituguês');
            });

            it('Deve retornar texto vazio quando multiplicado por 0 ("Olá" * 0)', async () => {
                const retornoLexador = lexador.mapear([`
                    resultado = "Olá" * 0
                    escreva(resultado)
                `], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes,
                    true
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toBe('');
            });

            it('Deve retornar a própria string quando multiplicado por 1 ("Olá" * 1)', async () => {
                const retornoLexador = lexador.mapear([`
                    resultado = "Olá" * 1
                    escreva(resultado)
                `], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes,
                    true
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toBe('Olá');
            });

            it('Deve executar atribuição composta de soma (+=) com sucesso', async () => {
                const retornoLexador = lexador.mapear([`
                    a = 10
                    a += 5
                    escreva(a)
                `], -1);
                const retornoAvaliador = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliador.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toEqual('15');
            });

            it('Deve executar atribuição composta de subtração (-=) com sucesso', async () => {
                const retornoLexador = lexador.mapear([`
                    a = 10
                    a -= 5
                    escreva(a)
                `], -1);
                const retornoAvaliador = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliador.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toEqual('5');
            });

            it('Deve executar atribuição composta de divisão (/=) com sucesso', async () => {
                const retornoLexador = lexador.mapear([`
                    a = 10
                    a /= 2
                    escreva(a)
                `], -1);
                const retornoAvaliador = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliador.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toEqual('5');
            });

            it('Deve executar atribuição composta de multiplicação (*=) com sucesso', async () => {
                const retornoLexador = lexador.mapear([`
                    a = 10
                    a *= 2
                    escreva(a)
                `], -1);
                const retornoAvaliador = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliador.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toEqual('20');
            });
        });

        it('termina_com - sufixo encontrado no final', async () => {
            const codigo = [
                't = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("."))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('termina_com - sufixo encontrado (palavra completa)', async () => {
            const codigo = [
                't = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("mundo."))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('termina_com - sufixo não encontrado', async () => {
            const codigo = [
                't = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("mundo"))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('falso');
        });

        it('termina_com - sufixo no meio do texto', async () => {
            const codigo = [
                't = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("bem-vindo"))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('falso');
        });

        it('termina_com - texto vazio como sufixo', async () => {
            const codigo = [
                't = "Olá mundo"',
                'escreva(t.termina_com(""))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('termina_com - sufixo maior que o texto', async () => {
            const codigo = [
                't = "Olá"',
                'escreva(t.termina_com("Olá mundo!"))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('falso');
        });

        it('interpolação de variáveis em textos', async () => {
            const codigo = [
                'nome = "Maria"',
                'idade = 30',
                'escreva("Meu nome é ${nome} e eu tenho ${idade} anos.")',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('Meu nome é Maria e eu tenho 30 anos.');
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(['a = [1, 2, 3]\nescreva(a[4])'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos negativos fora do tamanho do vetor', async () => {
                    const retornoLexador = lexador.mapear([`
                        a = [1, 2, 3]
                        escreva(a[-4])
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos negativos fora do tamanho da tupla', async () => {
                    const retornoLexador = lexador.mapear([`
                        a = (1, 2, 3)
                        escreva(a[-4])
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        ["a = {'a': 1, 'b': 2}\nescreva(a['c'])"],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });

            describe('Desempacotamento de Coleção', () => {
                it('Vetor maior que variáveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'numeros = [1, 2, 3, 4]',
                            'a, b, c = numeros',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);

                    const erro = retornoInterpretador.erros[0];
                    const mensagem = erro.erroInterno['message'] || String(erro.erroInterno);

                    expect(mensagem).toContain('tamanho diferente');
                });

                it('Falha: Vetor menor que variáveis (Runtime)', async () => {
                    const retornoLexador = lexador.mapear([
                        'numeros = [1, 2]',
                        'a, b, c = numeros'
                    ], -1);
                    const retornoAvaliador = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliador.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Fatiamento (Slicing)', () => {
                it('Tentar fatiar número', async () => {
                    const retornoLexador = lexador.mapear([`
                        numero = 123
                        fatia = numero[0:1]
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);

                    const erro = retornoInterpretador.erros[0];
                    expect(erro.erroInterno.message).toContain('só é suportado em vetores, textos e tuplas.');
                });

                it('Tentar fatiar booleano', async () => {
                    const retornoLexador = lexador.mapear([`
                        logico = verdadeiro
                        fatia = logico[0:1]
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Tentar fatiar dicionário (não suportado como intervalo)', async () => {
                    const retornoLexador = lexador.mapear([`
                        dic = {'a': 1, 'b': 2}
                        fatia = dic[0:1]
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Interpolação (f-string)', () => {
                it('Variável não declarada na interpolação', async () => {
                    const retornoLexador = lexador.mapear([
                        'escreva(f"Olá, {naoExiste}!")'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.name).toBe('Error');
                    expect(retornoInterpretador.erros[0].linha).toBe(1);
                });

                it('Erro de sintaxe complexa dentro da interpolação', async () => {
                    const retornoLexador = lexador.mapear([
                        'escreva(f"O resultado é {2 + }")'
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros[0].message).toContain("Esperado expressão.");
                });

                it('Aspas aninhadas inválidas', async () => {
                    const retornoLexador = lexador.mapear([
                        "escreva(f'Valor: {x}' é um problema')"
                    ], -1);

                    expect(retornoLexador.erros).toHaveLength(1);
                    expect(retornoLexador.erros[0].mensagem).toContain('Texto não finalizado');
                });
            });

            it('Deve dar erro ao tentar alterar valor de uma tupla (Imutabilidade)', async () => {
                const retornoLexador = lexador.mapear([`
                    t = (1, 2, 3)
                    t[0] = 999
                `], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes,
                    true
                );

                expect(retornoInterpretador.erros).toHaveLength(1);
                expect(retornoInterpretador.erros[0].erroInterno.message).toContain('imutáveis');
            });

            describe('Uso de primitivas de texto', () => {
                describe('particao / partição', () => {
                    it('Chamar particao sem argumentos', async () => {
                        const codigo = [
                            'txt = "texto de teste"',
                            'resultado = txt.particao()',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    });

                    it('Chamar particao com tipo errado (número)', async () => {
                        const codigo = [
                            'txt = "texto de teste"',
                            'resultado = txt.partição(123)',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    });

                    it('Chamar particao em um número (não é texto)', async () => {
                        const codigo = [
                            'num = 123',
                            'resultado = num.particao("2")',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    });

                    it('Chamar particao com mais argumentos do que o suportado', async () => {
                        const codigo = [
                            'txt = "texto de teste"',
                            'resultado = txt.partição("de", "extra")',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    });

                    it('Chamar particao com separador vazio', async () => {
                        const codigo = [
                            'txt = "texto de teste"',
                            'resultado = txt.particao("")',
                            'escreva(resultado)'
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    });
                });

                describe('Repetição de Strings', () => {
                    it('Deve dar erro ao tentar multiplicar texto por texto ("Olá" * "Mundo")', async () => {
                        const retornoLexador = lexador.mapear([
                            'escreva("Olá" * "Mundo")'
                        ], -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    });

                    it('Deve dar erro ao tentar multiplicar texto por número real/decimal ("Olá" * 2.5)', async () => {
                        const retornoLexador = lexador.mapear([
                            'escreva("Olá" * 2.5)'
                        ], -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    });

                    it('Deve dar erro ao tentar multiplicar texto por um booleano ("Olá" * verdadeiro)', async () => {
                        const retornoLexador = lexador.mapear([
                            'escreva("Olá" * verdadeiro)'
                        ], -1);
                        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes,
                            true
                        );

                        expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    });
                });
            });

            describe('tupla() e vetor()', () => {
                // TODO: Isto não dá erro por algum motivo.
                it.skip('Erro em transformar vetor para vetor', async () => {
                    const retornoLexador = lexador.mapear([`
                        tupla = [1, 2, 3]
                        vetor = vetor(tupla)
                        escreva(vetor);
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                });

                it('Erro em transformar tupla para tupla', async () => {
                    const retornoLexador = lexador.mapear([`
                        vetor = (1, 2, 3)
                        tupla = tupla(vetor)
                        escreva(tupla);
                    `], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                });
            });

            describe('Uso de primitivas de vetor e tupla', () => {
                it('paraTupla - não sendo uma lista', async () => {
                    const codigo = [
                        'lista = (1, 2, 3)',
                        'tupla = lista.paraTupla()'
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                });

                it('paraTupla - tupla vazia', async () => {
                    const codigo = [
                        'lista = ()',
                        'tupla = lista.paraTupla()',
                        'escreva(tupla)'
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                });

                it('paraVetor - não sendo uma tupla', async () => {
                    const codigo = [
                        'tupla = [1, 2, 3]',
                        'lista = tupla.paraVetor()',
                        'escreva(lista)'
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                });

                it('paraVetor - vetor vazio', async () => {
                    const codigo = [
                        'tupla = []',
                        'vetor = tupla.paraVetor()',
                        'escreva(vetor)'
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                });
            });

            it('Deve falhar ao tentar usar atribuição composta em um literal (Syntax Error)', async () => {
                const retornoLexador = lexador.mapear([`
                    10 += 5
                `], -1);

                const retornoAvaliador = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliador.erros).toHaveLength(1);
                expect(retornoAvaliador.erros[0].message).toBe('Tarefa de atribuição inválida');
            });

            it('Deve falhar ao tentar atualizar variável não definida (Runtime Error)', async () => {
                const retornoLexador = lexador.mapear([`
                    x += 10
                `], -1);

                const retornoAvaliador = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliador.erros.length).toBeGreaterThan(0);
            });
        });
    });
});