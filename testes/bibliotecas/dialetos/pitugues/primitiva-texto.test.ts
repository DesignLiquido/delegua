import primitivaTexto from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-texto';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { TuplaN } from '../../../../fontes/construtos/tupla-n';
import { Literal } from '../../../../fontes/construtos';

describe('primitiva-texto', () => {
    const interpretador = criarInterpretadorMock();

    describe('particao / partição', () => {
        it('deve partir o texto corretamente quando o separador existe', async () => {
            const texto = "I could eat bananas all day";
            const separador = "bananas";

            const resultado = await primitivaTexto.particao.implementacao(
                interpretador,
                'particao',
                texto,
                separador
            );

            expect(resultado).toBeInstanceOf(TuplaN);
            expect(resultado.tipo).toBe('tupla');

            const valores = resultado.elementos.map((elemento: Literal) => elemento.valor);
            expect(valores).toEqual(['I could eat ', 'bananas', ' all day']);
            expect(resultado.paraTextoSaida()).toBe('("I could eat ", "bananas", " all day")');
        });

        it('deve retornar tupla com campos vazios quando o separador não existe', async () => {
            const texto = "fruta";
            const separador = "carro";

            const resultado = await primitivaTexto.particao.implementacao(
                interpretador,
                'particao',
                texto,
                separador
            );

            expect(resultado).toBeInstanceOf(TuplaN);
            expect(resultado.tipo).toBe('tupla');

            const valores = resultado.elementos.map((elemento: Literal) => elemento.valor);
            expect(valores).toEqual(['fruta', '', '']);
            expect(resultado.paraTextoSaida()).toBe('("fruta", "", "")');
        });

        it('a versão com acento (partição) deve ter o mesmo comportamento', async () => {
            const texto = "python-pitugues";
            const separador = "-";

            const resultado = await primitivaTexto.partição.implementacao(
                interpretador,
                'partição',
                texto,
                separador
            );

            expect(resultado).toBeInstanceOf(TuplaN);
            expect(resultado.tipo).toBe('tupla');

            const valores = resultado.elementos.map((elemento: Literal) => elemento.valor);
            expect(valores).toEqual(['python', '-', 'pitugues']);
            expect(resultado.paraTextoSaida()).toBe('("python", "-", "pitugues")');
        });

        it('deve lidar com separadores no início do texto', async () => {
            const texto = ".texto";
            const separador = ".";

            const resultado = await primitivaTexto.particao.implementacao(
                interpretador,
                'particao',
                texto,
                separador
            );

            expect(resultado).toBeInstanceOf(TuplaN);
            expect(resultado.tipo).toBe('tupla');

            const valores = resultado.elementos.map((elemento: Literal) => elemento.valor);
            expect(valores).toEqual(['', '.', 'texto']);
            expect(resultado.paraTextoSaida()).toBe('("", ".", "texto")');
        });
    });
});