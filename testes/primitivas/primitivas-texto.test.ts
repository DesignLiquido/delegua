import primitivasTexto from '../../fontes/bibliotecas/primitivas-texto';
import { InterpretadorBase } from '../../fontes/interpretador';

describe('Primitivas de texto', () => {
    let interpretador: InterpretadorBase;

    beforeEach(() => {
        interpretador = new InterpretadorBase(
            process.cwd(), 
            false
        )
    });

    describe('apararInicio()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.apararInicio(interpretador, '  olá   ');
            expect(resultado).toStrictEqual('olá   ');
        });
    });

    describe('aparar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.aparar(interpretador, '  olá  ');
            expect(resultado).toStrictEqual('olá');
        });
    });

    describe('apararFim()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.apararFim(interpretador, '  olá   ');
            expect(resultado).toStrictEqual('  olá');
        });
    });

    describe('concatenar()', () => {
        it('Trivial', async () => {
            const mensagem = "Olá";
            const resultado = await primitivasTexto.concatenar(interpretador, mensagem, ", mundo", "!!!");
            expect(resultado).toStrictEqual('Olá, mundo!!!');
        });
    });

    describe('dividir()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.dividir(interpretador, '123|456|789|0', '|', 4);
            expect(resultado).toStrictEqual(['123', '456', '789', '0']);
        });
    });

    describe('fatiar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.fatiar(interpretador, '1234567890', 4, 7);
            expect(resultado).toBe('567');
        });
    });

    describe('inclui()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.inclui(interpretador, '123', '3');
            expect(resultado).toBe(true);
        });
    });

    describe('maiusculo()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.maiusculo(interpretador, 'delégua');
            expect(resultado).toBe('DELÉGUA');
        });
    });

    describe('minusculo()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.minusculo(interpretador, 'DELÉGUA');
            expect(resultado).toBe('delégua');
        });
    });

    describe('substituir()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.substituir(interpretador, '123', '2', '4');
            expect(resultado).toBe('143');
        });
    });

    describe('subtexto()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.subtexto(interpretador, '1234567890', 2, 5);
            expect(resultado).toBe('345');
        });
    });

    describe('tamanho()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.tamanho(interpretador, '1234567890');
            expect(resultado).toBe(10);
        });
    });
});