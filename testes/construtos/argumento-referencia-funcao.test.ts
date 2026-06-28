import { ArgumentoReferenciaFuncao } from '../../fontes/construtos';
import { criarSimbolo } from './ajudantes';

describe('ArgumentoReferenciaFuncao', () => {
    it('deve aceitar visitante e gerar paraTexto', async () => {
        const visitante = {
            visitarExpressaoArgumentoReferenciaFuncao: jest.fn().mockReturnValue('ok'),
        } as any;
        const argumento = new ArgumentoReferenciaFuncao(1, 1, criarSimbolo('minhaFuncao'));

        expect(await argumento.aceitar(visitante)).toBe('ok');
        expect(argumento.paraTexto()).toContain('argumento-referência-função');
        expect(() => argumento.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
