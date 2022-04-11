import { Delegua } from "../fontes/delegua";

describe('Biblioteca Global', () => {
    let delegua: Delegua;

    beforeEach(() => {
        delegua = new Delegua('delegua');
    });

    describe('aleatorio()', () => { 
        it('Trivial', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(aleatorio())"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });

    describe('aleatorioEntre()', () => {        
        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(aleatorioEntre(1, 5))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });

    describe('inteiro()', () => {
        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(inteiro(1))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });

        it('Falha - Não inteiro', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(inteiro('Oi'))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });

        it('Falha - Nulo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(inteiro(nulo))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });
    });

    describe('mapear()', () => {        
        it('Sucesso', () => {
            const codigo = [
                "var f = funcao(x) { retorna(x ** x) }",
                "escreva(mapear([1, 2, 3], f))"
            ];
            const retornoLexador = delegua.lexador.mapear(codigo);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });

    describe('ordenar()', () => {        
        it('Sucesso', () => {
            const codigo = [
                "ordenar([5, 12, 10, 1, 4, 25, 33, 9, 7, 6, 2])"
            ];
            const retornoLexador = delegua.lexador.mapear(codigo);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });

    describe('real()', () => {
        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(real(3.14))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });

        it('Falha - Não inteiro', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(real('Oi'))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });

        it('Falha - Nulo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(real(nulo))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });
    });

    describe('tamanho()', () => {        
        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(tamanho([1, 2, 3]))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });

        it('Falha - Não lista', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(tamanho(1))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });

        it('Falha - Nulo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(tamanho(nulo))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });
    });

    describe('texto()', () => {        
        it('Trivial', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(texto(123))"]);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador.simbolos);
            delegua.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);
            delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });
});