import { LexadorPotigol } from "../../fontes/lexador/dialetos";
import { AvaliadorSintaticoPotigol } from "../../fontes/avaliador-sintatico/dialetos";
import { ErroAvaliadorSintatico } from "../../fontes/avaliador-sintatico/erro-avaliador-sintatico";

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let lexador = new LexadorPotigol();
        let avaliadorSintatico = new AvaliadorSintaticoPotigol();

        describe('Cenários de sucesso', () => {
            describe('Entrada e saída', () => {
                it('Sucesso - Escreva Olá Mundo', () => {
                    const retornoLexador = lexador.mapear(['escreva "Olá mundo"'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Imprima Olá Mundo', () => {
                    const retornoLexador = lexador.mapear(['imprima "Olá mundo"'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });

            describe('Operações matemáticas', () => {
                it('Sucesso - 2 + 2', () => {
                    const retornoLexador = lexador.mapear(['escreva 2 + 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Operações encadeadas', () => {
                    const retornoLexador = lexador.mapear(['escreva (2 * 8) - (5 / 4 ^ 7)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Mod e Div', () => {
                    const retornoLexador = lexador.mapear(['escreva (100 mod 6 div 2)'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });
            
            describe('Operações lógicas', () => {
                it('Sucesso - Ou', () => {
                    const retornoLexador = lexador.mapear(['verdadeiro ou falso'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - E', () => {
                    const retornoLexador = lexador.mapear(['verdadeiro e falso'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Não (sem acento)', () => {
                    const retornoLexador = lexador.mapear(['nao verdadeiro'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Não (com acento)', () => {
                    const retornoLexador = lexador.mapear(['não verdadeiro'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Comparação de igualdade', () => {
                    const retornoLexador = lexador.mapear(['escreva 2 == 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Comparação de desigualdade', () => {
                    const retornoLexador = lexador.mapear(['escreva 2 <> 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Comparação de menor', () => {
                    const retornoLexador = lexador.mapear(['escreva 2 < 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Comparação de menor ou igual', () => {
                    const retornoLexador = lexador.mapear(['escreva 2 <= 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Comparação de maior', () => {
                    const retornoLexador = lexador.mapear(['escreva 2 > 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Comparação de maior ou igual', () => {
                    const retornoLexador = lexador.mapear(['escreva 2 >= 2'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });
            
            describe('Atribuição de variáveis', () => {
                it('Sucesso - Declaração de inteiro constante, inferência', () => {
                    const retornoLexador = lexador.mapear(['a = 10'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Declaração de inteiro variável, inferência', () => {
                    const retornoLexador = lexador.mapear(['var a := 10'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it('Sucesso - Declaração de múltiplas variáveis inteiras, inferência', () => {
                    const retornoLexador = lexador.mapear(['var a, b, c := 10, 20, 30'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
    
                it.skip('Sucesso - Declaração de caractere constante, dica de tipo', () => {
                    const retornoLexador = lexador.mapear(["c: Caractere = 'z'"], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it.skip('Sucesso - Declaração de inteiro constante, dica de tipo', () => {
                    const retornoLexador = lexador.mapear(['a: Inteiro = 10'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it.skip('Sucesso - Declaração de lógico (com acento) constante, dica de tipo', () => {
                    const retornoLexador = lexador.mapear(['b: Lógico = verdadeiro'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it.skip('Sucesso - Declaração de lógico (sem acento) constante, dica de tipo', () => {
                    const retornoLexador = lexador.mapear(['b: Logico = verdadeiro'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it.skip('Sucesso - Declaração de real constante, dica de tipo', () => {
                    const retornoLexador = lexador.mapear(['r: Real = 3.14'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
    
                it.skip('Sucesso - Declaração de texto constante, dica de tipo', () => {
                    const retornoLexador = lexador.mapear(['s: Texto = "Programação"'], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });
            
            describe('Estruturas de decisão', () => {
                it('Escolha', () => {
                    const retornoLexador = lexador.mapear([
                        'escolha x',
                        '  caso 1 => escreva "Um"',
                        '  caso 2 => escreva "Dois"',
                        '  caso 3 => escreva "Três"',
                        '  caso _ => escreva "Outro valor"',
                        'fim'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Se', () => {
                    const retornoLexador = lexador.mapear([
                        'se verdadeiro então',
                        '  escreva "verdadeiro"',
                        'senão',
                        '  escreva "falso"',
                        'fim'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });

            describe('Estruturas de repetição', () => {
                it('Enquanto', () => {
                    const retornoLexador = lexador.mapear([
                        'var i := 0',
                        'enquanto i <= 10 faça',
                        '  escreva i',
                        '  i := i + 1',
                        'fim'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Para', () => {
                    const retornoLexador = lexador.mapear([
                        'var soma := 0',
                        'para i de 1 até 10 faça',
                        '  soma := soma + i',
                        'fim',
                        'escreva "A soma é {soma}."'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            describe('Declarações de funções', () => {
                it('Função de uma linha, argumentos com tipo definido, sem dica de retorno', () => {
                    const retornoLexador = lexador.mapear([
                        'soma(x: Inteiro, y: Inteiro) = x + y'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Função de uma linha, argumentos com tipo definido, com dica de retorno', () => {
                    const retornoLexador = lexador.mapear([
                        'soma(x: Inteiro, y: Inteiro): Inteiro = x + y'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });

            describe('Declarações de tuplas', () => {
                it('Dupla', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Trio', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2, 3)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Quarteto', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2, 3, 4)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Quinteto', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2, 3, 4, 5)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Sexteto', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2, 3, 4, 5, 6)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Septeto', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2, 3, 4, 5, 6, 7)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Octeto', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2, 3, 4, 5, 6, 7, 8)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Noneto', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2, 3, 4, 5, 6, 7, 8, 9)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Deceto', () => {
                    const retornoLexador = lexador.mapear([
                        'var t := (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });

            describe('Tipos', () => {
                it('Trivial', () => {
                    const retornoLexador = lexador.mapear([
                        'tipo Quadrado',
                        '  lado: Inteiro',
                        '  area() = lado * lado',
                        '  perimetro() = 4 * lado',
                        'fim'
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });
        });

        describe('Cenários de Falha', () => {
            it('Falha - Declaração de múltiplas variáveis inteiras, lado direito diferente de esquerdo', () => {
                const retornoLexador = lexador.mapear(['var a, b, c := 10, 20'], -1);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.",
                    })
                );
            });
        });
    });
});
