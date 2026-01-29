import primitivasTexto from '../../../../fontes/bibliotecas/dialetos/pitugues/primitivas-texto';
import { criarInterpretadorMock } from '../../../_mocks/interpretador.mock';
import { TuplaN } from '../../../../fontes/construtos/tupla-n';
import { Literal } from '../../../../fontes/construtos';

describe('Primitivas de Texto (Pituguês)', () => {
    const interpretador = criarInterpretadorMock();

    describe('particao / partição', () => {
        it('deve partir o texto corretamente quando o separador existe', async () => {
            const texto = "I could eat bananas all day";
            const separador = "bananas";

            const resultado = await primitivasTexto.particao.implementacao(
                interpretador,
                texto,
                separador
            );

            expect(resultado).toBeInstanceOf(TuplaN);
            expect(resultado.tipo).toBe('tupla');

            const valores = resultado.elementos.map((elemento: Literal) => elemento.valor);
            expect(valores).toEqual(['I could eat ', 'bananas', ' all day']);
            expect(resultado.paraTextoSaida()).toBe('("I could eat ", "bananas", " all day")');
        });

        it('deve retornar tupla com campos vazios quando o separador não existe', async () => {
            const texto = "fruta";
            const separador = "carro";

            const resultado = await primitivasTexto.particao.implementacao(
                interpretador,
                texto,
                separador
            );

            expect(resultado).toBeInstanceOf(TuplaN);
            expect(resultado.tipo).toBe('tupla');

            const valores = resultado.elementos.map((elemento: Literal) => elemento.valor);
            expect(valores).toEqual(['fruta', '', '']);
            expect(resultado.paraTextoSaida()).toBe('("fruta", "", "")');
        });

        it('a versão com acento (partição) deve ter o mesmo comportamento', async () => {
            const texto = "python-pitugues";
            const separador = "-";

            const resultado = await primitivasTexto.partição.implementacao(
                interpretador,
                texto,
                separador
            );

            expect(resultado).toBeInstanceOf(TuplaN);
            expect(resultado.tipo).toBe('tupla');

            const valores = resultado.elementos.map((elemento: Literal) => elemento.valor);
            expect(valores).toEqual(['python', '-', 'pitugues']);
            expect(resultado.paraTextoSaida()).toBe('("python", "-", "pitugues")');
        });

        it('deve lidar com separadores no início do texto', async () => {
            const texto = ".texto";
            const separador = ".";

            const resultado = await primitivasTexto.particao.implementacao(
                interpretador,
                texto,
                separador
            );

            expect(resultado).toBeInstanceOf(TuplaN);
            expect(resultado.tipo).toBe('tupla');

            const valores = resultado.elementos.map((elemento: Literal) => elemento.valor);
            expect(valores).toEqual(['', '.', 'texto']);
            expect(resultado.paraTextoSaida()).toBe('("", ".", "texto")');
        });
    });
    describe('aparar_inicio / aparar_fim', () => {
        it('deve aparar inicio do texto', async () => {
            const texto = "   texto com espaco no inicio";
            const resultado = await primitivasTexto.aparar_inicio.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe("texto com espaco no inicio");
        });
        it('deve aparar fim do texto', async () => {
            const texto = "texto com espaco no fim   ";
            const resultado = await primitivasTexto.aparar_fim.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe("texto com espaco no fim");
        });
    });
    describe('concatenar', () => {
        it('deve concatenar textos', async () => {
            const texto1 = "Gosto de ";
            const texto2 = "programar em Pituguês.";
            const resultado = await primitivasTexto.concatenar.implementacao(
                interpretador,
                texto1,
                texto2
            );
            expect(resultado).toBe("Gosto de programar em Pituguês.");
        });
    });

    describe('encontrar', () => {
        it('deve retornar o indice do caractere', async () => {
            const texto = "Eu adoro banana";
            const caractere = "a";
            const resultado = await primitivasTexto.encontrar.implementacao(
                interpretador,
                texto,
                caractere
            );
            expect(resultado).toBe(3);
        });
        it('deve retornar -1 quando o caractere não é encontrado', async () => {
            const texto = "Eu adoro banana";
            const caractere = "x";
            const resultado = await primitivasTexto.encontrar.implementacao(
                interpretador,
                texto,
                caractere
            );
            expect(resultado).toBe(-1);
        });
        it('deve retornar o indice do caractere', async () => {
            const texto = "Eu adoro banana";
            const caractere = "a";
            const resultado = await primitivasTexto.encontrar.implementacao(
                interpretador,
                texto,
                caractere
            );
            expect(resultado).toBe(3);
        })
        it('deve retornar o indice quando passado o indice inicial', async () => {
            const texto = "Eh preciso saber viver"
            const caractere = "i";
            const indiceInicial = 10;
            const resultado = await primitivasTexto.encontrar.implementacao(
                interpretador,
                texto,
                caractere,
                indiceInicial
            );
            expect(resultado).toBe(18);
        })
    });
    describe('dividir', () => {
        it('deve dividir o texto pelo delimitador', async () => {
            const texto = "um dois três";
            const delimitador = " ";
            const resultado = await primitivasTexto.dividir.implementacao(
                interpretador,
                texto,
                delimitador
            );
            expect(resultado).toEqual(['um', 'dois', 'três']);
        });

        it('deve respeitar o limite de elementos', async () => {
            const texto = "a-b-c-d-e";
            const delimitador = "-";
            const limite = 3;
            const resultado = await primitivasTexto.dividir.implementacao(
                interpretador,
                texto,
                delimitador,
                limite
            );
            expect(resultado).toEqual(['a', 'b', 'c']);
        });

        it('deve retornar array com um elemento quando o delimitador não existe', async () => {
            const texto = "texto";
            const delimitador = "-";
            const resultado = await primitivasTexto.dividir.implementacao(
                interpretador,
                texto,
                delimitador
            );
            expect(resultado).toEqual(['texto']);
        });
    });

    describe('encontrar_ultimo', () => {
        it('deve retornar o índice da última ocorrência', async () => {
            const texto = "Mi casa, su casa.";
            const subtexto = "casa";
            const resultado = await primitivasTexto.encontrar_ultimo.implementacao(
                interpretador,
                texto,
                subtexto
            );
            expect(resultado).toBe(12);
        });

        it('deve retornar -1 quando o subtexto não é encontrado', async () => {
            const texto = "Mi casa, su casa.";
            const subtexto = "nada";
            const resultado = await primitivasTexto.encontrar_ultimo.implementacao(
                interpretador,
                texto,
                subtexto
            );
            expect(resultado).toBe(-1);
        });

        it('deve retornar o índice da primeira ocorrência quando há apenas uma', async () => {
            const texto = "Olá mundo";
            const subtexto = "Olá";
            const resultado = await primitivasTexto.encontrar_ultimo.implementacao(
                interpretador,
                texto,
                subtexto
            );
            expect(resultado).toBe(0);
        });
        it('deve retornar o índice correto passando o índice inicial', async () => {
            const texto = "abc def abc ghi abc";
            const subtexto = "abc";
            const indiceInicial = 10;
            const resultado = await primitivasTexto.encontrar_ultimo.implementacao(
                interpretador,
                texto,
                subtexto,
                indiceInicial
            );
            expect(resultado).toBe(16);
        })
        it('deve retornar o índice correto quando o índice inicial é negativo', async () => {
            const texto = "abc def abc ghi abc";
            const subtexto = "abc";
            const indiceInicial = -5;
            const resultado = await primitivasTexto.encontrar_ultimo.implementacao(
                interpretador,
                texto,
                subtexto,
                indiceInicial
            );
            expect(resultado).toBe(16);
        });
        it('deve retornar -1 quando o índice inicial é maior que o tamanho do texto', async () => {
            const texto = "abc def abc ghi abc";
            const subtexto = "abc";
            const indiceInicial = 100;
            const resultado = await primitivasTexto.encontrar_ultimo.implementacao(
                interpretador,
                texto,
                subtexto,
                indiceInicial
            );
            expect(resultado).toBe(-1);
        })
    });

    describe('fatiar', () => {
        it('deve fatiar o texto entre início e fim', async () => {
            const texto = "Um dois três quatro";
            const resultado = await primitivasTexto.fatiar.implementacao(
                interpretador,
                texto,
                3,
                7
            );
            expect(resultado).toBe("dois");
        });

        it('deve fatiar do início até o final quando não há fim', async () => {
            const texto = "Um dois três quatro";
            const resultado = await primitivasTexto.fatiar.implementacao(
                interpretador,
                texto,
                8
            );
            expect(resultado).toBe("três quatro");
        });

        it('deve retornar string vazia quando início é maior que fim', async () => {
            const texto = "Um dois três quatro";
            const resultado = await primitivasTexto.fatiar.implementacao(
                interpretador,
                texto,
                10,
                5
            );
            expect(resultado).toBe("");
        });
    });
    describe('formatar', () => {
        it('deve lançar erro quando usar formato de float (f) com tipo texto', async () => {
            const texto = "Valor: {:.2f}";
            const valorTexto = "texto";
            
            await expect(
                primitivasTexto.formatar.implementacao(
                    interpretador,
                    texto,
                    valorTexto
                )
            ).rejects.toThrow("Erro: Código de formato 'f' desconhecido para objeto do tipo 'texto'");
        });
        
        it('deve lançar erro quando usar formato de float (f) com tipo booleano', async () => {
            const texto = "Valor: {:.2f}";
            const valorBooleano = true;
            
            await expect(
                primitivasTexto.formatar.implementacao(
                    interpretador,
                    texto,
                    valorBooleano
                )
            ).rejects.toThrow("Erro: Código de formato 'f' desconhecido para objeto do tipo 'boolean'");
        });
        it('deve lançar erro quando usar formato de float (f) com tipo não numérico', async () => {
            const texto = "Valor: {:.2f}";
            const valorTexto = "texto";
            
            await expect(
                primitivasTexto.formatar.implementacao(
                    interpretador,
                    texto,
                    valorTexto
                )
            ).rejects.toThrow();
        });
        it('deve formatar o número com duas casas decimais', async () => {
            const texto = "O valor é {:.2f}";
            const numero = 3.14159;
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                numero
            );
            expect(resultado).toBe("O valor é 3.14");
        });
        
        it('deve formatar o número com uma casa decimal', async () => {
            const texto = "Valor: {:.1f}";
            const numero = 3.14159;
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                numero
            );
            expect(resultado).toBe("Valor: 3.1");
        });
    
        it('deve formatar o número com cinco casas decimais', async () => {
            const texto = "Precisão: {:.5f}";
            const numero = 3.14159;
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                numero
            );
            expect(resultado).toBe("Precisão: 3.14159");
        });
    
        it('deve formatar sem casas decimais', async () => {
            const texto = "Inteiro: {:.0f}";
            const numero = 3.7;
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                numero
            );
            expect(resultado).toBe("Inteiro: 4");
        });
    
        it('deve formatar com valor negativo', async () => {
            const texto = "Negativo: {:.2f}";
            const numero = -15.789;
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                numero
            );
            expect(resultado).toBe("Negativo: -15.79");
        });
        it('deve formatar texto com formato especial que não seja f', async () => {
            const texto = "Valor: {:s}";
            const valor = "teste";
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                valor
            );
            expect(resultado).toBe("Valor: teste");
        });
    
        it('deve formatar texto simples sem formato especial', async () => {
            const texto = "Olá {}";
            const valor = 'Mundo';
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                valor
            );
            expect(resultado).toBe("Olá Mundo");
        });
    
        it('deve formatar número zero', async () => {
            const texto = "Zero: {:.2f}";
            const numero = 0;
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                numero
            );
            expect(resultado).toBe("Zero: 0.00");
        });
    
        it('deve manter múltiplos placeholders se houver apenas um valor', async () => {
            const texto = "Valor: {:.2f} e {:.2f}";
            const numero = 3.14159;
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                numero
            );
    
            expect(resultado).toBe("Valor: 3.14 e {:.2f}");
        });
        it('deve formatar número com formato f sem especificar casas decimais', async () => {
            const texto = "Valor: {:f}";
            const numero = 3.14159;
            const resultado = await primitivasTexto.formatar.implementacao(
                interpretador,
                texto,
                numero
            );
            expect(resultado).toBe("Valor: 3.14");
        });
    });
    describe('inclui', () => {
        it('deve retornar verdadeiro quando o elemento está contido', async () => {
            const texto = "um dois três";
            const elemento = "dois";
            const resultado = await primitivasTexto.inclui.implementacao(
                interpretador,
                texto,
                elemento
            );
            expect(resultado).toBe(true);
        });

        it('deve retornar falso quando o elemento não está contido', async () => {
            const texto = "um dois três";
            const elemento = "quatro";
            const resultado = await primitivasTexto.inclui.implementacao(
                interpretador,
                texto,
                elemento
            );
            expect(resultado).toBe(false);
        });
    });

    describe('inverter', () => {
        it('deve inverter o texto', async () => {
            const texto = "python";
            const resultado = await primitivasTexto.inverter.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe("nohtyp");
        });

        it('deve inverter texto com espaços', async () => {
            const texto = "olá mundo";
            const resultado = await primitivasTexto.inverter.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe("odnum álo");
        });
    });

    describe('maiusculo', () => {
        it('deve converter para maiúsculo', async () => {
            const texto = "tudo em minúsculo";
            const resultado = await primitivasTexto.maiusculo.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe("TUDO EM MINÚSCULO");
        });

        it('deve manter maiúsculo se já estiver', async () => {
            const texto = "JÁ ESTÁ EM MAIÚSCULO";
            const resultado = await primitivasTexto.maiusculo.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe("JÁ ESTÁ EM MAIÚSCULO");
        });
    });

    describe('minusculo', () => {
        it('deve converter para minúsculo', async () => {
            const texto = "TUDO EM MAIÚSCULO";
            const resultado = await primitivasTexto.minusculo.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe("tudo em maiúsculo");
        });

        it('deve manter minúsculo se já estiver', async () => {
            const texto = "já está em minúsculo";
            const resultado = await primitivasTexto.minusculo.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe("já está em minúsculo");
        });
    });

    describe('substituir', () => {
        it('deve substituir primeira ocorrência', async () => {
            const texto = "Eu gosto de caju";
            const aSubstituir = "caju";
            const substituto = "graviola";
            const resultado = await primitivasTexto.substituir.implementacao(
                interpretador,
                texto,
                aSubstituir,
                substituto
            );
            expect(resultado).toBe("Eu gosto de graviola");
        });

        it('deve substituir apenas a primeira ocorrência', async () => {
            const texto = "banana com banana";
            const aSubstituir = "banana";
            const substituto = "maçã";
            const resultado = await primitivasTexto.substituir.implementacao(
                interpretador,
                texto,
                aSubstituir,
                substituto
            );
            expect(resultado).toBe("maçã com banana");
        });

        it('deve retornar o texto inalterado quando não encontra', async () => {
            const texto = "Eu gosto de caju";
            const aSubstituir = "manga";
            const substituto = "graviola";
            const resultado = await primitivasTexto.substituir.implementacao(
                interpretador,
                texto,
                aSubstituir,
                substituto
            );
            expect(resultado).toBe("Eu gosto de caju");
        });
    });

    describe('subtexto', () => {
        it('deve extrair subtexto entre posições', async () => {
            const texto = "Eu gosto de caju e de graviola";
            const resultado = await primitivasTexto.subtexto.implementacao(
                interpretador,
                texto,
                3,
                16
            );
            expect(resultado).toBe("gosto de caju");
        });

        it('deve retornar string vazia quando início é igual a fim', async () => {
            const texto = "Texto qualquer";
            const resultado = await primitivasTexto.subtexto.implementacao(
                interpretador,
                texto,
                5,
                5
            );
            expect(resultado).toBe("");
        });
    });

    describe('tamanho', () => {
        it('deve retornar o tamanho do texto', async () => {
            const texto = "Um dois três quatro";
            const resultado = await primitivasTexto.tamanho.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe(19);
        });

        it('deve retornar 0 para texto vazio', async () => {
            const texto = "";
            const resultado = await primitivasTexto.tamanho.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe(0);
        });
    });

    describe('termina_com', () => {
        it('deve retornar verdadeiro quando termina com o sufixo', async () => {
            const texto = "Olá, bem-vindo ao meu mundo.";
            const sufixo = ".";
            const resultado = await primitivasTexto.termina_com.implementacao(
                interpretador,
                texto,
                sufixo
            );
            expect(resultado).toBe(true);
        });

        it('deve retornar falso quando não termina com o sufixo', async () => {
            const texto = "Olá, bem-vindo ao meu mundo.";
            const sufixo = "mundo";
            const resultado = await primitivasTexto.termina_com.implementacao(
                interpretador,
                texto,
                sufixo
            );
            expect(resultado).toBe(false);
        });

        it('deve retornar verdadeiro para sufixo completo no final', async () => {
            const texto = "Olá, bem-vindo ao meu mundo.";
            const sufixo = "mundo.";
            const resultado = await primitivasTexto.termina_com.implementacao(
                interpretador,
                texto,
                sufixo
            );
            expect(resultado).toBe(true);
        });
    });

    describe('tudo_maiusculo', () => {
        it('deve retornar verdadeiro quando todos em maiúsculo', async () => {
            const texto = "TUDO EM MAIÚSCULO";
            const resultado = await primitivasTexto.tudo_maiusculo.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe(true);
        });

        it('deve retornar falso quando há minúsculas', async () => {
            const texto = "Tudo em Maiúsculo";
            const resultado = await primitivasTexto.tudo_maiusculo.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe(false);
        });
    });

    describe('tudo_minusculo', () => {
        it('deve retornar verdadeiro quando todos em minúsculo', async () => {
            const texto = "tudo em minúsculo";
            const resultado = await primitivasTexto.tudo_minusculo.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe(true);
        });

        it('deve retornar falso quando há maiúsculas', async () => {
            const texto = "Tudo em Minúsculo";
            const resultado = await primitivasTexto.tudo_minusculo.implementacao(
                interpretador,
                texto
            );
            expect(resultado).toBe(false);
        });
    });

});
