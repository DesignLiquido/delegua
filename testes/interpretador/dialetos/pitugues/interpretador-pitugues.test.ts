import { AvaliadorSintaticoPitugues } from "../../../../fontes/avaliador-sintatico";
import { LexadorPitugues } from "../../../../fontes/lexador";
import { InterpretadorPitugues } from "../../../../fontes/interpretador/dialetos/pitugues"
import { Iteravel } from "../../../../fontes/interpretador/estruturas/iteravel";

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
                it('Atribuição como expressão em escreva mantém valor em Pituguês', async () => {
                    const retornoLexador = lexador.mapear([
                        'x = 10',
                        'escreva(x = 99)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('99');
                });

                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear([
                        'a = 1',
                        'b, c = 1, 2'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Teste do exemplo de código presente no artigo sobre o Interpretador', async () => {
                    const retornoLexador = lexador.mapear([
                        'letra = "b"',
                        'se letra == "a":',
                        '    escreva("Letra A")',
                        'senao:',
                        '    escreva("Não é letra A")'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Atribuição com anotação de tipo texto[]', async () => {
                    const retornoLexador = lexador.mapear([
                        "t: texto[] = ['gggg', 'vvv']",
                        'escreva(t)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("['gggg', 'vvv']");
                });

                it('Atribuição com anotação de tipo inteiro', async () => {
                    const retornoLexador = lexador.mapear([
                        'n: inteiro = 42',
                        'escreva(n)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('42');
                });

                it('Variável sem tipo explícito aceita qualquer valor', async () => {
                    const retornoLexador = lexador.mapear([
                        'y = "hello"',
                        'y = 10',
                        'escreva(y)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('10');
                });

                it('Reatribuição com mesmo tipo funciona normalmente', async () => {
                    const retornoLexador = lexador.mapear([
                        'z: inteiro = 5',
                        'z = 42',
                        'escreva(z)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('42');
                });

                it('Tipos numéricos são compatíveis entre si', async () => {
                    const retornoLexador = lexador.mapear([
                        'n: número = 10',
                        'n = 3.14',
                        'escreva(n)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Função com nada', async () => {
                    const retornoLexador = lexador.mapear([
                        'funcao bhaskara(a,b,c):',
                        '   nada',
                        '# Insira os coeficientes depois da função',
                        'a = 1',
                        'b = -1',
                        'c = -30',
                        'bhaskara(a,b,c)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                describe('Escopo de variáveis (Python LEGB)', () => {
                    it('Atribuição dentro de função não altera variável global de mesmo nome', async () => {
                        const retornoLexador = lexador.mapear([
                            'x = 10',
                            'funcao teste():',
                            '    x = 5',
                            '    escreva(x)',
                            'teste()',
                            'escreva(x)',
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(2);
                        expect(_saidas[0]).toBe('5');
                        expect(_saidas[1]).toBe('10');
                    });

                    it('Função pode ler variável global sem criar local', async () => {
                        const retornoLexador = lexador.mapear([
                            'x = 42',
                            'funcao ler():',
                            '    escreva(x)',
                            'ler()',
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas[0]).toBe('42');
                    });

                    it('Variável local de função não vaza para o escopo global', async () => {
                        const retornoLexador = lexador.mapear([
                            'funcao criar():',
                            '    local = 99',
                            'criar()',
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(() =>
                            interpretador.pilhaEscoposExecucao.obterVariavelPorNome('local')
                        ).toThrow();
                    });

                    it('Múltiplas chamadas à função não acumulam estado entre si', async () => {
                        const retornoLexador = lexador.mapear([
                            'funcao incrementar(n):',
                            '    n = n + 1',
                            '    retorna n',
                            'a = incrementar(5)',
                            'b = incrementar(10)',
                            'escreva(a)',
                            'escreva(b)',
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas[0]).toBe('6');
                        expect(_saidas[1]).toBe('11');
                    });

                    it('Atribuição a índice de vetor global dentro de função modifica o vetor', async () => {
                        const retornoLexador = lexador.mapear([
                            'nums = [1, 2, 3]',
                            'funcao alterar():',
                            '    nums[0] = 99',
                            'alterar()',
                            'escreva(nums[0])',
                        ], -1);

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas[0]).toBe('99');
                    });
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Vetor com elementos acessados por índice', async () => {
                    const retornoLexador = lexador.mapear([
                        'vetor1 = [8, 2, 9, 5]',
                        'vetor2 = [vetor1[0], vetor1[1]]',
                        'escreva(vetor2)',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('[8, 2]');
                });

                it('Vetor com elementos acessados por índice após laço enquanto', async () => {
                    const retornoLexador = lexador.mapear([
                        'vetor1 = [8, 2, 9, 5]',
                        'aux = 0',
                        'i = 0',
                        'enquanto i < 3:',
                        '    se vetor1[i] > vetor1[i+1]:',
                        '        aux = vetor1[i]',
                        '        vetor1[i] = vetor1[i+1]',
                        '        vetor1[i+1] = aux',
                        '    i = i + 1',
                        '',
                        'vetor2 = [vetor1[0], vetor1[1]]',
                        'escreva(vetor2)',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('[2, 8]');
                });

                it('Dicionário', async () => {
                    const retornoLexador = lexador.mapear(["a = {'a': 1, 'b': 2}"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual([1, 2, 3]);
                        });

                        it('Fatiamento com início, fim e passo definidos [início:fim:passo]', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [0, 1, 2, 3, 4, 5]
                                fatia = numeros[1::2]
                            `], -1);

                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                                retornoLexador,
                                -1
                            );

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);

                            const variavelFatia = interpretador.pilhaEscoposExecucao.obterVariavelPorNome('fatia');

                            expect(variavelFatia.valor).toEqual([1, 3, 5]);
                        });

                        it('Fatiamento sem fim definido [início:]', async () => {
                            const retornoLexador = lexador.mapear([`
                                numeros = [0, 1, 2, 3]
                                fatia = numeros[2:]
                            `], -1);
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                it('Transformando tupla para vetor', async () => {
                    const retornoLexador = lexador.mapear([`
                        tupla = (1, 2, 3)
                        vetor = vetor(tupla)
                        escreva(vetor);
                    `], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toEqual('[1, 2, 3]');
                });

                it('Transformando vetor para tupla', async () => {
                    const retornoLexador = lexador.mapear([`
                        vetor = [1, 2, 3]
                        tupla = tupla(vetor)
                        escreva(tupla);
                    `], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

            describe('paraTupla() e paraVetor()', () => {
                it('Transformando tupla para vetor usando paraVetor()', async () => {
                    const retornoLexador = lexador.mapear([`
                        tupla = (1, 2, 3)
                        vetor = tupla.paraVetor()
                        escreva(vetor);
                    `], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toEqual('[1, 2, 3]');
                });

                it('Transformando vetor para tupla usando paraTupla()', async () => {
                    const retornoLexador = lexador.mapear([`
                        vetor = [1, 2, 3]
                        tupla = vetor.paraTupla()
                        escreva(tupla);
                    `], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

            describe('entrada', () => {
                it('Trivial', async () => {
                    let _saida: string = '';
                    const respostas = ['5'];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        },
                    };

                    const retornoLexador = lexador.mapear(
                        ['teste = entrada("Insira algo:")', 'imprima(teste)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe("390625");
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - ou', async () => {
                    const retornoLexador = lexador.mapear(['escreva(verdadeiro ou falso)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

                    it('retorna dentro de para cada dentro de funcao encerra a funcao (issue #1180)', async () => {
                        const retornoLexador = lexador.mapear(
                            [
                                'funcao encontrar_indice(frase, caractere):',
                                '    indice = 0',
                                '    para cada letra em frase:',
                                '        se letra == caractere:',
                                '            retorna indice',
                                '        indice = indice + 1',
                                '    retorna -1',
                                'resultado = encontrar_indice("opa", "p")',
                                'escreva(resultado)',
                            ],
                            -1
                        );

                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('1');
                    });

                    describe('Dicionários', () => {
                        it('Iterando dicionários com duas variáveis usando o método itens()', async () => {
                            const retornoLexador = lexador.mapear(
                                [
                                    'dicionarioLegal = { "a": 1, "b": 2, "c": 3 }',
                                    'para cada chave, valor em dicionarioLegal.itens():',
                                    '    escreva(chave, valor)'
                                ],
                                -1
                            );

                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                                retornoLexador,
                                -1
                            );

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            expect(_saidas).toHaveLength(3);
                            expect(_saidas[0]).toBe('a 1');
                            expect(_saidas[1]).toBe('b 2');
                            expect(_saidas[2]).toBe('c 3');
                        });

                        it('Iterando dicionários com duas variáveis', async () => {
                            const retornoLexador = lexador.mapear(
                                [
                                    'dicionarioLegal = { "a": 1, "b": 2, "c": 3 }',
                                    'para cada chave, valor em dicionarioLegal:',
                                    '    escreva(chave, valor)'
                                ],
                                -1
                            );

                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                                retornoLexador,
                                -1
                            );

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            expect(_saidas).toHaveLength(3);
                            expect(_saidas[0]).toBe('a 1');
                            expect(_saidas[1]).toBe('b 2');
                            expect(_saidas[2]).toBe('c 3');
                        });

                        it('Iterando dicionários com uma variável', async () => {
                            const retornoLexador = lexador.mapear(
                                [
                                    'dicionarioLegal = { "a": 1, "b": 2, "c": 3 }',
                                    'para cada chaveValor em dicionarioLegal:',
                                    '    escreva(chaveValor)'
                                ],
                                -1
                            );

                            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                                retornoLexador,
                                -1
                            );

                            const retornoInterpretador = await interpretador.interpretar(
                                retornoAvaliadorSintatico.declaracoes,
                                true
                            );

                            expect(retornoInterpretador.erros).toHaveLength(0);
                            expect(_saidas).toHaveLength(3);
                            expect(_saidas[0]).toBe('("a", 1)');
                            expect(_saidas[1]).toBe('("b", 2)');
                            expect(_saidas[2]).toBe('("c", 3)');
                        });
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
                        await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

                it('Classes - declaração de propriedades', async () => {
                    const codigo = [
                        'classe Animal:',
                        '    construtor(nome, idade):',
                        '        isto.nome = nome',
                        '        isto.idade = idade',
                        '    função meuNome():',
                        '        escreva(isto.nome)',
                        '    função minhaIdade():',
                        '        escreva(isto.idade)',
                        'animalLegal = Animal("animal1", 10)',
                        'animalLegal.meuNome()',
                        'animalLegal.minhaIdade()',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('animal1');
                    expect(_saidas[1]).toBe('10');
                });

                it('Classes - Atributos de classe', async () => {
                    const codigo = [
                        'classe Carro:',
                        '    rodas = 4',
                        'carroRadical = Carro()',
                        'escreva(carroRadical.rodas)',
                        'carroRadical.rodas = 6',
                        'escreva(carroRadical.rodas)',
                        'Carro.rodas = 5',
                        'escreva(Carro.rodas)',
                        'escreva(carroRadical.rodas)'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(4);
                    expect(_saidas[0]).toBe('4');
                    expect(_saidas[1]).toBe('6');
                    expect(_saidas[2]).toBe('5');
                    expect(_saidas[3]).toBe('6');
                });

                it('Classes - decorador @propriedade', async () => {
                    const codigo = [
                        'classe Usuario:',
                        '    construtor(idade):',
                        '        isto.idade = idade',
                        '    @propriedade',
                        '    funcao idade():',
                        '        retorna isto.idadeUsuario',
                        '    @idade.definidor',
                        '    funcao idade(valor):',
                        '        se (valor < 0):',
                        '            escreva("Valor fornecido deve ser um número positivo.")',
                        '            retorna',
                        '        isto.idadeUsuario = valor',
                        'usuarioLegal = Usuario(21)',
                        'escreva(usuarioLegal.idade)',
                        'usuarioLegal.idade = 22',
                        'usuarioLegal.idade = -16'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('21');
                    expect(_saidas[1]).toBe('Valor fornecido deve ser um número positivo.');
                });
            });

            describe('Declaração e chamada de funções', () => {
                it('Corpo de função com nada (equivalente ao pass do Python)', async () => {
                    const codigo = [
                        'funcao bhaskara(a, b, c):',
                        '    nada',
                        'bhaskara(1, 2, 3)',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Trivial', async () => {
                    const codigo = ['funcao teste():', '    imprima("Teste")', 'teste()'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

                it('Função com múltiplos parâmetros retorna valor atribuído a variável', async () => {
                    const codigo = [
                        'funcao somar_com_varios_parametros(a, b, c):',
                        '    soma = a + b + c',
                        '    imprima(soma)',
                        '    retorna soma',
                        'soma = somar_com_varios_parametros(1, 1, 1)',
                        'imprima(f"soma: {soma}")',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(2);
                    expect(_saidas[0]).toBe('3');
                    expect(_saidas[1]).toBe('soma: 3');
                });

                it('Uso de funções de ordem superior', async () => {
                    const codigo = [
                        'vetor = [1, 2, 3]',
                        'fn = funcao(valor):',
                        '    retorna valor * 2',
                        'escreva(mapear(vetor, fn))',
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );

                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("[['a', 1], ['b', 2], ['c', 3]]");
                    });
                });
                describe('chaves', () => {
                    it('Trivial', async () => {
                        const codigo = [
                            "d = {'a': 1, 'b': 2, 'c': 3}",
                            'escreva(d.chaves())',
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe("['a', 'b', 'c']");
                    });
                });
                describe('remover', () => {
                    it('Trivial', async () => {
                        const codigo = [
                            "d = {'a': 1, 'b': 2, 'c': 3}",
                            "d.remover('b')",
                            'escreva(d)',
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('{"a":1,"c":3}');
                    })
                });
                describe('valores', () => {
                    it('Trivial', async () => {
                        const codigo = [
                            "d = {'a': 1, 'b': 2, 'c': 3}",
                            'escreva(d.valores())',
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador,
                            -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('[1, 2, 3]');
                    })
                });
                describe('contém e contem', () => {
                    it('Trivial', async () => {
                        const codigo = [
                            "d = {'a': 1, 'b': 2, 'c': 3}",
                            'escreva(d contém "a")',
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador, -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('verdadeiro');
                    })
                    it('Retornando falso quando a chave não existe', async () => {
                        const codigo = [
                            "d = {'x': 10, 'y': 20}",
                            'escreva(d contém "z")',
                        ];
                        const retornoLexador = lexador.mapear(codigo, -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                            retornoLexador, -1
                        );
                        const retornoInterpretador = await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );
                        expect(retornoInterpretador.erros).toHaveLength(0);
                        expect(_saidas).toHaveLength(1);
                        expect(_saidas[0]).toBe('falso');
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
            });

            describe('Formatação de strings com operador %', () => {
                it('Formatação com %s (string)', async () => {
                    const codigo = ['escreva("Olá %s" % "Mark")'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Olá Mark');
                });

                it('Formatação com %d (inteiro)', async () => {
                    const codigo = ['escreva("Idade: %d anos" % 25)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Idade: 25 anos');
                });

                it('Formatação com %d converte float para inteiro', async () => {
                    const codigo = ['escreva("Valor: %d" % 3.7)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Valor: 3');
                });

                it('Formatação com %f (flutuante)', async () => {
                    const codigo = ['escreva("Pi: %f" % 3.14159)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Pi: 3.14159');
                });

                it('Formatação com %.2f (flutuante com 2 casas decimais)', async () => {
                    const codigo = ['escreva("Preço: R$ %.2f" % 19.99)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Preço: R$ 19.99');
                });

                it('Formatação com %.4f (flutuante com 4 casas decimais)', async () => {
                    const codigo = ['escreva("Pi: %.4f" % 3.14159265)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Pi: 3.1416');
                });

                it('Formatação com %x (hexadecimal caixa baixa)', async () => {
                    const codigo = ['escreva("Hex: %x" % 255)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Hex: ff');
                });

                it('Formatação com %X (hexadecimal caixa alta)', async () => {
                    const codigo = ['escreva("Hex: %X" % 255)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Hex: FF');
                });

                it('Formatação com %o (octal)', async () => {
                    const codigo = ['escreva("Octal: %o" % 8)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Octal: 10');
                });

                it('Formatação com múltiplos valores usando tupla', async () => {
                    const codigo = ['escreva("Nome: %s, Idade: %d" % ("João", 30))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Nome: João, Idade: 30');
                });

                it('Formatação com múltiplos valores usando vetor', async () => {
                    const codigo = ['escreva("X: %d, Y: %d, Z: %d" % [10, 20, 30])'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('X: 10, Y: 20, Z: 30');
                });

                it('Formatação com %% (porcentagem literal)', async () => {
                    const codigo = ['escreva("Taxa: %d%%" % 15)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Taxa: 15%');
                });

                it('Formatação com variáveis', async () => {
                    const codigo = [
                        'nome = "Maria"',
                        'idade = 25',
                        'mensagem = "Olá, %s! Você tem %d anos." % (nome, idade)',
                        'escreva(mensagem)'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Olá, Maria! Você tem 25 anos.');
                });

                it('Erro: especificador desconhecido', async () => {
                    const codigo = ['escreva("Teste: %z" % 123)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.message).toContain('Especificador de formato desconhecido: %z');
                });

                it('Erro: valores insuficientes', async () => {
                    const codigo = ['escreva("Nome: %s, Idade: %d" % "João")'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.message).toContain('Argumentos insuficientes para a string de formatação');
                });

                it('Erro: valores em excesso', async () => {
                    const codigo = ['escreva("Nome: %s" % ("João", 30))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.message).toContain('Nem todos os argumentos foram convertidos durante a formatação da string.');
                });

                it('Operador % matemático ainda funciona com números', async () => {
                    const codigo = ['escreva(10 % 3)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('1');
                });
            });

            describe('Uso de primitivas de texto', () => {
                it('SE ternário', async () => {
                    const codigo = [
                        'a = 10',
                        'b = 20',
                        'maior = a se a > b senão b',
                        'escreva(maior)',
                    ];

                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

                it('Formatação de pontos flutuantes', async () => {
                    const retornoLexador = lexador.mapear([`
                        valor = 1234.56789
                        escreva(f"Duas casas decimais: {valor:.2f}")
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Duas casas decimais: 1234.57');
                });

                it('Formatação de moedas', async () => {
                    const retornoLexador = lexador.mapear([`
                        valor = 1000000
                        escreva(f"R\${valor:,.2f}")
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('R$1,000,000.00');
                });

                it('Formatação de percentuais', async () => {
                    const retornoLexador = lexador.mapear([`
                        percentual = 0.75
                        escreva(f"{percentual:.1%}")
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('75.0%');
                });

                it('Formatação de zero-padding', async () => {
                    const retornoLexador = lexador.mapear([`
                        n = 42
                        escreva(f"{n:05}")
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('00042');
                });

                it('Formatação de conversão de bases', async () => {
                    const retornoLexador = lexador.mapear([`
                        variavelLegal = 255
                        escreva(f"Hex: {variavelLegal:x}, Bin: {variavelLegal:b}")
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(1);
                    expect(_saidas[0]).toBe('Hex: ff, Bin: 11111111');
                });

                it('Alinhamento e preenchimento customizado', async () => {
                    const retornoLexador = lexador.mapear([`
                        txt = "oi"
                        escreva(f"|{txt:<10}|")
                        escreva(f"|{txt:^10}|")
                        escreva(f"|{txt:>10}|")
                        escreva(f"{txt:*^10}")
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBeGreaterThan(1);
                    expect(_saidas[0]).toBe('|oi        |');
                    expect(_saidas[1]).toBe('|    oi    |');
                    expect(_saidas[2]).toBe('|        oi|');
                    expect(_saidas[3]).toBe('****oi****');
                });

                it('Formatação de depuração rápida', async () => {
                    const retornoLexador = lexador.mapear([`
                        usuario = "admin"
                        tentativas = 3
                        escreva(f"{usuario=}, {tentativas=}")
                        escreva(f"{tentativas * 2 = }")
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas.length).toBeGreaterThan(1);
                    expect(_saidas[0]).toBe('usuario=\'admin\', tentativas=3');
                    expect(_saidas[1]).toBe('tentativas * 2 = 6');
                });
            });

            it('Formatação de ponto flutuante usando formatar()', async () => {
                const retornoLexador = lexador.mapear([`
                    valor = 1234.56789
                    escreva("Duas casas decimais: {:.2f}".formatar(valor))
                `], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Duas casas decimais: 1234.57')
            });

            describe('Tuplas', () => {
                it('Verifica se a exibição da tupla no terminal é entre parênteses ao invés de chaves', async () => {
                    const codigo = [
                        't = (10, 20, 30)',
                        'escreva(t)'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliador.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toEqual('20');
            });

            describe('Caracteres de Escape', () => {
                it('Deve interpretar quebra de linha (\\n) na saída', async () => {
                    const retornoLexador = lexador.mapear(['escreva("Linha 1\\nLinha 2")'], -1);
                    const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliador.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('Linha 1\nLinha 2');
                });

                it('Deve interpretar tabulação (\\t) em variável', async () => {
                    const retornoLexador = lexador.mapear([`
                        texto = "Coluna1\\tColuna2"
                        escreva(texto)
                    `], -1);
                    const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliador.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('Coluna1\tColuna2');
                });

                it('Deve interpretar aspas duplas escapadas (\\") sem quebrar a string', async () => {
                    const retornoLexador = lexador.mapear(['escreva("Ela disse: \\"Olá!\\"")'], -1);
                    const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliador.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('Ela disse: "Olá!"');
                });
            });

            describe('maximo()', () => {
                it('Deve retornar o vetor com os maiores elementos', async () => {
                    const codigo = ['escreva(maximo([[1, 2, 3], [4, 5, 6]]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('[4, 5, 6]');
                });

                it('Deve retornar o maior número em um vetor de inteiros positivos', async () => {
                    const codigo = ['escreva(maximo([1, 10, 5, 3]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('10');
                });

                it('Deve retornar o maior número em um vetor de números negativos', async () => {
                    const codigo = ['escreva(maximo([-5, -1, -20]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('-1');
                });

                it('Deve retornar o maior número em um vetor de reais (ponto flutuante)', async () => {
                    const codigo = ['escreva(maximo([2.5, 2.9, 2.1]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('2.9');
                });
            });

            describe('minimo()', () => {
                it('Deve retornar o vetor com os menores elementos', async () => {
                    const codigo = ['escreva(minimo([[1, 2, 3], [4, 5, 6]]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('[1, 2, 3]');
                });

                it('Deve retornar o menor número em um vetor de inteiros', async () => {
                    const codigo = ['escreva(minimo([5, 1, 10, 3]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('1');
                });

                it('Deve retornar o menor número em um vetor de números negativos', async () => {
                    const codigo = ['escreva(minimo([-5, -1, -20]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('-20');
                });

                it('Deve retornar o menor número em um vetor misto', async () => {
                    const codigo = ['escreva(minimo([10, 0, -5]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('-5');
                });
            });

            describe('somar()', () => {
                it('Deve somar corretamente números inteiros', async () => {
                    const codigo = ['escreva(somar([1, 2, 3]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('6');
                });

                it('Deve somar corretamente números reais', async () => {
                    const codigo = ['escreva(somar([1.5, 2.5]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('4');
                });

                it('Deve retornar 0 para um vetor vazio', async () => {
                    const codigo = ['escreva(somar([]))'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('0');
                });
            });

            describe('vetor.limpar()', () => {
                it('Limpar vetor usando o método vetor.limpar()', async () => {
                    const retornoLexador = lexador.mapear([`
                        vetor = [1, 2, 3]
                        vetor.limpar()
                        escreva(vetor);
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('[]');
                });

                it('Limpar um vetor que já está vazio', async () => {
                    const código = [
                        "vetor = []",
                        "vetor.limpar()",
                        "escreva(vetor)"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('[]');
                });

                it('Verificar se o vetor limpo pode receber novos itens após a limpeza', async () => {
                    const código = [
                        "vetor = [1, 2]",
                        "vetor.limpar()",
                        "vetor.adicionar(10)",
                        "escreva(vetor)"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('[10]');
                });
            });

            describe('vetor.contar()', () => {
                it('Contar ocorrências de elementos repetidos', async () => {
                    const retornoLexador = lexador.mapear([
                        "v = [1, 'a', 1, 'b', 1, 'a']",
                        "escreva(v.contar(1))",
                        "escreva(v.contar('a'))",
                        "escreva(v.contar('z'))"
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('3');
                    expect(_saidas[1]).toBe('2');
                    expect(_saidas[2]).toBe('0');
                });

                it('Contar elemento que não existe no vetor', async () => {
                    const código = [
                        "v = [1, 2, 3]",
                        "escreva(v.contar(99))"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('0');
                });

                it('Contar em um vetor vazio', async () => {
                    const código = [
                        "v = []",
                        "escreva(v.contar(1))"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('0');
                });
            });

            describe('vetor.estender()', () => {
                it('Estender vetor', async () => {
                    const retornoLexador = lexador.mapear([`
                        v1 = [1, 2]
                        v2 = [3, 4]
                        v1.estender(v2)
                        escreva(v1)
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('[1, 2, 3, 4]');
                });

                it('Estender usando múltiplos vetores (variádico)', async () => {
                    const código = [
                        "v1 = [1]",
                        "v1.estender([2], [3], [4])",
                        "escreva(v1)"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('[1, 2, 3, 4]');
                });

                it('Estender um vetor vazio com outro vetor', async () => {
                    const código = [
                        "v1 = []",
                        "v1.estender([1, 2])",
                        "escreva(v1)"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('[1, 2]');
                });

                it('Estender com um objeto literal', async () => {
                    const retornoLexador = lexador.mapear([`
                        v = [1]
                        v.estender({ 'a': 1 })
                        v.estender({ 'b': 2 })
                        escreva(v)
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe("[1, 'a', 'b']");
                });
            });

            describe('vetor.inserir()', () => {
                it('Inserir elemento no vetor', async () => {
                    const retornoLexador = lexador.mapear([`
                        vetor = [10, 30, 40]
                        vetor.inserir(1, 20)
                        escreva(vetor)
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('[10, 20, 30, 40]');
                });

                it('Inserir elemento no início (índice 0)', async () => {
                    const código = [
                        "vetor = [2, 3]",
                        "vetor.inserir(0, 1)",
                        "escreva(vetor)"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('[1, 2, 3]');
                });

                it('Inserir elemento no final do vetor usando o tamanho atual como índice', async () => {
                    const código = [
                        "vetor = [1, 2]",
                        "vetor.inserir(2, 3)",
                        "escreva(vetor)"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('[1, 2, 3]');
                });
            });

            describe('vetor.indice()', () => {
                it('Verificar índice de elemento', async () => {
                    const retornoLexador = lexador.mapear([`
                        vetor = [1, 2, 3, 4, 5]
                        escreva(vetor.indice(3))
                    `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('2');
                });

                it('Retornar -1 para elemento inexistente', async () => {
                    const código = [
                        "vetor = [1, 2, 3]",
                        "escreva(vetor.indice(50))"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('-1');
                });

                it('Retornar o índice da primeira ocorrência quando há duplicatas', async () => {
                    const código = [
                        "vetor = ['a', 'b', 'a', 'c']",
                        "escreva(vetor.indice('a'))"
                    ];
                    const retornoLexador = lexador.mapear(código, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('0');
                });
            });

            describe('arredondar()', () => {
                it('Arredondando número para duas casas decimais', async () => {
                    const codigo = [
                        "numeroLegal = 10.7561",
                        "escreva(arredondar(numeroLegal, 2))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('10.76');
                });

                it('Arredondando para o inteiro mais próximo', async () => {
                    const codigo = [
                        "numeroMuitoLegal = 10.75",
                        "escreva(arredondar(numeroMuitoLegal))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('11');
                });
            });

            it('Usando tipo() para saber o tipo de um dado', async () => {
                const codigo = [
                    "escreva(tipo(10))",
                    "escreva(tipo('olá'))",
                    "escreva(tipo([]))",
                    "escreva(tipo({ 'a': 10 }))"
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas[0]).toBe('número');
                expect(_saidas[1]).toBe('texto');
                expect(_saidas[2]).toBe('vetor');
                expect(_saidas[3]).toBe('dicionário');
            });

            describe('Primitivas de número - formatar()', () => {
                it('Trivial', async () => {
                    const codigo = [
                        'valor = 1234.56',
                        'escreva(valor.formatar())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('1.234,56');
                });

                it('Apenas parte inteira', async () => {
                    const codigo = [
                        'valor = 1234',
                        'escreva(valor.formatar())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('1.234,00');
                });

                it('Apenas parte decimal', async () => {
                    const codigo = [
                        'valor = 0.56',
                        'escreva(valor.formatar())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('0,56');
                });

                it('Com casas decimais personalizadas', async () => {
                    const codigo = [
                        'valor = 1234.56789',
                        'opcoes = { "maximoCasasDecimais": 3 }',
                        'escreva(valor.formatar(opcoes))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('1.234,568');
                });

                it('Com casas decimais igual a zero', async () => {
                    const codigo = [
                        'valor = 1234.56',
                        'opcoes = { "casasDecimais": 0 }',
                        'escreva(valor.formatar(opcoes))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('1.234,56');
                });

                it('Número zero', async () => {
                    const codigo = [
                        'valor = 0',
                        'escreva(valor.formatar())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('0,00');
                });

                it('Número muito pequeno', async () => {
                    const codigo = [
                        'valor = 0.001',
                        'escreva(valor.formatar())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('0,00');
                });

                it('Número muito grande', async () => {
                    const codigo = [
                        'valor = 999999999.99',
                        'escreva(valor.formatar())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('999.999.999,99');
                });


                it('Com casasDecimais e maximoCasasDecimais diferentes', async () => {
                    const codigo = [
                        'valor = 1234.5',
                        'opcoes = { "casasDecimais": 1, "maximoCasasDecimais": 4 }',
                        'escreva(valor.formatar(opcoes))'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('1.234,5');
                });
                describe('todos()', () => {
                    it('Chama a função nativa "todos()" com iterável de dados Truly', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'listaDeNumeros = [1, "Pituguês", verdadeiro]',
                                'escreva(todos(listaDeNumeros))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('verdadeiro');
                    });

                    it('Chama a função nativa "todos()" com um objeto', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'objetoLegal = { 1: "a", 2: "b", 3: "c" }',
                                'escreva(todos(objetoLegal))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('verdadeiro');
                    });

                    it('Chama a função nativa "todos()" com um dicionário', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'objetoLegal = { 1: "a", 2: "b", 3: "c" }',
                                'escreva(todos(objetoLegal))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('verdadeiro');
                    });

                    it('Chama a função nativa "todos()" com iterável de dados Falsy', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'listaDeNumeros = [0, "", nulo, falso]',
                                'escreva(todos(listaDeNumeros))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('falso');
                    });
                });

                describe('todos_em_condicao()', () => {
                    it('Chama a função nativa "todos_em_condicao()" para verificar se os elementos do array são par.', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'listaDeNumeros = [1, 2, 3, 4, 5]',
                                'funcao eh_par(valor):',
                                '    retorna valor % 2 == 0',
                                'escreva(todos_em_condicao(listaDeNumeros, eh_par))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(
                            retornoAvaliadorSintatico.declaracoes
                        );

                        expect(_saida).toBe('falso');
                    });

                    it('Chama a função nativa "todos_em_condicao()" para verificar se todos os nomes começam com "V"', async () => {
                        let _saida: string = '';

                        const retornoLexador = lexador.mapear(
                            [
                                'listaDeNomes = ["Victor", "Verônica", "Vanessa"]',
                                'funcao verificar_nomes(nome):',
                                '    retorna nome[0] == "V"',
                                'escreva(todos_em_condicao(listaDeNomes, verificar_nomes))'
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        interpretador.funcaoDeRetorno = (saida: any) => {
                            _saida = saida;
                        };

                        await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                        expect(_saida).toBeTruthy();
                        expect(_saida).toBe('verdadeiro');
                    });
                });
            });

            it('Suporta o uso de Decoradores utilizando função anônima', async () => {
                const codigo = [
                    'função de decorador meu_decorador(decorado):',
                    '   retorna funcao():',
                    '       escreva("Antes")',
                    '       decorado()',
                    '       escreva("Depois")',
                    '',
                    '@meu_decorador',
                    'função ola_mundo():',
                    '   escreva("Olá, Mundo!")',
                    '',
                    'ola_mundo()'
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliador = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliador.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toEqual(['Antes', 'Olá, Mundo!', 'Depois']);
            });

            it('Suporta o uso de Decoradores usando função nomeada', async () => {
                const codigo = [
                    'função de decorador meu_decorador(decorado):',
                    '   funcao envelope():',
                    '       escreva("Antes")',
                    '       decorado()',
                    '       escreva("Depois")',
                    '',
                    '   retorna envelope',
                    '',
                    '@meu_decorador',
                    'função ola_mundo():',
                    '   escreva("Olá, Mundo!")',
                    '',
                    'ola_mundo()'
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliador = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliador.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toEqual(['Antes', 'Olá, Mundo!', 'Depois']);
            });

            it('aleatorio_entre()', async () => {
                const codigo = [
                    'numero_aleatorio = aleatorio_entre(1, 9)',
                    'escreva(numero_aleatorio)'
                ];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliador = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliador.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);

                const resultado = Number(_saidas[0]);

                expect(resultado).toBeGreaterThanOrEqual(1);
                expect(resultado).toBeLessThanOrEqual(9);
            });

            describe('Operador Morsa (:=)', () => {
                it('Deve retornar valor atribuído a uma variável para a expressão', async () => {
                    const codigo = [
                        'lista_de_linguagens = ["Delégua", "Pituguês"]',
                        'se ((n := tamanho(lista_de_linguagens)) > 1):',
                        '    escreva("Você é um programador muito bom!")',
                        'escreva(n)'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliador = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliador.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('Você é um programador muito bom!');
                    expect(_saidas[1]).toBe('2');
                });
            });

            describe('Operador Bote (~>)', () => {
                it('Deve retornar quantidade de caracteres no nome', async () => {
                    const codigo = [
                        'resultado = "victor" ~> tamanho() ~> texto()',
                        'escreva(resultado)'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliador = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );
                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliador.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas[0]).toBe('6');
                });
            });

            describe('iteravel', () => {
                it('Deve extrair elementos de um Array nativo do JavaScript', () => {
                    const iteravel = new Iteravel([1, 2, 3]);

                    expect(iteravel.elementos).toEqual([1, 2, 3]);
                });

                it('Deve extrair elementos de uma String (Texto nativo)', () => {
                    const iteravel = new Iteravel('Pituguês');
                    expect(iteravel.elementos).toEqual(
                        ['P', 'i', 't', 'u', 'g', 'u', 'ê', 's']
                    );
                });

                it('Deve extrair elementos de um Construto Vetor', () => {
                    const mockVetor = {
                        valores: ['A', 'B', 'C']
                    };
                    const iteravel = new Iteravel(mockVetor);

                    expect(iteravel.elementos).toEqual(['A', 'B', 'C']);
                });

                it('Deve extrair elementos de um Construto Tupla', () => {
                    const mockVetor = {
                        elementos: ['A', 'B', 'C']
                    };
                    const iteravel = new Iteravel(mockVetor);

                    expect(iteravel.elementos).toEqual(['A', 'B', 'C']);
                });

                it('Deve extrair elementos em pares [chave, valor] de um Construto Dicionário', () => {
                    const mockDicionario = {
                        chaves: ['usuario', 'linguagem'],
                        valores: ['Victor', 'Pituguês']
                    };
                    const iteravel = new Iteravel(mockDicionario);
                    const esperado = [
                        ['usuario', 'Victor'],
                        ['linguagem', 'Pituguês']
                    ];

                    expect(iteravel.elementos).toEqual(esperado);
                });

                it('Deve extrair valores de um objeto puro nativo do JavaScript', () => {
                    const mockObjeto = { a: 100, b: 200 };
                    const iteravel = new Iteravel(mockObjeto);

                    expect(iteravel.elementos).toEqual([100, 200]);
                });

                it('Deve retornar um array vazio se receber um dado inválido ou não iterável', () => {
                    const iteravelNumerico = new Iteravel(42);
                    const iteravelNulo = new Iteravel(null);

                    expect(iteravelNumerico.elementos).toEqual([]);
                    expect(iteravelNulo.elementos).toEqual([]);
                });
            });
        });

        it('termina_com - sufixo encontrado no final', async () => {
            const codigo = [
                't = "Olá, bem-vindo ao meu mundo."',
                'escreva(t.termina_com("."))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

        it('Suporta decimal iniciado por ponto em nova linha', async () => {
            const codigo = [
                'numeroLegal = 1',
                '.50 + 2',
                'escreva(numeroLegal)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('1');
        });

        describe('Cenários de falha', () => {
            describe('Tipagem explícita', () => {
                it('Erro ao atribuir número a variável do tipo texto', async () => {
                    const retornoLexador = lexador.mapear([
                        'nome: texto = "Fernando"',
                        'nome = 10',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        "Variável 'nome' é do tipo 'texto' e não pode receber um valor do tipo 'número'."
                    );
                });

                it('Erro ao atribuir texto a variável do tipo inteiro', async () => {
                    const retornoLexador = lexador.mapear([
                        'idade: inteiro = 25',
                        'idade = "vinte"',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros).toHaveLength(1);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe(
                        "Variável 'idade' é do tipo 'inteiro' e não pode receber um valor do tipo 'texto'."
                    );
                });
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', async () => {
                    const retornoLexador = lexador.mapear(['a = [1, 2, 3]\nescreva(a[4])'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

                it('Tentativa de formatar uma string como ponto flutuante', async () => {
                    const retornoLexador = lexador.mapear([`
                    valor = "estudante"
                    escreva(f"{valor:.2f}")
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Variável não definida dentro da f-string', async () => {
                    const retornoLexador = lexador.mapear([`
                    escreva(f"O resultado é: {resultado_fantasma:.2f}")
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            it('Tentativa de formatação de ponto flutuante usando formatar() com valor string', async () => {
                const retornoLexador = lexador.mapear([`
                valor = "1234.56789"
                escreva("Duas casas decimais: {:.2f}".formatar(valor))
            `], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
            });

            it('Deve dar erro ao tentar alterar valor de uma tupla (Imutabilidade)', async () => {
                const retornoLexador = lexador.mapear([`
                t = (1, 2, 3)
                t[0] = 999
            `], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                it('Erro em transformar vetor para vetor', async () => {
                    const retornoLexador = lexador.mapear([`
                    vetor_muito_legal = [1, 2, 3]
                    vetor = vetor(vetor_muito_legal)
                    escreva(vetor);
                `], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    tupla_muito_legal = (1, 2, 3)
                    tupla = tupla(tupla_muito_legal)
                    escreva(tupla);
                `], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

            describe('paraTupla() e paraVetor()', () => {
                it('Erro em transformar vetor para vetor usando paraVetor()', async () => {
                    const retornoLexador = lexador.mapear([`
                    vetor_muito_legal = [1, 2, 3]
                    vetor = vetor_muito_legal.paraVetor()
                    escreva(vetor);
                `], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes,
                        true
                    );

                    expect(retornoInterpretador.erros).toHaveLength(1);
                });

                it('Erro em transformar tupla para tupla usando paraTupla()', async () => {
                    const retornoLexador = lexador.mapear([`
                    tupla_muito_legal = (1, 2, 3)
                    tupla = tupla_muito_legal.paraTupla()
                    escreva(tupla);
                `], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
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

                const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliador.erros).toHaveLength(1);
                expect(retornoAvaliador.erros[0].message).toBe('Tarefa de atribuição inválida');
            });

            it('Deve falhar ao tentar atualizar variável não definida (Runtime Error)', async () => {
                const retornoLexador = lexador.mapear([`
                x += 10
            `], -1);

                const retornoAvaliador = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliador.erros.length).toBeGreaterThan(0);
            });

            describe('maximo()', () => {
                it('Deve falhar ao passar um argumento que não é vetor', async () => {
                    const codigo = ['maximo(123)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('deve ser um vetor');
                });

                it('Deve falhar ao passar um vetor vazio', async () => {
                    const codigo = ['maximo([])'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('não pode estar vazio');
                });

                it('Deve falhar ao tentar comparar tipos incomparáveis dentro do vetor', async () => {
                    const codigo = ['maximo([1, [2]])']; // Comparar número com vetor
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('Não é possível comparar elementos');
                });
            });

            describe('minimo()', () => {
                it('Deve falhar ao passar um argumento que não é vetor', async () => {
                    const codigo = ['minimo("texto")'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('deve ser um vetor');
                });

                it('Deve falhar ao passar um vetor vazio', async () => {
                    const codigo = ['minimo([])'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('não pode estar vazio');
                });

                it('Deve falhar com tipos incompatíveis para comparação', async () => {
                    const codigo = ['minimo([1, "a"])'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('somar()', () => {
                it('Deve falhar ao passar um argumento que não é vetor', async () => {
                    const codigo = ['somar(123)'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('deve ser um vetor');
                });

                it('Deve falhar se o vetor contiver textos', async () => {
                    const codigo = ['somar([1, "2"])'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('aceita apenas vetores contendo números');
                });

                it('Deve falhar se o vetor contiver booleanos', async () => {
                    const codigo = ['somar([1, verdadeiro])'];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain('aceita apenas vetores contendo números');
                });
            });

            describe('vetor.limpar()', () => {
                it('Falha - Tentar limpar uma variável que não é um vetor (ex: número)', async () => {
                    const retornoLexador = lexador.mapear([`
                    numero = 10
                    numero.limpar()
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.message).toContain("não encontrado");
                });

                it('Falha - Tentar limpar um vetor nulo', async () => {
                    const retornoLexador = lexador.mapear([`
                    v = nulo
                    v.limpar()
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('vetor.contar()', () => {
                it('Falha - Chamar contar() sem passar o argumento do elemento', async () => {
                    const retornoLexador = lexador.mapear([`
                    v = [1, 2]
                    escreva(v.contar())
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Falha - Passar mais argumentos do que o esperado (deve ignorar ou falhar)', async () => {
                    const retornoLexador = lexador.mapear([`
                    v = [1, 2]
                    escreva(v.contar(1, 2, 3))
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('vetor.estender()', () => {
                it('Falha - Tentar estender com um valor booleano', async () => {
                    const retornoLexador = lexador.mapear([`
                    v = [1]
                    v.estender(verdadeiro)
                    escreva(v)
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Falha - Estender com nulo', async () => {
                    const retornoLexador = lexador.mapear([`
                    v = [1]
                    v.estender(nulo)
                    escreva(v)
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('vetor.inserir()', () => {
                it('Falha - Inserir passando texto no lugar do índice', async () => {
                    const retornoLexador = lexador.mapear([`
                    v = [1, 2]
                    v.inserir('texto', 10)
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Falha - Passar apenas um argumento (faltando o elemento)', async () => {
                    const codigo = ["v = [1, 2]", "v.inserir(0)"];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Falha - Índice muito negativo (fora da realidade do vetor)', async () => {
                    const retornoLexador = lexador.mapear([`
                    v = [1, 2]
                    v.inserir(-999, 0)
                    escreva(v)
                `], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });
            });

            describe('vetor.indice()', () => {
                it('Falha - Chamar sem argumentos', async () => {
                    const codigo = ["v = [1, 2]", "v.indice()"];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Falha - Chamar em um dicionário (objeto)', async () => {
                    const codigo = ["d = { 'chave': 'valor' }", "d.indice('valor')"];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Falha - Argumento nulo para busca', async () => {
                    const codigo = ["v = [1, 2]", "escreva(v.indice(nulo))"];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(_saidas[0]).toBe('-1');
                });
            });

            describe('arredondar()', () => {
                it('Falha - Arredondando texto', async () => {
                    const codigo = [
                        "numeroLegal = 'olá'",
                        "escreva(arredondar(numeroLegal, 2))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Falha - Não informou o número a ser arredondado', async () => {
                    const codigo = [
                        "numeroLegal = 10",
                        "escreva(arredondar(, 2))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });

            it('Lançando erro quando a divisão de um número é por zero', async () => {
                const codigo = ["escreva(10 / 0)"];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                expect(retornoInterpretador.erros).toHaveLength(1);
                expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe('Divisão por zero não é permitida.');
            });

            it('Lançando erro quando a divisão inteira de um número é por zero', async () => {
                const codigo = ["escreva(10 // 0)"];
                const retornoLexador = lexador.mapear(codigo, -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, true);

                expect(retornoInterpretador.erros).toHaveLength(1);
                expect(retornoInterpretador.erros[0].erroInterno.mensagem).toBe('Divisão por zero não é permitida.');
            });

            describe('todos()', () => {
                it('Chama a função nativa "todos()" passando dados que não são iteráveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'listaDeNumeros = 67',
                            'escreva(todos(listaDeNumeros))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain(
                        'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
                    );
                });
            });

            describe('todos_em_condicao()', () => {
                it('Chama a função nativa "todos_em_condicao()" passando dados que não são iteráveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'listaDeNumeros = 67',
                            'funcao eh_par(valor):',
                            '    retorna valor % 2 == 0',
                            'escreva(todos_em_condicao(listaDeNumeros, eh_par))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                    expect(retornoInterpretador.erros[0].erroInterno.mensagem).toContain(
                        'Parâmetro inválido. O primeiro parâmetro deve ser um iterável.'
                    );
                });
            });
        });

        describe('Métodos de primitivas com dependência no interpretador', () => {
            describe('Números', () => {
                it('absoluto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'imprima(-5.absoluto())',
                            'imprima(3.absoluto())',
                            'imprima(0.absoluto())',
                            'imprima(-6.absoluto())',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    const retornoInterpretador = await interpretador.interpretar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(4);
                    expect(_saidas[0]).toBe('5');
                    expect(_saidas[1]).toBe('3');
                    expect(_saidas[2]).toBe('0');
                    expect(_saidas[3]).toBe('6');
                });
            });
        });
    });
});