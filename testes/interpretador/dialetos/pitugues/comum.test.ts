import { visitarExpressaoAcessoMetodo, visitarExpressaoAcessoMetodoOuPropriedade, visitarExpressaoAcessoIntervaloVariavel, resolverInterpolacoes } from '../../../../fontes/interpretador/dialetos/pitugues/comum';
import { AcessoMetodo } from '../../../../fontes/construtos/acesso-metodo';
import { AcessoMetodoOuPropriedade } from '../../../../fontes/construtos/acesso-metodo-ou-propriedade';
import { AcessoIntervaloVariavel } from '../../../../fontes/construtos/acesso-intervalo-variavel';
import { Literal } from '../../../../fontes/construtos/literal';
import { MetodoPrimitiva } from '../../../../fontes/interpretador/estruturas/metodo-primitiva';
import { ErroEmTempoDeExecucao } from '../../../../fontes/excecoes';

describe('comum (dialeto pitugues)', () => {
  it('visitarExpressaoAcessoMetodo retorna MetodoPrimitiva para primitiva texto', async () => {
    const literal = new Literal(1, 1, 'abc', 'texto');
    const expressao = new AcessoMetodo(1, literal, 'maiusculo');

    const interpretador: any = {
      resolverNomeObjectoAcessado: jest.fn().mockReturnValue('t'),
      avaliar: jest.fn().mockResolvedValue({ tipo: 'texto', valor: 'abc' }),
      resolverValor: jest.fn().mockReturnValue('abc'),
      hashArquivoDeclaracaoAtual: 0,
      linhaDeclaracaoAtual: 1,
    };

    const resultado = await visitarExpressaoAcessoMetodo(interpretador, expressao);

    expect(resultado).toBeInstanceOf(MetodoPrimitiva);
    expect(resultado.nomeMetodo).toBe('maiusculo');
  });

  it('visitarExpressaoAcessoMetodoOuPropriedade lança ErroEmTempoDeExecucao para método inexistente em texto', async () => {
    const literal = new Literal(1, 1, 'abc', 'texto');
    const simbolo: any = { lexema: 'inexistente', linha: 10 };
    const expressao = new AcessoMetodoOuPropriedade(1, literal, simbolo);

    const interpretador: any = {
      resolverNomeObjectoAcessado: jest.fn().mockReturnValue('t'),
      avaliar: jest.fn().mockResolvedValue({ tipo: 'texto', valor: 'abc' }),
      // must return a String object so the branch `objeto.constructor === String` is true
      resolverValor: jest.fn().mockReturnValue(new String('abc')),
    };

    await expect(visitarExpressaoAcessoMetodoOuPropriedade(interpretador, expressao)).rejects.toBeInstanceOf(ErroEmTempoDeExecucao);
  });

  it('visitarExpressaoAcessoIntervaloVariavel lança ErroEmTempoDeExecucao quando não é vetor nem texto', async () => {
    const literal = new Literal(1, 1, 10, 'número');
    const simboloFechamento: any = { linha: 5 };
    const expressao = new AcessoIntervaloVariavel(
        1,
        literal,
        null,
        null,
        null,
        simboloFechamento
    );

      const interpretador: any = {
      avaliar: jest.fn().mockResolvedValue({ valor: 10 }),
      resolverValor: jest.fn().mockReturnValue(10),
    };

    await expect(visitarExpressaoAcessoIntervaloVariavel(interpretador, expressao)).rejects.toBeInstanceOf(ErroEmTempoDeExecucao);
  });

  it('resolverInterpolacoes avalia expressões interpoladas e retorna resultados', async () => {
    const interpretador: any = {
      microLexador: { mapear: (s: string) => s },
      microAvaliadorSintatico: {
        analisar: (s: string, linha: number) => ({ declaracoes: [new Literal(1, linha, 42, 'número')] }),
      },
      avaliar: jest.fn().mockResolvedValue(42),
    };

    const resultado = await resolverInterpolacoes(interpretador, 'valor = ${x}', 12);

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toHaveProperty('expressaoInterpolacao', 'x');
    expect(resultado[0]).toHaveProperty('valor', 42);
    expect(interpretador.avaliar).toHaveBeenCalled();
  });
});

describe('comum (dialeto pitugues) - acesso com interpretador real', () => {
    const { InterpretadorPitugues } = require('../../../../fontes/interpretador/dialetos/pitugues');
    const { AcessoPropriedade } = require('../../../../fontes/construtos/acesso-propriedade');
    const { TuplaN } = require('../../../../fontes/construtos/tupla-n');
    const { DeleguaModulo } = require('../../../../fontes/interpretador/estruturas');
    const { visitarExpressaoAcessoPropriedade } = require('../../../../fontes/interpretador/dialetos/pitugues/comum');

    const literal = (valor: any) => new Literal(-1, 1, valor);
    const modulo = () => {
        const moduloTeste = new DeleguaModulo('teste');
        moduloTeste.componentes['componente'] = 42;
        return moduloTeste;
    };

    describe.each([
        ['visitarExpressaoAcessoMetodo', (objeto: any, nome: string) => new AcessoMetodo(-1, objeto, nome), visitarExpressaoAcessoMetodo],
        [
            'visitarExpressaoAcessoPropriedade',
            (objeto: any, nome: string) => new AcessoPropriedade(-1, objeto, nome),
            visitarExpressaoAcessoPropriedade,
        ],
    ])('%s', (_nome: string, criar: (objeto: any, nome: string) => any, visitarFuncao: any) => {
        const visitar = (objeto: any, nome: string) =>
            visitarFuncao(new InterpretadorPitugues(process.cwd()), criar(literal(objeto), nome));

        it('Primitiva de vetor', async () => {
            expect(await visitar([3, 1], 'ordenar')).toBeInstanceOf(MetodoPrimitiva);
        });

        it('Primitiva de tupla', async () => {
            expect(await visitar(new TuplaN(-1, 1, [literal(1), literal(2)]), 'juntar')).toBeInstanceOf(MetodoPrimitiva);
        });

        it('Primitiva de dicionário', async () => {
            expect(await visitar({ a: 1 }, 'chaves')).toBeInstanceOf(MetodoPrimitiva);
        });

        it('Primitiva de texto', async () => {
            expect(await visitar('abc', 'maiusculo')).toBeInstanceOf(MetodoPrimitiva);
        });

        it('Função de objeto JavaScript', async () => {
            const funcao = () => 1;
            expect(await visitar(new (class { f = funcao })(), 'f')).toBe(funcao);
        });

        it('Componente de módulo', async () => {
            expect(await visitar(modulo(), 'componente')).toBe(42);
            expect(await visitar(modulo(), 'inexistente')).toBeNull();
        });

        it('Membro inexistente', async () => {
            await expect(visitar(new (class { x = 1 })(), 'naoExiste')).rejects.toBeTruthy();
        });
    });
});
