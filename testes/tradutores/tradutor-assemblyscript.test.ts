import { Lexador, Simbolo } from "../../fontes/lexador";
import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { TradutorAssemblyScript } from '../../fontes/tradutores/tradutor-assemblyscript';
import { Bloco, Escreva, Se } from "../../fontes/declaracoes";
import { Binario, Literal, Variavel } from "../../fontes/construtos";

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

describe('Tradutor Delégua -> AssemblyScript', async () => {
    const tradutor: TradutorAssemblyScript = new TradutorAssemblyScript();

    describe('Programático', async () => {
        it('se -> if, programático', async () => {
            const se = new Se(
                new Binario(
                    -1,
                    new Variavel(-1, new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'a', null, 1, -1)),
                    new Simbolo(tiposDeSimbolos.IGUAL_IGUAL, '', null, 1, -1),
                    new Literal(-1, 1, 1)
                ),
                new Bloco(-1, 1, [new Escreva(2, -1, [new Literal(-1, 1, 10)])]),
                null,
                null
            );
            const resultado = tradutor.traduzir([se]);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
        });
    })

    describe('Codigo', async () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
        })

        it('escreva -> console.log', async () => {
            const retornoLexador = lexador.mapear([
                'escreva("Olá, mundo!")',
            ], -1);

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/console\.log\('Olá, mundo!'\)/i);
        })

        describe('Variáveis', async () => {
            it('var -> let -> number -> f64', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: inteiro;',
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: f64;/i);
            })

            it('var -> let -> string -> string', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: texto = "teste"',
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: string = 'teste'/i);
            })
            it('var -> sem inicializador -> let', async () => {
                const retornoLexador = lexador.mapear([
                    'var a;'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: any;/i);
            })
            it('constante -> const -> number -> f64', async () => {
                const retornoLexador = lexador.mapear([
                    'constante a: inteiro = 1'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/const a: f64 = 1/i);
            })
            it('constante -> const -> string -> string', async () => {
                const retornoLexador = lexador.mapear([
                    'constante a: texto = "teste"',
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/const a: string = 'teste'/i);
            });

            it('var -> let com tipo iniciado -> number -> f64', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: inteiro = 1'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: f64 = 1/i);
            });

            it('var -> let com tipo iniciado -> string -> string', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: texto = "teste"'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: string = 'teste'/i);
            });

            it('var -> let com tipo iniciado -> real -> f64', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: real = 1.1'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: f64 = 1.1/i);
            });

            it('falhar - throw', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'falhar \"erro inesperado!\"',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/throw 'erro inesperado!'/i);
            });

            it('tipo de - typeof', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'escreva(tipo de 1)',
                        'escreva(tipo de \'2\')',
                        'escreva(tipo de nulo)',
                        'escreva(tipo de [1, 2, 3])'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/typeof 1/i);
                expect(resultado).toMatch(/typeof \'2\'/i);
                expect(resultado).toMatch(/typeof null/i);
                expect(resultado).toMatch(/typeof \[1, 2, 3\]/i);
            });

            it('bit a bit', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'escreva(8 | 1)',
                        'escreva(8 & 1)',
                        'escreva(8 ^ 1)',
                        'escreva(~2)',
                        'var a: inteiro = 3',
                        'var c = -a + 3'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/console\.log\(8 | 1\)/i);
                expect(resultado).toMatch(/console\.log\(8 & 1\)/i);
                expect(resultado).toMatch(/console\.log\(8 \^ 1\)/i);
                expect(resultado).toMatch(/console\.log\(~2\)/i);
                expect(resultado).toMatch(/let a: f64 = 3/i);
                expect(resultado).toMatch(/let c: f64 = -a \+ 3/i);
            });
        });

        it('definindo função com variável', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = funcao(parametro1: inteiro, parametro2: inteiro) { escreva(\'Oi\')\nescreva(\'Olá\') \n retorna 123 }',
                    'a(1, 2)'
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let a: any = function\(parametro1: f64, parametro2: f64\) {/i);
            expect(resultado).toMatch(/console\.log\('Oi'\)/i);
            expect(resultado).toMatch(/console\.log\('Olá'\)/i);
            expect(resultado).toMatch(/a\(1, 2\)/i);
        });

        it('Comentários', async () => {
            const retornoLexador = lexador.mapear(
                [
                    '// Isto é um comentário',
                    'escreva("Código após comentário.");'
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('// Isto é um comentário');
        });
    })
})
