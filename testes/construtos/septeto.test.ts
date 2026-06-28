import { Septeto } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Septeto', () => {
    it('deve cobrir getter e setter acentuados', () => {
        const septeto = new Septeto(
            criarLiteral(1),
            criarLiteral(2),
            criarLiteral(3),
            criarLiteral(4),
            criarLiteral(5),
            criarLiteral(6),
            criarLiteral(7)
        );

        septeto['sétimo'] = criarLiteral(8) as any;
        expect(septeto['sétimo'].valor).toBe(8);
        expect(septeto.paraTexto()).toContain('septeto');
    });
});
