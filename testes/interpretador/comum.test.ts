import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Interpretador } from '../../fontes/interpretador';
import { obterTopicoAjuda } from '../../fontes/interpretador/comum';
import { FuncaoPadrao } from '../../fontes/interpretador/estruturas';
import { Lexador } from '../../fontes/lexador';

describe('Interpretador - funções comuns', () => {
    describe('obterTopicoAjuda()', () => {
        const funcoesGlobais = [
            'aleatorio',
            'aleatorioEntre',
            'algum',
            'clonar',
            'encontrar',
            'encontrarIndice',
            'encontrarUltimo',
            'encontrarUltimoIndice',
            'filtrarPor',
            'incluido',
            'inteiro',
            'intervalo',
            'longo',
            'mapear',
            'maximo',
            'minimo',
            'numero',
            'ordenar',
            'paraCada',
            'primeiroEmCondicao',
            'real',
            'reduzir',
            'somar',
            'tamanho',
            'texto',
            'todosEmCondicao',
            'tupla',
        ];

        it.each(funcoesGlobais)('Ajuda da função global %s', (nomeFuncao: string) => {
            const interpretador = new Interpretador(process.cwd());
            const funcao = interpretador.pilhaEscoposExecucao.obterValorVariavel({ lexema: nomeFuncao } as any).valor;
            const ajuda = obterTopicoAjuda(funcao);
            expect(ajuda).toContain(nomeFuncao);
        });

        it('Função padrão não identificada', () => {
            const funcao = new FuncaoPadrao(0, () => null);
            expect(obterTopicoAjuda(funcao)).toBe('Função não identificada. Não há documentação disponível.');
        });

        it('Classe com propriedades e métodos', async () => {
            const saidas: string[] = [];
            const lexador = new Lexador();
            const avaliadorSintatico = new AvaliadorSintatico();
            const interpretador = new Interpretador(process.cwd(), false, (texto: string) => saidas.push(texto));
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                lexador.mapear(['classe Pessoa {', '    nome: texto', '    falar() { retorna 1 }', '}', 'escreva(ajuda(Pessoa()))'], -1),
                -1
            );
            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            const ajuda = saidas.join('');
            expect(ajuda).toContain('Classe Pessoa');
            expect(ajuda).toContain('Propriedades:');
            expect(ajuda).toContain('nome');
            expect(ajuda).toContain('Métodos:');
            expect(ajuda).toContain('falar()');
        });
    });
});
