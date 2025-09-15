import { LexadorPrisma } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPrisma } from '../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorComDepuracao } from '../../fontes/interpretador/interpretador-com-depuracao';

describe('Interpretador (Prisma)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPrisma;
        let avaliadorSintatico: AvaliadorSintaticoPrisma;
        let interpretador: InterpretadorComDepuracao;

        beforeEach(() => {
            lexador = new LexadorPrisma();
            avaliadorSintatico = new AvaliadorSintaticoPrisma();
            interpretador = new InterpretadorComDepuracao(process.cwd(), () => {}, () => {});
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Declaração de variável simples', async () => {
                const retornoLexador = lexador.mapear(['var x = 42;'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                
                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Sucesso - Operação matemática básica', async () => {
                const retornoLexador = lexador.mapear([
                    'var a = 5;',
                    'var b = 3;',
                    'var resultado = a + b;'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                
                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Sucesso - Valores booleanos', async () => {
                const retornoLexador = lexador.mapear([
                    'var verdade = verdadeiro;',
                    'var mentira = falso;'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                
                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Sucesso - Texto básico', async () => {
                const retornoLexador = lexador.mapear([
                    'var nome = "João";',
                    'var sobrenome = "Silva";'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                
                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(resultado.erros).toHaveLength(0);
            });
        });

        describe('Cenários de falha', () => {
            it('Falha - Análise sintática com erro', () => {
                const retornoLexador = lexador.mapear(['var x =;'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                
                // Deve ter erro sintático
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });
        });
    });
});