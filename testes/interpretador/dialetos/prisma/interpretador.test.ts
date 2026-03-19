import { LexadorPrisma } from '../../../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPrisma } from '../../../../fontes/avaliador-sintatico/dialetos';
import { Interpretador } from '../../../../fontes/interpretador/interpretador';

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

            it('Estrutura escolha com caso e padrao', async () => {
                const retornoLexador = lexador.mapear([
                    'local x = 2;',
                    'escolha x',
                    'caso 1 entao',
                    '    imprima("um");',
                    'caso 2 entao',
                    '    imprima("dois");',
                    'padrao entao',
                    '    imprima("outro");',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('dois');
                expect(_saidas).not.toContain('um');
                expect(_saidas).not.toContain('outro');
            });

            it('Estrutura tente com pegue e finalmente', async () => {
                const retornoLexador = lexador.mapear([
                    'tente',
                    '    imprima("no-tente");',
                    'pegue',
                    '    imprima("pegou");',
                    'finalmente',
                    '    imprima("finalizou");',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('no-tente');
                expect(_saidas).not.toContain('pegou');
                expect(_saidas).toContain('finalizou');
            });

            it('Operador ternário', async () => {
                const retornoLexador = lexador.mapear([
                    'local resultado = verdadeiro ? "sim" ou "nao";',
                    'imprima(resultado);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('sim');
                expect(_saidas).not.toContain('nao');
            });

            it('Laço para cada', async () => {
                const retornoLexador = lexador.mapear([
                    'local lista = nulo;',
                    'local total = 0;',
                    'para cada elemento em lista inicio',
                    '    total = total + 1;',
                    'fim',
                    'imprima(total);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                // Primeiro declara a variável para manter consistência com a análise sintática,
                // depois injeta um vetor real no ambiente para testar execução do para cada.
                const resultadoInicial = await interpretador.interpretar([
                    retornoAvaliadorSintatico.declaracoes[0],
                ]);
                expect(resultadoInicial.erros).toHaveLength(0);

                interpretador.pilhaEscoposExecucao.definirVariavel('lista', [1, 2, 3], 'vetor');

                const resultado = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes.slice(1)
                );

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('3');
            });
        });
    });
});