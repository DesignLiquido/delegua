import { LexadorPotigol } from "../../fontes/lexador/dialetos";
import { AvaliadorSintaticoPotigol } from "../../fontes/avaliador-sintatico/dialetos";
import { ErroAvaliadorSintatico } from "../../fontes/avaliador-sintatico/erro-avaliador-sintatico";

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let lexador = new LexadorPotigol();
        let avaliadorSintatico = new AvaliadorSintaticoPotigol();

        describe('Cenários de sucesso', () => {
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

            it('Sucesso - Declaração de caractere constante, dica de tipo', () => {
                const retornoLexador = lexador.mapear(["c: Caractere = 'z'"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - Declaração de inteiro constante, dica de tipo', () => {
                const retornoLexador = lexador.mapear(['a: Inteiro = 10'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - Declaração de lógico (com acento) constante, dica de tipo', () => {
                const retornoLexador = lexador.mapear(['b: Lógico = verdadeiro'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - Declaração de lógico (sem acento) constante, dica de tipo', () => {
                const retornoLexador = lexador.mapear(['b: Logico = verdadeiro'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - Declaração de real constante, dica de tipo', () => {
                const retornoLexador = lexador.mapear(['r: Real = 3.14'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - Declaração de texto constante, dica de tipo', () => {
                const retornoLexador = lexador.mapear(['s: Texto = "Programação"'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

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

        describe('Cenários de Falha', () => {
            it.only('Falha - Declaração de múltiplas variáveis inteiras, lado direito diferente de esquerdo', () => {
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
