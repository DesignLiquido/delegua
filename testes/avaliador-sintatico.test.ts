import { Delegua } from "../fontes/delegua";

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        const delegua = new Delegua('delegua');

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo')"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - Vetor vazio', () => {
            const retornoLexador = delegua.lexador.mapear(["var vetorVazio = []"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - Dicionário vazio', () => {
            const retornoLexador = delegua.lexador.mapear(["var dicionarioVazio = {}"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - Undefined', () => {
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(undefined);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });

        it('Sucesso - Null', () => {
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(null);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
        });

        it('Falha - Não é permitido ter dois identificadores seguidos na mesma linha', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva('Olá mundo') identificador1 identificador2"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            expect(retornoAvaliadorSintatico.erros[0].message).toBe('Não é permitido ter dois identificadores seguidos na mesma linha.');
        });

        describe('Funções Anônimas', () => {
            it('Função anônima com mais de 255 parâmetros', () => {
                let acumulador = "";
                for (let i = 1; i <= 256; i++) {
	                acumulador += "a" + i + ", "
                }

                acumulador = acumulador.substring(0, acumulador.length - 2);

                const funcaoCom256Argumentos = "var f = funcao(" + acumulador + ") {}"
                const retornoLexador = delegua.lexador.mapear([funcaoCom256Argumentos], -1);
                const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
                expect(retornoAvaliadorSintatico.erros[0].message).toBe('Não pode haver mais de 255 parâmetros');
            })
        });
    });
});