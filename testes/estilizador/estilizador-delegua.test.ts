import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { EstilizadorDelegua } from '../../fontes/estilizador/estilizador-delegua';
import { RegraFortalecerTipos } from '../../fontes/estilizador/regras/fortalecer-tipos';
import { RegraConvencaoNomenclatura } from '../../fontes/estilizador/regras/convencao-nomenclatura';
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

        it('Deve fortalecer tipo de variável com literal numérico', () => {
            const retornoLexador = lexador.mapear(['var x = 5'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.tipo).toBe('número');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });

        it('Deve fortalecer tipo de variável com literal de texto', () => {
            const retornoLexador = lexador.mapear(['var nome = "João"'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.tipo).toBe('texto');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });

        it('Deve fortalecer tipo de variável com literal booleano', () => {
            const retornoLexador = lexador.mapear(['var ativo = verdadeiro'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.tipo).toBe('lógico');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });

        it('Deve fortalecer tipo de constante com literal numérico', () => {
            const retornoLexador = lexador.mapear(['constante PI = 3.14'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const constDeclaracao = declaracoesEstilizadas[0] as Const;
            expect(constDeclaracao.tipo).toBe('número');
            expect(constDeclaracao.tipoExplicito).toBe(true);
        });

        it('Não deve modificar tipo já explicitamente definido', () => {
            const retornoLexador = lexador.mapear(['var x: número = 5'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.tipo).toBe('número');
            expect(varDeclaracao.tipoExplicito).toBe(true);
        });

        it('Deve processar múltiplas declarações', () => {
            const retornoLexador = lexador.mapear([
                'var x = 5',
                'var nome = "Maria"',
                'constante PI = 3.14'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(3);
            expect((declaracoesEstilizadas[0] as Var).tipo).toBe('número');
            expect((declaracoesEstilizadas[1] as Var).tipo).toBe('texto');
            expect((declaracoesEstilizadas[2] as Const).tipo).toBe('número');
        });
    });

    describe('Convenção de Nomenclatura', () => {
        it('Deve validar variáveis em caixaCamelo', () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var MeuNome = "João"'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            expect(violacoes.length).toBeGreaterThan(0);
            expect(violacoes[0].regra).toBe('convencao-nomenclatura');
        });

        it('Deve transformar variáveis para caixaCamelo', () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixaCamelo'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var MeuNome = "João"'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.simbolo.lexema).toBe('meuNome');
        });

        it('Deve transformar constantes para CAIXA_ALTA', () => {
            const regra = new RegraConvencaoNomenclatura({
                constante: 'CAIXA_ALTA'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['constante piValor = 3.14'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const constDeclaracao = declaracoesEstilizadas[0] as Const;
            expect(constDeclaracao.simbolo.lexema).toBe('PI_VALOR');
        });

        it('Deve transformar variáveis para caixa_cobra quando configurado', () => {
            const regra = new RegraConvencaoNomenclatura({
                variavel: 'caixa_cobra'
            });
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['var meuNomeCompleto = "João Silva"'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(1);
            const varDeclaracao = declaracoesEstilizadas[0] as Var;
            expect(varDeclaracao.simbolo.lexema).toBe('meu_nome_completo');
        });
    });

    describe('Múltiplas Regras', () => {
        it('Deve aplicar múltiplas regras em sequência', () => {
            estilizador = new EstilizadorDelegua([
                new RegraFortalecerTipos(),
                new RegraConvencaoNomenclatura({
                    variavel: 'caixaCamelo'
                })
            ]);

            const retornoLexador = lexador.mapear(['var MeuNumero = 42'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

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
        it('Deve permitir adicionar regras dinamicamente', () => {
            estilizador = new EstilizadorDelegua();
            expect(estilizador.regras.length).toBe(0);

            estilizador.adicionarRegra(new RegraFortalecerTipos());
            expect(estilizador.regras.length).toBe(1);

            estilizador.adicionarRegra(new RegraConvencaoNomenclatura());
            expect(estilizador.regras.length).toBe(2);
        });

        it('Deve permitir remover regras pelo nome', () => {
            estilizador = new EstilizadorDelegua([
                new RegraFortalecerTipos(),
                new RegraConvencaoNomenclatura()
            ]);
            expect(estilizador.regras.length).toBe(2);

            estilizador.removerRegra('fortalecer-tipos');
            expect(estilizador.regras.length).toBe(1);
            expect(estilizador.regras[0].nome).toBe('convencao-nomenclatura');
        });
    });
});
