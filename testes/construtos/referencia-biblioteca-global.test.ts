import { ReferenciaBibliotecaGlobal } from '../../fontes/construtos';

describe('ReferenciaBibliotecaGlobal', () => {
    it('deve rejeitar aceitar e formatar texto', async () => {
        const referencia = new ReferenciaBibliotecaGlobal(1, 1, 'matematica');

        expect(referencia.paraTexto()).toContain('referência-biblioteca-global');
        await expect(referencia.aceitar({} as any)).rejects.toThrow('Este método não deveria ser chamado.');
        expect(() => referencia.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
