import { Decorador } from '../../fontes/construtos';
import { criarLiteral } from './ajudantes';

describe('Decorador', () => {
    it('deve serializar atributos e rejeitar aceitar', async () => {
        const decorador = new Decorador(1, 1, 'registrar', {
            ativo: true,
            alvo: criarLiteral('x', 'texto'),
        });

        expect(decorador.paraTexto()).toContain('decorador');
        expect(decorador.paraTexto()).toContain('ativo=true');
        await expect(decorador.aceitar({} as any)).rejects.toThrow('Este método não deveria ser chamado.');
        expect(() => decorador.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
