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
            const resultado = await primitivasTexto.apararInicio.implementacao(interpretador, '  olá   ');
            expect(resultado).toStrictEqual('olá   ');
        });
    });

    describe('aparar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.aparar.implementacao(interpretador, '  olá  ');
            expect(resultado).toStrictEqual('olá');
        });
    });

    describe('apararFim()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.apararFim.implementacao(interpretador, '  olá   ');
            expect(resultado).toStrictEqual('  olá');
        });
    });

    describe('concatenar()', () => {
        it('Trivial', async () => {
            const mensagem = "Olá";
            const resultado = await primitivasTexto.concatenar.implementacao(interpretador, mensagem, ", mundo", "!!!");
            expect(resultado).toStrictEqual('Olá, mundo!!!');
        });
    });

    describe('dividir()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.dividir.implementacao(interpretador, '123|456|789|0', '|', 4);
            expect(resultado).toStrictEqual(['123', '456', '789', '0']);
        });

        it('Trivial', async () => {
            const resultado = await primitivasTexto.dividir.implementacao(interpretador, 'TEXTO', '');
            expect(resultado).toStrictEqual(['T', 'E', 'X', 'T', 'O']);
        });
    });

    describe('fatiar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.fatiar.implementacao(interpretador, '1234567890', 4, 7);
            expect(resultado).toBe('567');
        });
    });

    describe('inclui()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.inclui.implementacao(interpretador, '123', '3');
            expect(resultado).toBe(true);
        });
    });

    describe('maiusculo()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.maiusculo.implementacao(interpretador, 'delégua');
            expect(resultado).toBe('DELÉGUA');
        });
    });

    describe('minusculo()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.minusculo.implementacao(interpretador, 'DELÉGUA');
            expect(resultado).toBe('delégua');
        });
    });

    describe('substituir()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.substituir.implementacao(interpretador, '123', '2', '4');
            expect(resultado).toBe('143');
        });
    });

    describe('subtexto()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.subtexto.implementacao(interpretador, '1234567890', 2, 5);
            expect(resultado).toBe('345');
        });
    });

    describe('tamanho()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.tamanho.implementacao(interpretador, '1234567890');
            expect(resultado).toBe(10);
        });
    });
});