import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { TradutorMermaidJs } from '../../fontes/tradutores';

describe('Tradutor Delégua -> MermaidJs - Funções', () => {
    const tradutor: TradutorMermaidJs = new TradutorMermaidJs();
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
    });

    it('Função simples com chamada', async () => {
        const codigo = [
            'funcao saudacao() {',
            '    escreva("Olá!");',
            '}',
            'saudacao();'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('graph TD;');
        expect(resultado).toContain('subgraph saudacao');
        expect(resultado).toContain('Função: saudacao()');
        expect(resultado).toContain('FuncsaudacaoInicio');
        expect(resultado).toContain('FuncsaudacaoFim');
        expect(resultado).toContain('chamada a saudacao');
    });

    it('Função com parâmetros e retorno', async () => {
        const codigo = [
            'funcao soma(a, b) {',
            '    var resultado = a + b;',
            '    retorna resultado;',
            '}',
            'var x = soma(2, 3);'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('subgraph soma');
        expect(resultado).toContain('Função: soma()');
        expect(resultado).toContain('FuncsomaInicio');
        expect(resultado).toContain('FuncsomaFim');
        expect(resultado).toContain('variável: resultado');
    });

    it('Múltiplas funções', async () => {
        const codigo = [
            'funcao funcao1() {',
            '    escreva("Função 1");',
            '}',
            'funcao funcao2() {',
            '    escreva("Função 2");',
            '}',
            'funcao1();',
            'funcao2();'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('subgraph funcao1');
        expect(resultado).toContain('subgraph funcao2');
        expect(resultado).toContain('Função: funcao1()');
        expect(resultado).toContain('Função: funcao2()');
    });

    it('Função com estrutura condicional', async () => {
        const codigo = [
            'funcao verificaPositivo(n) {',
            '    se (n > 0) {',
            '        escreva("Positivo");',
            '    } senao {',
            '        escreva("Negativo");',
            '    }',
            '}',
            'verificaPositivo(5);'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('subgraph verificaPositivo');
        expect(resultado).toContain('{se }');
        expect(resultado).toContain('senão');
    });
});
