import { LexadorPrisma } from '../../../../fontes/lexador/dialetos';
import { AvaliadorSintaticoPrisma } from '../../../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorPrisma } from '../../../../fontes/interpretador/dialetos';

describe('Interpretador (Prisma)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPrisma;
        let avaliadorSintatico: AvaliadorSintaticoPrisma;
        let interpretador: InterpretadorPrisma;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorPrisma();
            avaliadorSintatico = new AvaliadorSintaticoPrisma();
            interpretador = new InterpretadorPrisma(process.cwd(), false, funcaoSaida, funcaoSaida);
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

            it('Classe com construtor e método', async () => {
                const retornoLexador = lexador.mapear([
                    'classe Pessoa {',
                    '    construtor(nome) {',
                    '        isto.nome = nome;',
                    '    }',
                    '    funcao apresentar() {',
                    '        retorne isto.nome;',
                    '    }',
                    '}',
                    'local pessoa = Pessoa("Maria");',
                    'imprima(pessoa.apresentar());'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('Maria');
            });
        });

        describe('Funções nativas (built-ins)', () => {
            it('tipo() - determina o tipo de um valor', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(tipo(42));',
                    'imprima(tipo("texto"));',
                    'imprima(tipo(verdadeiro));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('número');
                expect(_saidas).toContain('texto');
                expect(_saidas).toContain('logico');
            });

            it('poe() - imprime valores', async () => {
                const retornoLexador = lexador.mapear([
                    'poe("Olá");',
                    'poe("Mundo");'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('Olá');
                expect(_saidas).toContain('Mundo');
            });

            it('tamanho() - calcula o tamanho de strings', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(tamanho("ola"));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('3');
            });

            it('convnumero() - converte valores para número', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(convnumero("42"));',
                    'imprima(convnumero(42));',
                    'imprima(convnumero(verdadeiro));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('42');
                expect(_saidas).toContain('1');
            });

            it('convstring() - converte valores para texto', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(convstring(42));',
                    'imprima(convstring(verdadeiro));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('42');
                expect(_saidas).toContain('verdadeiro');
            });

            it('aleatorio() - gera número entre 0 e 1', async () => {
                const retornoLexador = lexador.mapear([
                    'local x = aleatorio();',
                    'imprima(x);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas.length).toBeGreaterThan(0);
            });

            it('aleatorio_entre() - gera número entre min e max', async () => {
                const retornoLexador = lexador.mapear([
                    'local x = aleatorio_entre(1, 10);',
                    'imprima(x);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas.length).toBeGreaterThan(0);
            });
        });
    });
});