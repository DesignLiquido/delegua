import { Noneto } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Noneto', () => {
    it('deve cobrir getter e setter acentuados', () => {
        const noneto = new Noneto(
            criarLiteral(1),
            criarLiteral(2),
            criarLiteral(3),
            criarLiteral(4),
            criarLiteral(5),
            criarLiteral(6),
            criarLiteral(7),
            criarLiteral(8),
            criarLiteral(9)
        );

        noneto['sétimo'] = criarLiteral(10) as any;
        expect(noneto['sétimo'].valor).toBe(10);
        expect(noneto.paraTexto()).toContain('noneto');
    });
});
