import primitivasNumero from "../../../fontes/bibliotecas/dialetos/potigol/primitivas-numero";
import { InterpretadorPotigol } from "../../../fontes/interpretador/dialetos/potigol/interpretador-potigol";

describe('Primitivas de número - Potigol', () => {
    let interpretador: InterpretadorPotigol;

    beforeEach(() => {
        interpretador = new InterpretadorPotigol(
            process.cwd(), 
            false
        )
    });

    describe('arredonde()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.arredonde(interpretador, 123.45);
            expect(resultado).toStrictEqual(124);
        });
    });

    describe('caractere()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.caractere(interpretador, 97);
            expect(resultado).toStrictEqual('a');
        });
    });

    describe('inteiro()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.inteiro(interpretador, 123.45);
            expect(resultado).toStrictEqual(123);
        });
    });

    describe('qual_tipo()', () => {
        it('Inteiro', async () => {
            const resultado = await primitivasNumero.qual_tipo(interpretador, 123);
            expect(resultado).toStrictEqual('Inteiro');
        });

        it('Real', async () => {
            const resultado = await primitivasNumero.qual_tipo(interpretador, 123.45);
            expect(resultado).toStrictEqual('Real');
        });
    });

    describe('piso()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.piso(interpretador, 123.45);
            expect(resultado).toStrictEqual(123);
        });
    });

    describe('real()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.real(interpretador, 123.45);
            expect(resultado).toStrictEqual(123.45);
        });
    });

    describe('teto()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.teto(interpretador, 123.45);
            expect(resultado).toStrictEqual(124);
        });
    });
    
    describe('texto()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.texto(interpretador, 123.45);
            expect(resultado).toStrictEqual('123.45');
        });
    });
});
