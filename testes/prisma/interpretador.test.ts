import { LexadorPrisma } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPrisma } from '../../fontes/avaliador-sintatico/dialetos';
import { Interpretador } from '../../fontes/interpretador/interpretador';

describe('Interpretador (Prisma)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPrisma;
        let avaliadorSintatico: AvaliadorSintaticoPrisma;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorPrisma();
            avaliadorSintatico = new AvaliadorSintaticoPrisma();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Cenários de sucesso', () => {
            it('Declaração de variável simples', async () => {
                const retornoLexador = lexador.mapear(['local x = 42;'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                
                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Operação matemática básica', async () => {
                const retornoLexador = lexador.mapear([
                    'local a = 5;',
                    'local b = 3;',
                    'local resultado = a + b;'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                
                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Valores booleanos', async () => {
                const retornoLexador = lexador.mapear([
                    'local verdade = verdadeiro;',
                    'local mentira = falso;'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                
                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Texto básico', async () => {
                const retornoLexador = lexador.mapear([
                    'local nome = "João";',
                    'local sobrenome = "Silva";'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                
                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(resultado.erros).toHaveLength(0);
            });
        });
    });
});