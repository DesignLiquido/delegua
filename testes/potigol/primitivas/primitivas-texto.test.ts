import primitivasTexto from '../../../fontes/bibliotecas/dialetos/potigol/primitivas-texto';
import { InterpretadorPotigol } from '../../../fontes/interpretador/dialetos/potigol/interpretador-potigol';

describe('Primitivas de texto - Potigol', () => {
    let interpretador: InterpretadorPotigol;

    beforeEach(() => {
        interpretador = new InterpretadorPotigol(
            process.cwd(), 
            false
        )
    });

    describe('cabeça()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.cabeça(interpretador, 'abc');
            expect(resultado).toStrictEqual('a');
        });
    });

    describe('cauda()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.cauda(interpretador, 'abc');
            expect(resultado).toStrictEqual('bc');
        });
    });

    describe('contém()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.contém(interpretador, 'abc', 'b');
            expect(resultado).toBe(true);
        });

        it('Elemento inexistente', async () => {
            const resultado = await primitivasTexto.contém(interpretador, 'abc', 'f');
            expect(resultado).toBe(false);
        });
    });

    describe('descarte()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.descarte(interpretador, 'abcde', 2);
            expect(resultado).toStrictEqual('cde');
        });
    });

    describe('divida()', () => {
        it('Sem separador como argumento', async () => {
            const resultado = await primitivasTexto.divida(interpretador, 'Um texto');
            expect(resultado).toStrictEqual(['Um', 'texto']);
        });

        it('Com separador como argumento', async () => {
            const resultado = await primitivasTexto.divida(interpretador, 'Um-texto', '-');
            expect(resultado).toStrictEqual(['Um', 'texto']);
        });
    });

    describe('insira()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.insira(interpretador, 'abc', 3, 'd');
            expect(resultado).toStrictEqual('abdc');
        });
    });

    describe('inteiro()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.inteiro(interpretador, '123');
            expect(resultado).toStrictEqual(123);
        });

        it('Texto decimal', async () => {
            const resultado = await primitivasTexto.inteiro(interpretador, '123.45');
            expect(resultado).toStrictEqual(123);
        });
    });

    describe('inverta()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.inverta(interpretador, 'abcde');
            expect(resultado).toStrictEqual('edcba');
        });
    });

    describe('junte()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.junte(interpretador, 'abc', '-');
            expect(resultado).toStrictEqual('a-b-c');
        });
    });

    describe('lista()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.lista(interpretador, 'abc');
            expect(resultado).toStrictEqual(['a', 'b', 'c']);
        });
    });

    describe('maiúsculo()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.maiúsculo(interpretador, 'Abc');
            expect(resultado).toStrictEqual('ABC');
        });
    });

    describe('minúsculo()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.minúsculo(interpretador, 'Abc');
            expect(resultado).toStrictEqual('abc');
        });
    });

    describe('ordene()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.ordene(interpretador, 'bca');
            expect(resultado).toStrictEqual('abc');
        });
    });

    describe('pegue()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.pegue(interpretador, 'abcde', 3);
            expect(resultado).toStrictEqual('abc');
        });
    });

    describe('posição()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.posição(interpretador, 'abcde', 'b');
            expect(resultado).toStrictEqual(2);
        });
    });

    describe('qual_tipo()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.qual_tipo(interpretador, 'bca');
            expect(resultado).toStrictEqual('Texto');
        });
    });

    describe('real()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.real(interpretador, '123.45');
            expect(resultado).toStrictEqual(123.45);
        });
    });

    describe('remova()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.remova(interpretador, 'abc', 2);
            expect(resultado).toStrictEqual('ac');
        });
    });

    describe('tamanho()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.tamanho(interpretador, 'abc');
            expect(resultado).toStrictEqual(3);
        });
    });

    describe('último()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasTexto.último(interpretador, 'abc');
            expect(resultado).toStrictEqual('c');
        });

        it('Texto vazio', async () => {
            const resultado = await primitivasTexto.último(interpretador, '');
            expect(resultado).toStrictEqual('');
        });
    });
});