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

    describe('arredondarParaCima()', () => {
        it('Trivial', async () => {
            const resultado = await primitivasNumero.arredondarParaCima(interpretador, 2.5);
            expect(resultado).toStrictEqual(3);
        });
    });
});