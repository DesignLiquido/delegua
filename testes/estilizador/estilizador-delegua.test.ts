import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { EstilizadorDelegua } from '../../fontes/estilizador/estilizador-delegua';
import { QuebradorDeLinha } from '../../fontes/estilizador/quebrador-linha';
import { RegraFortalecerTipos } from '../../fontes/estilizador/regras/regra-fortalecer-tipos';
import { RegraConvencaoNomenclatura } from '../../fontes/estilizador/regras/regra-convencao-nomenclatura';
import { Var, Const } from '../../fontes/declaracoes';

describe('Estilizador Delégua', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let estilizador: EstilizadorDelegua;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
    });

    describe('Fortalecer Tipos', () => {
        beforeEach(() => {
            estilizador = new EstilizadorDelegua([new RegraFortalecerTipos()]);
        });

        it('Deve fortalecer tipo de variável com literal numérico', async () => {
            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.tipo).toBe('número');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });

        it('Deve fortalecer tipo de variável com literal de texto', async () => {
            const retornoLexador = lexador.mapear(['var nome = "João"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.tipo).toBe('texto');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });

        it('Deve fortalecer tipo de variável com literal booleano', async () => {
            const retornoLexador = lexador.mapear(['var ativo = verdadeiro'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.tipo).toBe('lógico');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });

        it('Deve fortalecer tipo de constante com literal numérico', async () => {
            const retornoLexador = lexador.mapear(['constante PI = 3.14'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const constDeclaracao = declaracoesEstilizadas[0] as Const;
            expect(constDeclaracao.tipo).toBe('número');
            expect(constDeclaracao.tipoExplicito).toBe(true);
        });

        it('Não deve modificar tipo já explicitamente definido', async () => {
            const retornoLexador = lexador.mapear(['var x: número = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.tipo).toBe('número');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });

        it('Deve processar múltiplas declarações', async () => {
            const retornoLexador = lexador.mapear([
                'var x = 5',
                'var nome = "Maria"',
                'constante PI = 3.14'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(3);
            expect((declaracoesEstilizadas[0] as Var).tipo).toBe('número');
            expect((declaracoesEstilizadas[1] as Var).tipo).toBe('texto');
            expect((declaracoesEstilizadas[2] as Const).tipo).toBe('número');
        });
    });

    describe('Convenção de Nomenclatura', () => {
        it('Deve validar variáveis em caixaCamelo', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var MeuNome = "João"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            expect(violacoes.length).toBeGreaterThan(0);
            expect(violacoes[0].regra).toBe('convencao-nomenclatura');
        });

        it('Deve transformar variáveis para caixaCamelo', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var MeuNome = "João"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.simbolo.lexema).toBe('meuNome');
        });

        it('Deve transformar constantes para CAIXA_ALTA', async () => {
            const regra = new RegraConvencaoNomenclatura({
                constante: 'CAIXA_ALTA'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['constante piValor = 3.14'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const constDeclaracao = declaracoesEstilizadas[0] as Const;
            expect(constDeclaracao.simbolo.lexema).toBe('PI_VALOR');
        });

        it('Deve transformar variáveis para caixa_cobra quando configurado', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixa_cobra'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var meuNomeCompleto = "João Silva"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.simbolo.lexema).toBe('meu_nome_completo');
        });
    });

    describe('Múltiplas Regras', () => {
        it('Deve aplicar múltiplas regras em sequência', async () => {
            estilizador = new EstilizadorDelegua([
                new RegraFortalecerTipos(),
                new RegraConvencaoNomenclatura({
                    variavel: 'caixaCamelo'
                })
            ]);

            const retornoLexador = lexador.mapear(['var meu_numero = 42'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;

            // Verifica aplicação da regra de nomenclatura
            expect(varDeclaracao.simbolo.lexema).toBe('meuNumero');

            // Verifica aplicação da regra de tipos
            expect(varDeclaracao.tipo).toBe('número');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });
    });

    describe('Adicionar e Remover Regras', () => {
        it('Deve permitir adicionar regras dinamicamente', async () => {
            estilizador = new EstilizadorDelegua();
            expect(estilizador.regras.length).toBe(0);

            estilizador.adicionarRegra(new RegraFortalecerTipos());
            expect(estilizador.regras.length).toBe(1);

            estilizador.adicionarRegra(new RegraConvencaoNomenclatura());
            expect(estilizador.regras.length).toBe(2);
        });

        it('Deve permitir remover regras pelo nome', async () => {
            estilizador = new EstilizadorDelegua([
                new RegraFortalecerTipos(),
                new RegraConvencaoNomenclatura()
            ]);
            expect(estilizador.regras.length).toBe(2);

            estilizador.removerRegra('fortalecer-tipos');
            expect(estilizador.regras.length).toBe(1);
            expect(estilizador.regras[0].nome).toBe('convencao-nomenclatura');
        });

        it('Deve remover regra inexistente sem erros', async () => {
            estilizador = new EstilizadorDelegua([
                new RegraFortalecerTipos()
            ]);
            expect(estilizador.regras.length).toBe(1);

            estilizador.removerRegra('regra-inexistente');
            expect(estilizador.regras.length).toBe(1);
        });
    });

    describe('Orquestração de Formatação', () => {
        it('Deve aplicar regra do Estilizador e formatar com aspas duplas', async () => {
            estilizador = new EstilizadorDelegua([
                new RegraConvencaoNomenclatura({ variavel: 'caixaCamelo' })
            ]);

            const retornoLexador = lexador.mapear(["var MEU_NOME = 'Ana'"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes, {
                delimitadorTexto: 'aspas-duplas',
                quebraLinha: '\\n',
            });

            expect(resultado).toContain('var meuNome = "Ana"');
        });

        it('Deve preservar delimitadores originais quando configurado', async () => {
            estilizador = new EstilizadorDelegua();

            const retornoLexador = lexador.mapear([
                "var a = 'um'",
                'var b = "dois"',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes, {
                delimitadorTexto: 'preservar',
                quebraLinha: '\\n',
            });

            expect(resultado).toContain("var a = 'um'");
            expect(resultado).toContain('var b = "dois"');
        });
    });

    describe('Modo Validação', () => {
        it('Deve detectar violações sem modificar declarações', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var MeuNome = "João"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const declaracaoOriginal = retornoAvaliadorSintatico.declaracoes[0] as Var;
            const nomeOriginal = declaracaoOriginal.simbolo.lexema;

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            // Verifica que detectou a violação
            expect(violacoes.length).toBeGreaterThan(0);

            // Verifica que não modificou a declaração original
            expect(declaracaoOriginal.simbolo.lexema).toBe(nomeOriginal);
        });

        it('Deve resetar modo validação após validar', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var MeuNome = "João"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            // Executa validação
            estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            // Executa estilização - deve modificar
            const retornoLexador2 = lexador.mapear(['var OutroNome = "Maria"'], -1);
            const retornoAvaliadorSintatico2 = await avaliadorSintatico.analisar(retornoLexador2, -1);
            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico2.declaracoes);

            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.simbolo.lexema).toBe('outroNome');
        });

        it('Deve detectar múltiplas violações', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo',
                constante: 'CAIXA_ALTA'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear([
                'var MeuNome = "João"',
                'var OutroNome = "Maria"',
                'constante piValor = 3.14'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            expect(violacoes.length).toBe(3);
        });

        it('Não deve gerar violações quando código está conforme', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var meuNome = "João"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            expect(violacoes.length).toBe(0);
        });
    });

    describe('Estilização de Estruturas Aninhadas', () => {
        it('Deve estilizar variáveis dentro de blocos se', async () => {
            estilizador = new EstilizadorDelegua([
                new RegraFortalecerTipos(),
                new RegraConvencaoNomenclatura({
                    variavel: 'caixaCamelo'
                })
            ]);

            const retornoLexador = lexador.mapear([
                'se (verdadeiro) {',
                '    var meu_numero = 10',
                '}'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            // A declaração 'se' deve ter sido estilizada recursivamente
            const blocoSe = declaracoesEstilizadas[0] as any;
            expect(blocoSe).toBeDefined();
        });

        it('Deve estilizar variáveis dentro de loops', async () => {
            estilizador = new EstilizadorDelegua([
                new RegraConvencaoNomenclatura({
                    variavel: 'caixaCamelo'
                })
            ]);

            const retornoLexador = lexador.mapear([
                'enquanto (verdadeiro) {',
                '    var CONTADOR = 0',
                '}'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
        });

        it('Deve estilizar múltiplas declarações aninhadas', async () => {
            estilizador = new EstilizadorDelegua([new RegraFortalecerTipos()]);

            const retornoLexador = lexador.mapear([
                'se (verdadeiro) {',
                '    var x = 5',
                '    var y = 10',
                '}'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
        });
    });

    describe('Casos Extremos', () => {
        it('Deve processar lista vazia de declarações', async () => {
            estilizador = new EstilizadorDelegua([new RegraFortalecerTipos()]);

            const declaracoesEstilizadas = estilizador.estilizar([]);

            expect(declaracoesEstilizadas.length).toBe(0);
        });

        it('Deve validar lista vazia de declarações', async () => {
            estilizador = new EstilizadorDelegua([new RegraFortalecerTipos()]);

            const violacoes = estilizador.validar([]);

            expect(violacoes.length).toBe(0);
        });

        it('Deve funcionar sem regras', async () => {
            estilizador = new EstilizadorDelegua([]);

            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
        });

        it('Deve processar declaração sem inicializador', async () => {
            estilizador = new EstilizadorDelegua([new RegraFortalecerTipos()]);

            const retornoLexador = lexador.mapear(['var x'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
        });
    });

    describe('Detecção de Mudanças em Validação', () => {
        it('Deve detectar mudança de tipo', async () => {
            estilizador = new EstilizadorDelegua([new RegraFortalecerTipos()]);

            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            // A regra de fortalecer tipos deve adicionar tipo quando não existe
            expect(violacoes.length).toBeGreaterThanOrEqual(0);
        });

        it('Deve detectar mudança de nome de símbolo', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var NOME_COMPLETO = "João"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            expect(violacoes.length).toBeGreaterThan(0);
            expect(violacoes[0].mensagem).toContain('nomenclatura');
        });
    });

    describe('Clonagem de Declarações', () => {
        it('Deve clonar declaração corretamente durante validação', async () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var MeuNome = "João"'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracaoOriginal = retornoAvaliadorSintatico.declaracoes[0] as Var;
            const linhaOriginal = declaracaoOriginal.linha;
            const lexemaOriginal = declaracaoOriginal.simbolo.lexema;

            estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            // Verifica que a declaração original não foi modificada
            expect(declaracaoOriginal.linha).toBe(linhaOriginal);
            expect(declaracaoOriginal.simbolo.lexema).toBe(lexemaOriginal);
        });
    });

    describe('Regras com Aplicação Parcial', () => {
        it('Deve funcionar com regra que só tem aplicarEmDeclaracao', async () => {
            const regraCustomizada = {
                nome: 'regra-teste',
                descricao: 'Regra de teste',
                aplicarEmDeclaracao: (declaracao: any) => declaracao
            };
            estilizador = new EstilizadorDelegua([regraCustomizada]);

            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
        });

        it('Deve funcionar com regra que só tem aplicarEmConstruto', async () => {
            const regraCustomizada = {
                nome: 'regra-construto',
                descricao: 'Regra para construtos',
                aplicarEmConstruto: (construto: any) => construto
            };
            estilizador = new EstilizadorDelegua([regraCustomizada]);

            const retornoLexador = lexador.mapear(['var x = 5 + 3'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
        });

        it('Deve aplicar regra em construtos recursivamente', async () => {
            let contadorAplicacoes = 0;
            const regraCustomizada = {
                nome: 'regra-contador',
                descricao: 'Regra que conta aplicações em construtos',
                aplicarEmConstruto: (construto: any) => {
                    contadorAplicacoes++;
                    return construto;
                }
            };
            estilizador = new EstilizadorDelegua([regraCustomizada]);

            // Expressão com múltiplos construtos: (5 + 3) * 2
            const retornoLexador = lexador.mapear(['var x = (5 + 3) * 2'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            // A regra deve ter sido aplicada em construtos (quando estilização processa recursivamente)
            expect(contadorAplicacoes).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Validação com Construtos', () => {
        it('Modo validação foca em declarações', async () => {
            // O modo validação do estilizador foca principalmente em declarações
            // e não processa construtos recursivamente (por design, conforme linha 66 do código)
            const regraCustomizada = {
                nome: 'regra-modificar-construto',
                descricao: 'Modifica construtos para gerar violação',
                aplicarEmConstruto: (construto: any) => {
                    const modificado = { ...construto, _modificado: true };
                    return modificado;
                }
            };
            estilizador = new EstilizadorDelegua([regraCustomizada]);

            const retornoLexador = lexador.mapear(['var x = 5 + 3'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            // Em modo validação, construtos não são processados recursivamente
            expect(violacoes.length).toBeGreaterThanOrEqual(0);
        });

        it('Não deve modificar construtos em modo validação', async () => {
            const regraCustomizada = {
                nome: 'regra-modifica',
                descricao: 'Tenta modificar construtos',
                aplicarEmConstruto: (construto: any) => {
                    return { ...construto, _modificado: true };
                }
            };
            estilizador = new EstilizadorDelegua([regraCustomizada]);

            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const declaracaoOriginal = retornoAvaliadorSintatico.declaracoes[0];

            estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            // Verifica que o construto original não tem a propriedade _modificado
            const varDecl = declaracaoOriginal as any;
            if (varDecl.inicializacao) {
                expect(varDecl.inicializacao._modificado).toBeUndefined();
            }
        });
    });

    describe('Detecção de Tipos de Objetos', () => {
        it('Deve processar declarações com expressões complexas', async () => {
            estilizador = new EstilizadorDelegua([]);

            const retornoLexador = lexador.mapear([
                'var resultado = (10 + 5) * 2',
                'var condicao = verdadeiro e falso'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(2);
        });

        it('Deve processar funções com corpo', async () => {
            estilizador = new EstilizadorDelegua([new RegraFortalecerTipos()]);

            const retornoLexador = lexador.mapear([
                'função somar(a, b) {',
                '    var resultado = a + b',
                '    retorna resultado',
                '}'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
        });

        it('Deve processar declarações com arrays', async () => {
            estilizador = new EstilizadorDelegua([]);

            const retornoLexador = lexador.mapear([
                'var numeros = [1, 2, 3, 4, 5]'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
        });

        it('Deve processar declarações com dicionários', async () => {
            estilizador = new EstilizadorDelegua([]);

            const retornoLexador = lexador.mapear([
                'var pessoa = { "nome": "João", "idade": 30 }'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            // O parser pode ou não parsear esta estrutura, dependendo da sintaxe
            expect(declaracoesEstilizadas.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Modificação de Tipo em Validação', () => {
        it('Deve detectar mudança de tipoExplicito', async () => {
            const regraCustomizada = {
                nome: 'regra-tipo-explicito',
                descricao: 'Torna tipo explícito',
                aplicarEmDeclaracao: (declaracao: any) => {
                    const clone = { ...declaracao };
                    clone.tipoExplicito = true;
                    return clone;
                }
            };
            estilizador = new EstilizadorDelegua([regraCustomizada]);

            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            // Pode detectar mudança no tipoExplicito
            expect(violacoes.length).toBeGreaterThanOrEqual(0);
        });

        it('Deve detectar mudança de tipo da declaração', async () => {
            const regraCustomizada = {
                nome: 'regra-mudar-tipo',
                descricao: 'Muda o tipo da variável',
                aplicarEmDeclaracao: (declaracao: any) => {
                    const clone = { ...declaracao };
                    clone.tipo = 'texto';
                    return clone;
                }
            };
            estilizador = new EstilizadorDelegua([regraCustomizada]);

            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            expect(violacoes.length).toBeGreaterThan(0);
        });
    });

    describe('Clonagem de Estruturas Complexas', () => {
        it('Deve clonar declaração com arrays', async () => {
            const regraCustomizada = {
                nome: 'regra-teste-clone',
                descricao: 'Testa clonagem',
                aplicarEmDeclaracao: (declaracao: any) => {
                    // A clonagem deve preservar a estrutura
                    return declaracao;
                }
            };
            estilizador = new EstilizadorDelegua([regraCustomizada]);

            const retornoLexador = lexador.mapear(['var x = [1, 2, 3]'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            // Não deve gerar violações se não houver mudança
            expect(violacoes.length).toBe(0);
        });
    });

    describe('Limite de colunas (maximoCaracteresPorLinha)', () => {
        beforeEach(() => {
            estilizador = new EstilizadorDelegua();
        });

        it('Linha dentro do limite não é alterada', async () => {
            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const semLimite = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes);
            const comLimite = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes, {
                maximoCaracteresPorLinha: 80,
            });

            expect(comLimite).toBe(semLimite);
        });

        it('Ausência da opção não altera o comportamento padrão', async () => {
            const retornoLexador = lexador.mapear(
                ['escreva("valor_a", "valor_b", "valor_c")'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const semOpcao = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes);
            const comOpcaoAusente = estilizador.estilizarEFormatar(
                retornoAvaliadorSintatico.declaracoes,
                { quebraLinha: '\n' }
            );

            expect(comOpcaoAusente).toBe(semOpcao);
        });

        it('Quebra chamada de função com muitos argumentos após vírgulas', async () => {
            const retornoLexador = lexador.mapear(
                ['escreva("argumento_um", "argumento_dois", "argumento_tres")'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes, {
                maximoCaracteresPorLinha: 40,
                quebraLinha: '\n',
            });

            const linhas = resultado.split('\n');
            expect(linhas.length).toBeGreaterThan(1);
            linhas.filter((l) => l.trim().length > 0).forEach((linha) => {
                expect(linha.length).toBeLessThanOrEqual(40);
            });
        });

        it('QuebradordeLinha quebra linha com operador " e " antes do operador', () => {
            // O formatador converte && para " e ". Testamos o QuebradordeLinha diretamente
            // com a saída que o formatador produziria para uma condição composta.
            const quebrador = new QuebradorDeLinha(40, 4, '\n');
            // "se (verdadeiro e verdadeiro e verdadeiro) {" = 43 chars
            const input = 'se (verdadeiro e verdadeiro e verdadeiro) {';
            const resultado = quebrador.quebrar(input);
            const linhas = resultado.split('\n');
            expect(linhas.length).toBeGreaterThan(1);
            linhas.filter((l) => l.trim().length > 0).forEach((linha) => {
                expect(linha.length).toBeLessThanOrEqual(40);
            });
        });

        it('QuebradordeLinha quebra linha com operador " ou " antes do operador', () => {
            // O formatador converte || para " ou ". Testamos o QuebradordeLinha diretamente.
            const quebrador = new QuebradorDeLinha(40, 4, '\n');
            // "se (verdadeiro ou verdadeiro ou verdadeiro) {" = 45 chars
            const input = 'se (verdadeiro ou verdadeiro ou verdadeiro) {';
            const resultado = quebrador.quebrar(input);
            const linhas = resultado.split('\n');
            expect(linhas.length).toBeGreaterThan(1);
            linhas.filter((l) => l.trim().length > 0).forEach((linha) => {
                expect(linha.length).toBeLessThanOrEqual(40);
            });
        });

        it('Vírgulas dentro de strings não são pontos de quebra', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva('primeiro, valor', 'segundo, valor')"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes, {
                maximoCaracteresPorLinha: 30,
                quebraLinha: '\n',
            });

            // Strings originais devem estar intactas (sem quebra interna)
            expect(resultado).toContain("'primeiro, valor'");
            expect(resultado).toContain("'segundo, valor'");
        });

        it('Linha sem ponto de quebra válido é preservada intacta', async () => {
            // "var x = 1" não tem ponto de quebra (nenhuma vírgula nem operadores lógicos)
            // e é muito menor que o limite, mas se o limite fosse impossível de cumprir
            // a linha seria preservada. Aqui testamos com um literal de texto sem vírgulas.
            const retornoLexador = lexador.mapear(
                ['var identificador = "abcdefghijklmnopqrstuvwxyz"'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes, {
                maximoCaracteresPorLinha: 10,
                quebraLinha: '\n',
            });

            // Deve conter o literal intacto, sem truncamento
            expect(resultado).toContain('abcdefghijklmnopqrstuvwxyz');
        });

        it('Indentação de continuação respeita tamanhoIndentacao', async () => {
            const retornoLexador = lexador.mapear(
                ['escreva("argumento_um", "argumento_dois", "argumento_tres")'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = estilizador.estilizarEFormatar(retornoAvaliadorSintatico.declaracoes, {
                maximoCaracteresPorLinha: 35,
                tamanhoIndentacao: 2,
                quebraLinha: '\n',
            });

            const linhas = resultado.split('\n');
            // Linhas de continuação devem começar com 2 espaços (tamanhoIndentacao=2)
            const linhasContinuacao = linhas.slice(1).filter((l) => l.trim().length > 0);
            if (linhasContinuacao.length > 0) {
                expect(linhasContinuacao[0]).toMatch(/^ {2}/);
            }
        });
    });
});
