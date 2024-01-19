import { AnalisadorSemanticoVisualg } from '../../fontes/analisador-semantico/dialetos/analisador-semantico-visualg'
import { AvaliadorSintaticoVisuAlg } from "../../fontes/avaliador-sintatico/dialetos";
import { LexadorVisuAlg } from "../../fontes/lexador/dialetos";

describe('Analisador sêmantico (Visualg)', () => {
    describe('analisar()', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintaticoVisuAlg: AvaliadorSintaticoVisuAlg;
        let analisadorSemanticoVisualg: AnalisadorSemanticoVisualg

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintaticoVisuAlg = new AvaliadorSintaticoVisuAlg();
            analisadorSemanticoVisualg = new AnalisadorSemanticoVisualg();
        });


        describe('Cenários de falha', () => {
            it('Variável indefinida, não declarada(escreva)', () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Declaração de variável"',
                    'var',
                    'inicio',
                    'escreva(idade, "teste");',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintaticoVisuAlg.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemanticoVisualg.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Variável indefinida, não declarada(atribuição)', () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Atribuição de valor"',
                    'var',
                    'inicio',
                    'idade <- 2',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintaticoVisuAlg.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemanticoVisualg.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição inválida', () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Atribuição de valor"',
                    'var',
                    'idade: real',
                    'inicio',
                    'idade <- "2"',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintaticoVisuAlg.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemanticoVisualg.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
        })
    })
})