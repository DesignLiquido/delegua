import {MicroAvaliadorSintaticoPitugues} from '../../../../fontes/avaliador-sintatico/dialetos/micro-avaliador-sintatico-pitugues';
import { Binario } from '../../../../fontes/construtos';
import { Expressao } from '../../../../fontes/declaracoes';
import { LexadorPitugues } from "../../../../fontes/lexador/dialetos";

describe('MicroAvaliadorSintatico (Pituguês)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPitugues;
        let microAvaliadorSintatico: MicroAvaliadorSintaticoPitugues;
        const HASH_ARQUIVO_EXEMPLO = -1; // valor usado nos testes (identificador/fonte)

        beforeEach(() => {
            lexador = new LexadorPitugues();
            microAvaliadorSintatico = new MicroAvaliadorSintaticoPitugues();
        });

        describe('Casos de sucesso', () => {
            it('Operações matemáticas básicas', () => {
                const retornoLexador = lexador.mapear(
                    [
                        "3 + 2 * 5 / 8"
                    ],
                    HASH_ARQUIVO_EXEMPLO
                );
                const retornoMicroAvaliadorSintatico =
                    microAvaliadorSintatico.analisar(retornoLexador, HASH_ARQUIVO_EXEMPLO);

                expect(retornoMicroAvaliadorSintatico).toBeTruthy();
                expect(retornoMicroAvaliadorSintatico.declaracoes).toHaveLength(1);

                expect(retornoMicroAvaliadorSintatico.declaracoes[0].constructor).toBe(Expressao);

                const construtoPrincipal = (retornoMicroAvaliadorSintatico.declaracoes[0] as any).expressao;
                expect(construtoPrincipal.constructor).toBe(Binario);
            });
        });
    });
});

describe('MicroAvaliadorSintatico (Pituguês) - expressões adicionais', () => {
    it.each([
        ['[]'],
        ['[1, 2, 3]'],
        ['verdadeiro'],
        ['falso'],
        ['nulo'],
        ['-5'],
        ['2 ** 3'],
        ['1 + 2 - 3'],
        ['1 << 2 >> 1'],
        ['1 & 2'],
        ['1 | 2 ^ 3'],
        ['verdadeiro e falso'],
        ['verdadeiro ou falso'],
        ['1 em [1, 2]'],
        ['1 == 2'],
        ['v[0]'],
    ])('Analisa %s', (codigo: string) => {
        const lexador = new LexadorPitugues();
        const microAvaliadorSintatico = new MicroAvaliadorSintaticoPitugues();
        const retornoLexador = lexador.mapear([codigo], -1);
        const retorno = microAvaliadorSintatico.analisar(retornoLexador, -1);
        expect(retorno.erros).toHaveLength(0);
        expect(retorno.declaracoes).toHaveLength(1);
        expect(retorno.declaracoes[0]).toBeInstanceOf(Expressao);
    });
});
