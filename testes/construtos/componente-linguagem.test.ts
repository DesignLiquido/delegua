import { ComponenteLinguagem } from '../../fontes/construtos';
import { criarSimbolo } from './ajudantes';

describe('ComponenteLinguagem', () => {
    it('deve lançar erro no aceitar e formatar texto', async () => {
        const componente = new ComponenteLinguagem(1, criarSimbolo('retorna'));

        expect(componente.paraTexto()).toContain('componente-linguagem');
        expect(() => componente.aceitar({} as any)).toThrow(
            'Um componente de linguagem não tem método de visita.'
        );
        expect(() => componente.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
