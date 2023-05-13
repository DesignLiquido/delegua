import primitivasTexto from '../../fontes/bibliotecas/primitivas-texto';

describe('Primitivas de texto', () => {
    describe('apararInicio()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.apararInicio('  olá   ');
            expect(resultado).toStrictEqual('olá   ');
        });
    });

    describe('aparar()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.aparar('  olá  ');
            expect(resultado).toStrictEqual('olá');
        });
    });

    describe('apararFim()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.apararFim('  olá   ');
            expect(resultado).toStrictEqual('  olá');
        });
    });

    describe('dividir()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.dividir('123|456|789|0', '|', 4);
            expect(resultado).toStrictEqual(['123', '456', '789', '0']);
        });
    });

    describe('fatiar()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.fatiar('1234567890', 4, 7);
            expect(resultado).toBe('567');
        });
    });

    describe('inclui()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.inclui('123', '3');
            expect(resultado).toBe(true);
        });
    });

    describe('maiusculo()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.maiusculo('delégua');
            expect(resultado).toBe('DELÉGUA');
        });
    });

    describe('minusculo()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.minusculo('DELÉGUA');
            expect(resultado).toBe('delégua');
        });
    });

    describe('substituir()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.substituir('123', '2', '4');
            expect(resultado).toBe('143');
        });
    });

    describe('subtexto()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.subtexto('1234567890', 2, 5);
            expect(resultado).toBe('345');
        });
    });

    describe('tamanho()', () => {
        it('Trivial', () => {
            const resultado = primitivasTexto.tamanho('1234567890');
            expect(resultado).toBe(10);
        });
    });
});