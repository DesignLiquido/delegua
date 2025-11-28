import { InterpretadorInterface } from '../../../interfaces';
import { PrimitivaInterface } from '../../../interfaces/primitiva-interface';
import { InformacaoElementoSintatico } from '../../../informacao-elemento-sintatico';

export default {
    aparar: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<string> => Promise.resolve(texto.trim()),
        assinaturaFormato: 'texto.aparar()',
        documentacao:
            '# `texto.aparar()` \n \n' +
            'Remove espaços em branco no início e no fim de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.aparar() + "|") // "|meu texto com espaços no início e no fim|"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.aparar()',
    },
    aparar_fim: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<string> => Promise.resolve(texto.trimEnd()),
        assinaturaFormato: 'texto.aparar_fim()',
        documentacao:
            '# `texto.aparar_fim()` \n \n' +
            'Remove espaços em branco no no fim de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.aparar_fim() + "|") // "|   meu texto com espaços no início e no fim|"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.aparar_fim()',
    },
    aparar_inicio: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<string> => Promise.resolve(texto.trimStart()),
        assinaturaFormato: 'texto.aparar_inicio()',
        documentacao:
            '# `texto.aparar_inicio()` \n \n' +
            'Remover espaços em branco no início e no fim de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.aparar_inicio() + "|") // "|meu texto com espaços no início e no fim       |"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.aparar_inicio()',
    },
    concatenar: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'outroTexto',
                'texto',
                true,
                [],
                'O texto a ser concatenado.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            ...texto: string[]
        ): Promise<string> => Promise.resolve(''.concat(...texto)),
        assinaturaFormato: 'texto.concatenar(...outroTexto: texto)',
        documentacao:
            '# `texto.concatenar(outroTexto)` \n \n' +
            'Realiza a junção de palavras/textos.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t1 = "um"\n' +
            'var t2 = "dois três"\n' +
            'escreva(t1.concatenar(t2)) // "umdois três"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.concatenar(outroTexto)',
    },
    dividir: {
        tipoRetorno: 'texto[]',
        argumentos: [
            new InformacaoElementoSintatico(
                'delimitador',
                'texto',
                true,
                [],
                'O delimitador usado para dividir o texto.'
            ),
            new InformacaoElementoSintatico(
                'limite',
                'número',
                false,
                [],
                '(Opcional) Número limite de elementos a serem retornados.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string,
            divisor: string,
            limite?: number
        ): Promise<string[]> => {
            if (limite) {
                return Promise.resolve(texto.split(divisor, limite));
            }

            return Promise.resolve(texto.split(divisor));
        },
        assinaturaFormato: 'texto.dividir(delimitador: texto, limite?: inteiro)',
        documentacao:
            '# `texto.dividir(delimitador)` \n \n' +
            'Divide o texto pelo separador passado como parâmetro.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "um dois três"\n' +
            "t.dividir(' ') // ['um','dois','três']\n```" +
            '\n\n ### Formas de uso  \n',
        exemploCodigo: "texto.dividir('<delimitador (, ; ' ')>')",
    },
    encontrar: {
        tipoRetorno: 'inteiro',
        argumentos: [
            new InformacaoElementoSintatico(
                'subtexto',
                'texto',
                true,
                [],
                'O texto que deve ser buscado.'
            ),
            new InformacaoElementoSintatico(
                'indiceInicio',
                'número',
                false,
                [],
                '(Opcional) O índice opcional para iniciar a busca.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string,
            subtexto: string,
            indiceInicio?: number
        ): Promise<number> => {
            if (indiceInicio !== undefined) {
                return Promise.resolve(texto.indexOf(subtexto, indiceInicio));
            }
            return Promise.resolve(texto.indexOf(subtexto));
        },
        assinaturaFormato: 'texto.encontrar(subtexto: texto, indiceInicio?: número)',
        documentacao:
            '# `texto.encontrar(subtexto, indiceInicio)` \n \n' +
            'Retorna o índice inicial de um subtexto. Retorna -1 caso não encontre.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "um dois três"\n' +
            't.encontrar("dois") // 3\n' +
            't.encontrar("quatro") // -1\n' +
            't.encontrar("dois", 4) // -1\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.encontre(subtexto, indiceInicio?)',
    },
    encontrar_ultimo: {
        tipoRetorno: 'inteiro',
        argumentos: [
            new InformacaoElementoSintatico(
                'subtexto',
                'texto',
                true,
                [],
                'O subtexto que deve ser buscado.'
            ),
            new InformacaoElementoSintatico(
                'indiceInicio',
                'número',
                false,
                [],
                '(Opcional) Índice inicial para começar a busca.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string,
            subtexto: string,
            indiceInicio?: number
        ): Promise<number> => {
            if (indiceInicio !== undefined) {
                if (indiceInicio < 0) indiceInicio = 0;
                if (indiceInicio > texto.length) indiceInicio = texto.length;

                const posicao = texto.indexOf(subtexto, indiceInicio);
                if (posicao === -1) return Promise.resolve(-1);

                return Promise.resolve(texto.lastIndexOf(subtexto));
            }

            return Promise.resolve(texto.lastIndexOf(subtexto));
        },
        assinaturaFormato: 'texto.encontrar_ultimo(subtexto: texto, indiceInicio?: número)',
        documentacao:
            '# `texto.encontrar_ultimo(subtexto, indiceInicio)`\n\n' +
            'Retorna o índice da **última ocorrência** de um subtexto dentro do texto. ' +
            'Retorna **-1** caso o subtexto não seja encontrado.\n\n' +
            '## Exemplo de Código\n\n' +
            '```pitugues\n' +
            'var t = "Mi casa, su casa."\n\n' +
            't.encontrar_ultimo("casa")        // 12\n' +
            't.encontrar_ultimo("Mi")          // 0\n' +
            't.encontrar_ultimo("nada")        // -1\n' +
            't.encontrar_ultimo("casa", 10)    // 3\n' +
            't.encontrar_ultimo("casa", 2)     // -1\n' +
            '```\n\n' +
            '### Formas de uso\n' +
            '- `texto.encontrar_ultimo(subtexto)`\n' +
            '- `texto.encontrar_ultimo(subtexto, indiceInicio)`\n',
        exemploCodigo: 'texto.encontrar_ultimo(subtexto, indiceInicio?)',
    },
    fatiar: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'inicio',
                'número',
                true,
                [],
                'A posição inicial da fatia.'
            ),
            new InformacaoElementoSintatico(
                'fim',
                'número',
                false,
                [],
                '(Opcional) A posição final da fatia. Se não fornecido, seleciona até o final do texto.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string,
            inicio: number,
            fim: number
        ): Promise<string> => Promise.resolve(texto.slice(inicio, fim)),
        assinaturaFormato: 'texto.fatiar(inicio: número, fim?: número)',
        documentacao:
            '# `texto.fatiar(inicio)` \n \n' +
            'Extrai uma fatia do texto, dadas posições de início e fim.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "Um dois três quatro"\n' +
            't.fatiar() // "um dois três quatro", ou seja, não faz coisa alguma.\n' +
            't.fatiar(2, 7) // "dois"\n' +
            't.fatiar(8, 12) // "três"\n' +
            't.fatiar(8) // "três quatro", ou seja, seleciona tudo da posição 8 até o final do texto.\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.fatiar(início, final)\n' + 'texto.fatiar(aPartirDaPosicao)',
    },
    inclui: {
        tipoRetorno: 'lógico',
        argumentos: [
            new InformacaoElementoSintatico(
                'elemento',
                'lógico',
                true,
                [],
                'O elemento a ser verificado se está contido no texto.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string,
            elemento: string
        ): Promise<boolean> => Promise.resolve(texto.includes(elemento)),
        assinaturaFormato: 'inclui(elemento: texto)',
        documentacao:
            '# `texto.inclui(elemento)` \n \n' +
            'Devolve verdadeiro se elemento passado por parâmetro está contido no texto, e falso em caso contrário.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "um dois três"\n' +
            't.inclui("dois") // verdadeiro\n' +
            't.inclui("quatro") // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: "texto.inclui('palavra')",
    },
    inverter: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<string> =>
            Promise.resolve(
                texto.split('').reduce((texto, caracter) => (texto = caracter + texto), '')
            ),
        assinaturaFormato: 'texto.inverter()',
        documentacao:
            '# `texto.inverter()` \n \n' +
            'Inverte as letras de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "um dois três"\n' +
            't.inverter() // "sêrt siod mu"```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.inverter()',
    },
    maiusculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<string> => Promise.resolve(texto.toUpperCase()),
        assinaturaFormato: 'texto.maiusculo()',
        documentacao:
            '# `texto.maiusculo()` \n \n' +
            'Converte todos os caracteres alfabéticos para suas respectivas formas em maiúsculo.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "tudo em minúsculo"\n' +
            'escreva(t.maiusculo()) // "TUDO EM MINÚSCULO"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.maiusculo()',
    },
    minusculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<string> => Promise.resolve(texto.toLowerCase()),
        assinaturaFormato: 'texto.minusculo()',
        documentacao:
            '# `texto.minusculo()` \n \n' +
            'Converte todos os caracteres alfabéticos para suas respectivas formas em minúsculo.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "TUDO EM MAIÚSCULO"\n' +
            'escreva(t.minusculo()) // "tudo em maiúsculo"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.minusculo()',
    },
    substituir: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'textoASerSubstituido',
                'texto',
                true,
                [],
                'Texto a ser substituído.'
            ),
            new InformacaoElementoSintatico('substituto', 'texto', true, [], 'A substituição'),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string,
            elemento: string,
            substituto: string
        ): Promise<string> => Promise.resolve(texto.replace(elemento, substituto)),
        assinaturaFormato: 'texto.substituir(textoASerSubstituido: texto, substituto: texto)',
        documentacao:
            '# `texto.substituir(textoASerSubstituido, substituto)` \n \n' +
            'Substitui a primeira ocorrência no texto do primeiro parâmetro pelo segundo parâmetro.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "Eu gosto de caju"\n' +
            't.substituir("caju", "graviola") // Resultado será "Eu gosto de graviola"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: "texto.substituir('palavra a ser substituída','nova palavra')",
    },
    subtexto: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'inicio',
                'inteiro',
                true,
                [],
                'A posição de início do texto a ser extraído.'
            ),
            new InformacaoElementoSintatico(
                'fim',
                'inteiro',
                true,
                [],
                'A posição de fim do texto a ser extraído.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string,
            inicio: number,
            fim: number
        ): Promise<string> => Promise.resolve(texto.slice(inicio, fim)),
        assinaturaFormato: 'texto.subtexto(inicio: inteiro, fim: inteiro)',
        documentacao:
            '# `texto.subtexto(inicio, fim)` \n\n' +
            'Extrai uma fatia do texto, dadas posições de início e fim.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "Eu gosto de caju e de graviola"\n' +
            't.subtexto(3, 16) // Resultado será "gosto de caju"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.subtexto(posiçãoInicial, posiçãoFinal)',
    },
    tamanho: {
        tipoRetorno: 'inteiro',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<number> => Promise.resolve(texto.length),
        assinaturaFormato: 'texto.tamanho()',
        documentacao:
            '# `texto.tamanho()` \n\n' +
            'Devolve um número inteiro com o número de caracteres do texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t = "Um dois três quatro"\n' +
            't.tamanho() // 19\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.tamanho()',
    },
    termina_com: {
        tipoRetorno: 'lógico',
        argumentos: [
            new InformacaoElementoSintatico(
                'sufixo',
                'texto',
                true,
                [],
                'O sufixo a ser verificado no final do texto.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string,
            sufixo: string
        ): Promise<boolean> => Promise.resolve(texto.endsWith(sufixo)),
        assinaturaFormato: 'texto.termina_com(sufixo: texto)',
        documentacao:
            '# `texto.termina_com(sufixo)` \n \n' +
            'Verifica se um texto termina com o sufixo especificado e retorna um valor lógico (verdadeiro ou falso).' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar mensagem = "Olá, bem-vindo ao meu mundo."\n' +
            'escreva(mensagem.termina_com(".")) // verdadeiro\n' +
            'escreva(mensagem.termina_com("mundo")) // falso\n' +
            'escreva(mensagem.termina_com("mundo.")) // verdadeiro\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.termina_com(sufixo)',
    },
    tudo_maiusculo: {
        tipoRetorno: 'lógico',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<boolean> => Promise.resolve(texto === texto.toUpperCase()),
        assinaturaFormato: 'texto.tudo_maiusculo()',
        documentacao:
            '# `texto.tudo_maiusculo()` \n\n' +
            'Devolve verdadeiro se todos os caracteres alfabéticos do texto estão em maiúsculo, e falso em caso contrário.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t1 = "TUDO EM MAIÚSCULO"\n' +
            'var t2 = "Tudo em Maiúsculo"\n' +
            't1.tudo_maiusculo() // verdadeiro\n' +
            't2.tudo_maiusculo() // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.tudo_maiusculo()',
    },
    tudo_minusculo: {
        tipoRetorno: 'lógico',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            nomePrimitiva: string,
            texto: string
        ): Promise<boolean> => Promise.resolve(texto === texto.toLowerCase()),
        assinaturaFormato: 'texto.tudo_minusculo()',
        documentacao:
            '# `texto.tudo_minusculo()` \n\n' +
            'Devolve verdadeiro se todos os caracteres alfabéticos do texto estão em minúsculo, e falso em caso contrário.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nvar t1 = "tudo em minúsculo"\n' +
            'var t2 = "Tudo em Minúsculo"\n' +
            't1.tudo_minusculo() // verdadeiro\n' +
            't2.tudo_minusculo() // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.tudo_minusculo()',
    },
} as { [nome: string]: PrimitivaInterface };
