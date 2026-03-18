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
