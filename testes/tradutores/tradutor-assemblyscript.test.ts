import { Lexador, Simbolo } from "../../fontes/lexador";
import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { TradutorAssemblyScript } from '../../fontes/tradutores/tradutor-assemblyscript';
import { Bloco, Escreva, Se } from "../../fontes/declaracoes";
import { Binario, Literal, TipoDe, Variavel } from "../../fontes/construtos";

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

describe('Tradutor Delégua -> AssemblyScript', () => {
    const tradutor: TradutorAssemblyScript = new TradutorAssemblyScript();

    describe('Programático', () => {
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
            expect(resultado).toMatch(/a == 1/i);
            expect(resultado).toMatch(/trace\(10\)/i);
        });
    })

    describe('Codigo', () => {
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
            expect(resultado).toMatch(/trace\("Olá, mundo!"\)/i);
        })

        describe('Variáveis', () => {
            it('var -> let -> inteiro -> i32', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: inteiro;',
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: i32;/i);
            })

            it('var -> let -> string -> string', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: texto = "teste"',
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: string = "teste"/i);
            })
            it('var -> sem inicializador -> sem tipo explícito gera erro', async () => {
                const retornoLexador = lexador.mapear([
                    'var a;'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                expect(() => {
                    tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                }).toThrow('não reconhecido');
            })
            it('constante -> const -> inteiro -> i32', async () => {
                const retornoLexador = lexador.mapear([
                    'constante a: inteiro = 1'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/const a: i32 = 1/i);
            })
            it('constante -> const -> string -> string', async () => {
                const retornoLexador = lexador.mapear([
                    'constante a: texto = "teste"',
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/const a: string = "teste"/i);
            });

            it('var -> let com tipo iniciado -> inteiro -> i32', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: inteiro = 1'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: i32 = 1/i);
            });

            it('var -> let com tipo iniciado -> string -> string', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: texto = "teste"'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, 1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/let a: string = "teste"/i);
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

            it('falhar - abort', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'falhar \"erro inesperado!\"',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/abort\('erro inesperado!'\)/i);
            });

            it('tipo de - typeof (erro)', async () => {
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

                expect(() => {
                    tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                }).toThrow('typeof não é suportado');
            });

            it('bit a bit', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'escreva(8 | 1)',
                        'escreva(8 & 1)',
                        'escreva(8 ^ 1)',
                        'escreva(~2)',
                        'var a: inteiro = 3',
                        'var c: inteiro = -a + 3'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toBeTruthy();
                expect(resultado).toMatch(/trace\(8 \| 1\)/i);
                expect(resultado).toMatch(/trace\(8 & 1\)/i);
                expect(resultado).toMatch(/trace\(8 \^ 1\)/i);
                expect(resultado).toMatch(/trace\(~2\)/i);
                expect(resultado).toMatch(/let a: i32 = 3/i);
                expect(resultado).toMatch(/let c: i32 = -a \+ 3/i);
            });
        });

        it('definindo função com variável', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao minhaFuncao(parametro1: inteiro, parametro2: inteiro): inteiro { escreva(\'Oi\')\nescreva(\'Olá\') \n retorna 123 }',
                    'minhaFuncao(1, 2)'
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function minhaFuncao\(parametro1: i32, parametro2: i32\): i32/i);
            expect(resultado).toMatch(/trace\("Oi"\)/i);
            expect(resultado).toMatch(/trace\("Olá"\)/i);
            expect(resultado).toMatch(/minhaFuncao\(1, 2\)/i);
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

        describe('Fase 1: Correções Críticas', () => {
            it('escreva -> trace (não console.log)', async () => {
                const retornoLexador = lexador.mapear(['escreva("teste")'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('trace(');
                expect(resultado).not.toContain('console.log');
            });

            it('operadores de igualdade -> == e != (não === e !==)', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: inteiro = 5',
                    'var b: logico = a == 5',
                    'var c: logico = a != 3'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('a == 5');
                expect(resultado).toContain('a != 3');
                expect(resultado).not.toContain('===');
                expect(resultado).not.toContain('!==');
            });

            it('exponenciação -> Math.pow()', async () => {
                const retornoLexador = lexador.mapear(['var resultado: inteiro = 2 ** 3'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('Math.pow(2, 3)');
                expect(resultado).not.toContain('**');
            });

            it('ordem de operandos correta em expressões lógicas', async () => {
                const retornoLexador = lexador.mapear(['var resultado: logico = 5 > 3 e 10 < 20'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                // Verifica que a ordem é esquerda && direita, não direita && esquerda
                expect(resultado).toMatch(/5 > 3 && 10 < 20/);
            });

            it('falhar -> abort()', async () => {
                const retornoLexador = lexador.mapear(['falhar "Erro ocorreu"'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('abort(');
                expect(resultado).not.toContain('throw');
            });

            it('tente/pegue -> aviso sobre falta de suporte', async () => {
                const retornoLexador = lexador.mapear([
                    'tente {',
                    '    escreva("teste")',
                    '} pegue (erro) {',
                    '    escreva("erro")',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('AVISO: AssemblyScript não suporta try/catch/finally');
            });

            it('paraCada -> loop baseado em índice', async () => {
                const retornoLexador = lexador.mapear([
                    'var numeros: inteiro[] = [1, 2, 3]',
                    'para cada numero em numeros {',
                    '    escreva(numero)',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                
                // Verifica que não usa for...of
                expect(resultado).not.toContain('for (let numero of');
                // Verifica que tem o vetor temporário e loop baseado em índice
                expect(resultado).toContain('const __arr_numero');
                expect(resultado).toContain('.length');
            });

            it('tipo nulo -> erro', () => {
                expect(() => {
                    tradutor.resolveTipoDeclaracaoVarEContante('nulo');
                }).toThrow('nulo');
            });

            it('tipo desconhecido -> erro', () => {
                expect(() => {
                    tradutor.resolveTipoDeclaracaoVarEContante('tipo_inexistente');
                }).toThrow('não reconhecido');
            });

            it('typeof -> erro', () => {
                const tipoDe = new TipoDe(
                    -1, 
                    new Simbolo(tiposDeSimbolos.TIPO, 'tipoDe', null, 1, -1),
                    new Variavel(-1, new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'x', null, 1, -1))
                );
                expect(() => {
                    tradutor.traduzirConstrutoTipoDe(tipoDe);
                }).toThrow('typeof não é suportado');
            });
        });

        describe('Fase 2: Sistema de Tipos Completo', () => {
            it('inteiro -> i32', async () => {
                const retornoLexador = lexador.mapear(['var x: inteiro = 42'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('i32');
                expect(resultado).not.toContain('f64');
            });

            it('real -> f64', async () => {
                const retornoLexador = lexador.mapear(['var x: real = 3.14'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('f64');
            });

            it('função com parâmetros tipados', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao soma(a: inteiro, b: inteiro): inteiro {',
                    '    retorna a + b',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toMatch(/function soma\(a: i32, b: i32\): i32/i);
            });

            it('função sem retorno -> void', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao imprime(msg: texto) {',
                    '    escreva(msg)',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toMatch(/function imprime\(msg: string\): void/i);
            });

            it('tipo vazio explícito -> void', () => {
                const resultado = tradutor.resolveTipoDeclaracaoVarEContante('vazio');
                expect(resultado).toBe(': void');
            });

            it('longo -> i64', async () => {
                const retornoLexador = lexador.mapear(['var grande: longo = 1000000'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('i64');
            });

            it('array de inteiros -> i32[]', async () => {
                const retornoLexador = lexador.mapear(['var nums: inteiro[] = [1, 2, 3]'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('i32[]');
            });

            it('dicionário tipo -> Map<string, i32>', async () => {
                const retornoLexador = lexador.mapear(['var d: dicionario = {}'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('Map<string, i32>');
            });

            it('dicionário literal com valores', async () => {
                const retornoLexador = lexador.mapear(['var config = {"debug": 1, "port": 8080}'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('new Map<string, i32>()');
                expect(resultado).toContain('m.set("debug", 1)');
                expect(resultado).toContain('m.set("port", 8080)');
            });
        });

        describe('Fase 3: Tipos de Coleção', () => {
            it('dicionário vazio', async () => {
                const retornoLexador = lexador.mapear(['var empty = {}'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('Map<string, i32>');
            });

            it('dicionário com múltiplas entradas', async () => {
                const retornoLexador = lexador.mapear([
                    'var dados = {',
                    '  "a": 10,',
                    '  "b": 20,',
                    '  "c": 30',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('m.set("a", 10)');
                expect(resultado).toContain('m.set("b", 20)');
                expect(resultado).toContain('m.set("c", 30)');
            });
        });

        describe('Fase 5: Fluxo de Controle', () => {
            it('enquanto -> while', async () => {
                const retornoLexador = lexador.mapear([
                    'var i: inteiro = 0',
                    'enquanto (i < 10) {',
                    '    i = i + 1',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('while (');
                expect(resultado).toContain('i < 10');
                expect(resultado).not.toContain('enquanto');
            });

            it('para -> for', async () => {
                const retornoLexador = lexador.mapear([
                    'para (var i = 0; i < 10; i = i + 1) {',
                    '    escreva(i)',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('for (');
                expect(resultado).toContain('i < 10');
                expect(resultado).not.toContain('para (');
            });

            it('escolha -> switch/case com padrão', async () => {
                const retornoLexador = lexador.mapear([
                    'var x: inteiro = 1',
                    'escolha (x) {',
                    '    caso 1:',
                    '        escreva("um")',
                    '    caso 2:',
                    '        escreva("dois")',
                    '    padrao:',
                    '        escreva("outro")',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('switch (');
                expect(resultado).toContain('case');
                expect(resultado).toContain('break');
                expect(resultado).toContain('default:');
                expect(resultado).not.toContain('escolha');
            });

            it('fazer/enquanto -> do/while', async () => {
                const retornoLexador = lexador.mapear([
                    'var i: inteiro = 0',
                    'fazer { i = i + 1 } enquanto (i < 5)'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('do ');
                expect(resultado).toContain('while (');
                expect(resultado).toContain('i < 5');
                expect(resultado).not.toContain('fazer');
            });

            it('retorna -> return com expressão', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao soma(a: inteiro, b: inteiro): inteiro {',
                    '    retorna a + b',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('return ');
                expect(resultado).toContain('a + b');
                expect(resultado).not.toContain('retorna');
            });
        });

        describe('Fase 6: Expressões', () => {
            it('operador lógico ou -> ||', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: logico = verdadeiro',
                    'var b: logico = falso',
                    'var r: logico = a ou b'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('||');
                expect(resultado).not.toContain(' ou ');
            });

            it('operador ternário -> condição ? a : b', async () => {
                const retornoLexador = lexador.mapear([
                    'var x: inteiro = 5',
                    'var categoria: texto = x > 3 ? "grande" : "pequeno"'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toMatch(/x > 3 \? "grande" : "pequeno"/);
            });

            it('atribuição de variável -> x = valor', async () => {
                const retornoLexador = lexador.mapear([
                    'var x: inteiro = 0',
                    'x = 42'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('x = 42');
            });

            it('acesso a índice de vetor -> vetor[i]', async () => {
                const retornoLexador = lexador.mapear([
                    'var nums: inteiro[] = [1, 2, 3]',
                    'escreva(nums[1])'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('nums[1]');
            });

            it('atribuição por índice -> vetor[i] = valor', async () => {
                const retornoLexador = lexador.mapear([
                    'var nums: inteiro[] = [1, 2, 3]',
                    'nums[0] = 99'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('nums[0] = 99');
            });
        });

        describe('Fase 4: Tipos de Tupla', () => {
            it('dupla - 2 elementos', async () => {
                const retornoLexador = lexador.mapear(['var par = (1, 2)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1, 2]');
            });

            it('trio - 3 elementos', async () => {
                const retornoLexador = lexador.mapear(['var t = (1, 2, 3)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1, 2, 3]');
            });

            it('quarteto - 4 elementos', async () => {
                const retornoLexador = lexador.mapear(['var q = (10, 20, 30, 40)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[10, 20, 30, 40]');
            });

            it('quinteto - 5 elementos', async () => {
                const retornoLexador = lexador.mapear(['var q5 = (1, 2, 3, 4, 5)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1, 2, 3, 4, 5]');
            });

            it('sexteto - 6 elementos', async () => {
                const retornoLexador = lexador.mapear(['var s6 = (1, 2, 3, 4, 5, 6)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1, 2, 3, 4, 5, 6]');
            });

            it('septeto - 7 elementos', async () => {
                const retornoLexador = lexador.mapear(['var s7 = (1, 2, 3, 4, 5, 6, 7)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1, 2, 3, 4, 5, 6, 7]');
            });

            it('octeto - 8 elementos', async () => {
                const retornoLexador = lexador.mapear(['var o8 = (1, 2, 3, 4, 5, 6, 7, 8)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1, 2, 3, 4, 5, 6, 7, 8]');
            });

            it('noneto - 9 elementos', async () => {
                const retornoLexador = lexador.mapear(['var n9 = (1, 2, 3, 4, 5, 6, 7, 8, 9)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1, 2, 3, 4, 5, 6, 7, 8, 9]');
            });

            it('deceto - 10 elementos', async () => {
                const retornoLexador = lexador.mapear(['var d10 = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]');
            });
        });

        describe('Importações padrão', () => {
            it('escreva gera import "wasi" no início do arquivo', async () => {
                const retornoLexador = lexador.mapear(['escreva("Olá, mundo!")'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
                expect(resultado.indexOf('import "wasi";')).toBeLessThan(resultado.indexOf('trace('));
            });

            it('escreva dentro de função gera import "wasi" no início do arquivo', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao saudacao(): vazio {',
                    '    escreva("Olá!")',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
                expect(resultado.indexOf('import "wasi";')).toBeLessThan(resultado.indexOf('function'));
            });

            it('código sem escreva não gera imports desnecessários', async () => {
                const retornoLexador = lexador.mapear([
                    'var x: inteiro = 42',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).not.toContain('import');
            });

            it('escreva dentro de bloco se gera import "wasi"', async () => {
                const retornoLexador = lexador.mapear([
                    'var x: inteiro = 1',
                    'se (x == 1) {',
                    '    escreva("dentro do se")',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
            });
        });
    })
})
