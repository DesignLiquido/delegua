import { Lexador, Simbolo } from "../../fontes/lexador";
import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';
import { TradutorAssemblyScript } from '../../fontes/tradutores/tradutor-assemblyscript';
import { Bloco, Escreva, Se } from "../../fontes/declaracoes";
import { Binario, Literal, Variavel } from "../../fontes/construtos";

describe('Tradutor Delégua -> AssemblyScript', () => {
    const tradutor: TradutorAssemblyScript = new TradutorAssemblyScript();

    describe('Programático', () => {
        it.skip('se -> if, programático', () => {
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
        })
    })
})