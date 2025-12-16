import { InterpretadorPituguesComDepuracao } from '../../../../fontes/interpretador/dialetos/pitugues/interpretador-pitugues-com-depuracao';
import * as comum from '../../../../fontes/interpretador/dialetos/pitugues/comum';
import { AcessoMetodo, AcessoMetodoOuPropriedade, AcessoPropriedade } from '../../../../fontes/construtos';
import { AcessoIntervaloVariavel } from '../../../../fontes/construtos/acesso-intervalo-variavel';

describe('InterpretadorPituguesComDepuracao', () => {
    let interpretador: InterpretadorPituguesComDepuracao;

    beforeEach(() => {
        interpretador = new InterpretadorPituguesComDepuracao('', () => {}, () => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('delegates visitarExpressaoAcessoMetodo to comum.visitarExpressaoAcessoMetodo and returns value', async () => {
        const spy = jest
            .spyOn(comum, 'visitarExpressaoAcessoMetodo')
            .mockResolvedValue('ok-metodo');

        const objeto = { linha: 1, paraTexto: () => '<obj>' } as any;
        const expressao = new AcessoMetodo(1, objeto, 'm');

        await expect(interpretador.visitarExpressaoAcessoMetodo(expressao)).resolves.toBe('ok-metodo');
        expect(spy).toHaveBeenCalledWith(interpretador, expressao);
    });

    it('delegates visitarExpressaoAcessoMetodoOuPropriedade to comum.visitarExpressaoAcessoMetodoOuPropriedade and returns value', async () => {
        const spy = jest
            .spyOn(comum, 'visitarExpressaoAcessoMetodoOuPropriedade')
            .mockResolvedValue('ok-meth-prop');

        const objeto = { linha: 2, paraTexto: () => '<o>' } as any;
        const simbolo = { lexema: 'x' } as any;
        const expressao = new AcessoMetodoOuPropriedade(2, objeto, simbolo);

        await expect(interpretador.visitarExpressaoAcessoMetodoOuPropriedade(expressao)).resolves.toBe(
            'ok-meth-prop'
        );
        expect(spy).toHaveBeenCalledWith(interpretador, expressao);
    });

    it('delegates visitarExpressaoAcessoPropriedade to comum.visitarExpressaoAcessoPropriedade and returns value', async () => {
        const spy = jest
            .spyOn(comum, 'visitarExpressaoAcessoPropriedade')
            .mockResolvedValue('ok-prop');

        const objeto = { linha: 3, paraTexto: () => '<o>' } as any;
        const expressao = new AcessoPropriedade(3, objeto, 'nome');

        await expect(interpretador.visitarExpressaoAcessoPropriedade(expressao)).resolves.toBe('ok-prop');
        expect(spy).toHaveBeenCalledWith(interpretador, expressao);
    });

    it('delegates visitarExpressaoAcessoIntervaloVariavel to comum.visitarExpressaoAcessoIntervaloVariavel and returns value', async () => {
        const spy = jest
            .spyOn(comum, 'visitarExpressaoAcessoIntervaloVariavel')
            .mockResolvedValue('ok-intervalo');

        const entidade = { linha: 4, paraTexto: () => '<e>' } as any;
        const simb = { lexema: ']' } as any;
        const expressao = new AcessoIntervaloVariavel(4, entidade, null, null, simb);

        await expect(interpretador.visitarExpressaoAcessoIntervaloVariavel(expressao)).resolves.toBe(
            'ok-intervalo'
        );
        expect(spy).toHaveBeenCalledWith(interpretador, expressao);
    });

    it('propagates rejection from comum functions', async () => {
        const spy = jest
            .spyOn(comum, 'visitarExpressaoAcessoMetodo')
            .mockRejectedValue(new Error('boom'));

        const objeto = { linha: 1, paraTexto: () => '<obj>' } as any;
        const expressao = new AcessoMetodo(1, objeto, 'm');

        await expect(interpretador.visitarExpressaoAcessoMetodo(expressao)).rejects.toBeInstanceOf(Error);
        expect(spy).toHaveBeenCalledWith(interpretador, expressao);
    });

    describe('integração com comum (depuração)', () => {
        it('visitarDeclaracaoEscreva chama funcaoDeRetorno com formato correto', async () => {
            const retornoSpy = jest.fn();
            const localInterpretador = new InterpretadorPituguesComDepuracao('', retornoSpy, () => {});

            const { Literal } = require('../../../../fontes/construtos/literal');
            const { Escreva } = require('../../../../fontes/declaracoes/escreva');

            const lit1 = new Literal(1, 1, 'abc', 'texto');
            const lit2 = new Literal(1, 2, 42);
            const decl = new Escreva(1, 1, [lit1, lit2]);

            await expect(localInterpretador.visitarDeclaracaoEscreva(decl)).resolves.toBeNull();
            expect(retornoSpy).toHaveBeenCalledWith('abc 42');
        });

        it('quando pontoDeParadaAtivo não chama funcaoDeRetorno', async () => {
            const retornoSpy = jest.fn();
            const localInterpretador = new InterpretadorPituguesComDepuracao('', retornoSpy, () => {});

            localInterpretador.pontoDeParadaAtivo = true;

            const { Literal } = require('../../../../fontes/construtos/literal');
            const { Escreva } = require('../../../../fontes/declaracoes/escreva');

            const lit1 = new Literal(1, 1, 'x', 'texto');
            const decl = new Escreva(1, 1, [lit1]);

            await expect(localInterpretador.visitarDeclaracaoEscreva(decl)).resolves.toBeNull();
            expect(retornoSpy).not.toHaveBeenCalled();
        });

        it('quando avaliar lança, o erro é registrado em interpretador.erros', async () => {
            const retornoSpy = jest.fn();
            const localInterpretador = new InterpretadorPituguesComDepuracao('', retornoSpy, () => {});

            jest.spyOn(localInterpretador, 'avaliar').mockRejectedValue(new Error('fail'));

            const { Literal } = require('../../../../fontes/construtos/literal');
            const { Escreva } = require('../../../../fontes/declaracoes/escreva');

            const lit1 = new Literal(1, 1, 'x', 'texto');
            const decl = new Escreva(1, 1, [lit1]);

            await expect(localInterpretador.visitarDeclaracaoEscreva(decl)).resolves.toBeUndefined();
            expect(localInterpretador.erros.length).toBeGreaterThan(0);
            expect(retornoSpy).not.toHaveBeenCalled();
        });

        it('avaliar retorna valor em cache quando resolucoesChamadas contém a chave', async () => {
            const localInterpretador = new InterpretadorPituguesComDepuracao('', () => {}, () => {});

            const escopoAtual = localInterpretador.pilhaEscoposExecucao.topoDaPilha();
            escopoAtual.espacoMemoria.resolucoesChamadas['id-123'] = 999;

            const dummy = { id: 'id-123', argumentos: [], aceitar: jest.fn() } as any;

            const resultado = await localInterpretador.avaliar(dummy);
            expect(resultado).toBe(999);
            expect(dummy.aceitar).not.toHaveBeenCalled();
        });
    });
});
