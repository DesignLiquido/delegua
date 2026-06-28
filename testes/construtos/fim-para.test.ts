import { Binario, FimPara, Literal } from '../../fontes/construtos';
import { Bloco } from '../../fontes/declaracoes';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';
import { criarSimbolo } from './ajudantes';

describe('FimPara', () => {
    it('deve aceitar visitante e serializar condicao e incremento', async () => {
        const visitante = { visitarExpressaoFimPara: jest.fn().mockReturnValue('ok') } as any;
        const operador = criarSimbolo('+', tiposDeSimbolos.ADICAO);
        const binario = new Binario(1, new Literal(1, 1, 1, 'número'), operador, new Literal(1, 1, 2, 'número'));
        const incremento = new Bloco(1, 1, []);
        const fimPara = new FimPara(1, 1, binario as any, incremento);

        expect(await fimPara.aceitar(visitante)).toBe('ok');
        expect(fimPara.paraTexto()).toContain('fim-para');
        expect(() => fimPara.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
