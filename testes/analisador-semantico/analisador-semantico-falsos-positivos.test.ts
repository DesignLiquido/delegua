import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { AnalisadorSemantico } from '../../fontes/analisador-semantico';

/**
 * Cenários que geravam diagnósticos falsos (ou interrompiam a análise) em código real,
 * como o cliente `pacote` escrito em Delégua.
 */
describe('Analisador semântico - falsos positivos', () => {
    async function analisar(linhas: string[]) {
        const lexador = new Lexador();
        const avaliadorSintatico = new AvaliadorSintatico();
        const analisadorSemantico = new AnalisadorSemantico();

        const retornoLexador = lexador.mapear(linhas, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);

        return await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
    }

    function mensagens(retorno: { diagnosticos: { mensagem?: string }[] }): string[] {
        return retorno.diagnosticos.map((d) => String(d.mensagem));
    }

    it('Aceita vetor tipado inicializado por acesso a propriedade', async () => {
        const retorno = await analisar([
            'classe Pacote {',
            '    realizacoes: texto[]',
            '    construtor() {',
            '        isto.realizacoes = []',
            '    }',
            '}',
            'var pacote = Pacote()',
            'var realizacoes: texto[] = pacote.realizacoes',
            'escreva(realizacoes)',
        ]);

        expect(mensagens(retorno)).toHaveLength(0);
    });

    it('Continua rejeitando vetor tipado inicializado por literal', async () => {
        const retorno = await analisar(['var v: inteiro[] = 1', 'escreva(v)']);

        expect(mensagens(retorno)).toContain(
            "Atribuição inválida para 'v': é esperado um vetor de elementos."
        );
    });

    it('Chamada de função importada não interrompe a análise e marca o uso', async () => {
        const retorno = await analisar([
            'importar { salvar, abrir } de "./autenticacao.delegua"',
            'classe Cli {',
            '    autenticar(token: texto) {',
            '        salvar(token)',
            '        var naoUsada = 1',
            '    }',
            '}',
            'abrir("x")',
        ]);

        const textos = mensagens(retorno);
        expect(textos.some((m) => m.includes("'salvar'"))).toBe(false);
        expect(textos.some((m) => m.includes("'abrir'"))).toBe(false);
    });

    it('Analisa corpos de tente e pegue, marcando o tipo da exceção como usado', async () => {
        const retorno = await analisar([
            'importar { carregar, ErroLeitura } de "./leitura.delegua"',
            'funcao executar() {',
            '    var resultado = ""',
            '    tente {',
            '        resultado = carregar("arquivo")',
            '    } pegue (erro: ErroLeitura) {',
            '        escreva(erro)',
            '    }',
            '    retorna resultado',
            '}',
            'escreva(executar())',
        ]);

        const textos = mensagens(retorno);
        expect(textos.some((m) => m.includes("'carregar'"))).toBe(false);
        expect(textos.some((m) => m.includes("'ErroLeitura'"))).toBe(false);
        expect(textos.some((m) => m.includes("'erro'"))).toBe(false);
    });

    it('Reporta problemas dentro de tente', async () => {
        const retorno = await analisar([
            'tente {',
            '    var t: texto = 1',
            '} finalmente {',
            '    escreva("fim")',
            '}',
        ]);

        expect(mensagens(retorno)).toContain("Atribuição inválida para 't': é esperado um valor do tipo texto. Atual: número.");
    });

    it('Marca como usadas variáveis em argumentos de falhar', async () => {
        const retorno = await analisar([
            'importar { nomeArquivo } de "./trava.delegua"',
            'funcao validar() {',
            '    falhar "erro em " + nomeArquivo()',
            '}',
            'validar()',
        ]);

        expect(mensagens(retorno).some((m) => m.includes("'nomeArquivo'"))).toBe(false);
    });

    it('Não interrompe a análise ao encontrar interface', async () => {
        const retorno = await analisar([
            'interface Fonte {',
            '    buscar(nome: texto): texto',
            '}',
            'var naoUsada = 1',
        ]);

        expect(mensagens(retorno)).toContain("Variável 'naoUsada' foi declarada mas nunca usada.");
    });
});
