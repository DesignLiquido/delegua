import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Ajuda, Bloco, Classe, Const, Escreva, Expressao, FuncaoDeclaracao, Importar, ParaCada, Retorna, Se, TendoComo, Tente, Var } from '../../fontes/declaracoes';
import { Binario, Chamada, DefinirValor, Elvis, ExpressaoRegular, FuncaoConstruto, ImportarComoConstruto, Leia, ListaCompreensao, Literal, Logico, SeTernario, TipoDe, Variavel } from '../../fontes/construtos';

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let lexador = new Lexador();
        let avaliadorSintatico = new AvaliadorSintatico();

        describe('Cenários de sucesso', () => {
            it('Olá Mundo', async () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Vetor vazio', async () => {
                const retornoLexador = lexador.mapear(['var vetorVazio = []'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Undefined', async () => {
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(undefined as any, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Null', async () => {
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(null as any, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Incremento e decremento após variável ou literal', async () => {
                const retornoLexador = lexador.mapear(['var a = 1', 'a++', 'a--', '++5', '--5'], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            describe('Asserção', () => {
                it('Sem parênteses', async () => {
                    const retornoLexador = lexador.mapear(['asserção verdadeiro'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Se);
                });

                it('Com parênteses e mensagem', async () => {
                    const retornoLexador = lexador.mapear(['asserção(1 < 2, "ok")'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Se);
                });

                it('Falha quando falta parêntese direito', async () => {
                    const retornoLexador = lexador.mapear(['asserção(verdadeiro'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Esperado ')' após argumentos de 'asserção'."
                    );
                });

                it('Falha quando não há condição', async () => {
                    const retornoLexador = lexador.mapear(['asserção()'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Falha com argumentos demais', async () => {
                    const retornoLexador = lexador.mapear(['asserção(verdadeiro, "a", "b")'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "'asserção' aceita apenas condição obrigatória e mensagem opcional."
                    );
                });

                it('Falha com mensagem sem parênteses', async () => {
                    const retornoLexador = lexador.mapear(['asserção verdadeiro, "falhou"'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Mensagem em 'asserção' exige uso de parênteses."
                    );
                });
            });

            describe('Comentários', () => {
                it('Comentários multilinha', async () => {
                    const retornoLexador = lexador.mapear(["/*", "comentário", "*/"], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Comentários entre elementos de vetores', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var castelo = [',
                            '    [0, 0], // Parte do topo do castelo',
                            '    [0, 0, 0], // Parte do meio castelo',
                            '    [0, 0, 0], // Parte do meio castelo',
                            '    [0, 0, 0], // Parte do meio castelo',
                            '    [0, 0, 0, 0, 0] // Parte de baixo do castelo ',
                            ']',
                        ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Comentário de linha antes da primeira chave de um dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var objeto = {',
                            '    // comentario',
                            "    'chave': 'valor'",
                            '}',
                            'escreva(objeto)',
                        ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Comentários entre pares de um dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var objeto = {',
                            "    'chave1': 'valor1', // Comentário após a primeira chave",
                            '    // Comentário antes da segunda chave',
                            "    'chave2': 'valor2'",
                            '    // Comentário antes da chave direita',
                            '}',
                            'escreva(objeto)',
                        ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            describe('Desestruturações', () => {
                it('Desestruturação de variáveis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = { "prop1": 123 }',
                            'var { prop1 } = a'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Desestruturação de constantes', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'const a = { "prop1": 123 }',
                            'const { prop1 } = a'
                        ],
                        -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Classes, propriedades e métodos', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Triangulo {',
                            '    base: numero;',
                            '    altura: número',
                            '    area() {',
                            '        escreva((isto.base * isto.altura) / 2)',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Não desincroniza com tipo desconhecido em parâmetro de método', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Externa {',
                            '    consumir(itens: TipoNaoResolvido[]) {',
                            '        escreva(itens.tamanho())',
                            '    }',
                            '}',
                            'escreva("ok")',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                        retornoLexador,
                        -1
                    );

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Classe);
                    expect(retornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(Escreva);
                });

                it('Propriedade estática não torna construtor estático', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe MinhaClasse {',
                            '    estatico {',
                            '        resultado: numero',
                            '    }',
                            '    construtor() {',
                            '        MinhaClasse.resultado = 99',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);

                    const declaracaoClasse = retornoAvaliadorSintatico.declaracoes[0] as Classe;
                    expect(declaracaoClasse.propriedades).toHaveLength(1);
                    expect(declaracaoClasse.propriedades[0].estatico).toBe(true);

                    const construtor = declaracaoClasse.metodos.find((m) => m.simbolo.lexema === 'construtor');
                    expect(construtor).toBeDefined();
                    if (!construtor) {
                        throw new Error('Construtor não encontrado.');
                    }
                    expect(construtor.estatico).toBe(false);

                    const primeiraDeclaracaoCorpo = construtor.funcao.corpo[0] as Expressao;
                    expect(primeiraDeclaracaoCorpo).toBeInstanceOf(Expressao);
                    expect(primeiraDeclaracaoCorpo.expressao).toBeInstanceOf(DefinirValor);

                    const definirValor = primeiraDeclaracaoCorpo.expressao as DefinirValor;
                    expect(definirValor.objeto).toBeInstanceOf(Variavel);
                    expect((definirValor.objeto as Variavel).simbolo.lexema).toBe('MinhaClasse');
                });

                it('classe estrangeira gera AST com flag estrangeira e métodos sem corpo', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe estrangeira Modelo {',
                            '    id: numero',
                            '    salvar()',
                            '    buscarPorId(id: numero)',
                            '    versao(): texto',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoClasse = retornoAvaliadorSintatico.declaracoes[0] as Classe;
                    expect(declaracaoClasse.estrangeira).toBe(true);
                    expect(declaracaoClasse.metodos).toHaveLength(3);
                    declaracaoClasse.metodos.forEach((m) => {
                        expect(m.funcao.corpo).toHaveLength(0);
                    });
                });

                it('classe estrangeira — método com corpo lança erro de sintaxe', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe estrangeira Modelo {',
                            '    salvar() { retorne 1 }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('classe estrangeira com decorador @definicao aceita métodos sem corpo', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@definicao',
                            'classe estrangeira Modelo {',
                            '    id: numero',
                            '    /**',
                            '     * Persiste o registro no banco de dados como uma nova inserção.',
                            '     */',
                            '    salvar()',
                            '    /**',
                            '     * Atualiza os campos do registro já existente no banco de dados.',
                            '     */',
                            '    modificar()',
                            '    /**',
                            '     * Exclui o registro do banco de dados.',
                            '     */',
                            '    remover()',
                            '    /**',
                            '     * Insere o registro se ainda não existe, ou atualiza se já existir (upsert).',
                            '     */',
                            '    salvarOuAtualizar()',
                            '    /**',
                            '     * Retorna todos os registros da tabela correspondente.',
                            '     */',
                            '    buscarTodos()',
                            '    /**',
                            '     * Retorna o registro correspondente ao identificador informado, ou nulo se não encontrado.',
                            '     */',
                            '    buscarPorId(id: numero)',
                            '    /**',
                            '     * Retorna um construtor de consultas para filtros e ordenações avançadas.',
                            '     */',
                            '    consulta()',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoClasse = retornoAvaliadorSintatico.declaracoes[0] as Classe;
                    expect(declaracaoClasse.estrangeira).toBe(true);
                    expect(declaracaoClasse.decoradores).toHaveLength(1);
                    expect(declaracaoClasse.decoradores[0].nome).toBe('@definicao');
                });

                it('tipo funcao<T1, T2> como anotação de parâmetro é aceito', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@definicao',
                            'classe estrangeira Roteador {',
                            '    registrar(manipulador: funcao<Requisicao, Resposta>)',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoClasse = retornoAvaliadorSintatico.declaracoes[0] as Classe;
                    expect(declaracaoClasse.estrangeira).toBe(true);
                    const parametro = declaracaoClasse.metodos[0].funcao.parametros[0];
                    expect(parametro.tipoDado).toBe('funcao<Requisicao, Resposta>');
                });

                it('tipo funcao<T1, T2>[] como anotação de parâmetro rest é aceito', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@definicao',
                            'classe estrangeira Roteador {',
                            '    registrar(...manipuladores: funcao<Requisicao, Resposta>[])',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoClasse = retornoAvaliadorSintatico.declaracoes[0] as Classe;
                    const parametro = declaracaoClasse.metodos[0].funcao.parametros[0];
                    expect(parametro.abrangencia).toBe('multiplo');
                    expect(parametro.tipoDado).toBe('funcao<Requisicao, Resposta>[]');
                });

                it('@definicao classe estrangeira Liquido com todos os métodos HTTP aceita parâmetros rest funcao<Requisicao, Resposta>[]', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@definicao',
                            'classe estrangeira Liquido {',
                            '    rotaGet(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaPost(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaPut(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaDelete(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoClasse = retornoAvaliadorSintatico.declaracoes[0] as Classe;
                    expect(declaracaoClasse.estrangeira).toBe(true);
                    expect(declaracaoClasse.metodos).toHaveLength(4);
                    declaracaoClasse.metodos.forEach((metodo) => {
                        const parametro = metodo.funcao.parametros[0];
                        expect(parametro.abrangencia).toBe('multiplo');
                        expect(parametro.tipoDado).toBe('funcao<Requisicao, Resposta>[]');
                    });
                });

                it('definição completa de Liquido com todos os 12 métodos HTTP e parâmetros rest funcao<Requisicao, Resposta>[]', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@definicao',
                            'classe estrangeira Liquido {',
                            '    rotaGet(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaPost(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaPut(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaDelete(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaPatch(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaOptions(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaCopy(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaHead(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaLock(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaUnlock(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaPurge(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '    rotaPropfind(...sequenciaExecucao: funcao<Requisicao, Resposta>[])',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoClasse = retornoAvaliadorSintatico.declaracoes[0] as Classe;
                    expect(declaracaoClasse.estrangeira).toBe(true);
                    expect(declaracaoClasse.decoradores[0].nome).toBe('@definicao');
                    expect(declaracaoClasse.metodos).toHaveLength(12);
                    declaracaoClasse.metodos.forEach((metodo) => {
                        const parametro = metodo.funcao.parametros[0];
                        expect(parametro.abrangencia).toBe('multiplo');
                        expect(parametro.tipoDado).toBe('funcao<Requisicao, Resposta>[]');
                    });
                });

                it('Método sem corpo em classe concreta lança erro de sintaxe', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Concreta {',
                            '    calcular(): numero',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Métodos obtenedor e definidor são marcados corretamente', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Pessoa {',
                            '    _nome: texto',
                            '    nome: texto {',
                            '        obter() {',
                            '            retorna isto._nome',
                            '        }',
                            '        definir(valor) {',
                            '            isto._nome = valor',
                            '        }',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);

                    const declaracaoClasse = retornoAvaliadorSintatico.declaracoes[0] as Classe;
                    expect(declaracaoClasse.metodos).toHaveLength(2);

                    const obtenedor = declaracaoClasse.metodos.find((m) => m.simbolo.lexema === 'nome' && m.eObtenedor);
                    const definidor = declaracaoClasse.metodos.find((m) => m.simbolo.lexema === 'nome' && m.eDefinidor);

                    expect(obtenedor).toBeDefined();
                    if (!obtenedor) {
                        throw new Error('Obtenedor não encontrado.');
                    }
                    expect(obtenedor.eDefinidor).toBe(false);
                    expect(definidor).toBeDefined();
                    if (!definidor) {
                        throw new Error('Definidor não encontrado.');
                    }
                    expect(definidor.eObtenedor).toBe(false);
                });
            });

            describe('Decoradores', () => {
                it('Decoradores de classe simples, empilhados', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@meu.decorador1',
                            '@meu.decorador2',
                            'classe Teste {',
                            '    testeFuncao() {',
                            '        escreva("olá")',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Classe);
                    const decoradores = (declaracao as Classe).decoradores;
                    expect(decoradores).toHaveLength(2);
                    expect(decoradores[0].nome).toBe("@meu.decorador1");
                    expect(decoradores[1].nome).toBe("@meu.decorador2");
                });

                it('Decorador de classe com parametros', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@decorador1(atributo1="123", atributo2=4)',
                            'classe Teste {',
                            '    @decorador2(atributo3="567", atributo4=8)',
                            '    testeFuncao() {',
                            '        escreva("olá")',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Classe);

                    const classe = declaracao as Classe;
                    const decoradores = classe.decoradores;
                    expect(decoradores).toHaveLength(1);

                    const decorador1 = decoradores[0];
                    expect(decorador1.nome).toBe("@decorador1");
                    expect('atributo1' in decorador1.atributos).toBe(true);
                    expect('atributo2' in decorador1.atributos).toBe(true);
                    expect(decorador1.atributos['atributo1']).toBeInstanceOf(Literal);
                    expect(decorador1.atributos['atributo2']).toBeInstanceOf(Literal);
                    expect(decorador1.atributos['atributo1'].valor).toBe("123");
                    expect(decorador1.atributos['atributo2'].valor).toBe(4);

                    expect(classe.metodos).toHaveLength(1);
                    const metodo = classe.metodos[0];
                    expect(metodo.decoradores).toHaveLength(1);
                    const decorador2 = metodo.decoradores[0];
                    expect(decorador2.nome).toBe("@decorador2");
                    expect('atributo3' in decorador2.atributos).toBe(true);
                    expect('atributo4' in decorador2.atributos).toBe(true);
                    expect(decorador2.atributos['atributo3']).toBeInstanceOf(Literal);
                    expect(decorador2.atributos['atributo4']).toBeInstanceOf(Literal);
                    expect(decorador2.atributos['atributo3'].valor).toBe("567");
                    expect(decorador2.atributos['atributo4'].valor).toBe(8);
                });

                it('Decorador de classe/método pontuado, sem atributos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@meu.decorador1',
                            'classe Teste {',
                            '    @meu.decorador2',
                            '    testeFuncao() {',
                            '        escreva("olá")',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Classe);

                    const classe = declaracao as Classe;
                    const decoradores = classe.decoradores;
                    expect(decoradores).toHaveLength(1);

                    const decorador1 = decoradores[0];
                    expect(decorador1.nome).toBe("@meu.decorador1");
                    expect(Object.entries(decorador1.atributos)).toHaveLength(0);

                    expect(classe.metodos).toHaveLength(1);
                    const metodo = classe.metodos[0];
                    expect(metodo.decoradores).toHaveLength(1);
                    const decorador2 = metodo.decoradores[0];
                    expect(decorador2.nome).toBe("@meu.decorador2");
                    expect(Object.entries(decorador2.atributos)).toHaveLength(0);
                });

                it('Decorador de propriedade', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Teste {',
                            '    @meu.decorador',
                            '    propriedade1: texto',
                            '    testeFuncao() {',
                            '        escreva("olá")',
                            '    }',
                            '}',
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao).toBeInstanceOf(Classe);

                    const classe = declaracao as Classe;
                    expect(classe.propriedades).toHaveLength(1);
                    const propriedade = classe.propriedades[0];
                    expect(propriedade.decoradores).toHaveLength(1);
                    const decorador = propriedade.decoradores[0];
                    expect(decorador.nome).toBe("@meu.decorador");
                    expect(Object.entries(decorador.atributos)).toHaveLength(0);
                });

                it('Decorador de chamadas de métodos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            '@rest.documentacao(',
                            '    sumario = "Um exemplo de rota GET.", ',
                            '    descricao = "Uma descrição mais detalhada sobre como a rota GET funciona.", ',
                            '    idOperacao = "lerArtigos",',
                            '    etiquetas = ["artigos"]',
                            ')',
                            '@rest.resposta(',
                            '    codigo = 200, ',
                            '    descricao = "Devolvido com sucesso", ',
                            '    formatos = ["application/json", "application/xml"]',
                            ')',
                            'liquido.rotaGet(funcao(requisicao, resposta) {',
                            '    resposta.json([{',
                            '        "id": 1,',
                            '        "titulo": "teste 1",',
                            '        "descricao": "descricao 1"',
                            '    }])',
                            '})',
                            'liquido.rotaPost(funcao(requisicao, resposta) {',
                            '    resposta.redirecionar("/artigos")',
                            '})'
                        ],
                        -1
                    );

                    // TODO: Mapear variáveis especiais de Líquido no projeto correspondente.
                    avaliadorSintatico.tiposDeFerramentasExternas = {
                        liquido: {
                            'liquido': 'qualquer',
                            'requisicao': 'qualquer',
                            'resposta': 'qualquer'
                        }
                    }
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    // Declaração `liquido.rotaGet` tem 2 decoradores.
                    const declaracaoGet = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracaoGet).toBeInstanceOf(Expressao);

                    expect(declaracaoGet.decoradores).toHaveLength(2);
                    const decoradorRestDocumentacao = declaracaoGet.decoradores[0];
                    expect(decoradorRestDocumentacao.nome).toBe('@rest.documentacao');
                    expect(Object.entries(decoradorRestDocumentacao.atributos)).toHaveLength(4);
                    expect('sumario' in decoradorRestDocumentacao.atributos).toBe(true);
                    expect(decoradorRestDocumentacao.atributos['sumario'].valor).toBe('Um exemplo de rota GET.');
                    expect('descricao' in decoradorRestDocumentacao.atributos).toBe(true);
                    expect(decoradorRestDocumentacao.atributos['descricao'].valor).toBe('Uma descrição mais detalhada sobre como a rota GET funciona.');
                    expect('idOperacao' in decoradorRestDocumentacao.atributos).toBe(true);
                    expect(decoradorRestDocumentacao.atributos['idOperacao'].valor).toBe('lerArtigos');
                    expect('etiquetas' in decoradorRestDocumentacao.atributos).toBe(true);
                    expect(decoradorRestDocumentacao.atributos['etiquetas'].valores).toHaveLength(1);
                    expect(decoradorRestDocumentacao.atributos['etiquetas'].valores[0].valor).toBe('artigos');

                    const decoradorRestResposta = declaracaoGet.decoradores[1];
                    expect(decoradorRestResposta.nome).toBe('@rest.resposta');
                    expect(Object.entries(decoradorRestResposta.atributos)).toHaveLength(3);
                    expect('codigo' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['codigo'].valor).toBe(200);
                    expect('descricao' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['descricao'].valor).toBe('Devolvido com sucesso');
                    expect('formatos' in decoradorRestResposta.atributos).toBe(true);
                    expect(decoradorRestResposta.atributos['formatos'].valores).toHaveLength(3);
                    expect(decoradorRestResposta.atributos['formatos'].valores[0].valor).toBe('application/json');
                    // decoradorRestResposta.atributos['formatos'].valores[0] é um separador (vírgula).
                    expect(decoradorRestResposta.atributos['formatos'].valores[2].valor).toBe('application/xml');

                    // Declaração `liquido.rotaPost` não tem decoradores.
                    const declaracaoPost = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracaoPost.decoradores).toHaveLength(0);
                });

                it('Classes com herança, uso de super', async () => {
                    const resultadoLexador = lexador.mapear([
                        `classe Ancestral {`,
                        `    propriedade1: numero`,
                        `}`,
                        `classe Teste herda Ancestral {`,
                        `    construtor() {`,
                        `        super.propriedade1 = 0`,
                        `    }`,
                        `}`,
                    ], -1);

                    const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);

                    expect(resultadoAvaliacaoSintatica).toBeTruthy();
                    expect(resultadoAvaliacaoSintatica.declaracoes).toHaveLength(2);
                    expect(resultadoAvaliacaoSintatica.erros).toHaveLength(0);
                });
            });

            describe('Declaração se ... senão se ... senão', () => {
                it('Caso com os três blocos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao achePlaneta(coordenadas) {',
                            '    se (coordenadas == "x:20;y:10") {',
                            '        retorna "Planeta Xalax"',
                            '    } senao se (coordenadas == "x:42;y:84") {',
                            '        retorna "Planeta Haskell"',
                            '    } senao {',
                            '        retorna "Planeta Kyron"',
                            '    }',
                            '}',
                            "escreva('O ${achePlaneta(\"x:42;y:84\")} é para onde temos que ir!')"
                        ], -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                });
            });

            describe('Declaração `tendo ... como`', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao teste() { retorna [1, 2, 3, 4, 5] }',
                            'tendo teste() como a {}'
                        ], -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracaoTendoComo: TendoComo = retornoAvaliadorSintatico.declaracoes[1] as TendoComo;
                    expect(declaracaoTendoComo.simboloVariavel.lexema).toBe('a');
                    expect(declaracaoTendoComo.inicializacaoVariavel).toBeInstanceOf(Chamada);
                    expect(declaracaoTendoComo.corpo).toBeInstanceOf(Bloco);
                    expect(declaracaoTendoComo.corpo.declaracoes).toHaveLength(0);
                })
            });

            describe('Dicionários', () => {
                it('Dicionário vazio', async () => {
                    const retornoLexador = lexador.mapear(['var dicionarioVazio = {}'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Acesso a valor de Dicionário por índice', async () => {
                    const retornoLexador = lexador.mapear([
                        'var dici = { 1: "Um", 2: "Dois" }',
                        'escreva(dici[1])'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            describe('Funções', () => {
                it('Função retorna Dicionario literal', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar() {',
                            '   retorna { "chave": 100 }',
                            '}',
                            'escreva(executar())',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Retorno texto sem retorno dentro da função', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(valor1, valor2): texto {',
                            '   var resultado = valor1 + valor2',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Função com retorno de vetor', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(): texto[] {',
                            '    retorna ["1", "2"]',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Função com parâmetros tipados', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao soma(a: inteiro, b: inteiro): inteiro {',
                            '    retorna a + b',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(FuncaoDeclaracao);
                    const declaracaoTipada = declaracao as FuncaoDeclaracao;
                    const construtoFuncao = declaracaoTipada.funcao;
                    expect(construtoFuncao.constructor).toBe(FuncaoConstruto);
                    const construtoFuncaoTipado = construtoFuncao as FuncaoConstruto;
                    expect(construtoFuncaoTipado.tipo).toBe('inteiro');
                    expect(construtoFuncaoTipado.parametros).toHaveLength(2);
                    expect(construtoFuncaoTipado.parametros[0].tipoDado).toBe('inteiro');
                    expect(construtoFuncaoTipado.parametros[1].tipoDado).toBe('inteiro');
                    const corpo = construtoFuncaoTipado.corpo;
                    expect(corpo).toHaveLength(1);
                    expect(corpo[0].constructor).toBe(Retorna);
                    const corpoRetorna = corpo[0] as Retorna;
                    expect(corpoRetorna.valor).toBeTruthy();
                    expect((corpoRetorna.valor as any).constructor).toBe(Binario);
                    const corpoRetornaBinario = corpoRetorna.valor as Binario;
                    expect(corpoRetornaBinario.esquerda.constructor).toBe(Variavel);
                    expect(corpoRetornaBinario.direita.constructor).toBe(Variavel);
                    const corpoRetornaBinarioEsquerda = corpoRetornaBinario.esquerda as Variavel;
                    const corpoRetornaBinarioDireita = corpoRetornaBinario.direita as Variavel;
                    expect(corpoRetornaBinarioEsquerda.tipo).toBe('inteiro');
                    expect(corpoRetornaBinarioDireita.tipo).toBe('inteiro');
                });

                it('Função que retorna função', async () => {
                    const retornoLexador = lexador.mapear([
                        "funcao some(a, b) {",
                        "  retorna a + b",
                        "}",
                        "funcao facaCurrying(minhaFuncao) {",
                        "  retorna funcao(a) {",
                        "    retorna funcao(b) {",
                        "      retorna minhaFuncao(a, b)",
                        "    }",
                        "  }",
                        "}",
                        "var someViaCurryng = facaCurrying(some)",
                        "escreva(someViaCurryng(1)(2))"
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Chamada a funcao nativa mapear com função anônima, tipagem implícita', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var funcaoParaMapear = função(a) {',
                            '    retorna a * 2;',
                            '};',
                            'escreva(mapear([5, 3], funcaoParaMapear));',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Chamada a funcao nativa mapear com função anônima, parâmetros do tipo qualquer', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao funcaoTestaMap(lista) {',
                            '    retorna mapear(',
                            '        lista,',
                            '        funcao(valor) {',
                            '            retorna valor',
                            '        })',
                            '}',
                            'escreva(funcaoTestaMap([1, 2, 3, 4]))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Chamada a funcao nativa filtrarPor com função nomeada', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var listaDeIdades = [91, 32, 15, 44, 12, 18, 101]',
                            'funcao checarIdade(idade) {',
                            '    retorna(idade >= 18)',
                            '}',
                            'escreva(filtrarPor(listaDeIdades, checarIdade))'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Chamada a funcao nativa filtrarPor com função anônima', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var numeros = [5, 10, 15, 20]',
                            'var numerosFiltrados = filtrarPor(numeros, funcao(numero) {',
                            '    retorna numero > 10',
                            '})',
                            'escreva(numerosFiltrados)'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Funções nativas', () => {
                it('ajuda, sem parênteses', async () => {
                    const retornoLexador = lexador.mapear(['ajuda'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Ajuda);
                    const declaracaoAjuda = retornoAvaliadorSintatico.declaracoes[0] as Ajuda;
                    expect(declaracaoAjuda.funcao).toBe(false);
                    expect(declaracaoAjuda.elemento).toBeUndefined();
                });

                it('ajuda, com parênteses, sem argumento', async () => {
                    const retornoLexador = lexador.mapear(['ajuda()'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Ajuda);
                    const declaracaoAjuda = retornoAvaliadorSintatico.declaracoes[0] as Ajuda;
                    expect(declaracaoAjuda.funcao).toBe(true);
                    expect(declaracaoAjuda.elemento).toBeUndefined();
                });

                it('ajuda, com parênteses, com argumento', async () => {
                    const retornoLexador = lexador.mapear(['ajuda(1)'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Ajuda);
                    const declaracaoAjuda = retornoAvaliadorSintatico.declaracoes[0] as Ajuda;
                    expect(declaracaoAjuda.funcao).toBe(true);
                    expect(declaracaoAjuda.elemento).not.toBeUndefined();
                });
            });

            describe('Declarações de tuplas', () => {
                it('Dupla', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Trio', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Quarteto', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Quinteto', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Sexteto', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Septeto', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6, 7)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Octeto', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6, 7, 8)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Noneto', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6, 7, 8, 9)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Deceto', async () => {
                    const retornoLexador = lexador.mapear(['var t = [(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });
            });

            it('Declaração `tente ... pegue com parâmetro`', async () => {
                const retornoLexador = lexador.mapear([
                    'var i = nulo tente { i = i + 1 } pegue (erro) { escreva(erro) }'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                expect(declaracao.constructor).toBe(Tente);
            });

            describe('Declarações com construto binário', () => {
                it('Números literais, soma', async () => {
                    const retornoLexador = lexador.mapear(['2 + 3'], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Expressao);
                    const declaracaoTipada = declaracao as Expressao;
                    expect(declaracaoTipada.expressao.constructor).toBe(Binario);
                    const binario = declaracaoTipada.expressao as Binario;
                    expect(binario.tipo).toBe('número');
                    expect(binario.esquerda.constructor).toBe(Literal);
                    expect(binario.direita.constructor).toBe(Literal);
                    const literalEsquerdo = binario.esquerda as Literal;
                    const literalDireito = binario.direita as Literal;
                    expect(literalEsquerdo.tipo).toBe('número');
                    expect(literalEsquerdo.valor).toBe(2);
                    expect(literalDireito.tipo).toBe('número');
                    expect(literalDireito.valor).toBe(3);
                });

                it('Literal + variável, multiplicacao', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a: número = 50',
                            'escreva(a * 3)'
                        ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Escreva);
                    const declaracaoTipada = declaracao as Escreva;
                    expect(declaracaoTipada.argumentos).toHaveLength(1);
                    const argumento = declaracaoTipada.argumentos[0];
                    expect(argumento.constructor).toBe(Binario);
                    const binario = argumento as Binario;
                    expect(binario.tipo).toBe('número');
                    expect(binario.esquerda.constructor).toBe(Variavel);
                    expect(binario.direita.constructor).toBe(Literal);
                    const literalEsquerdo = binario.esquerda as Variavel;
                    const literalDireito = binario.direita as Literal;
                    expect(literalEsquerdo.tipo).toBe('número');
                    expect(literalDireito.tipo).toBe('número');
                    expect(literalDireito.valor).toBe(3);
                });

                it('Operador Elvis', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = nulo',
                            'escreva(a ?: 10)'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Elvis);
                });

                it('Contém', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2, 3, 4, 5]',
                            'escreva(a contém 3)'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                });

                it('Não contém', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2, 3, 4, 5]',
                            'escreva(a não contém 3)'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    expect(retornoAvaliadorSintatico.declaracoes[1].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[1] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Logico);
                    const contem = escreva.argumentos[0] as Logico;
                    expect(contem.negado).toBe(true);
                });

                it('Dicionário + dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = { "chave1": 1 }',
                            'var b = { "chave2": 2 }',
                            'escreva(a + b)'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                    expect(retornoAvaliadorSintatico.declaracoes[2].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[2] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Binario);
                    const binario = escreva.argumentos[0] as Binario;
                    expect(binario.tipo).toBe('dicionário');
                    expect(binario.esquerda.constructor).toBe(Variavel);
                    expect(binario.direita.constructor).toBe(Variavel);
                });

                it('Vetor + vetor', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2]',
                            'var b = [3, 4]',
                            'escreva(a + b)'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                    expect(retornoAvaliadorSintatico.declaracoes[2].constructor).toBe(Escreva);
                    const escreva = retornoAvaliadorSintatico.declaracoes[2] as Escreva;
                    expect(escreva.argumentos).toHaveLength(1);
                    expect(escreva.argumentos[0].constructor).toBe(Binario);
                    const binario = escreva.argumentos[0] as Binario;
                    expect(binario.tipo).toBe('número[]');
                    expect(binario.esquerda.constructor).toBe(Variavel);
                    expect(binario.direita.constructor).toBe(Variavel);
                });
            });

            describe('Leia', () => {
                it('Leia sem parâmetro', async () => {
                    const retornoLexador = lexador.mapear(['var nome = leia()'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.inicializador.constructor).toBe(Leia);
                    const declaracaoLeia = declaracaoTipada.inicializador as Leia;
                    expect(declaracaoLeia.argumentos).toHaveLength(0);
                });

                it('Leia com parâmetro', async () => {
                    const retornoLexador = lexador.mapear(["var nome = leia('Digite seu nome:')"], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.inicializador.constructor).toBe(Leia);
                    const declaracaoLeia = declaracaoTipada.inicializador as Leia;
                    expect(declaracaoLeia.argumentos.length).toBeGreaterThan(0);
                });
            });

            describe('Importar', () => {
                it('Primeira forma', async () => {
                    const retornoLexador = lexador.mapear(['const matematica = importar("matematica")'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Const);
                });

                it('Segunda forma', async () => {
                    const retornoLexador = lexador.mapear(['importar tudo como matematica de matematica'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Importar);
                    const importar = retornoAvaliadorSintatico.declaracoes[0] as Importar;
                    expect(importar.simboloTudo).not.toBeNull();
                });

                it('Segunda forma com desestruturação', async () => {
                    const retornoLexador = lexador.mapear(['importar { logaritmo, potencia } de matematica'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.declaracoes[0].constructor).toBe(Importar);
                    const importar = retornoAvaliadorSintatico.declaracoes[0] as Importar;
                    expect(importar.elementosImportacao).toHaveLength(2);
                });
            });

            describe('Inferência de tipos', () => {
                it('Var, inferindo de literal', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 3'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.tipo).toBe('número');
                });

                it('Var, inferindo de outra variável', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 3',
                            'var b = a'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.tipo).toBe('número');
                });

                it('Var, inferindo de valor de vetor', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = [1, 2, 3]',
                            'var b = a[2]'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Var);
                    const declaracaoTipada = declaracao as Var;
                    expect(declaracaoTipada.tipo).toBe('número');
                });

                it('Const, inferindo de literal', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'const a = "teste"'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(Const);
                    const declaracaoTipada = declaracao as Const;
                    expect(declaracaoTipada.tipo).toBe('texto');
                });

                it('Const, inferindo de variável', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = "teste"',
                            'const b = a'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Const);
                    const declaracaoTipada = declaracao as Const;
                    expect(declaracaoTipada.tipo).toBe('texto');
                });

                it('Const, inferindo de vetor de constantes', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'const a = ["teste1", "teste2", "teste3"]',
                            'const b = a[1]'
                        ],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[1];
                    expect(declaracao.constructor).toBe(Const);
                    const declaracaoTipada = declaracao as Const;
                    expect(declaracaoTipada.tipo).toBe('texto');
                });
            });

            describe('Tipo `decimal` como sinônimo de `real`', () => {
                it('Var com tipo explícito `decimal` é normalizada para `real`', async () => {
                    const retornoLexador = lexador.mapear(['var x: decimal = 10'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracaoTipada = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    expect(declaracaoTipada.constructor).toBe(Var);
                    expect(declaracaoTipada.tipo).toBe('real');
                });

                it('Const com tipo explícito `decimal` é normalizada para `real`', async () => {
                    const retornoLexador = lexador.mapear(['const x: decimal = 10'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracaoTipada = retornoAvaliadorSintatico.declaracoes[0] as Const;
                    expect(declaracaoTipada.constructor).toBe(Const);
                    expect(declaracaoTipada.tipo).toBe('real');
                });

                it('Vetor `decimal[]` é normalizado para `real[]`', async () => {
                    const retornoLexador = lexador.mapear(['var x: decimal[] = [1.0, 2.0]'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const declaracaoTipada = retornoAvaliadorSintatico.declaracoes[0] as Var;
                    expect(declaracaoTipada.tipo).toBe('real[]');
                });

                it('Parâmetro de função com tipo `decimal` é normalizado para `real`', async () => {
                    const retornoLexador = lexador.mapear(
                        ['funcao f(x: decimal): decimal {', '    retorna x', '}'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const funcaoDeclarada = retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao;
                    expect(funcaoDeclarada.funcao.parametros[0].tipoDado).toBe('real');
                    expect(funcaoDeclarada.funcao.tipo).toBe('real');
                });
            });

            describe('Enquanto', () => {
                it('Enquanto com retorno pelo escopo', async () => {
                    const retornoLexador = lexador.mapear(
                    [
                        'var a = 1',
                        'var teste = enquanto a <= 5 {',
                        '    a++',
                        '    retorna a * 6',
                        '}',
                        'escreva(teste)'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            describe('Fazer ... enquanto', () => {
                it('Fazer com retorno pelo escopo', async () => {
                    const retornoLexador = lexador.mapear(
                    [
                        'var a = 1',
                        'var teste = fazer {',
                        '    ++a',
                        '    retorna a * 6',
                        '} enquanto a <= 5',
                        'escreva(teste)'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                });
            });

            describe('Para cada', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'para cada elemento em [1, 2, 3] {',
                            "   escreva('Valor: ', elemento)",
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                });

                it('Para cada com ponto e vírgula no final', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'para cada elemento em [1, 2, 3] {',
                            "   escreva('Valor: ', elemento)",
                            '};'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                    const declaracao = retornoAvaliadorSintatico.declaracoes[0];
                    expect(declaracao.constructor).toBe(ParaCada);
                });

                it('Para cada com vetor variável', async () => {
                    const retornoLexador = lexador.mapear([
                        'var mochila = [',
                        '    "fruta",',
                        '    "ovo de Icelope", ',
                        '    "amêndua",',
                        '    "cristal", ',
                        '    "pirita", ',
                        '    "bastão laser quebrado", ',
                        '    "fóssil de urso anão",',
                        '    "meteorito congelado",',
                        '    [9, 4, 20, 37, 12, 1, 2, 1]',
                        ']',
                        'para cada item em mochila {',
                        '    se (item == "ovo de Icelope") {',
                        '        escreva(item)',
                        '    }',
                        '}'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });

                it('Para cada com para tradicional aninhado', async () => {
                    const retornoLexador = lexador.mapear([
                        'var mochila = [',
                        '    "fruta",',
                        '    "ovo de Icelope", ',
                        '    "amêndua",',
                        '    "cristal", ',
                        '    "pirita", ',
                        '    "bastão laser quebrado", ',
                        '    "fóssil de urso anão",',
                        '    "meteorito congelado",',
                        '    [9, 4, 20, 37, 12, 1, 2, 1]',
                        ']',
                        'var ovos = []',
                        'para cada item em mochila {',
                        '    se (item == "ovo de Icelope") {',
                        '        var quantidadeDeOvos = mochila[-1][1];',
                        '        para (var i = 0; i < quantidadeDeOvos; i++) {',
                        '            ovos.adicionar(item);',
                        '        }',
                        '    }',
                        '}',
                        'escreva(ovos)',
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Para cada com retorno pelo escopo', async () => {
                    const retornoLexador = lexador.mapear(
                    [
                        'var teste = para cada elemento em [1, 2, 3] {',
                        '    retorna elemento * 4',
                        '}',
                        'escreva(teste)'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            describe('Para tradicional', () => {
                it('Para/sustar', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'para (var i = 0; i < 10; i = i + 1) {',
                            '   se (i == 5) { sustar; }',
                            "   escreva('Valor: ', i)",
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Para com retorno pelo escopo', async () => {
                    const retornoLexador = lexador.mapear(
                    [
                        'var teste = para (var i = 0; i < 10; i = i + 1) {',
                        '    se (i == 5) { sustar; }',
                        '    retorna i ** i',
                        '}',
                        'escreva(teste)'
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                });
            });

            describe('Se ternário', () => {
                it('Trivial', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var idade = 20',
                            'var categoria = idade < 18 ? "menor" : "adulto"',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                    const declaracaoComSeTernario = retornoAvaliadorSintatico.declaracoes[1] as Var;
                    expect(declaracaoComSeTernario.inicializador.constructor).toBe(SeTernario);
                });
            });

            it('Deve barrar símbolos matemáticos como nomes de propriedades', async () => {
                const retornoLexador = lexador.mapear([
                    'var calculadora = {}',
                    'calculadora.+ = 10',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico
                    .analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros[0].message).toContain(
                    "Esperado nome do método ou propriedade após o '.'"
                );
            });
        });

        describe('Cenários de falha', () => {
            it('Identificador indefinido', async () => {
                const retornoLexador = lexador.mapear(['oi'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                const erro = retornoAvaliadorSintatico.erros[0];
                expect(erro.hashArquivo).toBeDefined();
                expect(erro.linha).toBeDefined();
                expect(erro.message).toBe(
                    "Variável não definida: 'oi'."
                );
            });

            it('Declaração de variáveis com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['var a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                const erro = retornoAvaliadorSintatico.erros[0];
                expect(erro.hashArquivo).toBeDefined();
                expect(erro.linha).toBeDefined();
                expect(erro.message).toBe(
                    'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
                );
            });

            it('Declaração de múltiplas variáveis sem inicialização com tipo compartilhado (var i, j: inteiro)', async () => {
                const retornoLexador = lexador.mapear(['var i, j: inteiro'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                expect(retornoAvaliadorSintatico.declaracoes.length).toBe(2);
                const [declI, declJ] = retornoAvaliadorSintatico.declaracoes as any[];
                expect(declI.simbolo.lexema).toBe('i');
                expect(declI.tipo).toBe('inteiro');
                expect(declJ.simbolo.lexema).toBe('j');
                expect(declJ.tipo).toBe('inteiro');
            });

            it('Declaração de constantes com identificadores à esquerda do igual diferente da quantidade de valores à direita', async () => {
                const retornoLexador = lexador.mapear(['const a, b, c = 1, 2'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                const erro = retornoAvaliadorSintatico.erros[0];
                expect(erro.hashArquivo).toBeDefined();
                expect(erro.linha).toBeDefined();
                expect(erro.message).toBe(
                    'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
                );
            });

            it('Declaração de constante com número literal no lugar do tipo (fixo pi: 14) não deve lançar exceção de lexema', async () => {
                const retornoLexador = lexador.mapear(['fixo pi: 14'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                const erro = retornoAvaliadorSintatico.erros[0];
                expect(erro.hashArquivo).toBeDefined();
                expect(erro.linha).toBeDefined();
                expect(erro.message).toBe(
                    "Esperado '=' ou '<-' após identificador em instrução 'constante'."
                );
            });

            describe('Dicionários', () => {
                it('Tipo de chave de dicionário inválida', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var dicionarioInvalido = {',
                            '    [1, 2, [1, 2, 3]]: "valor",',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    const erro = retornoAvaliadorSintatico.erros[0];
                    expect(erro.message).toBe('Esperado parêntese esquerdo após colchete esquerdo para definição de chave de dicionário. Atual: NUMERO.');
                });
            });

            describe('Funções', () => {
                it('Função retorna vazio mas tem retorno de valores', async () => {
                    // Usa um literal com tipo conhecido para que o avaliador sintático possa detectar
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(): vazio {',
                            '    retorna "resultado"',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    const erro = retornoAvaliadorSintatico.erros[0];
                    expect(erro.message).toBe("Função declara explicitamente 'vazio', mas usa expressão 'retorna' com tipo de retorno diferente de vazio.");
                });

                it('Função tem mais de um tipo de retorno', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(valor1, valor2): número {',
                            '    var resultado = 1',
                            '    se valor1 == 2 {',
                            '        retorna "teste"',
                            '    }',
                            '    retorna resultado',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    const erro = retornoAvaliadorSintatico.erros[0];
                    expect(erro.message).toBe("Função retorna valores com mais de um tipo. Tipo esperado: número. Tipos encontrados: texto, número.");
                });

                it('Função com tipo de retorno inteiro pode retornar literal numérico e variável inteiro', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao comparar(a: inteiro, b: inteiro): inteiro {',
                            '    var resultado: inteiro = a - b',
                            '    se resultado < 0 {',
                            '        retorna -1',
                            '    }',
                            '    se resultado == 0 {',
                            '        retorna 0',
                            '    }',
                            '    retorna resultado',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect((retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao).funcao.tipo).toBe('inteiro');
                });

                it('Função com tipo de retorno número pode retornar real e inteiro', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao decidir(a: número): número {',
                            '    var dois: inteiro = 2',
                            '    se a > 0 {',
                            '        retorna 1.5',
                            '    }',
                            '    retorna dois',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Função lógica pode retornar literal lógico e expressão com ou', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao semZeroAEsquerda(valor: texto): lógico {',
                            '    se valor == "" {',
                            '        retorna falso',
                            '    }',
                            '    retorna valor == "0" ou valor[0] != "0"',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Tipos deduzidos de expressões lógicas', async () => {
                    const casos: [string, string][] = [
                        ['b e c', 'lógico'],
                        ['b ou (n > 1)', 'lógico'],
                        ['"a" em lista', 'lógico'],
                        ['lista contém "a"', 'lógico'],
                        ['n e 3', 'número'],
                        ['n ou m', 'inteiro'],
                        ['t ou "padrão"', 'qualquer'],
                    ];
                    for (const [expressao, tipoEsperado] of casos) {
                        const retornoLexador = lexador.mapear(
                            [
                                'var b = verdadeiro',
                                'var c = falso',
                                'var n: inteiro = 5',
                                'var m: inteiro = 6',
                                'var t = "a"',
                                'var lista = ["a"]',
                                `var x = ${expressao}`,
                            ],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                        const inicializador = (retornoAvaliadorSintatico.declaracoes[6] as Var).inicializador;
                        expect(inicializador).toBeInstanceOf(Logico);
                        expect([expressao, inicializador.tipo]).toEqual([expressao, tipoEsperado]);
                    }
                });

                it('Acesso a propriedade de classe tem o tipo da propriedade', async () => {
                    const classes = [
                        'classe Endereco {',
                        '    rua: texto',
                        '    construtor() { isto.rua = "r" }',
                        '}',
                        'classe Pessoa {',
                        '    nome: texto',
                        '    idade: inteiro',
                        '    endereco: Endereco',
                        '    apelidos: texto[]',
                        '    construtor() { isto.nome = "a" }',
                        '    obterNome(): texto { retorna isto.nome }',
                        '}',
                        'classe Aluno herda Pessoa {',
                        '    construtor() { super.construtor() }',
                        '}',
                    ];
                    const casos: [string, string][] = [
                        ['pessoa.nome', 'texto'],
                        ['pessoa.idade', 'inteiro'],
                        ['pessoa.endereco', 'Endereco'],
                        ['pessoa.endereco.rua', 'texto'],
                        ['pessoa.apelidos', 'texto[]'],
                        ['pessoa.obterNome()', 'texto'],
                        ['aluno.nome', 'texto'],
                        ['aluno.obterNome()', 'texto'],
                    ];
                    for (const [expressao, tipoEsperado] of casos) {
                        const retornoLexador = lexador.mapear(
                            [...classes, 'var pessoa = Pessoa()', 'var aluno = Aluno()', `var x = ${expressao}`],
                            -1
                        );
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                        const declaracoes = retornoAvaliadorSintatico.declaracoes;
                        expect([expressao, (declaracoes[declaracoes.length - 1] as Var).tipo]).toEqual([expressao, tipoEsperado]);
                    }
                });

                it('Função pode retornar literal e propriedade de classe do mesmo tipo', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Pessoa {',
                            '    nome: texto',
                            '    construtor() { isto.nome = "a" }',
                            '}',
                            'funcao nomeOuPadrao(pessoa: Pessoa, usarPadrao: lógico): texto {',
                            '    se usarPadrao {',
                            '        retorna "padrão"',
                            '    }',
                            '    retorna pessoa.nome',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('`retorna` aceita tipo de, leia, importar e expressão regular', async () => {
                    const casos: [string, any][] = [
                        ['tipo de valor', TipoDe],
                        ['leia("x")', Leia],
                        ['importar("json")', ImportarComoConstruto],
                        ['||[a-z]+||', ExpressaoRegular],
                    ];
                    for (const [expressao, construto] of casos) {
                        const retornoLexador = lexador.mapear(['funcao f(valor) {', `    retorna ${expressao}`, '}'], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                        const corpo = (retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao).funcao.corpo;
                        expect(corpo).toHaveLength(1);
                        expect((corpo[0] as Retorna).valor).toBeInstanceOf(construto);
                    }
                });

                it('`tipo de` resulta em texto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao descrever(valor, curto: lógico): texto {',
                            '    se curto {',
                            '        retorna "?"',
                            '    }',
                            '    retorna tipo de valor',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect((retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao).funcao.tipo).toBe('texto');
                });

                it('Função com tipo de retorno numérico ainda rejeita retorno de texto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao executar(a: inteiro): inteiro {',
                            '    var resultado: inteiro = a',
                            '    se a > 0 {',
                            '        retorna "positivo"',
                            '    }',
                            '    se a < 0 {',
                            '        retorna -1',
                            '    }',
                            '    retorna resultado',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toContain('Função retorna valores com mais de um tipo. Tipo esperado: inteiro.');
                });

                it('Função sem tipo de retorno explícito que retorna expressão com parâmetros sem tipo é inferida como qualquer, não vazio', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao multiplicacao(x, y) {',
                            '    retorne x * y',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const [funcaoMultiplicacao] = retornoAvaliadorSintatico.declaracoes as any[];
                    expect(funcaoMultiplicacao.tipo).toBe('função<qualquer>');
                });

                it('Função sem tipo de retorno explícito que retorna chamada de outra função de tipo qualquer é inferida como qualquer, não vazio', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao multiplicacao(x, y) {',
                            '    retorne x * y',
                            '}',
                            '',
                            'funcao quadrado(x) {',
                            '    retorne multiplicacao(x, x)',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const [, funcaoQuadrado] = retornoAvaliadorSintatico.declaracoes as any[];
                    expect(funcaoQuadrado.tipo).toBe('função<qualquer>');
                });
            });

            describe('Laços de repetição', () => {
                it('Continua fora de laço de repetição', async () => {
                    const retornoLexador = lexador.mapear(['continua;'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    const erro = retornoAvaliadorSintatico.erros[0];
                    expect(erro.hashArquivo).toBeDefined();
                    expect(erro.linha).toBeDefined();
                    expect(erro.message).toBe(
                        "'continua' precisa estar em um laço de repetição."
                    );
                });

                it('Sustar fora de laço de repetição', async () => {
                    const retornoLexador = lexador.mapear(['sustar;'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "'sustar' ou 'pausa' deve estar dentro de um laço de repetição."
                    );
                });
            });

            it('Não é permitido ter dois identificadores seguidos na mesma linha', async () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo') identificador1 identificador2"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                    "Variável não definida: 'identificador1'."
                );
            });

            it('Laços de repetição - para cada - vetor inválido', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var v = falso',
                        'para cada elemento em v {',
                        "   escreva('Valor: ', elemento)",
                        '}'
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            describe('Funções nativas', () => {
                it('aleatorioEntre - erro quando chamada sem argumentos', async () => {
                    const codigo = [
                        'escreva(aleatorioEntre())'
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('algum - erro quando segundo argumento não é função', async () => {
                    const codigo = [
                        "escreva(algum([1, 2, 3], 'texto'))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('filtrarPor - Função de mapeamento inválida', async () => {
                    const codigo = [
                        "var f = 'Sou uma função'",
                        "escreva(filtrarPor([1, 2, 3, 4, 5, 6], f))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('todosEmCondicao - Função de mapeamento inválida', async () => {
                    const codigo = [
                        "var f = 'Sou uma função'",
                        "escreva(todosEmCondicao([1, 2, 3, 4, 5, 6], f))"
                    ];
                    const retornoLexador = lexador.mapear(codigo, -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });
            });

            describe('Operações binárias inválidas', () => {
                it('Multiplicação de lista com dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var dicionario = {"chave": "valor"}',
                            'var resultado = lista * dicionario'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * entre vetor e dicionário."
                    );
                });

                it('Soma de lista com dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var dicionario = {"chave": "valor"}',
                            'var resultado = lista + dicionario'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação + entre vetor e dicionário."
                    );
                });

                it('Multiplicação de nulo com dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var dicionario = {"chave": "valor"}',
                            'var resultado = nulo * dicionario'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * entre dicionário e nulo."
                    );
                });

                it('Multiplicação de nulo com vetor', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var resultado = nulo * lista'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * entre vetor e nulo."
                    );
                });

                it('Soma de nulo com dicionário', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var dicionario = {"chave": "valor"}',
                            'var resultado = nulo + dicionario'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação + entre dicionário e nulo."
                    );
                });

                it('Soma de nulo com vetor', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var resultado = nulo + lista'
                        ],
                    -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação + entre vetor e nulo."
                    );
                });

                it('Bloqueia operações unárias em vetores - padrão de ofuscação !![] * 1', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = !![] * 1'],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * com expressão unária aplicada a vetor."
                    );
                });

                it('Bloqueia operações unárias em vetores - padrão de ofuscação ![] * 1', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = ![] * 1'],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * com expressão unária aplicada a vetor."
                    );
                });

                it('Bloqueia código de ofuscação completo - acesso a índice com !![]', async () => {
                    const retornoLexador = lexador.mapear(
                        ['escreva(("verdadeiro")[!![] * 1 + !![] * 1])'],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação * com expressão unária aplicada a vetor."
                    );
                });

                it('Bloqueia operações unárias em vetores - adição !![] + 1', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = !![] + 1'],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                    expect(retornoAvaliadorSintatico.erros[0].message).toBe(
                        "Operação inválida: não é possível realizar operação + com expressão unária aplicada a vetor."
                    );
                });
            });

            it('Deve acusar erro ao criar um vetor da forma errada', async () => {
                const retornoLexador = lexador.mapear(
                    ['var vetorQuebrado = [1 2 3];'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(
                    0
                );
                expect(retornoAvaliadorSintatico.erros[0].message).toContain(
                    'Os itens dos vetores devem ser separados através de uma vírgula.'
                );
            });
        });

        describe('Casos extremos e validações adicionais', () => {
            describe('Expressões aninhadas profundas', () => {
                it('Analisa expressão com múltiplos níveis de parênteses', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = ((((1 + 2) * 3) - 4) / 5)'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa acesso encadeado a propriedades', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var objeto = { "nivel1": { "nivel2": { "nivel3": 42 } } }',
                            'var valor = objeto["nivel1"]["nivel2"]["nivel3"]'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Declarações vazias e casos especiais', () => {
                it('Analisa bloco vazio', async () => {
                    const retornoLexador = lexador.mapear(['{', '}'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa if sem else', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'se (verdadeiro) {',
                            '    escreva("sim")',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa múltiplas declarações vazias', async () => {
                    const retornoLexador = lexador.mapear([';;;'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });
            });

            describe('Operadores especiais', () => {
                it('Analisa operador ternário (quando implementado)', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var resultado = verdadeiro ? "sim" : "não"'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });

                it('Analisa operadores de incremento/decremento', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var x = 5',
                            'x++',
                            'x--',
                            '++x',
                            '--x'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });

                it('Analisa atribuições compostas', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var x = 10',
                            'x += 5',
                            'x -= 3',
                            'x *= 2',
                            'x /= 4'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });

                it('Analisa atribuições com operador <- (SETA_ESQUERDA)', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var x <- 10',
                            'var y <- 20',
                            'x <- x + y',
                            'y <- 30'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });

                it('Analisa atribuições mistas com = e <-', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var a = 5',
                            'var b <- 10',
                            'a <- 15',
                            'b = 20'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
                });
            });

            describe('Vetores e matrizes - casos extremos', () => {
                it('Analisa vetor com elementos heterogêneos', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var misto = [1, "texto", verdadeiro, nulo, [1, 2], {"chave": "valor"}]'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa vetor multidimensional', async () => {
                    const retornoLexador = lexador.mapear(
                        ['var matriz = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa acesso a índice negativo', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var numeros = [1, 2, 3]',
                            'var ultimo = numeros[-1]'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                });
            });

            describe('Funções - casos extremos', () => {
                it('Analisa função com múltiplos retornos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao testeRetorno(x) {',
                            '    se (x > 0) {',
                            '        retorna "positivo"',
                            '    } senao se (x < 0) {',
                            '        retorna "negativo"',
                            '    } senao {',
                            '        retorna "zero"',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa função retornando outra função', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao criarMultiplicador(fator) {',
                            '    retorna funcao(x) {',
                            '        retorna x * fator',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa função recursiva', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'funcao fatorial(n) {',
                            '    se (n <= 1) {',
                            '        retorna 1',
                            '    }',
                            '    retorna n * fatorial(n - 1)',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Strings e formatação', () => {
                it('Analisa template string com interpolação', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var nome = "João"',
                            'var idade = 30',
                            'var mensagem = "${nome} tem ${idade} anos"'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

            });

            describe('Erros - validações adicionais', () => {
                it('Erro - parêntese não fechado', async () => {
                    const retornoLexador = lexador.mapear(['var x = (1 + 2'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Erro - colchete não fechado em vetor', async () => {
                    const retornoLexador = lexador.mapear(['var arr = [1, 2, 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Erro - chave não fechada em dicionário', async () => {
                    const retornoLexador = lexador.mapear(['var obj = {"chave": "valor"'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Erro - dois operadores seguidos', async () => {
                    const retornoLexador = lexador.mapear(['var x = 5 + * 3'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Erro - expressão incompleta no final', async () => {
                    const retornoLexador = lexador.mapear(['var x = 5 +'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
                });

                it('Recuperação - duas declarações quebradas no nível superior acumulam dois erros', async () => {
                    const retornoLexador = lexador.mapear([
                        'var x = ;',
                        'var y = ;',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(2);
                });

                it('Recuperação - declaração quebrada seguida de declaração válida no nível superior', async () => {
                    const retornoLexador = lexador.mapear([
                        'var x = ;',
                        "escreva('recuperado')",
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(1);
                    expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThanOrEqual(1);
                });

                it('Recuperação - chave direita solta no nível superior não entra em loop', async () => {
                    const retornoLexador = lexador.mapear(['}'], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(1);
                    expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
                });

                it('Recuperação - declaração quebrada dentro de bloco não impede análise das demais', async () => {
                    const retornoLexador = lexador.mapear([
                        'funcao teste() {',
                        '    var x = ;',
                        "    escreva('ok')",
                        '}',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(1);
                    // A declaração de função deve ter sido recuperada
                    expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThanOrEqual(1);
                });

                it('Recuperação - erro dentro de método de classe preserva a classe e os demais métodos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Lexador {',
                            '    linha: inteiro',
                            '',
                            '    mapear(codigo: texto) {',
                            '        isto.linha = 1',
                            '        var retornoSimbolos = []',
                            '        para cada elemento em codigo {',
                            '            escreva(elemento)',
                            '            retornoSimbolos.',
                            '        }',
                            '',
                            '        retorna retornoSimbolos',
                            '    }',
                            '',
                            '    avancar() {',
                            '        retorna 1',
                            '    }',
                            '}',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThanOrEqual(1);

                    const classeLexador = retornoAvaliadorSintatico.declaracoes.find(
                        (declaracao) => declaracao instanceof Classe
                    ) as Classe;

                    expect(classeLexador).toBeTruthy();
                    expect(classeLexador.metodos.map((metodo) => metodo.simbolo.lexema)).toEqual(
                        expect.arrayContaining(['mapear', 'avancar'])
                    );
                });
            });

            describe('Classes - casos extremos', () => {
                it('Analisa classe com múltiplas propriedades e métodos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Veiculo {',
                            '    marca: texto',
                            '    modelo: texto',
                            '    ano: inteiro',
                            '    ',
                            '    construtor(m, mod, a) {',
                            '        isto.marca = m',
                            '        isto.modelo = mod',
                            '        isto.ano = a',
                            '    }',
                            '    ',
                            '    descrever() {',
                            '        retorna "${isto.marca} ${isto.modelo} (${isto.ano})"',
                            '    }',
                            '    ',
                            '    idade(anoAtual) {',
                            '        retorna anoAtual - isto.ano',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Analisa herança com sobrescrita de métodos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Animal {',
                            '    falar() {',
                            '        retorna "Som"',
                            '    }',
                            '}',
                            '',
                            'classe Gato herda Animal {',
                            '    falar() {',
                            '        retorna "Miau"',
                            '    }',
                            '    ',
                            '    ronronar() {',
                            '        retorna "Ronrom"',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('isto.método() chamando método definido anteriormente na classe não gera erro', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Calculadora {',
                            '    dobrar(n: número): número {',
                            '        retorna n * 2',
                            '    }',
                            '    ',
                            '    quadruplicar(n: número): número {',
                            '        retorna isto.dobrar(isto.dobrar(n))',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('isto.método() chamando método definido posteriormente na classe não gera erro', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Calculadora {',
                            '    quadruplicar(n: número): número {',
                            '        retorna isto.dobrar(isto.dobrar(n))',
                            '    }',
                            '    ',
                            '    dobrar(n: número): número {',
                            '        retorna n * 2',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('isto.método() com múltiplas chamadas encadeadas na mesma classe não gera erro', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'classe Construtor {',
                            '    valor: texto',
                            '    ',
                            '    definirValor(v: texto) {',
                            '        isto.valor = v',
                            '    }',
                            '    ',
                            '    limpar() {',
                            '        isto.definirValor("")',
                            '    }',
                            '    ',
                            '    reiniciar() {',
                            '        isto.limpar()',
                            '        isto.definirValor("padrão")',
                            '    }',
                            '}'
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Compreensão de listas', () => {
                it('Infere tipo texto[] quando expressão de retorno é literal de texto', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var resultado = ["olá" para cada x em lista]',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const listaCompreensao = (retornoAvaliadorSintatico.declaracoes[1] as Var).inicializador as ListaCompreensao;
                    expect(listaCompreensao.tipo).toBe('texto[]');
                });

                it('Infere tipo número[] quando expressão de retorno é literal numérico', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = ["a", "b", "c"]',
                            'var resultado = [42 para cada x em lista]',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const listaCompreensao = (retornoAvaliadorSintatico.declaracoes[1] as Var).inicializador as ListaCompreensao;
                    expect(listaCompreensao.tipo).toBe('número[]');
                });

                it('Usa qualquer[] quando expressão de retorno é uma variável', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            'var lista = [1, 2, 3]',
                            'var resultado = [x para cada x em lista]',
                        ],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const listaCompreensao = (retornoAvaliadorSintatico.declaracoes[1] as Var).inicializador as ListaCompreensao;
                    expect(listaCompreensao.tipo).toBe('qualquer[]');
                });
            });

            describe('Espalhamento (...)', () => {
                it('Deve processar parâmetro de espalhamento com ...', async () => {
                    const retornoLexador = lexador.mapear(
                        ['função teste(...argumentos) {', '   escreva(argumentos)', '}'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const funcao = retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao;
                    const parametros = (funcao.funcao as FuncaoConstruto).parametros;
                    expect(parametros).toHaveLength(1);
                    expect(parametros[0].nome.lexema).toBe('argumentos');
                    expect(parametros[0].abrangencia).toBe('multiplo');
                });

                it('Deve processar parâmetros normais antes do parâmetro de espalhamento', async () => {
                    const retornoLexador = lexador.mapear(
                        ['função teste(a, b, ...resto) {', '   escreva(resto)', '}'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const funcao = retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao;
                    const parametros = (funcao.funcao as FuncaoConstruto).parametros;
                    expect(parametros).toHaveLength(3);
                    expect(parametros[0].abrangencia).toBe('padrao');
                    expect(parametros[1].abrangencia).toBe('padrao');
                    expect(parametros[2].nome.lexema).toBe('resto');
                    expect(parametros[2].abrangencia).toBe('multiplo');
                });

                it('parâmetro de espalhamento com tipo qualquer[] preserva abrangência e tipoDado', async () => {
                    const retornoLexador = lexador.mapear(
                        ['funcao teste(...args: qualquer[]) {', '   escreva(args)', '}'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const funcao = retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao;
                    const parametros = (funcao.funcao as FuncaoConstruto).parametros;
                    expect(parametros).toHaveLength(1);
                    expect(parametros[0].abrangencia).toBe('multiplo');
                    expect(parametros[0].tipoDado).toBe('qualquer[]');
                });

                it('parâmetro de espalhamento com tipo texto[] preserva abrangência e tipoDado', async () => {
                    const retornoLexador = lexador.mapear(
                        ['funcao teste(...args: texto[]) {', '   escreva(args)', '}'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const funcao = retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao;
                    const parametros = (funcao.funcao as FuncaoConstruto).parametros;
                    expect(parametros).toHaveLength(1);
                    expect(parametros[0].abrangencia).toBe('multiplo');
                    expect(parametros[0].tipoDado).toBe('texto[]');
                });

                it('parâmetro de espalhamento com tipo funcao[] preserva abrangência e tipoDado', async () => {
                    const retornoLexador = lexador.mapear(
                        ['funcao teste(...callbacks: funcao[]) {', '   escreva(callbacks)', '}'],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                    const funcao = retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao;
                    const parametros = (funcao.funcao as FuncaoConstruto).parametros;
                    expect(parametros).toHaveLength(1);
                    expect(parametros[0].abrangencia).toBe('multiplo');
                    expect(parametros[0].tipoDado).toBe('funcao[]');
                });
            });
        });
    });

    describe('Operador de negação !', () => {
        let lexador = new Lexador();
        let avaliadorSintatico = new AvaliadorSintatico();

        describe('Cenários de erro', () => {
            it('! com número literal gera erro', async () => {
                const retornoLexador = lexador.mapear(['var x = !10'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('! com número negativo literal gera erro', async () => {
                const retornoLexador = lexador.mapear(['var x = !-5'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('! com texto literal gera erro', async () => {
                const retornoLexador = lexador.mapear(['var x = !"abc"'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('! com texto vazio literal gera erro', async () => {
                const retornoLexador = lexador.mapear(['var x = !""'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });
        });

        describe('Cenários de sucesso', () => {
            it('! com verdadeiro não gera erro', async () => {
                const retornoLexador = lexador.mapear(['var x = !verdadeiro'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('! com falso não gera erro', async () => {
                const retornoLexador = lexador.mapear(['var x = !falso'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('!! com lógico não gera erro', async () => {
                const retornoLexador = lexador.mapear(['var x = !!verdadeiro'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('! com variável não gera erro', async () => {
                const retornoLexador = lexador.mapear(['var a = verdadeiro', 'var x = !a'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });
        });
    });

    describe('Operador de interrogação (?) sem contexto ternário', () => {
        let lexador = new Lexador();
        let avaliadorSintatico = new AvaliadorSintatico();

        it('? com texto literal gera erro', async () => {
            const retornoLexador = lexador.mapear(["escreva(?'a')"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
        });

        it('? com número literal gera erro', async () => {
            const retornoLexador = lexador.mapear(['escreva(?10)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
        });

        it('? com lógico literal gera erro', async () => {
            const retornoLexador = lexador.mapear(['escreva(?verdadeiro)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
        });

        it('? com vetor vazio gera erro', async () => {
            const retornoLexador = lexador.mapear(['escreva(?[])'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
        });

        it('operador ternário válido não gera erro', async () => {
            const retornoLexador = lexador.mapear(['var x = verdadeiro ? 1 : 2'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
        });
    });

    describe('Operadores de comparação com tipos incompatíveis', () => {
        let lexador = new Lexador();
        let avaliadorSintatico = new AvaliadorSintatico();

        describe('Cenários de erro', () => {
            it('número != texto gera erro', async () => {
                const retornoLexador = lexador.mapear(["escreva(10 != '10')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('número == texto gera erro', async () => {
                const retornoLexador = lexador.mapear(["escreva(10 == '10')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('número > texto gera erro', async () => {
                const retornoLexador = lexador.mapear(["escreva(10 > '10')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('número < texto gera erro', async () => {
                const retornoLexador = lexador.mapear(["escreva(10 < '10')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('número >= texto gera erro', async () => {
                const retornoLexador = lexador.mapear(["escreva(10 >= '10')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });

            it('número <= texto gera erro', async () => {
                const retornoLexador = lexador.mapear(["escreva(10 <= '10')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
            });
        });

        describe('Cenários de sucesso', () => {
            it('número == número não gera erro', async () => {
                const retornoLexador = lexador.mapear(['escreva(10 == 10)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('texto == texto não gera erro', async () => {
                const retornoLexador = lexador.mapear(["escreva('a' == 'b')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });

            it('número > número não gera erro', async () => {
                const retornoLexador = lexador.mapear(['escreva(10 > 5)'], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            });
        });
    });

    describe('Issue #1360 - escolha vazio com mesmo parâmetro da função', () => {
        it('Não deve travar ao analisar função com escolha vazio usando o mesmo parâmetro da função', async () => {
            const lexador = new Lexador();
            const avaliadorSintatico = new AvaliadorSintatico();
            const retornoLexador = lexador.mapear([
                'funcao teste(param) {',
                '    escolha param {',
                '        // Comentário',
                '    }',
                '}',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(FuncaoDeclaracao);
        }, 2000);
    });

    describe('Inferência de tipos (minigpt)', () => {
        const analisar = async (linhas: string[]) => {
            const lexador = new Lexador();
            const avaliadorSintatico = new AvaliadorSintatico();
            return avaliadorSintatico.analisar(lexador.mapear(linhas, -1), -1);
        };

        it('Função com retorno numero aceita literal numérico e variável numero', async () => {
            const retorno = await analisar([
                'funcao raiz(x: numero): numero {',
                '    se (x <= 0) retorna 0',
                '    var y: numero = x',
                '    retorna y',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Resultado de chamada de função com retorno vetor suporta acesso por índice', async () => {
            const retorno = await analisar([
                'funcao gerar(a: qualquer[]): numero[] {',
                '    var r: numero[] = []',
                '    retorna r',
                '}',
                'funcao usar(a: qualquer[]): numero {',
                '    const p = gerar(a)',
                '    retorna p[0]',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
            const usar = retorno.declaracoes[1] as FuncaoDeclaracao;
            const constante = usar.funcao.corpo[0] as any;
            expect(constante.tipo).toBe('numero[]');
        });

        it('Chamada de método em propriedade de classe acessada por isto', async () => {
            const retorno = await analisar([
                'classe Tabela {',
                '    obter(i: numero): qualquer[] { retorna [] }',
                '}',
                'classe Modelo {',
                '    tabela: Tabela',
                '    construtor() { isto.tabela = Tabela() }',
                '    usar() {',
                '        const t = isto.tabela.obter(0)',
                '        retorna t[0]',
                '    }',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Chamada de função declarada posteriormente no arquivo', async () => {
            const retorno = await analisar([
                'funcao antes(): numero { retorna depois(1) }',
                'classe K {',
                '    m() { retorna depois(2) }',
                '}',
                'funcao depois(x: numero): numero { retorna x }',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Variável não declarada continua gerando erro', async () => {
            const retorno = await analisar(['funcao f() { retorna naoExiste(1) }']);
            expect(retorno.erros.length).toBeGreaterThan(0);
        });
    });

    describe('Inferência de tipos (jsvm)', () => {
        const analisar = async (linhas: string[]) => {
            const lexador = new Lexador();
            const avaliadorSintatico = new AvaliadorSintatico();
            return avaliadorSintatico.analisar(lexador.mapear(linhas, -1), -1);
        };

        it('Primitiva de vetor sobre propriedade de classe do tipo vetor de classe', async () => {
            const retorno = await analisar([
                'classe Instrucao { }',
                'classe Trecho {',
                '    codigo: Instrucao[]',
                '    construtor() { isto.codigo = [] }',
                '    tamanho(): numero {',
                '        const n = isto.codigo.tamanho()',
                '        retorna n',
                '    }',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Para cada sobre propriedade declarada de objeto de classe', async () => {
            const retorno = await analisar([
                'classe Bloco {',
                '    itens: numero[]',
                '    construtor() { isto.itens = [1, 2] }',
                '}',
                'funcao percorrer(b: Bloco) {',
                '    para cada i em b.itens { escreva(i) }',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Para cada sobre propriedade herdada de superclasse', async () => {
            const retorno = await analisar([
                'classe Base {',
                '    itens: numero[]',
                '    construtor() { isto.itens = [1] }',
                '}',
                'classe Derivada herda Base {',
                '    construtor() { super() }',
                '}',
                'funcao percorrer(d: Derivada) {',
                '    para cada i em d.itens { escreva(i) }',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Para cada sobre propriedade existente apenas em subclasse tem tipo indeterminado', async () => {
            const retorno = await analisar([
                'classe abstrata No { }',
                'classe Bloco herda No {',
                '    itens: No[]',
                '    construtor() { super() isto.itens = [] }',
                '}',
                'funcao percorrer(n: No) {',
                '    para cada item em n.itens { escreva(item) }',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Para cada sobre objeto de classe continua rejeitado', async () => {
            const retorno = await analisar([
                'classe Bloco { }',
                'funcao percorrer(b: Bloco) {',
                '    para cada i em b { escreva(i) }',
                '}',
            ]);
            expect(retorno.erros.length).toBeGreaterThan(0);
        });

        it('Tipo dicionario (sem acento) suporta acesso por índice', async () => {
            const retorno = await analisar([
                'var d: dicionario = {}',
                'd[0] = 1',
                'escreva(d[0])',
                'para cada {chave, valor} em d { escreva(chave) }',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Chamada de membro sobre objeto do tipo qualquer', async () => {
            const retorno = await analisar([
                'const arquivos: qualquer = importar("arquivos")',
                'const arquivo = arquivos.Arquivo("programa.js")',
                'funcao abrir(modulo: qualquer) {',
                '    const outro = modulo.Arquivo("programa.js")',
                '    retorna outro',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('Fatiamento de texto tem tipo texto; de vetor, tipo vetor', async () => {
            const retorno = await analisar([
                'var t: texto = "abcdef"',
                'var s = t[1:3]',
                'var v: numero[] = [1, 2, 3]',
                'var w = v[0:2]',
                'var u = "literal"[0:2]',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect((retorno.declaracoes[1] as Var).tipo).toBe('texto');
            expect((retorno.declaracoes[3] as Var).tipo).toBe('numero[]');
            expect((retorno.declaracoes[4] as Var).tipo).toBe('texto');
        });

        it('Fatiamento de propriedade de texto acessada por isto tem tipo texto', async () => {
            const retorno = await analisar([
                'classe Lexer {',
                '    src: texto',
                '    construtor(src: texto) { isto.src = src }',
                '    trecho(): texto {',
                '        var s = isto.src[0:2]',
                '        s = "console.log"',
                '        retorna s',
                '    }',
                '}',
            ]);
            expect(retorno.erros).toHaveLength(0);
            const classe = retorno.declaracoes[0] as Classe;
            const metodo = classe.metodos.find((m) => m.simbolo.lexema === 'trecho') as FuncaoDeclaracao;
            expect((metodo.funcao.corpo[0] as Var).tipo).toBe('texto');
        });

        it('Primitiva inexistente sobre tipo conhecido continua gerando erro', async () => {
            const retorno = await analisar(['const t: texto = "a"', 'const r = t.metodoQueNaoExiste()']);
            expect(retorno.erros.length).toBeGreaterThan(0);
        });
    });
});

describe('Avaliador sintático - erros adicionais', () => {
    it.each([
        [['var x: inteiro[ = 1'], "Esperado símbolo de fechamento do vetor: ']'."],
        [['var v = [1]', 'var d = {v: 1}'], 'Tipo número[] de identificador v não é válido como chave de dicionário.'],
        [['var d = {nulo: 1}'], 'Símbolo NULO inesperado ou inválido como chave de dicionário.'],
        [['para cada 1 em [1] { }'], 'Identificador de iteração deve ser ou um par chave-valor, ou um nome de variável.'],
        [['para cada x [1] { }'], "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução 'para cada'."],
        [['var n = 5', 'para cada x em n { }'], "Variável ou constante em 'para cada' não é iterável. Tipo resolvido: número."],
        [['var v = [1, , 2]'], 'Não podem haver duas vírgulas seguidas em uma definição de vetor'],
        [['var x = ajuda(escreva)'], "Avaliador sintático não consegue lidar com o tópico de ajuda 'escreva'."],
        [['var x = 5', 'x[0] = 1'], 'Tipo número não suporta acesso por índice.'],
        [
            ['funcao f(...a) { }', 'f(' + Array.from({ length: 256 }, (_, i) => String(i)).join(', ') + ')'],
            'Não pode haver mais de 255 argumentos.',
        ],
        [['var v = [1]', 'escreva(-v + 1)'], 'Operação inválida: não é possível realizar operação + com expressão unária aplicada a vetor.'],
        [['1 = 2'], 'Tarefa de atribuição inválida'],
        [['escolha 1 { padrao: escreva(1) padrao: escreva(2) }'], "Você só pode ter um 'padrao' em cada declaração de 'escolha'."],
        [['importar tudo como m de 5'], 'Esperado caminho do módulo como texto ou identificador em declaração de importação.'],
        [['var {a, b} 5'], 'Esperado igual ou seta esquerda após relação de propriedades da desestruturação.'],
        [['classe { }'], 'Esperado nome da classe.'],
        [['extensão de número { 5 }'], 'Esperado declaração de método na extensão.'],
        [['var a = 1', 'var b = 2', 'a b'], 'Não é permitido ter dois identificadores seguidos na mesma linha.'],
    ])('Erro em %j', async (codigo: string[], mensagem: string) => {
        const retorno = await new AvaliadorSintatico().analisar(new Lexador().mapear(codigo, -1), -1);
        expect(retorno.erros.map((erro) => erro.message).some((m) => m.includes(mensagem))).toBe(true);
    });
});
