import { LexadorCalango } from '../../../../fontes/lexador/dialetos/lexador-calango';

describe('Lexador (Calango)', () => {
    describe('mapear()', () => {
        let lexador: LexadorCalango;

        beforeEach(() => {
            lexador = new LexadorCalango();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Vetor de código vazio', () => {
                const resultado = lexador.mapear([], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
                expect(resultado.erros).toHaveLength(0);
            });
        });

        describe('Cenários de sucesso', () => {
            
            it('Sucesso - Código vazio com símbolos algoritmo, principal e fimPrincipal', () => {
                const resultado = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;', 
                    'principal', 
                    'fimPrincipal'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(5);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Sucesso - Método "escreva"', () => {
                const resultado = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;', 
                    'principal', 
                    'escreva("Ola Mundo");',
                    'fimPrincipal'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(10);
                expect(resultado.erros).toHaveLength(0);
            });

            it('Sucesso - Tipos de dados (real, logico, caracter, texto)', () => {
                const resultado = lexador.mapear([
                    'real preco;',
                    'logico ativo;',
                    'caracter letra;',
                    'texto nome;',
                    'preco = 3.14;',
                    'ativo = verdadeiro;',
                    'letra = \'a\';',
                    'nome = "João";',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['REAL', 'LOGICO', 'CARACTER', 'TIPO_TEXTO', 'VERDADEIRO', 'LITERAL_CARACTER', 'TEXTO'])
                );
            });

            it('Sucesso - enquanto / fimEnquanto', () => {
                const resultado = lexador.mapear([
                    'inteiro i;',
                    'i = 0;',
                    'enquanto (i < 3) faca',
                    'i = i + 1;',
                    'fimEnquanto',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['ENQUANTO', 'FACA', 'FIM_ENQUANTO'])
                );
            });

            it('Sucesso - funcao / fimFuncao / retorna', () => {
                const resultado = lexador.mapear([
                    'funcao dobrar(inteiro n): inteiro',
                    'inteiro resultado;',
                    'resultado = n + n;',
                    'retorna resultado;',
                    'fimFuncao',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['FUNCAO', 'FIM_FUNCAO', 'RETORNA', 'DOIS_PONTOS'])
                );
            });

            it('Sucesso - procedimento / fimProcedimento', () => {
                const resultado = lexador.mapear([
                    'procedimento saudar(texto nome)',
                    'escreval(nome);',
                    'fimProcedimento',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['PROCEDIMENTO', 'FIM_PROCEDIMENTO'])
                );
            });

            it('Sucesso - interrompa', () => {
                const resultado = lexador.mapear([
                    'inteiro i;',
                    'i = 0;',
                    'enquanto (i < 10) faca',
                    'se (i = 3) entao',
                    'interrompa',
                    'fimSe',
                    'i = i + 1;',
                    'fimEnquanto',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['INTERROMPA'])
                );
            });

            it('Sucesso - escolha / caso / outroCaso / fimEscolha', () => {
                const resultado = lexador.mapear([
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
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['ESCOLHA', 'CASO', 'DOIS_PONTOS', 'OUTRO_CASO', 'FIM_ESCOLHA'])
                );
            });

            it('Sucesso - faca / enquanto (do-while)', () => {
                const resultado = lexador.mapear([
                    'inteiro i;',
                    'i = 0;',
                    'faca',
                    'i = i + 1;',
                    'enquanto (i < 3)',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['FACA', 'ENQUANTO'])
                );
            });

            it('Sucesso - para / ate / passo / fimPara', () => {
                const resultado = lexador.mapear([
                    'inteiro i;',
                    'para i de 1 ate 5 passo 1 faca',
                    'escreval(i);',
                    'fimPara',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['PARA', 'DE', 'ATE', 'PASSO', 'FACA', 'FIM_PARA'])
                );
            });

            it('Sucesso - operador <> (diferente)', () => {
                const resultado = lexador.mapear([
                    'inteiro x;',
                    'x <> 0',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['DIFERENTE'])
                );
            });

            it('Sucesso - nao (negacao logica)', () => {
                const resultado = lexador.mapear([
                    'logico ativo;',
                    'ativo = nao verdadeiro;',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['NEGACAO'])
                );
            });

            it('Sucesso - mod e div', () => {
                const resultado = lexador.mapear([
                    'inteiro a;',
                    'a = 10 mod 3;',
                    'a = 10 div 3;',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['MODULO', 'DIVISAO_INTEIRA'])
                );
            });

            it('Sucesso - % (modulo) e ^ (exponenciacao)', () => {
                const resultado = lexador.mapear([
                    'inteiro a;',
                    'a = 10 % 3;',
                    'a = 2 ^ 8;',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos.map((s) => s.tipo)).toEqual(
                    expect.arrayContaining(['MODULO', 'EXPONENCIACAO'])
                );
            });

            it('Sucesso - comentário de linha (//)', () => {
                const resultado = lexador.mapear([
                    '// este é um comentário',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - comentário após instrução', () => {
                const resultado = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;',
                    'principal',
                    'inteiro x; // declara x',
                    'x = 1; // atribui 1 a x',
                    'fimPrincipal',
                ], -1);

                expect(resultado.erros).toHaveLength(0);
                // Apenas os símbolos das declarações, sem tokens do comentário
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).not.toContain('DIVISAO');
            });

            it('Sucesso - Condicionais (se, senao)', () => {
                const resultado = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;'+ 
                    'principal'+
                    'inteiro idade;'+
                    'escreva("Informe sua idade: ");'+
                    'leia(idade);'+
                    'se (idade >= 18) entao'+
                        'escreval("maior de idade");'+
                    'senao'+
                        'se (idade <= 0) entao'+
                            'escreval("valor invalido");'+
                        'senao',
                            'escreval("menor de idade");'+
                        'fimSe'+
                    'fimSe'+
                    'fimPrincipal'
                ], -1);
    
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(45);
                expect(resultado.erros).toHaveLength(0);
            });
        });
    });
});
