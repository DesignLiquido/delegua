import { Lexador, Simbolo } from "../../fontes/lexador";
import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';
import { TradutorAssemblyScript } from '../../fontes/tradutores/tradutor-assemblyscript';
import { Bloco, Escreva, Se } from "../../fontes/declaracoes";
import { Binario, Literal, Variavel } from "../../fontes/construtos";

describe('Tradutor Delégua -> AssemblyScript', () => {
    const tradutor: TradutorAssemblyScript = new TradutorAssemblyScript();

    describe('Programático', () => {
        it('se -> if, programático', () => {
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

    describe('Codigo', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
        })

        it('escreva -> console.log', () => {
            const retornoLexador = lexador.mapear([
                'escreva("Olá, mundo!")',
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/console\.log\('Olá, mundo!'\)/i);
        })

        describe('Variáveis', () => {
            it('var -> let -> number -> f64', () => {
                const retornoLexador = lexador.mapear([
                    'var a = 1',
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: f64 = 1/i);
            })

            it('var -> let -> string -> string', () => {
                const retornoLexador = lexador.mapear([
                    'var a = "teste"',
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: string = 'teste'/i);
            })

            it.skip('var -> let -> BigInt -> i64', () => {
                const bigInt = BigInt(123456789012345678901234567890);

                const retornoLexador = lexador.mapear([
                    'var a = ' + bigInt,
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
            })

            it('var -> let -> boolean -> bool', () => {
                const retornoLexador = lexador.mapear([
                    'var a = verdadeiro'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: bool = true/i);
            })
            it('var -> sem inicializador -> let', () => {
                const retornoLexador = lexador.mapear([
                    'var a;'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a/i);
            })
            it('constante -> const -> number -> f64', () => {
                const retornoLexador = lexador.mapear([
                    'constante a = 1'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/const a: f64 = 1/i);
            })
            it('constante -> const -> string -> string', () => {
                const retornoLexador = lexador.mapear([
                    'constante a = "teste"',
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/const a: string = 'teste'/i);
            })

            it.skip('constante -> const -> BigInt -> i64', () => {
                const bigInt = BigInt(123456789012345678901234567890);

                const retornoLexador = lexador.mapear([
                    'constante a = ' + bigInt,
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
            })

            it('constante -> const -> boolean -> bool', () => {
                const retornoLexador = lexador.mapear([
                    'constante a = verdadeiro'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/const a: bool = true/i);
            })
            it.skip('constante -> sem inicializador -> const', () => {
                const retornoLexador = lexador.mapear([
                    'constante a;'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);

                expect(tradutor.traduzir(retornoAvaliadorSintatico.declaracoes)).toThrow()
            })
            it('var -> let com tipo iniciado -> number -> f64', () => {
                const retornoLexador = lexador.mapear([
                    'var a: inteiro = 1'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: f64 = 1/i);
            })
            it('var -> let com tipo iniciado -> string -> string', () => {
                const retornoLexador = lexador.mapear([
                    'var a: texto = "teste"'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: string = 'teste'/i);
            })
            it('var -> let com tipo iniciado -> real -> f64', () => {
                const retornoLexador = lexador.mapear([
                    'var a: real = 1.1'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: f64 = 1.1/i);
            })
            it('falhar - throw', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'falhar \"erro inesperado!\"',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/throw 'erro inesperado!'/i);
            });
            it('tipo de - typeof', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'escreva(tipo de 1)',
                        'escreva(tipo de \'2\')',
                        'escreva(tipo de nulo)',
                        'escreva(tipo de [1, 2, 3])',
                        // 'classe Cachorro {}',
                        // 'escreva(tipo de Cachorro)'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/typeof 1/i);
                expect(resultado).toMatch(/typeof \'2\'/i);
                expect(resultado).toMatch(/typeof null/i);
                expect(resultado).toMatch(/typeof \[1, 2, 3\]/i);
            });

            it('bit a bit', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'escreva(8 | 1)',
                        'escreva(8 & 1)',
                        'escreva(8 ^ 1)',
                        'escreva(~2)',
                        'var a = 3',
                        'var c = -a + 3'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/console\.log\(8 | 1\)/i);
                expect(resultado).toMatch(/console\.log\(8 & 1\)/i);
                expect(resultado).toMatch(/console\.log\(8 \^ 1\)/i);
                expect(resultado).toMatch(/console\.log\(~2\)/i);
                expect(resultado).toMatch(/let a: f64 = 3/i);
                expect(resultado).toMatch(/let c = -a \+ 3/i);
            });
            it.skip('vetor acesso indice -> array/index', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var vetor = [1, \'2\']',
                        'vetor[0] = 3',
                        'vetor[1] = vetor[0]'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let vetor: f64[] = \[1, \'2\'\];/i);
                expect(resultado).toMatch(/vetor\[0\] = 3/i);
                expect(resultado).toMatch(/vetor\[1\] = vetor\[0\]/i);
            });
            it('declarando variável const/constante/fixo', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'const a = 1;',
                        'constante b = 2;',
                        'fixo c = 3;',
                        'const d, f, g = 1, 2, 3'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/const a: f64 = 1;/i);
                expect(resultado).toMatch(/const b: f64 = 2;/i);
                expect(resultado).toMatch(/const c: f64 = 3;/i);
                expect(resultado).toMatch(/const d: f64 = 1;/i);
                expect(resultado).toMatch(/const f: f64 = 2;/i);
                expect(resultado).toMatch(/const g: f64 = 3;/i);
            });
            it.skip('definindo funcao com variavel', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var a = funcao(parametro1: inteiro, parametro2: inteiro) { escreva(\'Oi\')\nescreva(\'Olá\') }',
                        'a(1, 2)'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a = function\(parametro1, parametro2\) {/i);
                expect(resultado).toMatch(/console\.log\('Oi'\)/i);
                expect(resultado).toMatch(/console\.log\('Olá'\)/i);
                expect(resultado).toMatch(/a\(1, 2\)/i);
            });
        })

    })
})