import { Octeto } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Octeto', () => {
    it('deve cobrir getter e setter acentuados', () => {
        const octeto = new Octeto(
            criarLiteral(1),
            criarLiteral(2),
            criarLiteral(3),
            criarLiteral(4),
            criarLiteral(5),
            criarLiteral(6),
            criarLiteral(7),
            criarLiteral(8)
        );

        octeto['sétimo'] = criarLiteral(9) as any;
        expect(octeto['sétimo'].valor).toBe(9);
        expect(octeto.paraTexto()).toContain('octeto');
    });
});
