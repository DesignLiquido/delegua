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

        describe('Funções nativas (embutidos)', () => {

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

            it('coletelixo() - solicita coleta de lixo sem ação', async () => {
                const retornoLexador = lexador.mapear([
                    'local r = coletelixo();',
                    'imprima(r);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('0');
            });

            it('coletelixo("contar") - retorna uso de memória', async () => {
                const retornoLexador = lexador.mapear([
                    'local r = coletelixo("contar");',
                    'imprima(r);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('0');
            });

            it('coletelixo("rodando") - verifica se coletor está ativo', async () => {
                const retornoLexador = lexador.mapear([
                    'local r = coletelixo("rodando");',
                    'imprima(r);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
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

            it('pares() - retorna índices pares de um vetor', async () => {
                const retornoLexador = lexador.mapear([
                    'local arr = {10, 20, 30, 40, 50};',
                    'local resultado = pares(arr);',
                    'imprima(tamanho(resultado));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('3');
            });

            it('ipares() - retorna índices ímpares de um vetor', async () => {
                const retornoLexador = lexador.mapear([
                    'local arr = {10, 20, 30, 40, 50};',
                    'local resultado = ipares(arr);',
                    'imprima(tamanho(resultado));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('2');
            });
        });

        describe('Estruturas condicionais', () => {
            it('if-then-else simples', async () => {
                const retornoLexador = lexador.mapear([
                    'local x = 5;',
                    'se x > 3 entao',
                    '    imprima("maior");',
                    'senao',
                    '    imprima("menor");',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('maior');
                expect(_saidas).not.toContain('menor');
            });

            it('Múltiplas condições com operadores lógicos', async () => {
                const retornoLexador = lexador.mapear([
                    'local a = verdadeiro;',
                    'local b = falso;',
                    'se a e (nao b) entao',
                    '    imprima("sucesso");',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('sucesso');
            });

            it('Condições com operadores de comparação', async () => {
                const retornoLexador = lexador.mapear([
                    'local x = 10;',
                    'se x >= 10 entao imprima("igual ou maior"); fim',
                    'se x <= 10 entao imprima("igual ou menor"); fim',
                    'se x ~= 5 entao imprima("diferente"); fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('igual ou maior');
                expect(_saidas).toContain('igual ou menor');
                expect(_saidas).toContain('diferente');
            });
        });

        describe('Laços de repetição', () => {
            it('enquanto (while loop)', async () => {
                const retornoLexador = lexador.mapear([
                    'local i = 0;',
                    'enquanto i < 3 fazer',
                    '    imprima(i);',
                    '    i = i + 1;',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toEqual(['0', '1', '2']);
            });

            it('para com inicio, fim, passo (for loop with step)', async () => {
                const retornoLexador = lexador.mapear([
                    'para i = 0, 5, 2 fazer',
                    '    imprima(i);',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toEqual(['0', '2', '4']);
            });

            it('para com inicio, fim, passo um (for loop default step)', async () => {
                const retornoLexador = lexador.mapear([
                    'para i = 1, 3 fazer',
                    '    imprima(i);',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toEqual(['1', '2', '3']);
            });

            it('quebrando loop com quebra', async () => {
                const retornoLexador = lexador.mapear([
                    'para i = 0, 10 fazer',
                    '    se i == 3 entao',
                    '        quebre;',
                    '    fim',
                    '    imprima(i);',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toEqual(['0', '1', '2']);
            });
        });

        describe('Funções e declarações de função', () => {
            it('Declaração e chamada de função simples', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao saudacao(nome)',
                    '    retorne "Olá, " .. nome;',
                    'fim',
                    'imprima(saudacao("Sofia"));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('Olá, Sofia');
            });

            it('Função com múltiplos parâmetros', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao somar(a, b, c)',
                    '    retorne a + b + c;',
                    'fim',
                    'imprima(somar(1, 2, 3));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('6');
            });

            it('Função recursiva (fatorial)', async () => {
                const retornoLexador = lexador.mapear([
                    'funcao fatorial(n)',
                    '    se n <= 1 entao',
                    '        retorne 1;',
                    '    fim',
                    '    retorne n * fatorial(n - 1);',
                    'fim',
                    'imprima(fatorial(5));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('120');
            });

            it('Funções anônimas/de primeira classe', async () => {
                const retornoLexador = lexador.mapear([
                    'local multiplicador = funcao(x)',
                    '    retorne x * 2;',
                    'fim;',
                    'imprima(multiplicador(5));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('10');
            });
        });

        describe('Tabelas e estruturas de dados', () => {
            it('Criação e acesso a tabela simples', async () => {
                const retornoLexador = lexador.mapear([
                    'local tabela = {1, 2, 3};',
                    'imprima(tabela[1]);',
                    'imprima(tabela[2]);',
                    'imprima(tabela[3]);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('1');
                expect(_saidas).toContain('2');
                expect(_saidas).toContain('3');
            });

            it('Tabela com chaves nomeadas (dicionário)', async () => {
                const retornoLexador = lexador.mapear([
                    'local pessoa = {nome = "João", idade = 30};',
                    'imprima(pessoa["nome"]);',
                    'imprima(pessoa["idade"]);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('João');
                expect(_saidas).toContain('30');
            });

            it('Tabela aninhada', async () => {
                const retornoLexador = lexador.mapear([
                    'local dados = {nomes = {"Alice", "Bob"}, ids = {1, 2}};',
                    'imprima(dados["nomes"][1]);',
                    'imprima(dados["ids"][2]);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('Alice');
                expect(_saidas).toContain('2');
            });

            it('Modificação de elementos de tabela', async () => {
                const retornoLexador = lexador.mapear([
                    'local arr = {1, 2, 3};',
                    'arr[2] = 20;',
                    'imprima(arr[2]);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('20');
            });
        });

        describe('Operadores bitwise', () => {
            it('Operador E lógico bitwise (&)', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(5 & 3);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('1');
            });

            it('Operador OU lógico bitwise (|)', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(5 | 3);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('7');
            });

            it('Operador XOR bitwise (~)', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(5 ~ 3);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('6');
            });

            it('Operador deslocamento esquerda (<<)', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(5 << 2);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('20');
            });

            it('Operador deslocamento direita (>>)', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(20 >> 2);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('5');
            });
        });

        describe('Operações de string', () => {
            it('Concatenação com operador .. ', async () => {
                const retornoLexador = lexador.mapear([
                    'local resultado = "Olá" .. ", " .. "Mundo";',
                    'imprima(resultado);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('Olá, Mundo');
            });

            it('Comprimento de string com #', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(#"teste");'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('5');
            });
        });

        describe('Operações matemáticas avançadas', () => {
            it('Exponenciação com **', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(2 ** 8);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('256');
            });

            it('Módulo/resto com %', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(17 % 5);'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('2');
            });

            it('Divisão inteira com piso()', async () => {
                // Em Prisma, // é comentário de linha; divisão inteira usa piso(a / b)
                const retornoLexador = lexador.mapear([
                    'imprima(piso(17 / 5));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('3');
            });

            it('teto() - arredondamento para cima', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(teto(3.2));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('4');
            });

            it('Negação unária', async () => {
                const retornoLexador = lexador.mapear([
                    'imprima(-5);',
                    'imprima(-(-3));'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

                const resultado = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(resultado.erros).toHaveLength(0);
                expect(_saidas).toContain('-5');
                expect(_saidas).toContain('3');
            });
        });
    });
});