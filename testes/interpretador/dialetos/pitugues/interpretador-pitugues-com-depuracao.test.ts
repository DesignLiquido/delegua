import { InterpretadorPituguesComDepuracao } from '../../../../fontes/interpretador/dialetos/pitugues/interpretador-pitugues-com-depuracao';
import { AcessoIndiceVariavel, AcessoMetodo, AcessoMetodoOuPropriedade, AcessoPropriedade, AtribuicaoPorIndice } from '../../../../fontes/construtos';
import { AcessoIntervaloVariavel } from '../../../../fontes/construtos/acesso-intervalo-variavel';

import * as comum from '../../../../fontes/interpretador/dialetos/pitugues/comum';
import { InterpretadorComDepuracao } from '../../../../fontes/interpretador/depuracao';

const { TuplaN } = require('../../../../fontes/construtos/tupla-n');
const { Literal } = require('../../../../fontes/construtos/literal');
describe('Interpretador Pituguês com Depuração', () => {
    let interpretador: InterpretadorPituguesComDepuracao;
    
    beforeEach(() => {
        interpretador = new InterpretadorPituguesComDepuracao('', () => {}, () => {});
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    it('Execução de comum.visitarExpressaoAcessoMetodo', async () => {
        const spy = jest
        .spyOn(comum, 'visitarExpressaoAcessoMetodo')
        .mockResolvedValue('ok-metodo');
        
        const objeto = { linha: 1, paraTexto: () => '<obj>' } as any;
        const expressao = new AcessoMetodo(1, objeto, 'm');
        
        await expect(interpretador.visitarExpressaoAcessoMetodo(expressao)).resolves.toBe('ok-metodo');
        expect(spy).toHaveBeenCalledWith(interpretador, expressao);
    });
    
    it('Execução de comum.visitarExpressaoAcessoMetodoOuPropriedade', async () => {
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
    
    it('Execução de comum.visitarExpressaoAcessoPropriedade', async () => {
        const spy = jest
        .spyOn(comum, 'visitarExpressaoAcessoPropriedade')
        .mockResolvedValue('ok-prop');
        
        const objeto = { linha: 3, paraTexto: () => '<o>' } as any;
        const expressao = new AcessoPropriedade(3, objeto, 'nome');
        
        await expect(interpretador.visitarExpressaoAcessoPropriedade(expressao)).resolves.toBe('ok-prop');
        expect(spy).toHaveBeenCalledWith(interpretador, expressao);
    });
    
    it('Execução de comum.visitarExpressaoAcessoIntervaloVariavel', async () => {
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
    it('Execução de comum.visitarExpressaoTuplaN', async () => {
        const spy = jest
        .spyOn(comum, 'visitarExpressaoTuplaN')
        .mockResolvedValue('ok-tupla');
        
        const expressao = { linha: 5, paraTexto: () => '<tupla>' } as any;
        
        await expect(interpretador.visitarExpressaoTuplaN(expressao)).resolves.toBe('ok-tupla');
        expect(spy).toHaveBeenCalledWith(interpretador, expressao);
    });
    it('Execução de super.visitarExpressaoDeAtribuicao', async () => {
        const spy = jest
        .spyOn(InterpretadorComDepuracao.prototype, 'visitarExpressaoDeAtribuicao')
        .mockResolvedValue('ok-atrib');
        const expressao = { linha: 6, paraTexto: () => '<atrib>' } as any;
        
        await expect(interpretador.visitarExpressaoDeAtribuicao(expressao)).resolves.toBe('ok-atrib');
        expect(spy).toHaveBeenCalledWith(expressao);
    });
    it('visitarExpressaoAcessoIndiceVariavel com TuplaN válida', async () => {
               
        const tupla = new TuplaN(1, 6);
        
        jest.spyOn(interpretador, 'avaliar')
        .mockResolvedValueOnce(tupla)
        .mockResolvedValueOnce(0);
        
        
        jest.spyOn(interpretador, 'resolverValor')
        .mockReturnValueOnce(tupla)
        .mockReturnValueOnce(0);
        
        
        const expressao = {
            linha: 1,
            paraTexto: () => '<expressao>',
            entidade: tupla,
            indice: 0
        } as any as AcessoIndiceVariavel;
        const resultado = await interpretador.visitarExpressaoAcessoIndiceVariavel(expressao);
        expect(resultado).toBe('valor1');
    });
    
    it('visitarExpressaoAcessoIndiceVariavel com índice inválido (não inteiro)', async () => {
        
        
        const tupla = new TuplaN(1, [new Literal(1, 1, 'x', 'texto')]);
        
        jest.spyOn(interpretador, 'avaliar')
        .mockResolvedValueOnce(tupla)
        .mockResolvedValueOnce(1.5);
        
        jest.spyOn(interpretador, 'resolverValor')
        .mockReturnValueOnce(tupla)
        .mockReturnValueOnce(1.5);
        
        const entidade = { linha: 1, paraTexto: () => '<e>' } as any;
        const indice = { linha: 1, paraTexto: () => '<i>' } as any;
        const simbolo = { lexema: ']', linha: 1 } as any;
        const expressao = new AcessoIndiceVariavel(1, entidade, indice, simbolo);
        
        await expect(interpretador.visitarExpressaoAcessoIndiceVariavel(expressao)).rejects.toThrow('Índice deve ser inteiro.');
    });
    
    it('visitarExpressaoAcessoIndiceVariavel com índice fora do intervalo', async () => {
               
        const tupla = new TuplaN(1, [new Literal(1, 1, 'x', 'texto')]);
        
        jest.spyOn(interpretador, 'avaliar')
        .mockResolvedValueOnce(tupla)
        .mockResolvedValueOnce(5);
        
        jest.spyOn(interpretador, 'resolverValor')
        .mockReturnValueOnce(tupla)
        .mockReturnValueOnce(5);
        
        const entidade = { linha: 1, paraTexto: () => '<e>' } as any;
        const indice = { linha: 1, paraTexto: () => '<i>' } as any;
        const simbolo = { lexema: ']', linha: 1 } as any;
        const expressao = new AcessoIndiceVariavel(1, entidade, indice, simbolo);
        
        await expect(interpretador.visitarExpressaoAcessoIndiceVariavel(expressao)).rejects.toThrow('Índice fora do intervalo.');
    });
    
    it('visitarExpressaoAtribuicaoPorIndice com TuplaN deve lançar erro', async () => {
               
        const tupla = new TuplaN(1, [new Literal(1, 1, 'x', 'texto')]);
        
        jest.spyOn(interpretador, 'avaliar').mockResolvedValueOnce(tupla);
        jest.spyOn(interpretador, 'resolverValor').mockReturnValueOnce(tupla);
        
        const objeto = { linha: 1, paraTexto: () => '<obj>' } as any;
        const indice = { linha: 1, paraTexto: () => '<i>' } as any;
        const valor = { linha: 1, paraTexto: () => '<v>' } as any;
        const simbolo = { lexema: ']', linha: 1 } as any;
        const expressao = new AtribuicaoPorIndice(1, objeto, indice, valor, simbolo);
        
        await expect(interpretador.visitarExpressaoAtribuicaoPorIndice(expressao)).rejects.toThrow('Não é possível modificar uma tupla');
    });
    it('Propagação de Promise.reject entre funções de comum', async () => {
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
