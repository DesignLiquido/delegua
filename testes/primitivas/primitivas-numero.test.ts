import primitivasNumero from '../../fontes/bibliotecas/primitivas-numero';
import { InterpretadorBase } from '../../fontes/interpretador';

describe('Primitivas de número', () => {
    let interpretador: InterpretadorBase;

    beforeEach(() => {
        interpretador = new InterpretadorBase(
            process.cwd(),
            false
        )
    });

    describe('arredondarParaBaixo()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.arredondarParaBaixo.implementacao(interpretador, 5.7);
            expect(resultado).toStrictEqual(5);
        });
    });

    describe('arredondarParaCima()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.arredondarParaCima.implementacao(interpretador, 2.5);
            expect(resultado).toStrictEqual(3);
        });
    });

    describe('absoluto()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.absoluto.implementacao(interpretador, -5);
            expect(resultado).toStrictEqual(5);
        });
    });

    describe('formatar()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(interpretador, 1234.56);
            expect(resultado).toStrictEqual('1.234,56');
        });

        it('Apenas parte inteira', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(interpretador, 1234);
            expect(resultado).toStrictEqual('1.234,00');
        });

        it('Apenas parte decimal', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(interpretador, 0.56);
            expect(resultado).toStrictEqual('0,56');
        });

        it('Com casas decimais personalizadas', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(interpretador, 1234.56789, { maximoCasasDecimais: 3 });
            expect(resultado).toStrictEqual('1.234,568');
        });
        it('Com casas decimais igual a zero', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(interpretador, 1234.56, { casasDecimais: 0 } );
            expect(resultado).toStrictEqual('1.234,56');
        });
            
        it('Número zero', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(interpretador, 0);
            expect(resultado).toStrictEqual('0,00');
        });

        it('Número muito pequeno', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(interpretador, 0.001);
            expect(resultado).toStrictEqual('0,00');
        });

        it('Número muito grande', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(interpretador, 999999999.99);
            expect(resultado).toStrictEqual('999.999.999,99');
        });
        

        it('Com casasDecimais definido como 0', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(
                interpretador, 
                1234.56, 
                { casasDecimais: 0 }
            );
            expect(resultado).toStrictEqual('1.234,56');
        });

        it('Com casasDecimais e maximoCasasDecimais diferentes', async () => {
            const resultado = await primitivasNumero.formatar.implementacao(
                interpretador, 
                1234.5, 
                { casasDecimais: 1, maximoCasasDecimais: 4 }
            );
            expect(resultado).toStrictEqual('1.234,5');
        });
    });
});
