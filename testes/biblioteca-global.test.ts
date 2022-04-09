import { Delegua } from "../fontes/delegua";

describe('Biblioteca Global', () => {
    describe('aleatorio()', () => {
        const delegua = new Delegua('delegua');
        
        it('Trivial', () => {
            const simbolos = delegua.lexador.mapear(["escreva(aleatorio())"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });

    describe('aleatorioEntre()', () => {
        const delegua = new Delegua('delegua');
        
        it('Sucesso', () => {
            const simbolos = delegua.lexador.mapear(["escreva(aleatorioEntre(1, 5))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });

    describe('inteiro()', () => {
        const delegua = new Delegua('delegua');
        
        it('Sucesso', () => {
            const simbolos = delegua.lexador.mapear(["escreva(inteiro(1))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });

        it('Falha - Não inteiro', () => {
            const simbolos = delegua.lexador.mapear(["escreva(inteiro('Oi'))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });

        it('Falha - Nulo', () => {
            const simbolos = delegua.lexador.mapear(["escreva(inteiro(nulo))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });
    });

    describe('mapear()', () => {
        const delegua = new Delegua('delegua');
        
        it('Sucesso', () => {
            const codigo = [
                "var f = funcao(x) { retorna(x ** x) }",
                "escreva(mapear([1, 2, 3], f))"
            ];
            const simbolos = delegua.lexador.mapear(codigo);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });

    describe('ordenar()', () => {
        const delegua = new Delegua('delegua');
        
        it('Sucesso', () => {
            const codigo = [
                "ordenar([5, 12, 10, 1, 4, 25, 33, 9, 7, 6, 2])"
            ];
            const simbolos = delegua.lexador.mapear(codigo);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });

    describe('real()', () => {
        const delegua = new Delegua('delegua');
        
        it('Sucesso', () => {
            const simbolos = delegua.lexador.mapear(["escreva(real(3.14))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });

        it('Falha - Não inteiro', () => {
            const simbolos = delegua.lexador.mapear(["escreva(real('Oi'))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });

        it('Falha - Nulo', () => {
            const simbolos = delegua.lexador.mapear(["escreva(real(nulo))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });
    });

    describe('tamanho()', () => {
        const delegua = new Delegua('delegua');
        
        it('Sucesso', () => {
            const simbolos = delegua.lexador.mapear(["escreva(tamanho([1, 2, 3]))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });

        it('Falha - Não lista', () => {
            const simbolos = delegua.lexador.mapear(["escreva(tamanho(1))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });

        it('Falha - Nulo', () => {
            const simbolos = delegua.lexador.mapear(["escreva(tamanho(nulo))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(true);
        });
    });

    describe('texto()', () => {
        const delegua = new Delegua('delegua');
        
        it('Trivial', () => {
            const simbolos = delegua.lexador.mapear(["escreva(texto(123))"]);
            const declaracoes = delegua.avaliadorSintatico.analisar(simbolos);
            delegua.resolvedor.resolver(declaracoes);
            delegua.interpretador.interpretar(declaracoes);

            expect(delegua.teveErroEmTempoDeExecucao).toBe(false);
        });
    });
});