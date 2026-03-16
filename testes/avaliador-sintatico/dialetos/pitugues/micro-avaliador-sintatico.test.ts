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
