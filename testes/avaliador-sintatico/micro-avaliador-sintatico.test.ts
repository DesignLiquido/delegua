import { MicroLexador } from '../../fontes/lexador/micro-lexador';
import { MicroAvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Expressao } from '../../fontes/declaracoes';
import { AcessoIndiceVariavel, Binario, Dicionario, Elvis, Logico, Unario, Vetor } from '../../fontes/construtos';

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let microLexador: MicroLexador;
        let microAvaliadorSintatico: MicroAvaliadorSintatico;

        beforeEach(() => {
            microLexador = new MicroLexador();
            microAvaliadorSintatico = new MicroAvaliadorSintatico();
        });

        describe('Casos de sucesso', () => {
            it('Código Vazio', () => {
                const retornoLexador = microLexador.mapear("");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(0);
            });

            it('Olá Mundo', () => {
                const retornoLexador = microLexador.mapear("'Olá mundo'");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Chamada de função', () => {
                const retornoLexador = microLexador.mapear("somar(2, 3)");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Vetor literal', () => {
                const retornoLexador = microLexador.mapear("[1, 2, 3, 4, 5]");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Acesso a propriedade por índice numérico', () => {
                const retornoLexador = microLexador.mapear("a[1]");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Operador Elvis', () => {
                const retornoLexador = microLexador.mapear("a ?: b");
                const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                const expressao = retornoAvaliadorSintatico.declaracoes[0];
                expect(expressao).toBeInstanceOf(Elvis);
            });
        });        
    });
});

describe('Micro avaliador sintático (expressões adicionais)', () => {
    it.each([
        ['[]', Vetor],
        ['-5', Unario],
        ['2 ** 3', Binario],
        ['2 * 3 / 4 % 5', Binario],
        ['1 + 2 - 3', Binario],
        ['verdadeiro e falso', Logico],
        ['verdadeiro ou falso', Logico],
        ['v[0]', AcessoIndiceVariavel],
        ['{}', Dicionario],
        ["{'a': 1, 'b': 2}", Dicionario],
        ['!verdadeiro', Unario],
        ['!!verdadeiro', Unario],
        ['~5', Unario],
        ['1 << 2 >> 1', Binario],
        ['1 & 2', Binario],
        ['1 | 2 ^ 3', Binario],
        ['1 < 2', Binario],
        ['1 <= 2', Binario],
        ['1 > 2', Binario],
        ['1 >= 2', Binario],
        ['1 == 2', Binario],
        ['1 != 2', Binario],
    ])('Analisa %s', (codigo: string, tipoEsperado: any) => {
        const microLexador = new MicroLexador();
        const microAvaliadorSintatico = new MicroAvaliadorSintatico();
        const retornoLexador = microLexador.mapear(codigo);
        expect(retornoLexador.erros).toHaveLength(0);
        const retornoAvaliadorSintatico = microAvaliadorSintatico.analisar(retornoLexador, 1);
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(tipoEsperado);
    });
});
