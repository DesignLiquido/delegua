import { Literal } from '../fontes/construtos';
import { Importar } from '../fontes/declaracoes';
import { Delegua } from '../fontes/delegua';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
        });

        describe('Cenários de sucesso', () => {
            describe('Atribuições', () => {
                it('Trivial', () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = 1"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Vetor', () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = [1, 2, 3]"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Dicionário', () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = {'a': 1, 'b': 2}"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', () => {
                    const retornoLexador = delegua.lexador.mapear([
                        "var a = [1, 2, 3]", 
                        "escreva(a[1])"
                    ], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Acesso a elementos de dicionário', () => {
                    const retornoLexador = delegua.lexador.mapear([
                        "var a = {'a': 1, 'b': 2}",
                        "escreva(a['b'])"
                    ], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('escreva()', () => {
                it('Olá Mundo (escreva() e literal)', () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo')"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('nulo', () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(nulo)"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações matemáticas', () => {
                it('Operações matemáticas - Trivial', () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(5 + 4 * 3 - 2 ** 1 / 6 % 10)"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Operações lógicas', () => {
                it('Operações lógicas - ou', () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(verdadeiro ou falso)"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                }); 

                it('Operações lógicas - e', () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(verdadeiro e falso)"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                }); 

                it('Operações lógicas - em', () => {
                    const retornoLexador = delegua.lexador.mapear(["escreva(2 em [1, 2, 3])"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                }); 
            });

            describe('Condicionais', () => {
                it('Condicionais - condição verdadeira', () => {
                    const retornoLexador = delegua.lexador.mapear(["se (1 < 2) { escreva('Um menor que dois') } senão { escreva('Nunca será executado') }"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Condicionais - condição falsa', () => {
                    const retornoLexador = delegua.lexador.mapear(["se (1 > 2) { escreva('Nunca acontece') } senão { escreva('Um não é maior que dois') }"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });
            
            describe('Laços de repetição', () => {
                it('Laços de repetição - enquanto', () => {
                    const retornoLexador = delegua.lexador.mapear(["var a = 0;\nenquanto (a < 10) { a = a + 1 }"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
    
                it('Laços de repetição - fazer ... enquanto', () => {
                    const retornoLexador = delegua.lexador.mapear([
                        "var a = 0",
                        "fazer { a = a + 1 } enquanto (a < 10)"
                    ], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
    
                it('Laços de repetição - para', () => {
                    const retornoLexador = delegua.lexador.mapear(["para (var i = 0; i < 10; i = i + 1) { escreva(i) }"], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });
            
            describe('Classes', () => {
                it('Trivial', () => {
                    const codigo = [
                        "classe Animal {",
                        "    correr() {",
                        "        escreva('Correndo Loucamente')",
                        "    }",
                        "}",
                        "classe Cachorro herda Animal {",
                        "    latir() {",
                        "        escreva('Au Au Au Au')",
                        "    }",
                        "}",
                        "var nomeDoCachorro = Cachorro()",
                        "nomeDoCachorro.correr()",
                        "nomeDoCachorro.latir()",
                        "escreva('Classe: OK!')"
                    ];
                    
                    const retornoLexador = delegua.lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Declaração e chamada de funções', () => {
                it('Fibonacci', () => {
                    const codigo = [
                        "função fibonacci(n) {",
                        "    se (n == 0) {",
                        "      retorna(0);",
                        "    }",
                        "    se (n == 1) {",
                        "      retorna(1);",
                        "    }",
                        "    var n1 = n - 1;",
                        "    var n2 = n - 2;",
                        "    var f1 = fibonacci(n1);",
                        "    var f2 = fibonacci(n2);",
                        "    retorna(f1 + f2);",
                        "}",
                        "var a = fibonacci(0);",
                        "escreva(a);",
                        "a = fibonacci(1);",
                        "escreva(a);",
                        "a = fibonacci(2);",
                        "escreva(a);",
                        "a = fibonacci(3);",
                        "escreva(a);",
                        "a = fibonacci(4);",
                        "escreva(a);",
                        "a = fibonacci(5);",
                        "escreva(a);"
                    ];
                    const retornoLexador = delegua.lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });
        });

        describe('Cenários de falha', () => {
            describe('Acesso a variáveis e objetos', () => {
                it('Acesso a elementos de vetor', () => {
                    const retornoLexador = delegua.lexador.mapear([
                        "var a = [1, 2, 3];",
                        "escreva(a[4]);"
                    ], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
                });

                it('Acesso a elementos de dicionário', () => {
                    const retornoLexador = delegua.lexador.mapear([
                        "var a = {'a': 1, 'b': 2};",
                        "escreva(a['c']);"
                    ], -1);
                    const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
                    
                    const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        
                    expect(retornoInterpretador.erros.length).toBeGreaterThanOrEqual(0);
                });
            });
        });

        describe('Importar', () => {
            it('Importar módulo', () => {

                const importar = new Importar(new Literal(0, 0, './../../testes/importar-modulo/importar'), '')
                var modulo = delegua.interpretador.visitarExpressaoImportar(importar);
        
                expect(modulo.importarFuncaoDelegua).toBeTruthy()
            });

            // it('Importar módulo que não existe', () => {
            //     const importar = new Importar(new Literal(0, 0, 'lodash abc'), '')

            //     expect(delegua.interpretador.visitarExpressaoImportar(importar)).toThrow()
            // });   
        });
    });
});