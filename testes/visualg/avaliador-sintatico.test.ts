import { Delegua } from "../../fontes/delegua";

describe('Avaliador sintático (VisuAlg)', () => {
    describe('analisar()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('visualg');
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = delegua.lexador.mapear([
                "algoritmo 'olá-mundo'",
                "inicio",
                "escreva('Olá mundo')",
                "fimalgoritmo"
            ], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - Para', () => {
            const retornoLexador = delegua.lexador.mapear([
                "algoritmo 'Numeros de 1 a 10'",
                "var j: inteiro",
                "inicio",
                "    para j de 1 ate 10 faca",
                "        escreva (j)",
                "    fimpara",
                "fimalgoritmo"
            ], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - Escolha', () => {
            const retornoLexador = delegua.lexador.mapear([
                'algoritmo "Times"',
                'var time: caractere',
                'inicio',
                'escreva ("Entre com o nome de um time de futebol: ")',
                'leia (time)',
                'escolha time',
                '    caso "Flamengo", "Fluminense", "Vasco", "Botafogo"',
                '        escreval ("É um time carioca.")',
                '    caso "São Paulo", "Palmeiras", "Santos", "Corínthians"',
                '        escreval ("É um time paulista.")',
                '    outrocaso',
                '        escreval ("É de outro estado.")',
                'fimescolha',
                'fimalgoritmo'
            ], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
        });
    });
});