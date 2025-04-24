import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { FormatadorPitugues } from "../../fontes/formatadores";
import { Lexador } from "../../fontes/lexador";

describe('Formatadores > Pituguês', () => {
    const lexador = new Lexador();
    const avaliadorSintatico = new AvaliadorSintatico();
    const formatador = new FormatadorPitugues();

    it('Trivial', () => {
        expect(lexador).toBeTruthy();
        expect(avaliadorSintatico).toBeTruthy();
        expect(formatador).toBeTruthy();
    });
});