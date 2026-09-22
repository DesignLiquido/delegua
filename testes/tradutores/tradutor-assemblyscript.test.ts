import { Lexador, Simbolo } from "../../fontes/lexador";
import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { TradutorAssemblyScript } from '../../fontes/tradutores/tradutor-assemblyscript';
import { Ajuda, Bloco, Const, ConstMultiplo, Escreva, EscrevaMesmaLinha, Expressao, Importar, Se, TendoComo, TextoDocumentacao, Var, VarMultiplo } from "../../fontes/declaracoes";
import { Binario, Elvis, ExpressaoRegular, Leia, Literal, Variavel, TipoDe } from "../../fontes/construtos";

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

        describe('traduzirFuncoesNativas', () => {
            it('métodos de array', () => {
                expect(tradutor.traduzirFuncoesNativas('adicionar')).toBe('push');
                expect(tradutor.traduzirFuncoesNativas('empilhar')).toBe('push');
                expect(tradutor.traduzirFuncoesNativas('concatenar')).toBe('concat');
                expect(tradutor.traduzirFuncoesNativas('fatiar')).toBe('slice');
                expect(tradutor.traduzirFuncoesNativas('inclui')).toBe('includes');
                expect(tradutor.traduzirFuncoesNativas('incluido')).toBe('includes');
                expect(tradutor.traduzirFuncoesNativas('inverter')).toBe('reverse');
                expect(tradutor.traduzirFuncoesNativas('juntar')).toBe('join');
                expect(tradutor.traduzirFuncoesNativas('ordenar')).toBe('sort');
                expect(tradutor.traduzirFuncoesNativas('removerprimeiro')).toBe('shift');
                expect(tradutor.traduzirFuncoesNativas('removerultimo')).toBe('pop');
                expect(tradutor.traduzirFuncoesNativas('tamanho')).toBe('length');
                expect(tradutor.traduzirFuncoesNativas('indice')).toBe('indexOf');
                expect(tradutor.traduzirFuncoesNativas('indiceode')).toBe('indexOf');
            });

            it('métodos de string', () => {
                expect(tradutor.traduzirFuncoesNativas('maiusculo')).toBe('toUpperCase');
                expect(tradutor.traduzirFuncoesNativas('minusculo')).toBe('toLowerCase');
                expect(tradutor.traduzirFuncoesNativas('substituir')).toBe('replace');
                expect(tradutor.traduzirFuncoesNativas('trimcomeco')).toBe('trimStart');
                expect(tradutor.traduzirFuncoesNativas('trimfim')).toBe('trimEnd');
                expect(tradutor.traduzirFuncoesNativas('trim')).toBe('trim');
                expect(tradutor.traduzirFuncoesNativas('comeca')).toBe('startsWith');
                expect(tradutor.traduzirFuncoesNativas('termina')).toBe('endsWith');
                expect(tradutor.traduzirFuncoesNativas('contem')).toBe('includes');
                expect(tradutor.traduzirFuncoesNativas('contém')).toBe('includes');
            });

            it('funções matemáticas', () => {
                expect(tradutor.traduzirFuncoesNativas('abs')).toBe('Math.abs');
                expect(tradutor.traduzirFuncoesNativas('absoluto')).toBe('Math.abs');
                expect(tradutor.traduzirFuncoesNativas('ceil')).toBe('Math.ceil');
                expect(tradutor.traduzirFuncoesNativas('teto')).toBe('Math.ceil');
                expect(tradutor.traduzirFuncoesNativas('floor')).toBe('Math.floor');
                expect(tradutor.traduzirFuncoesNativas('piso')).toBe('Math.floor');
                expect(tradutor.traduzirFuncoesNativas('round')).toBe('Math.round');
                expect(tradutor.traduzirFuncoesNativas('arredondar')).toBe('Math.round');
                expect(tradutor.traduzirFuncoesNativas('sqrt')).toBe('Math.sqrt');
                expect(tradutor.traduzirFuncoesNativas('raizquadrada')).toBe('Math.sqrt');
                expect(tradutor.traduzirFuncoesNativas('pow')).toBe('Math.pow');
                expect(tradutor.traduzirFuncoesNativas('potencia')).toBe('Math.pow');
                expect(tradutor.traduzirFuncoesNativas('max')).toBe('Math.max');
                expect(tradutor.traduzirFuncoesNativas('maximo')).toBe('Math.max');
                expect(tradutor.traduzirFuncoesNativas('min')).toBe('Math.min');
                expect(tradutor.traduzirFuncoesNativas('minimo')).toBe('Math.min');
                expect(tradutor.traduzirFuncoesNativas('sin')).toBe('Math.sin');
                expect(tradutor.traduzirFuncoesNativas('seno')).toBe('Math.sin');
                expect(tradutor.traduzirFuncoesNativas('cos')).toBe('Math.cos');
                expect(tradutor.traduzirFuncoesNativas('cosseno')).toBe('Math.cos');
                expect(tradutor.traduzirFuncoesNativas('tan')).toBe('Math.tan');
                expect(tradutor.traduzirFuncoesNativas('tangente')).toBe('Math.tan');
                expect(tradutor.traduzirFuncoesNativas('pi')).toBe('Math.PI');
                expect(tradutor.traduzirFuncoesNativas('e')).toBe('Math.E');
            });

            it('método desconhecido retorna o mesmo nome', () => {
                expect(tradutor.traduzirFuncoesNativas('minhaFuncao')).toBe('minhaFuncao');
            });
        });

        describe('traduzirFuncaoNativaGlobal', () => {
            it('aleatorio -> Math.random()', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('aleatorio', [])).toBe('Math.random()');
            });

            it('aleatorioEntre com 2 args -> fórmula aleatória', () => {
                const resultado = tradutor.traduzirFuncaoNativaGlobal('aleatorioEntre', ['1', '10']);
                expect(resultado).toContain('Math.random()');
                expect(resultado).toContain('1');
                expect(resultado).toContain('10');
            });

            it('aleatorioEntre com menos de 2 args -> null', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('aleatorioEntre', ['1'])).toBeNull();
            });

            it('arredondar -> Math.round()', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('arredondar', ['x'])).toBe('Math.round(x)');
                expect(tradutor.traduzirFuncaoNativaGlobal('arredondar', [])).toBeNull();
            });

            it('inteiro -> Math.trunc()', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('inteiro', ['x'])).toBe('Math.trunc(x)');
                expect(tradutor.traduzirFuncaoNativaGlobal('inteiro', [])).toBeNull();
            });

            it('numero -> Number()', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('numero', ['x'])).toBe('Number(x)');
            });

            it('texto -> String()', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('texto', ['x'])).toBe('String(x)');
            });

            it('longo -> parseInt()', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('longo', ['x'])).toBe('parseInt(x)');
            });

            it('real -> parseFloat()', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('real', ['x'])).toBe('parseFloat(x)');
            });

            it('tamanho -> .length', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('tamanho', ['arr'])).toBe('(arr).length');
            });

            it('intervalo com 2 args -> Array.from', () => {
                const resultado = tradutor.traduzirFuncaoNativaGlobal('intervalo', ['0', '10']);
                expect(resultado).toContain('Array.from');
                expect(resultado).toContain('0');
                expect(resultado).toContain('10');
            });

            it('intervalo com 3 args -> Array.from com passo', () => {
                const resultado = tradutor.traduzirFuncaoNativaGlobal('intervalo', ['0', '10', '2']);
                expect(resultado).toContain('Array.from');
                expect(resultado).toContain('2');
            });

            it('intervalo com 1 arg -> null', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('intervalo', ['0'])).toBeNull();
            });

            it('maximo -> Math.max(...spread)', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('maximo', ['arr'])).toBe('Math.max(...arr)');
            });

            it('minimo -> Math.min(...spread)', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('minimo', ['arr'])).toBe('Math.min(...arr)');
            });

            it('funções complexas (mapear etc.) -> null', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('mapear', [])).toBeNull();
                expect(tradutor.traduzirFuncaoNativaGlobal('filtrarPor', [])).toBeNull();
                expect(tradutor.traduzirFuncaoNativaGlobal('reduzir', [])).toBeNull();
            });

            it('função desconhecida -> null', () => {
                expect(tradutor.traduzirFuncaoNativaGlobal('funcaoDesconhecida', [])).toBeNull();
            });
        });

        describe('resolveTipoDeclaracaoVarEContante - tipos adicionais', () => {
            it('inteiro_curto/inteiroCurto -> i16', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('inteiro_curto')).toBe(': i16');
                expect(tradutor.resolveTipoDeclaracaoVarEContante('inteiroCurto')).toBe(': i16');
            });

            it('byte -> i8', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('byte')).toBe(': i8');
            });

            it('numero/número -> f64', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('numero')).toBe(': f64');
                expect(tradutor.resolveTipoDeclaracaoVarEContante('número')).toBe(': f64');
            });

            it('real_curto/realCurto -> f32', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('real_curto')).toBe(': f32');
                expect(tradutor.resolveTipoDeclaracaoVarEContante('realCurto')).toBe(': f32');
            });

            it('logico/lógico -> bool', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('logico')).toBe(': bool');
                expect(tradutor.resolveTipoDeclaracaoVarEContante('lógico')).toBe(': bool');
            });

            it('nada -> void', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('nada')).toBe(': void');
            });

            it('inteiro[] -> i32[]', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('inteiro[]')).toBe(': i32[]');
            });

            it('longo[] -> i64[]', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('longo[]')).toBe(': i64[]');
            });

            it('real[]/numero[]/número[] -> f64[]', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('real[]')).toBe(': f64[]');
                expect(tradutor.resolveTipoDeclaracaoVarEContante('numero[]')).toBe(': f64[]');
                expect(tradutor.resolveTipoDeclaracaoVarEContante('número[]')).toBe(': f64[]');
            });

            it('texto[] -> string[]', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('texto[]')).toBe(': string[]');
            });

            it('logico[]/lógico[] -> bool[]', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('logico[]')).toBe(': bool[]');
                expect(tradutor.resolveTipoDeclaracaoVarEContante('lógico[]')).toBe(': bool[]');
            });

            it('tipos de tupla -> i32[]', () => {
                for (const tipo of ['dupla', 'trio', 'quarteto', 'quinteto', 'sexteto', 'septeto', 'octeto', 'noneto', 'deceto', 'tupla']) {
                    expect(tradutor.resolveTipoDeclaracaoVarEContante(tipo)).toBe(': i32[]');
                }
            });

            it('dicionario/dicionário -> Map<string, i32>', () => {
                expect(tradutor.resolveTipoDeclaracaoVarEContante('dicionario')).toBe(': Map<string, i32>');
                expect(tradutor.resolveTipoDeclaracaoVarEContante('dicionário')).toBe(': Map<string, i32>');
            });
        });

        describe('Construtos e declarações programáticos', () => {
            it('EscrevaMesmaLinha -> trace()', () => {
                const decl = new EscrevaMesmaLinha(1, -1, [new Literal(-1, 1, 'Olá')]);
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('trace(');
                expect(resultado).toContain('"Olá"');
            });

            it('Ajuda -> comentário // ajuda', () => {
                const decl = new Ajuda(-1, 1);
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('// ajuda');
            });

            it('TextoDocumentacao -> comentário JSDoc', () => {
                const decl = new TextoDocumentacao(-1, 1, 'Documentação da função');
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('/**');
            });

            it('VarMultiplo -> let com múltiplos símbolos', () => {
                const simbolos = [
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'a', null, 1, -1),
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'b', null, 1, -1),
                ];
                const decl = new VarMultiplo(simbolos, new Literal(-1, 1, 0), 'inteiro');
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('let a, b: i32 = 0');
            });

            it('ConstMultiplo -> const com múltiplos símbolos', () => {
                const simbolos = [
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'x', null, 1, -1),
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'y', null, 1, -1),
                ];
                const decl = new ConstMultiplo(simbolos, new Literal(-1, 1, 1), 'inteiro');
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('const x, y: i32 = 1');
            });

            it('Elvis -> ||', () => {
                const elvis = new Elvis(
                    -1,
                    new Variavel(-1, new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'a', null, 1, -1)),
                    new Literal(-1, 1, 10)
                );
                const resultado = tradutor.dicionarioConstrutos['Elvis'](elvis);
                expect(resultado).toBe('a || 10');
            });

            it('ExpressaoRegular com string -> string entre aspas', () => {
                const regex = new ExpressaoRegular(
                    -1,
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'r', null, 1, -1),
                    '[a-z]+'
                );
                const resultado = tradutor.dicionarioConstrutos['ExpressaoRegular'](regex);
                expect(resultado).toBe('"[a-z]+"');
            });

            it('ExpressaoRegular com não-string -> String(valor)', () => {
                const regex = new ExpressaoRegular(
                    -1,
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'r', null, 1, -1),
                    42
                );
                const resultado = tradutor.dicionarioConstrutos['ExpressaoRegular'](regex);
                expect(resultado).toBe('42');
            });
        });

        describe('Fluxo de controle adicional', () => {
            it('tente com finally', async () => {
                const retornoLexador = lexador.mapear([
                    'tente {',
                    '    escreva("tente")',
                    '} pegue (erro) {',
                    '    escreva("pegue")',
                    '} finalmente {',
                    '    escreva("finalmente")',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('finally');
                expect(resultado).toContain('trace("finalmente")');
            });

            it('se com senão se (else if chain)', async () => {
                const retornoLexador = lexador.mapear([
                    'var x: inteiro = 5',
                    'se (x == 1) {',
                    '    escreva("um")',
                    '} senao se (x == 2) {',
                    '    escreva("dois")',
                    '} senao {',
                    '    escreva("outro")',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('else if (');
                expect(resultado).toContain('x == 2');
            });

            it('importar -> mensagem de não suporte', () => {
                const decl = new Importar(new Literal(-1, 1, 'modulo'));
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('importar() não é suportado');
            });

            it('leia -> mensagem de não suporte', () => {
                const decl = new Leia(
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'leia', null, 1, -1),
                    []
                );
                const resultado = tradutor.dicionarioDeclaracoes['Leia'](decl);
                expect(resultado).toContain('leia() não é suportado');
            });
        });

        describe('Classes', () => {
            it('classe simples', async () => {
                const retornoLexador = lexador.mapear([
                    'classe Animal {',
                    '    construtor() { }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('export class Animal');
                expect(resultado).toContain('constructor(');
            });

            it('classe com herança -> extends', async () => {
                const retornoLexador = lexador.mapear([
                    'classe Animal {',
                    '    construtor() { }',
                    '}',
                    'classe Cachorro herda Animal {',
                    '    construtor() { }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('extends Animal');
            });
        });

        describe('Comentários', () => {
            it('comentário multilinha -> /* ... */', async () => {
                const retornoLexador = lexador.mapear(['/*', 'comentário multilinha', '*/'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('/*');
                expect(resultado).toContain('*/');
            });
        });

        describe('Acesso a métodos nativos', () => {
            it('array.adicionar -> array.push', async () => {
                const retornoLexador = lexador.mapear([
                    'var nums: inteiro[] = [1, 2, 3]',
                    'nums.adicionar(4)'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('nums.push');
            });

            it('array.tamanho -> array.length', async () => {
                const retornoLexador = lexador.mapear([
                    'var nums: inteiro[] = [1, 2, 3]',
                    'escreva(nums.tamanho())'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('nums.length');
            });
        });

        describe('Operador Elvis', () => {
            it('nulo ?: valor -> || alternativo', async () => {
                const retornoLexador = lexador.mapear([
                    'var a: inteiro = 0',
                    'var b: inteiro = a ?: 10'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('||');
                expect(resultado).toContain('10');
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

        describe('Operadores binários adicionais', () => {
            it('subtração -> -', async () => {
                const retornoLexador = lexador.mapear(['var r: inteiro = 10 - 3'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('10 - 3');
            });

            it('divisão -> /', async () => {
                const retornoLexador = lexador.mapear(['var r: real = 10.0 / 2.0'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('10 / 2');
            });

            it('módulo -> %', async () => {
                const retornoLexador = lexador.mapear(['var r: inteiro = 10 % 3'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('10 % 3');
            });

            it('maior que -> >', async () => {
                const retornoLexador = lexador.mapear(['var r: logico = 5 > 3'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('5 > 3');
            });

            it('maior ou igual -> >=', async () => {
                const retornoLexador = lexador.mapear(['var r: logico = 5 >= 3'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('5 >= 3');
            });

            it('menor ou igual -> <=', async () => {
                const retornoLexador = lexador.mapear(['var r: logico = 3 <= 5'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('3 <= 5');
            });

            it('multiplicação -> *', async () => {
                const retornoLexador = lexador.mapear(['var r: inteiro = 4 * 5'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('4 * 5');
            });

            it('operador ou lógico -> ||', async () => {
                const retornoLexador = lexador.mapear(['var r: logico = verdadeiro ou falso'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('||');
            });

            it('expressão binária com agrupamento -> parênteses', async () => {
                const retornoLexador = lexador.mapear(['var r: inteiro = (2 + 3) * 4'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('(');
                expect(resultado).toContain('* 4');
            });
        });

        describe('Declarações de variáveis sem inicializador', () => {
            it('var sem inicializador com tipo -> only type annotation', async () => {
                const retornoLexador = lexador.mapear(['var x: inteiro;'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('let x: i32;');
            });

            it('constante sem inicializador com tipo -> only type annotation', async () => {
                const simbolo = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'PI', null, 1, -1);
                const decl = new Const(simbolo, null, 'real');
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('const PI: f64;');
            });
        });

        describe('TendoComo', () => {
            it('tendo como -> let com escopo', () => {
                const simboloVar = new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'arquivo', null, 1, -1);
                const inicializacao = new Literal(-1, 1, 'recurso.txt');
                const corpo = new Bloco(-1, 1, []);
                const decl = new TendoComo(1, -1, simboloVar, inicializacao, corpo);
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('// tendo arquivo como recurso');
                expect(resultado).toContain('let arquivo =');
                expect(resultado).toContain('"recurso.txt"');
            });
        });

        describe('EscrevaMesmaLinha como declaração', () => {
            it('escreva mesma linha -> trace()', async () => {
                const retornoLexador = lexador.mapear(['escreva("linha")'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('trace(');
                expect(resultado).toContain('"linha"');
            });
        });

        describe('Loop para com diferentes inicializadores', () => {
            it('para com var tipado -> for com let tipado', async () => {
                const retornoLexador = lexador.mapear([
                    'para (var i: inteiro = 0; i < 5; i = i + 1) {',
                    '    escreva(i)',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('for (');
                expect(resultado).toContain('i < 5');
            });
        });

        describe('Função com inferência de tipo de retorno', () => {
            it('função com corpo aninhado inferindo tipo de retorno', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao verificar(x: inteiro): logico {',
                    '    retorna x > 0',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('function verificar');
                expect(resultado).toContain(': bool');
            });

            it('função com retorno void explícito', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao nada(): vazio {',
                    '    var x: inteiro = 1',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain(': void');
            });
        });

        describe('Escolha com retorna no caso', () => {
            it('escolha com retorna nos casos -> switch com return', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao nomeNum(n: inteiro): texto {',
                    '    escolha (n) {',
                    '        caso 1:',
                    '            retorna "um"',
                    '        caso 2:',
                    '            retorna "dois"',
                    '        padrao:',
                    '            retorna "outro"',
                    '    }',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('switch (');
                expect(resultado).toContain('return');
                expect(resultado).toContain('default:');
            });
        });

        describe('Bloco como declaração', () => {
            it('bloco isolado -> bloco com chaves', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao f(): vazio {',
                    '    var x: inteiro = 1',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('{');
                expect(resultado).toContain('}');
            });
        });

        describe('VarMultiplo e ConstMultiplo sem inicializador', () => {
            it('VarMultiplo sem inicializador -> let com tipo', () => {
                const simbolos = [
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'a', null, 1, -1),
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'b', null, 1, -1),
                ];
                const decl = new VarMultiplo(simbolos, null, 'inteiro');
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('let a, b: i32;');
            });

            it('ConstMultiplo sem inicializador -> const com tipo', () => {
                const simbolos = [
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'x', null, 1, -1),
                    new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'y', null, 1, -1),
                ];
                const decl = new ConstMultiplo(simbolos, null, 'inteiro');
                const resultado = tradutor.traduzir([decl]);
                expect(resultado).toContain('const x, y: i32;');
            });
        });

        describe('Se com senão simples', () => {
            it('se sem senão -> apenas if', async () => {
                const retornoLexador = lexador.mapear([
                    'var x: inteiro = 5',
                    'se (x > 0) {',
                    '    escreva(x)',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('if (');
                expect(resultado).toContain('x > 0');
                expect(resultado).not.toContain('else');
            });

            it('se com senão -> if/else', async () => {
                const retornoLexador = lexador.mapear([
                    'var x: inteiro = 0',
                    'se (x > 0) {',
                    '    escreva("positivo")',
                    '} senao {',
                    '    escreva("zero ou negativo")',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('if (');
                expect(resultado).toContain('else');
                expect(resultado).toContain('trace("zero ou negativo")');
            });
        });

        describe('Retorna como declaração autônoma', () => {
            it('retorna valor inteiro -> return num', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao obterNumero(): inteiro {',
                    '    retorna 42',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('return 42');
            });
        });

        describe('ParaCada com corpo de expressões', () => {
            it('para cada com bloco de expressões', async () => {
                const retornoLexador = lexador.mapear([
                    'var items: inteiro[] = [10, 20, 30]',
                    'para cada item em items {',
                    '    escreva(item)',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('const __arr_item');
                expect(resultado).toContain('__i_item');
                expect(resultado).toContain('.length');
                expect(resultado).toContain('const item =');
            });
        });

        describe('Acesso a propriedade', () => {
            it('acesso a propriedade de objeto -> objeto.propriedade', async () => {
                const retornoLexador = lexador.mapear([
                    'var nums: inteiro[] = [1, 2, 3]',
                    'escreva(nums.tamanho)',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('nums.');
            });
        });

        describe('Vetor vazio e não-vazio', () => {
            it('vetor vazio -> []', async () => {
                const retornoLexador = lexador.mapear(['var v: inteiro[] = []'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[]');
            });

            it('vetor com valores -> [1, 2, 3]', async () => {
                const retornoLexador = lexador.mapear(['var v: inteiro[] = [1, 2, 3]'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('[1');
                expect(resultado).toContain('2');
                expect(resultado).toContain('3]');
            });
        });

        describe('Importações dentro de diferentes blocos', () => {
            it('escreva dentro de enquanto gera import wasi', async () => {
                const retornoLexador = lexador.mapear([
                    'var i: inteiro = 0',
                    'enquanto (i < 3) {',
                    '    escreva(i)',
                    '    i = i + 1',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
            });

            it('escreva dentro de para gera import wasi', async () => {
                const retornoLexador = lexador.mapear([
                    'para (var i: inteiro = 0; i < 3; i = i + 1) {',
                    '    escreva(i)',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
            });

            it('escreva dentro de fazer gera import wasi', async () => {
                const retornoLexador = lexador.mapear([
                    'var i: inteiro = 0',
                    'fazer { escreva(i) i = i + 1 } enquanto (i < 3)',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
            });

            it('escreva dentro de paraCada gera import wasi', async () => {
                const retornoLexador = lexador.mapear([
                    'var nums: inteiro[] = [1, 2]',
                    'para cada num em nums {',
                    '    escreva(num)',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
            });

            it('escreva dentro de classe gera import wasi', async () => {
                const retornoLexador = lexador.mapear([
                    'classe Animal {',
                    '    falar() { escreva("som") }',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
            });

            it('escreva dentro de tente gera import wasi', async () => {
                const retornoLexador = lexador.mapear([
                    'tente {',
                    '    escreva("tente")',
                    '} pegue (erro) {',
                    '    var x: inteiro = 0',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('import "wasi";');
            });
        });

        describe('Função sem parâmetros', () => {
            it('função sem parâmetros -> function sem args', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao saudacao(): texto {',
                    '    retorna "Olá"',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
                expect(resultado).toContain('function saudacao()');
                expect(resultado).toContain('return "Olá"');
            });
        });

        describe('traduzirSimboloOperador direto', () => {
            it('retorna operador de divisão', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.DIVISAO, '/', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('/');
            });

            it('retorna operador de módulo', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.MODULO, '%', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('%');
            });

            it('retorna operador de subtração', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.SUBTRACAO, '-', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('-');
            });

            it('retorna operador maior ou igual', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.MAIOR_IGUAL, '>=', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('>=');
            });

            it('retorna operador menor ou igual', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.MENOR_IGUAL, '<=', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('<=');
            });

            it('retorna operador ou lógico', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.OU, 'ou', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('||');
            });

            it('retorna operador diferente', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.DIFERENTE, '!=', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('!=');
            });

            it('retorna operador igual (atribuição)', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.IGUAL, '=', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('=');
            });

            it('retorna operador igual igual', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.IGUAL_IGUAL, '==', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('==');
            });

            it('retorna operador maior', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.MAIOR, '>', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('>');
            });

            it('retorna operador multiplicação', () => {
                const simbolo = new Simbolo(tiposDeSimbolos.MULTIPLICACAO, '*', null, 1, -1);
                expect(tradutor.traduzirSimboloOperador(simbolo)).toBe('*');
            });
        });
    })
})
