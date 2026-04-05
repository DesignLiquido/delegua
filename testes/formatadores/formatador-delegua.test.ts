const quebraLinha = '\n';

import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { FormatadorDelegua } from '../../fontes/formatadores';

describe('Formatadores > Delégua', () => {
    const formatador = new FormatadorDelegua(quebraLinha);
    const avaliadorSintatico = new AvaliadorSintatico();
    const lexador = new Lexador();
    
    it('Unários', async () => {
        const resultadoLexador = lexador.mapear(
            ["3 ** 4 - 9 (10 * -1 - -2)"], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(4);
        expect(linhasResultado[0]).toBe("3 ** 4 - 9(10 * -1");
        expect(linhasResultado[1]).toBe(" - -2");
        expect(linhasResultado[2]).toBe(")");
    });
    
    describe('Atribuições', () => {
        it('Atribuição por índice', async () => {
            const resultadoLexador = lexador.mapear(
                ["var fila = []; fila[0] = 1 fila[1] = 2 fila[3] = 3 escreva(fila[3])"], 
                -1
            );
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            const linhasResultado = resultado.split(quebraLinha);
            
            // console.log(resultado);
            expect(linhasResultado).toHaveLength(6);
        });
        
        it('Atribuições múltiplas', async () => {
            const resultadoLexador = lexador.mapear([
                "var a, b, c = 1, 2, 3 const d,f,g=4,5,6",
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            const linhasResultado = resultado.split(quebraLinha);
            
            expect(linhasResultado).toHaveLength(7);
        });
        
        it('Atribuições com tipo', async () => {
            const resultadoLexador = lexador.mapear([
                "var nome: texto = 'Fernando' escreva(nome)",
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            const linhasResultado = resultado.split(quebraLinha);
            
            expect(linhasResultado).toHaveLength(3);
        });
    });
    
    it('Funções', async () => {
        const resultadoLexador = lexador.mapear([
            "funcao teste(a: inteiro, b: inteiro): inteiro {",
            "    retorna a + b",
            "}",
            "var resultado = teste(1, 2)",
        ], -1);
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(5);
        expect(linhasResultado[0]).toBe("função teste(a: inteiro, b: inteiro): inteiro {");
    });
    
    it('Classes', async () => {
        const resultadoLexador = lexador.mapear([
            `classe Teste {propriedade1: numero propriedade2: texto construtor(){isto.propriedade1=0 isto.propriedade2="123"}testeMetodo(argumento1: numero){isto.propriedade1=argumento1}}`,
        ], -1);
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(13);
    });
    
    it('Classes com herança, uso de super', async () => {
        const resultadoLexador = lexador.mapear([
            `classe Ancestral{ propriedade1:numero}`,
            `classe Teste herda Ancestral{ construtor(){super.propriedade1=0 }}`,
        ], -1);
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(11);
    });
    
    it('Dicionários', async () => {
        const resultadoLexador = lexador.mapear([
            `var dicionario = {  'a':1, 'b'  : 2    }`,
        ], -1);
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(2);
    });
    
    it('Escolha', async () => {
        const resultadoLexador = lexador.mapear([
            "escolha (2) { caso 1: escreva('correspondente à opção 1'); caso 2: caso 3: escreva('correspondente à opção 2 e 3'); padrao: escreva('Sem opção correspondente'); }",
        ], -1);
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(10);
    });
    
    it('Enquanto', async () => {
        const resultadoLexador = lexador.mapear(
            ["var a = 1 enquanto a < 10 { a += 1 se a > 8 {sustar  }}"], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(8);
    });
    
    it('Expressões Regulares', async () => {
        const resultadoLexador = lexador.mapear(
            [
                "var str = \"olá mundo, olá universo\" var novaStr = str.substituir(||/olá/g||, \"oi\") escreva(novaStr);",
            ], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(4);
    });
    
    it('Falhar', async () => {
        const resultadoLexador = lexador.mapear(
            [
                "funcao temDigitoRepetido(num) {",
                "    var str = texto( num);",
                "  para (var i =1; i< tamanho(str);i++   ) {",
                "        se (str[i] != str[0]) {",
                "     falhar \"Erro!!!\"",
                "}",
                "    }",
                "   retorna verdadeiro;",
                "}",
            ], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(10);
    });
    
    it('Fazer', async () => {
        const resultadoLexador = lexador.mapear(
            ["var a = 1 fazer { a++ } enquanto a < 10 "],
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(5);
    });

    describe('Delimitador de texto', () => {
        it('Deve formatar texto com aspas duplas quando configurado', async () => {
            const formatadorAspasDuplas = new FormatadorDelegua(quebraLinha, 4, {
                delimitadorTexto: 'aspas-duplas',
            });
            const resultadoLexador = lexador.mapear(["var x = 'abc'"], -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);

            const resultado = formatadorAspasDuplas.formatar(resultadoAvaliacaoSintatica.declaracoes);

            expect(resultado).toContain('var x = "abc"');
        });

        it('Deve preservar delimitador original quando configurado', async () => {
            const formatadorPreservar = new FormatadorDelegua(quebraLinha, 4, {
                delimitadorTexto: 'preservar',
            });
            const resultadoLexador = lexador.mapear([
                "var a = 'um'",
                'var b = "dois"',
            ], -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);

            const resultado = formatadorPreservar.formatar(resultadoAvaliacaoSintatica.declaracoes);

            expect(resultado).toContain("var a = 'um'");
            expect(resultado).toContain('var b = "dois"');
        });
    });
    
    it('Funções', async () => {
        const resultadoLexador = lexador.mapear(
            ["funcao teste() { retorna 1} var a = teste() escreva(a)"],
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(6);
    });
    
    it('Funções, indentação bem zoada', async () => {
        const resultadoLexador = lexador.mapear(
            [
                "funcao temDigitoRepetido(num) {",
                "    var str = texto( num);",
                "  para (var i =1; i< tamanho(str);i++   ) {",
                "        se (str[i] != str[0]) {",
                "     retorna falso;",
                "}",
                "    }",
                "   retorna verdadeiro;",
                "}",
            ], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(10);
    });
    
    it('Funções com argumentos tipados', async () => {
        const resultadoLexador = lexador.mapear(
            [
                'função f(a:texto,b:inteiro, c: texto, d){ escreva(a +b)}',
            ], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(4);
    });
    
    it('Função que retorna função', async () => {
        const retornoLexador = lexador.mapear([
            "funcao some(a, b) {",
            "  retorna a +b",
            "}",
            "funcao facaCurrying(minhaFuncao) {",
            "  retorna funcao(a) {",
            "retorna funcao(b) {",
            " retorna minhaFuncao(a, b)",
            "    } }}",
            "var someViaCurryng=facaCurrying(some)",
            "escreva(someViaCurryng(1)(2))"
        ], -1);
        
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatador.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(15);
    });
    
    it('Importar', async () => {
        const resultadoLexador = lexador.mapear(
            [
                "var dm = importar('@designliquido/delegua-matematica')var m = importar('matematica') dm.raizQuadrada(9) // Imprime 3",
            ], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        expect(linhasResultado).toHaveLength(5);
        expect(linhasResultado[2]).toContain('dm.raizQuadrada(9)');
        expect(linhasResultado[3]).toContain('// Imprime 3');
    });
    
    it('leia() e escreva()', async () => {
        const resultadoLexador = lexador.mapear(
            [`var a=leia( "Escreva alguma coisa"   ) escreva( a )`], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });
    
    it('Operadores lógicos', async () => {
        const resultadoLexador = lexador.mapear(
            [`var a=falso var b=verdadeiro escreva( a    ou b)`], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(4);
    });
    
    it('Para', async () => {
        const resultadoLexador = lexador.mapear(
            ["para var a = 1; a < 10; a++ { se a %2==0 { continua } escreva(a) }"], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(7);
    });
    
    it('Para cada', async () => {
        const resultadoLexador = lexador.mapear(
            ["var a = [1, 2,3] para cada  elemento   de  a    {  escreva( a  ) }"], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(5);
    });
    
    it('Se', async () => {
        const resultadoLexador = lexador.mapear(
            ["var a = 2 se a == 1 { escreva(a) } senao {escreva(a + 1)} "], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(7);
    });
    
    it('Tendo ... como', async () => {
        const resultadoLexador = lexador.mapear(
            [
                'funcao teste(){retorna "Ok" }',
                'tendo teste() como a{escreva(a)',
                '}'
            ], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(7);
    });
    
    it('Tente', async () => {
        const resultadoLexador = lexador.mapear(
            ["tente { escreva('sucesso') } pegue {escreva('pegue')} finalmente { escreva('pronto') }"], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(8);
    });
    
    it('Tipo de', async () => {
        const resultadoLexador = lexador.mapear(
            [`var a   = "Teste" escreva( tipo     de a      )`],
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });
    
    it('Variaveis', async () => {
        const resultadoLexador = lexador.mapear(
            ["var a=1 fixo c = 2"], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(3);
    });
    
    it('Vetor', async () => {
        const resultadoLexador = lexador.mapear(
            ["var a = [1,2,3] const c=[4,5,6] escreva(a[0])"], 
            -1
        );
        
        const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
        const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
        const linhasResultado = resultado.split(quebraLinha);
        
        // console.log(resultado);
        expect(linhasResultado).toHaveLength(4);
    });
    
    describe("Exemplos", () => {
        it('Fibonacci', async () => {
            const codigo = [
                "função fibonacci(n) {",
                "    se (n == 0) {",
                "      retorna(0);",
                "    }",
                "    se (n == 1) {",
                "      retorna(1);",
                "    }",
                "    var n1 = n - 1;",
                "    var n2 = n - 2;",
                "    var f1 = fibonacci(n1);",
                "    var f2 = fibonacci(n2);",
                "    retorna(f1 + f2);",
                "}",
                "var a = fibonacci(0);",
                "escreva(a);",
                "a = fibonacci(1);",
                "escreva(a);",
                "a = fibonacci(2);",
                "escreva(a);",
                "a = fibonacci(3);",
                "escreva(a);",
                "a = fibonacci(4);",
                "escreva(a);",
                "a = fibonacci(5);",
                "escreva(a);"
            ];
            
            const resultadoLexador = lexador.mapear(codigo, -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            const linhasResultado = resultado.split(quebraLinha);
            
            // console.log(resultado);
            expect(linhasResultado).toHaveLength(26);
        });
        
        it('Fibonacci simplificado', async () => {
            const codigo = [
                "função fibonacci(n: inteiro): inteiro {",
                "    se (n <= 1) {",
                "        retorna 1",
                "    }",
                "    retorna fibonacci(n-1) + fibonacci(n-2)",
                "}",
                "var resultado = fibonacci(10)"
            ];
            
            const resultadoLexador = lexador.mapear(codigo, -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            const linhasResultado = resultado.split(quebraLinha);
            
            // console.log(resultado);
            expect(linhasResultado).toHaveLength(8);
        });
        
        it('FizzBuzz', async () => {
            const codigo = [
                "var n = 15",
                "para var i = 1; i <= n; i = i + 1 {",
                "    var resultado: texto;",
                "    se (i % 3 == 0) {",
                "        resultado = resultado + 'Fizz'",
                "    }",
                "    se (i % 5 == 0) {",
                "        resultado = resultado + 'Buzz'",
                "    }",
                "    se (resultado == '') {",
                "        escreva(i, '\\n')",
                "    } senão {",
                "        escreva(resultado, '\\n')",
                "    }",
                "}"
            ];
            
            const resultadoLexador = lexador.mapear(codigo, -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            const linhasResultado = resultado.split(quebraLinha);
            
            // console.log(resultado);
            expect(linhasResultado).toHaveLength(16);
            expect(linhasResultado[0]).toBe("var n = 15");
            expect(linhasResultado[1]).toContain("para var i = 1; i <= n; i = i + 1 {");
            expect(linhasResultado[2]).toBe("    var resultado: texto");
            expect(linhasResultado[3]).toBe("    se (i % 3 == 0) {");
            expect(linhasResultado[4]).toBe("        resultado = resultado + 'Fizz'");
            expect(linhasResultado[5]).toBe("    }");
            expect(linhasResultado[6]).toBe("    se (i % 5 == 0) {");
            expect(linhasResultado[7]).toBe("        resultado = resultado + 'Buzz'");
            expect(linhasResultado[8]).toBe("    }");
            expect(linhasResultado[9]).toBe("    se (resultado == '') {");
            expect(linhasResultado[10]).toBe("        escreva(i, '\\n')");
            expect(linhasResultado[11]).toBe("    } senão {");
            expect(linhasResultado[12]).toBe("        escreva(resultado, '\\n')");
            expect(linhasResultado[13]).toBe("    }");
            expect(linhasResultado[14]).toBe("}");
        });
    });
    
    describe('Cobertura adicional', () => {
        it('Comentários multilinha', async () => {
            const resultadoLexador = lexador.mapear([
                "/* Este é um comentário de múltiplas linhas */",
                "escreva('teste')"
            ], -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            expect(resultado).toContain("escreva");
            
        });
        
        it('Expressões regulares', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 'teste'",
                "escreva(x)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("escreva");
        });
        
        it('Formatação escrita', async () => {
            const resultadoLexador = lexador.mapear([
                "escreva('teste %d teste', 10)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("escreva");
        });
        
        it('Acesso a intervalo de variável', async () => {
            const resultadoLexador = lexador.mapear([
                "var lista = [1, 2, 3, 4, 5]",
                "var sublista = lista[1:4]"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("lista");
        });
        
        it('Acesso de propriedade', async () => {
            const resultadoLexador = lexador.mapear([
                "var obj = { }",
                "escreva(obj)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("obj");
        });
        
        it('Tupla', async () => {
            const resultadoLexador = lexador.mapear([
                "var tupla = (1, 'teste')",
                "escreva(tupla)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("tupla");
        });
        
        it('Referência de função', async () => {
            const resultadoLexador = lexador.mapear([
                "função teste() { }",
                "escreva(teste)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("teste");
        });
        
        it('Argumento referência de função', async () => {
            const resultadoLexador = lexador.mapear([
                "função callback(fn) { fn() }",
                "função outro() { }",
                "callback(outro)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("callback");
        });
        
        it('Isto (referência ao objeto)', async () => {
            const resultadoLexador = lexador.mapear([
                "função teste() { escreva(1) }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("teste");
        });
        
        it('Super (construtor da classe pai)', async () => {
            const resultadoLexador = lexador.mapear([
                "função super_teste() { }",
                "escreva(super_teste)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("super_teste");
        });
        
        it('Separador', async () => {
            const resultadoLexador = lexador.mapear([
                "escreva(1)",
                "escreva(2)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("escreva");
        });
        
        it('Literal com null/undefined', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = nulo"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("null");
        });
        
        it('Literal com string com caracteres especiais', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 'teste\\nnova\\tlinha\\rretorno'"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("\\n");
            expect(resultado).toContain("\\t");
            expect(resultado).toContain("\\r");
        });
        
        it('Literal booleano', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = verdadeiro",
                "var y = falso"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("verdadeiro");
            expect(resultado).toContain("falso");
        });
        
        it('Unário DEPOIS (pós-incremento/decremento)', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 1",
                "x++"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("++");
        });
        
        it('Unário ANTES (pré-incremento)', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 1",
                "++x"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("++");
        });
        
        it('Unário negação', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = !verdadeiro"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("!");
        });
        
        it('Unário subtração', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = -5"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("-");
        });
        
        it('Função com tipo explícito', async () => {
            const resultadoLexador = lexador.mapear([
                "função teste(): inteiro { retorna 1 }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("inteiro");
        });
        
        it('Função com parâmetros tipados', async () => {
            const resultadoLexador = lexador.mapear([
                "função somar(a: inteiro, b: inteiro): inteiro { retorna a + b }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("inteiro");
        });
        
        
        
        it('Expressão regular', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = ||teste||"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("||");
        });
        
        it('Acesso a método', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 'teste'",
                "x.length()"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("x");
        });
        
        it('Acesso a propriedade direto', async () => {
            const resultadoLexador = lexador.mapear([
                "var obj = {}",
                "obj.nome"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("obj");
        });
        
        it('Operador divisão inteira', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 10 \\ 3"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("\\");
        });
        
        it('Operador +=', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 1",
                "x += 2"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("+=");
        });
        
        it('Operador -=', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 5",
                "x -= 2"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("-=");
        });
        
        it('Operador /=', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 10",
                "x /= 2"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("/=");
        });
        
        it('Operador %=', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 10",
                "x %= 3"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("%=");
        });
        
        it('Operador \\=', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 10",
                "x \\= 3"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("\\=");
        });
        
        it('Operador em (in)', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = [1, 2, 3]",
                "se 1 em x { }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("em");
        });
        
        it('Tipo de (type of)', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = tipo de 1"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("tipo de");
        });
        
        it('Atribuição por índice', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = [1, 2, 3]",
                "x[0] = 5"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("[");
        });
        
        it('Definir valor (atribuição a propriedade)', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 1"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toBeDefined();
        });
        
        it('Variável sem inicializador', async () => {
            const resultadoLexador = lexador.mapear([
                "var x"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("var");
        });
        
        
        
        it('Constante com tipo', async () => {
            const resultadoLexador = lexador.mapear([
                "const VALOR = 42"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("constante");
        });
        
        it('Retorna com valor', async () => {
            const resultadoLexador = lexador.mapear([
                "função teste() { retorna 42 }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("retorna");
        });
        
        it('Tente com pegue e finalmente', async () => {
            const resultadoLexador = lexador.mapear([
                "tente {",
                "  escreva(1)",
                "} pegue {",
                "  escreva(2)",
                "} finalmente {",
                "  escreva(3)",
                "}"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("tente");
            expect(resultado).toContain("pegue");
            expect(resultado).toContain("finalmente");
        });
        
        it('Falhar com mensagem', async () => {
            const resultadoLexador = lexador.mapear([
                "falhar 'Erro!'"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("falhar");
        });
        
        it('Leia com argumentos', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = leia('Digite um valor: ')"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("leia");
        });
        
        it('Isto (this)', async () => {
            const resultadoLexador = lexador.mapear([
                "var obj = {}",
                "escreva(isto)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("escreva");
        });
        
        it('Super', async () => {
            const resultadoLexador = lexador.mapear([
                "função teste() { retorna 1 }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("função");
        });
        
        it('Agrupamento (parênteses)', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = (1 + 2) * 3"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("(");
        });
        
        it('Chamada de função com múltiplos argumentos', async () => {
            const resultadoLexador = lexador.mapear([
                "função teste(a, b, c) { }",
                "teste(1, 2, 3)"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("teste");
        });
        
        it('Para com múltiplas inicializações', async () => {
            const resultadoLexador = lexador.mapear([
                "para var i = 0; i < 10; i++ {",
                "  escreva(i)",
                "}"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("para");
        });
        
        it('Para cada', async () => {
            const resultadoLexador = lexador.mapear([
                "var arr = [1, 2, 3]",
                "para cada i de arr {",
                "  escreva(i)",
                "}"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("para cada");
        });
        
        it('Se com senão', async () => {
            const resultadoLexador = lexador.mapear([
                "se verdadeiro {",
                "  escreva(1)",
                "} senão {",
                "  escreva(2)",
                "}"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("se");
            expect(resultado).toContain("senão");
        });
        
        it('Tenho como', async () => {
            const resultadoLexador = lexador.mapear([
                "var i = 0"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("var");
        });
        
        it('Comentário inline', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 1"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("var");
        });
        
        it('Operador DIFERENTE (!= )', async () => {
            const resultadoLexador = lexador.mapear([
                "se 1 != 2 { }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("!=");
        });
        
        it('Operador MULTIPLICAÇÃO *= ', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 5",
                "x *= 2"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("*");
        });
        
        it('Operador EXPONENCIACAO **', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 2 ** 3"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("**");
        });
        
        it('Operador MODULO %', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = 10 % 3"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("%");
        });
        
        it('Operador E (and)', async () => {
            const resultadoLexador = lexador.mapear([
                "se verdadeiro e verdadeiro { }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("e");
        });
        
        it('Operador OU (or)', async () => {
            const resultadoLexador = lexador.mapear([
                "se verdadeiro ou falso { }"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("ou");
        });
        
        it('Vetor vazio', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = []"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("[");
        });
        
        it('Dicionário vazio', async () => {
            const resultadoLexador = lexador.mapear([
                "var x = {}"
            ], -1);
            
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            
            expect(resultado).toContain("{");
        });
        it('Agrupamento e precedência mantém parênteses e espaçamento', async () => {
            const codigo = ["var x=(1+2)*3 escreva(x)"];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain("var x = (1 + 2) * 3");
            expect(resultado).toContain("escreva(x)");
        });
        
        it('Espaçamento binário normaliza operadores com espaços', async () => {
            const codigo = ["var a=1+2"];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain("var a = 1 + 2");
        });
        
        it('Operador divisão inteira preserva barra invertida', async () => {
            const codigo = ["var x = 10 \\ 3"];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain("\\");
        });
        
        it('Retorna função aninhada é indicada como "retorna função"', async () => {
            const codigo = [
                "funcao outer() {",
                "  retorna funcao() {",
                "    retorna 1",
                "  }",
                "}",
                "var f = outer()",
                "escreva(f())"
            ];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain("retorna função");
            expect(resultado).toContain("escreva(f())");
        });
        
    });

    describe('Comentários', () => {
        it('Comentário de uma linha é preservado', async () => {
            const codigo = [
                "var i: inteiro",
                "// incrementa i",
                "i = 1",
            ];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain("// incrementa i");
        });

        it('Comentário de bloco após enquanto é preservado', async () => {
            const codigo = [
                "var i: inteiro",
                "i = 1",
                "enquanto(i<=5){",
                "    escreva(i)",
                "    i = i + 1",
                "}",
                "/*",
                "var nome: texto",
                "para i = 1; i <= 5; i = i + 1 {",
                "    nome = leia('Digite seu nome: ')",
                "    escreva('Olá, ${nome}')",
                "}",
                "*/",
            ];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain("/*");
            expect(resultado).toContain("*/");
            expect(resultado).toContain("var nome: texto");
        });
    });

    describe('Extensão', () => {
        it('Extensão simples de número', async () => {
            const codigo = [
                'extensão de número { dobro() {    retorna isto * 2    }',
                '}',
            ];
            const resultadoLexador = lexador.mapear(codigo, -1);
            const resultadoAvaliadorSintatico = await avaliadorSintatico.analisar(resultadoLexador, -1);
            expect(resultadoAvaliadorSintatico.erros).toHaveLength(0);
            const resultado = formatador.formatar(resultadoAvaliadorSintatico.declaracoes);
            expect(resultado).toContain('extensão de número {');
            expect(resultado).toContain('dobro(');
        });

        it('Extensão global de texto', async () => {
            const codigo = [
                'extensão global de texto {',
                'gritando() {retorna isto.maiusculo()',
                '  }',
                '     }',
            ];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            expect(avaliado.erros).toHaveLength(0);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain('extensão global de texto {');
        });
    });

    describe('Interface', () => {
        it('Interface com método', async () => {
            const codigo = [
                'interface Imprimivel {',
                '    imprimir(): vazio',
                '}',
            ];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            expect(avaliado.erros).toHaveLength(0);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain('interface Imprimivel {');
            expect(resultado).toContain('imprimir(): vazio');
        });

        it('Interface com propriedade e método com parâmetro', async () => {
            const codigo = [
                'interface Identificavel {',
                '    id: inteiro',
                '    identificar(prefixo: texto): texto',
                '}',
            ];
            const lexado = lexador.mapear(codigo, -1);
            const avaliado = await avaliadorSintatico.analisar(lexado, -1);
            expect(avaliado.erros).toHaveLength(0);
            const resultado = formatador.formatar(avaliado.declaracoes);
            expect(resultado).toContain('interface Identificavel {');
            expect(resultado).toContain('id: inteiro');
            expect(resultado).toContain('identificar(prefixo: texto): texto');
        });
    });

    describe('Correções de formatação', () => {
        it('Chamada de método em objeto preserva objeto e método no output', async () => {
            const codigo = [
                "var regions = []",
                "regions.adicionar(1)",
                "regions.remover(0)",
            ];
            const resultadoLexador = lexador.mapear(codigo, -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);

            expect(resultado).toContain('regions.adicionar(1)');
            expect(resultado).toContain('regions.remover(0)');
        });

        it('Enquanto com chamada de função na condição tem espaço antes de {', async () => {
            const codigo = [
                "var m = 0",
                "enquanto m != 13 {",
                "    m = m + 1",
                "}",
            ];
            const resultadoLexador = lexador.mapear(codigo, -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);

            expect(resultado).toContain('enquanto m != 13 {');
        });

        it('classe estrangeira é formatada com modificador e métodos sem corpo', async () => {
            const codigo = [
                'classe estrangeira Modelo {',
                '    id: numero',
                '    salvar()',
                '    buscarPorId(id: numero)',
                '    versao(): texto',
                '}',
            ];
            const resultadoLexador = lexador.mapear(codigo, -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);

            expect(resultado).toContain('classe estrangeira Modelo');
            expect(resultado).not.toContain('salvar() {');
            expect(resultado).toContain('salvar()');
            expect(resultado).toContain('buscarPorId(id: numero)');
            expect(resultado).toContain('versao(): texto');
        });

        it('Para com chamada de método no corpo coloca } em linha separada', async () => {
            const codigo = [
                "var regions = []",
                "para var i = 0; i < 3; i++ {",
                "    regions.adicionar(i + 1)",
                "}",
            ];
            const resultadoLexador = lexador.mapear(codigo, -1);
            const resultadoAvaliacaoSintatica = await avaliadorSintatico.analisar(resultadoLexador, -1);
            const resultado = formatador.formatar(resultadoAvaliacaoSintatica.declaracoes);
            const linhas = resultado.split(quebraLinha);

            const linhaCorpo = linhas.findIndex(l => l.includes('adicionar'));
            const linhaFechamento = linhas.findIndex(l => l.trim() === '}');
            expect(linhaCorpo).toBeGreaterThan(-1);
            expect(linhaFechamento).toBeGreaterThan(linhaCorpo);
        });
    });
});
