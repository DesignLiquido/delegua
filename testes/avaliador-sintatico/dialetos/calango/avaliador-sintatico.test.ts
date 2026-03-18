import { AvaliadorSintaticoCalango } from "../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango";
import { LexadorCalango } from "../../../../fontes/lexador/dialetos";

describe('Avaliador sintático (Calango)', () => {
    describe('analisar()', () => {
        let lexador: LexadorCalango;
        let avaliadorSintatico: AvaliadorSintaticoCalango;

        beforeEach(() => {
            lexador = new LexadorCalango();
            avaliadorSintatico = new AvaliadorSintaticoCalango();
        });

        it('Sucesso - escreva()', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                'escreva("Ola Mundo");',
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - escreval()', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                // Essa forma de escrita eu testei em Calango e funciona tranquilamente (linha 44)
                'escreval("Ola Mundo"); escreva("nova linha");', 
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Sucesso - Atribuindo variáveis', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                'inteiro idade;',
                'idade = 0;',
                'escreval(idade)', 
                'fimPrincipal'
            ], -1);
            
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - Tipos de dados (real, logico, caracter, texto)', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'real preco;',
                'logico ativo;',
                'caracter letra;',
                'texto nome;',
                'preco = 3.14;',
                'ativo = verdadeiro;',
                'letra = \'a\';',
                'nome = "João";',
                'escreval(preco);',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(9);
        });

        it('Sucesso - enquanto / fimEnquanto', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro i;',
                'i = 0;',
                'enquanto (i < 3) faca',
                'i = i + 1;',
                'fimEnquanto',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - funcao com parametros e retorna', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'funcao dobrar(inteiro n): inteiro',
                'inteiro resultado;',
                'resultado = n + n;',
                'retorna resultado;',
                'fimFuncao',
                'principal',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 FuncaoDeclaracao antes do principal, 0 declarações no corpo
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - procedimento com parametros', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'procedimento saudar(texto nome)',
                'escreval(nome);',
                'fimProcedimento',
                'principal',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - interrompa dentro de enquanto', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro i;',
                'i = 0;',
                'enquanto (i < 10) faca',
                'se (i = 3) entao',
                'interrompa',
                'fimSe',
                'i = i + 1;',
                'fimEnquanto',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 Var + 1 Atribuir + 1 Enquanto
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - escolha / caso / outroCaso / fimEscolha', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro x;',
                'x = 2;',
                'escolha (x)',
                'caso 1:',
                'escreval("um");',
                'caso 2:',
                'escreval("dois");',
                'outroCaso:',
                'escreval("outro");',
                'fimEscolha',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 Var + 1 Atribuir + 1 Escolha
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - faca / enquanto (do-while)', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro i;',
                'i = 0;',
                'faca',
                'i = i + 1;',
                'enquanto (i < 3)',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 Var + 1 Atribuir + 1 Fazer
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - para / ate / passo / fimPara (passo explícito)', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro i;',
                'para i de 1 ate 5 passo 1 faca',
                'escreval(i);',
                'fimPara',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 declaracao Var + 1 Para
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Sucesso - para / ate / fimPara (passo implícito)', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro i;',
                'para i de 1 ate 3 faca',
                'escreval(i);',
                'fimPara',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Sucesso - operador <> (diferente) em condicional', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro x;',
                'x = 1;',
                'se (x <> 0) entao',
                'escreval(x);',
                'fimSe',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 Var + 1 Atribuir + 1 Se
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - nao (negacao logica)', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'logico ativo;',
                'ativo = nao verdadeiro;',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 Var + 1 Atribuir
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Sucesso - mod, div, ^', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro a;',
                'a = 10 mod 3;',
                'a = 10 div 3;',
                'a = 2 ^ 8;',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 Var + 3 Atribuir
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
        });

        it('Sucesso - se com = como comparacao (nao atribuicao)', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;',
                'principal',
                'inteiro x;',
                'x = 1;',
                'se (x = 1) entao',
                'escreval(x);',
                'fimSe',
                'fimPrincipal',
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
            // 1 Var + 1 Atribuir + 1 Se
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        it('Sucesso - Condicionais (se, senao)', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                'inteiro idade;', 
                'escreva("Informe sua idade: ");',
                'leia(idade);',
                'se (idade >= 18) entao',
                    'escreval("maior de idade");',
                'senao',
                    'se (idade <= 0) entao',
                        'escreval("valor invalido");',
                    'senao',
                        'escreval("menor de idade");',
                    'fimSe',
                'fimSe',
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
        });
    });
});
