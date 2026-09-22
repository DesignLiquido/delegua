import { Separador } from '../../fontes/construtos';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';
import { criarSimbolo } from './ajudantes';

describe('Separador', () => {
    it('deve aceitar visitante e serializar conteúdo', async () => {
        const visitante = { visitarExpressaoSeparador: jest.fn().mockReturnValue('ok') } as any;
        const separador = new Separador(criarSimbolo(';', tiposDeSimbolos.PONTO_E_VIRGULA));

        expect(await separador.aceitar(visitante)).toBe('ok');
        expect(separador.paraTexto()).toContain('separador');
        expect(() => separador.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
