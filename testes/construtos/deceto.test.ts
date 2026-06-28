import { Deceto } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Deceto', () => {
    it('deve cobrir getters e setters acentuados', () => {
        const deceto = new Deceto(
            criarLiteral(1),
            criarLiteral(2),
            criarLiteral(3),
            criarLiteral(4),
            criarLiteral(5),
            criarLiteral(6),
            criarLiteral(7),
            criarLiteral(8),
            criarLiteral(9),
            criarLiteral(10)
        );

        deceto['sétimo'] = criarLiteral(11) as any;
        deceto['décimo'] = criarLiteral(12) as any;

        expect(deceto['sétimo'].valor).toBe(11);
        expect(deceto['décimo'].valor).toBe(12);
        expect(deceto.paraTexto()).toContain('deceto');
        expect(deceto.paraTextoSaida()).toContain('12');
    });
});
