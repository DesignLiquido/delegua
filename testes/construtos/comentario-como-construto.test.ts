import { ComentarioComoConstruto } from '../../fontes/construtos';
import { criarSimbolo } from './ajudantes';

describe('ComentarioComoConstruto', () => {
    it('deve identificar multiline e aceitar visitante', async () => {
        const visitante = { visitarExpressaoComentario: jest.fn().mockReturnValue('ok') } as any;
        const comentario = new ComentarioComoConstruto(criarSimbolo('comentario', 'DOCUMENTARIO'));

        expect(await comentario.aceitar(visitante)).toBe('ok');
        expect(comentario.multilinha).toBe(true);
        expect(comentario.paraTexto()).toContain('comentário-como-construto');
        expect(() => comentario.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
