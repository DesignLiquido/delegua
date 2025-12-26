import { AvaliadorSintaticoPitugues } from '../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-pitugues';
import { Lexador } from '../../fontes/lexador';
import { EstilizadorDelegua } from '../../fontes/estilizador/estilizador-delegua';
import { RegraParadigmaConsistente } from '../../fontes/estilizador/regras/paradigma-consistente';
import { Escreva } from '../../fontes/declaracoes';

describe('Regra Paradigma Consistente', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintaticoPitugues;
    let estilizador: EstilizadorDelegua;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintaticoPitugues();
    });

    describe('Modo imperativo', () => {
        beforeEach(() => {
            estilizador = new EstilizadorDelegua([new RegraParadigmaConsistente({ paradigma: 'imperativo' })]);
        });

        it('Deve transformar "escrever" para "escreva"', () => {
            const retornoLexador = lexador.mapear(['escrever("Hello")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBeGreaterThan(0);
            const escreva = declaracoesEstilizadas[0] as Escreva;
            expect(escreva.simboloEscreva).toBeDefined();
            expect(escreva.simboloEscreva!.lexema).toBe('escreva');
        });

        it('Deve manter "escreva" como está', () => {
            const retornoLexador = lexador.mapear(['escreva("Hello")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBeGreaterThan(0);
            const escreva = declaracoesEstilizadas[0] as Escreva;
            expect(escreva.simboloEscreva).toBeDefined();
            expect(escreva.simboloEscreva!.lexema).toBe('escreva');
        });

        it('Deve validar violações para palavras infinitivas', () => {
            const retornoLexador = lexador.mapear(['escrever("Hello")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            const violacao = violacoes.find((v) => v.regra === 'paradigma-consistente');
            if (violacao) {
                expect(violacao.mensagem).toContain('paradigma');
            }
        });
    });

    describe('Modo infinitivo', () => {
        beforeEach(() => {
            estilizador = new EstilizadorDelegua([new RegraParadigmaConsistente({ paradigma: 'infinitivo' })]);
        });

        it('Deve transformar "escreva" para "escrever"', () => {
            const retornoLexador = lexador.mapear(['escreva("Hello")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBeGreaterThan(0);
            const escreva = declaracoesEstilizadas[0] as Escreva;
            expect(escreva.simboloEscreva).toBeDefined();
            expect(escreva.simboloEscreva!.lexema).toBe('escrever');
        });

        it('Deve manter "escrever" como está', () => {
            const retornoLexador = lexador.mapear(['escrever("Hello")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBeGreaterThan(0);
            const escreva = declaracoesEstilizadas[0] as Escreva;
            expect(escreva.simboloEscreva).toBeDefined();
            expect(escreva.simboloEscreva!.lexema).toBe('escrever');
        });

        it('Deve validar violações para palavras imperativas', () => {
            const retornoLexador = lexador.mapear(['escreva("Hello")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            const violacao = violacoes.find((v) => v.regra === 'paradigma-consistente');
            if (violacao) {
                expect(violacao.mensagem).toContain('paradigma');
            }
        });
    });

    describe('Modo ambos (padrão)', () => {
        beforeEach(() => {
            estilizador = new EstilizadorDelegua([new RegraParadigmaConsistente({ paradigma: 'ambos' })]);
        });

        it('Deve aceitar "escreva" sem transformação', () => {
            const retornoLexador = lexador.mapear(['escreva("Hello")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBeGreaterThan(0);
            const escreva = declaracoesEstilizadas[0] as Escreva;
            expect(escreva.simboloEscreva).toBeDefined();
            expect(escreva.simboloEscreva!.lexema).toBe('escreva');
        });

        it('Deve aceitar "escrever" sem transformação', () => {
            const retornoLexador = lexador.mapear(['escrever("Hello")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBeGreaterThan(0);
            const escreva = declaracoesEstilizadas[0] as Escreva;
            expect(escreva.simboloEscreva).toBeDefined();
            expect(escreva.simboloEscreva!.lexema).toBe('escrever');
        });

        it('Não deve gerar violações', () => {
            const retornoLexador = lexador.mapear(['escreva("Hello")', 'escrever("World")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            const violacao = violacoes.find((v) => v.regra === 'paradigma-consistente');
            expect(violacao).toBeUndefined();
        });
    });

    describe('Criação sem opções', () => {
        it('Deve usar paradigma "ambos" como padrão', () => {
            const regra = new RegraParadigmaConsistente();
            estilizador = new EstilizadorDelegua([regra]);

            const retornoLexador = lexador.mapear(['escreva("Hello")', 'escrever("World")'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const declaracoesEstilizadas = estilizador.estilizar(retornoAvaliadorSintatico.declaracoes);
            const violacoes = estilizador.validar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracoesEstilizadas.length).toBe(2);
            expect(violacoes.find((v) => v.regra === 'paradigma-consistente')).toBeUndefined();
        });
    });
});
