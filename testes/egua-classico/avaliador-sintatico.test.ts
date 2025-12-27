import { AvaliadorSintaticoEguaClassico } from "../../fontes/avaliador-sintatico/dialetos";
import { SimboloInterface } from "../../fontes/interfaces";
import { RetornoLexador } from "../../fontes/interfaces/retornos/retorno-lexador";
import { LexadorEguaClassico } from "../../fontes/lexador/dialetos";

describe('Avaliador sintático (Égua Clássico)', () => {
    describe('analisar()', () => {
        let lexador: LexadorEguaClassico;
        let avaliadorSintatico: AvaliadorSintaticoEguaClassico;

        beforeEach(() => {
            lexador = new LexadorEguaClassico();
            avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
        });

        it('Sucesso - Olá Mundo', async () => {
            const retornoLexador = lexador.mapear(["escreva('Olá mundo');"]);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Falha - Vetor vazio', async () => {
            await expect(avaliadorSintatico.analisar({ simbolos: [] } as any as RetornoLexador<SimboloInterface>, -1)).rejects.toThrow(TypeError);
        });

        it('Falha - Undefined', async () => {
            await expect(avaliadorSintatico.analisar(undefined as any, -1)).rejects.toThrow(TypeError);
        });

        it('Falha - Null', async () => {
            await expect(avaliadorSintatico.analisar(null as any, -1)).rejects.toThrow(TypeError);
        });
    });
});