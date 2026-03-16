import { AvaliadorSintatico } from '../../../fontes/avaliador-sintatico';
import { Lexador } from '../../../fontes/lexador';
import { TradutorMermaidJs } from '../../../fontes/tradutores';

describe('Tradutor Delégua -> MermaidJs - Classes', () => {
    const tradutor: TradutorMermaidJs = new TradutorMermaidJs();
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
    });

    it('Classe simples com construtor', async () => {
        const codigo = [
            'classe Pessoa {',
            '    construtor(nome) {',
            '        escreva(nome);',
            '    }',
            '}'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('graph TD;');
        expect(resultado).toContain('subgraph Pessoa["Classe: Pessoa"]');
        expect(resultado).toContain('subgraph construtor_Pessoa["Construtor"]');
        expect(resultado).toContain('MetodoconstrutorPessoaInicio[Início: construtor()]');
        expect(resultado).toContain('MetodoconstrutorPessoaFim[Fim: construtor()]');
    });

    it('Classe com um método', async () => {
        const codigo = [
            'classe Calculadora {',
            '    somar(a, b) {',
            '        retorna a + b;',
            '    }',
            '}'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('graph TD;');
        expect(resultado).toContain('subgraph Calculadora["Classe: Calculadora"]');
        expect(resultado).toContain('subgraph somar_Calculadora["Método: somar()"]');
        expect(resultado).toContain('MetodosomarCalculadoraInicio[Início: somar()]');
        expect(resultado).toContain('MetodosomarCalculadoraFim[Fim: somar()]');
        expect(resultado).toContain('retorna:');
    });

    it('Classe com múltiplos métodos', async () => {
        const codigo = [
            'classe Matematica {',
            '    somar(a, b) {',
            '        retorna a + b;',
            '    }',
            '    subtrair(a, b) {',
            '        retorna a - b;',
            '    }',
            '}'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('graph TD;');
        expect(resultado).toContain('subgraph Matematica["Classe: Matematica"]');
        expect(resultado).toContain('subgraph somar_Matematica["Método: somar()"]');
        expect(resultado).toContain('subgraph subtrair_Matematica["Método: subtrair()"]');
        expect(resultado).toContain('MetodosomarMatematicaInicio[Início: somar()]');
        expect(resultado).toContain('MetodosubtrairMatematicaInicio[Início: subtrair()]');
    });

    it('Classe com construtor e métodos', async () => {
        const codigo = [
            'classe Contador {',
            '    construtor() {',
            '        var valor = 0;',
            '    }',
            '    incrementar() {',
            '        escreva("Incrementando");',
            '    }',
            '}'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('graph TD;');
        expect(resultado).toContain('subgraph Contador["Classe: Contador"]');
        expect(resultado).toContain('subgraph construtor_Contador["Construtor"]');
        expect(resultado).toContain('subgraph incrementar_Contador["Método: incrementar()"]');
        expect(resultado).toContain('variável: valor');
    });

    it('Classe com método contendo condicional', async () => {
        const codigo = [
            'classe Validador {',
            '    ehPar(numero) {',
            '        se (numero % 2 == 0) {',
            '            retorna verdadeiro;',
            '        } senao {',
            '            retorna falso;',
            '        }',
            '    }',
            '}'
        ];

        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = await tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        console.log(resultado);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('graph TD;');
        expect(resultado).toContain('subgraph Validador["Classe: Validador"]');
        expect(resultado).toContain('subgraph ehPar_Validador["Método: ehPar()"]');
        expect(resultado).toContain('{se ');
        expect(resultado).toContain('senão');
    });
});
