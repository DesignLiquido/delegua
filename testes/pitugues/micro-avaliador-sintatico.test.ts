
import  {MicroAvaliadorSintaticoPitugues}  from '../../fontes/avaliador-sintatico/dialetos/micro-avaliador-sintatico-pitugues';
import { LexadorPitugues } from "../../fontes/lexador/dialetos";

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
            it('Olá Mundo', () => {
                const retornoLexador = lexador.mapear(
                    ["var nome = 'Design Liquido'",
                        "imprima(Olá, {nome}!)"
                    ],
                    HASH_ARQUIVO_EXEMPLO
                );
                const retornoMicroAvaliadorSintatico =
                    microAvaliadorSintatico.analisar(retornoLexador, HASH_ARQUIVO_EXEMPLO);
                expect(retornoMicroAvaliadorSintatico).toBeTruthy();
                expect(retornoMicroAvaliadorSintatico.declaracoes).toHaveLength(2);
            });
            
        });
    });
});
