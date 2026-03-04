import { InterpretadorInterface } from '../interfaces';
import { PrimitivaInterface } from '../interfaces/primitiva-interface';
import { InformacaoElementoSintatico } from '../informacao-elemento-sintatico';
import { Construto, TuplaN, Literal } from '../construtos';
import { ErroEmTempoDeExecucao } from '../excecoes';

export const implementacaoParticao = (
    interpretador: InterpretadorInterface,
    texto: any,
    separador: any,
    ...args: any[]
): Promise<any> => {
    if (args.length > 0) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `A função "partição" aceita apenas um argumento.`,
                interpretador.linhaDeclaracaoAtual
            )
        );
    }

    if (typeof texto !== 'string') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `A função "partição" só pode ser chamada em textos.`,
                interpretador.linhaDeclaracaoAtual
            )
        );
    }

    if (separador === undefined) {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `A função "partição" requer um argumento separador.`,
                interpretador.linhaDeclaracaoAtual
            )
        );
    }

    if (typeof separador !== 'string') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                'O separador deve ser do tipo texto.',
                interpretador.linhaDeclaracaoAtual
            )
        );
    }

    if (separador === '') {
        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                'O separador não pode ser uma string vazia.',
                interpretador.linhaDeclaracaoAtual
            )
        );
    }

    const indice = texto.indexOf(separador);
    let partes: string[];

    if (indice === -1) {
        partes = [texto, '', ''];
    } else {
        const antes = texto.substring(0, indice);
        const depois = texto.substring(indice + separador.length);
        partes = [antes, separador, depois];
    }

    const elementos: Construto[] = partes.map(
        (p) =>
            new Literal(
                interpretador.hashArquivoDeclaracaoAtual,
                interpretador.linhaDeclaracaoAtual,
                p,
                'texto'
            )
    );

    const tupla = new TuplaN(
        interpretador.hashArquivoDeclaracaoAtual,
        interpretador.linhaDeclaracaoAtual,
        elementos
    );

    return Promise.resolve(tupla);
};

export default {
    aparar: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trim()),
        assinaturaFormato: 'texto.aparar()',
        documentacao:
            '# `texto.aparar()` \n \n' +
            'Remove espaços em branco no início e no fim de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.aparar() + "|") // "|meu texto com espaços no início e no fim|"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.aparar()',
    },
    apararFim: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trimEnd()),
        assinaturaFormato: 'texto.apararFim()',
        documentacao:
            '# `texto.apararFim()` \n \n' +
            'Remove espaços em branco no no fim de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.apararFim() + "|") // "|   meu texto com espaços no início e no fim|"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.apararFim()',
    },
    apararInicio: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trimStart()),
        assinaturaFormato: 'texto.apararInicio()',
        documentacao:
            '# `texto.apararInicio()` \n \n' +
            'Remover espaços em branco no início e no fim de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.apararInicio() + "|") // "|meu texto com espaços no início e no fim       |"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.apararInicio()',
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
            ...textos: string[]
        ): Promise<string> => Promise.resolve(''.concat(...textos)),
        assinaturaFormato: 'texto.concatenar(...outroTexto: texto)',
        documentacao:
            '# `texto.concatenar(outroTexto)` \n \n' +
            'Realiza a junção de palavras/textos.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t1 = "um"\n' +
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
            '\n\n```delegua\nvar t = "um dois três"\n' +
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
            '\n\n```delegua\nvar t = "um dois três"\n' +
            't.encontrar("dois") // 3\n' +
            't.encontrar("quatro") // -1\n' +
            't.encontrar("dois", 4) // -1\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.encontre(subtexto, indiceInicio?)',
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
            texto: string,
            inicio: number,
            fim: number
        ): Promise<string> => Promise.resolve(texto.slice(inicio, fim)),
        assinaturaFormato: 'texto.fatiar(inicio: número, fim?: número)',
        documentacao:
            '# `texto.fatiar(inicio)` \n \n' +
            'Extrai uma fatia do texto, dadas posições de início e fim.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "Um dois três quatro"\n' +
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
                'texto',
                true,
                [],
                'O elemento a ser verificado se está contido no texto.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            elemento: string
        ): Promise<boolean> => Promise.resolve(texto.includes(elemento)),
        assinaturaFormato: 'inclui(elemento: texto)',
        documentacao:
            '# `texto.inclui(elemento)` \n \n' +
            'Devolve verdadeiro se elemento passado por parâmetro está contido no texto, e falso em caso contrário.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "um dois três"\n' +
            't.inclui("dois") // verdadeiro\n' +
            't.inclui("quatro") // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: "texto.inclui('palavra')",
    },
    inverter: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(
                texto.split('').reduce((texto, caracter) => (texto = caracter + texto), '')
            ),
        assinaturaFormato: 'texto.inverter()',
        documentacao:
            '# `texto.inverter()` \n \n' +
            'Inverte as letras de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "um dois três"\n' +
            't.inverter() // "sêrt siod mu"```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.inverter()',
    },
    maiusculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.toUpperCase()),
        assinaturaFormato: 'texto.maiusculo()',
        documentacao:
            '# `texto.maiusculo()` \n \n' +
            'Converte todos os caracteres alfabéticos para suas respectivas formas em maiúsculo.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "tudo em minúsculo"\n' +
            'escreva(t.maiusculo()) // "TUDO EM MINÚSCULO"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.maiusculo()',
    },
    minusculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.toLowerCase()),
        assinaturaFormato: 'texto.minusculo()',
        documentacao:
            '# `texto.minusculo()` \n \n' +
            'Converte todos os caracteres alfabéticos para suas respectivas formas em minúsculo.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "TUDO EM MAIÚSCULO"\n' +
            'escreva(t.minusculo()) // "tudo em maiúsculo"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.minusculo()',
    },
    particao: {
        tipoRetorno: 'tupla',
        argumentos: [
            new InformacaoElementoSintatico(
                'separador',
                'texto',
                true,
                [],
                'O separador usado para partir o texto.'
            ),
        ],
        implementacao: implementacaoParticao,
        assinaturaFormato: 'texto.particao(separador: texto)',
        documentacao:
            '# `texto.particao(separador)` \n \n' +
            'Divide o texto na primeira ocorrência do separador e retorna uma tupla com: ' +
            'o que vem antes, o separador e o que vem depois.',
        exemploCodigo: 'texto.particao(" ")',
    },
    partição: {
        tipoRetorno: 'tupla',
        argumentos: [
            new InformacaoElementoSintatico(
                'separador',
                'texto',
                true,
                [],
                'O separador usado para partir o texto.'
            ),
        ],
        implementacao: implementacaoParticao,
        assinaturaFormato: 'texto.partição(separador: texto)',
        documentacao:
            '# `texto.partição(separador)` \n \n' +
            'Divide o texto na primeira ocorrência do separador e retorna uma tupla com: ' +
            'o que vem antes, o separador e o que vem depois.',
        exemploCodigo: 'texto.partição(" ")',
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
            texto: string,
            elemento: string,
            substituto: string
        ): Promise<string> => Promise.resolve(texto.replace(elemento, substituto)),
        assinaturaFormato: 'texto.substituir(textoASerSubstituido: texto, substituto: texto)',
        documentacao:
            '# `texto.substituir(textoASerSubstituido, substituto)` \n \n' +
            'Substitui a primeira ocorrência no texto do primeiro parâmetro pelo segundo parâmetro.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "Eu gosto de caju"\n' +
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
            texto: string,
            inicio: number,
            fim: number
        ): Promise<string> => Promise.resolve(texto.slice(inicio, fim)),
        assinaturaFormato: 'texto.subtexto(inicio: inteiro, fim: inteiro)',
        documentacao:
            '# `texto.subtexto(inicio, fim)` \n\n' +
            'Extrai uma fatia do texto, dadas posições de início e fim.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "Eu gosto de caju e de graviola"\n' +
            't.subtexto(3, 16) // Resultado será "gosto de caju"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.subtexto(posiçãoInicial, posiçãoFinal)',
    },
    tamanho: {
        tipoRetorno: 'inteiro',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<number> =>
            Promise.resolve(texto.length),
        assinaturaFormato: 'texto.tamanho()',
        documentacao:
            '# `texto.tamanho()` \n\n' +
            'Devolve um número inteiro com o número de caracteres do texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "Um dois três quatro"\n' +
            't.tamanho() // 19\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.tamanho()',
    },
    terminaCom: {
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
            texto: string,
            sufixo: string
        ): Promise<boolean> => Promise.resolve(texto.endsWith(sufixo)),
        assinaturaFormato: 'texto.terminaCom(sufixo: texto)',
        documentacao:
            '# `texto.terminaCom(sufixo)` \n \n' +
            'Verifica se um texto termina com o sufixo especificado e retorna um valor lógico (verdadeiro ou falso).' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar mensagem = "Olá, bem-vindo ao meu mundo."\n' +
            'escreva(mensagem.terminaCom(".")) // verdadeiro\n' +
            'escreva(mensagem.terminaCom("mundo")) // falso\n' +
            'escreva(mensagem.terminaCom("mundo.")) // verdadeiro\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.terminaCom(sufixo)',
    },
    tudoMaiusculo: {
        tipoRetorno: 'lógico',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<boolean> =>
            Promise.resolve(texto === texto.toUpperCase()),
        assinaturaFormato: 'texto.tudoMaiusculo()',
        documentacao:
            '# `texto.tudoMaiusculo()` \n\n' +
            'Devolve verdadeiro se todos os caracteres alfabéticos do texto estão em maiúsculo, e falso em caso contrário.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t1 = "TUDO EM MAIÚSCULO"\n' +
            'var t2 = "Tudo em Maiúsculo"\n' +
            't1.tudoMaiusculo() // verdadeiro\n' +
            't2.tudoMaiusculo() // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.tudoMaiusculo()',
    },
    tudoMinusculo: {
        tipoRetorno: 'lógico',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<boolean> =>
            Promise.resolve(texto === texto.toLowerCase()),
        assinaturaFormato: 'texto.tudoMinusculo()',
        documentacao:
            '# `texto.tudoMinusculo()` \n\n' +
            'Devolve verdadeiro se todos os caracteres alfabéticos do texto estão em minúsculo, e falso em caso contrário.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t1 = "tudo em minúsculo"\n' +
            'var t2 = "Tudo em Minúsculo"\n' +
            't1.tudoMinusculo() // verdadeiro\n' +
            't2.tudoMinusculo() // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.tudoMinusculo()',
    },
    apararInício: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.trimStart()),
        assinaturaFormato: 'texto.apararInício()',
        documentacao:
            '# `texto.apararInício()` \n \n' +
            'Remover espaços em branco no início e no fim de um texto.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "   meu texto com espaços no início e no fim       "\n' +
            'escreva("|" + t.apararInício() + "|") // "|meu texto com espaços no início e no fim       |"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.apararInício()',
    },
    maiúsculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.toUpperCase()),
        assinaturaFormato: 'texto.maiúsculo()',
        documentacao:
            '# `texto.maiúsculo()` \n \n' +
            'Converte todos os caracteres alfabéticos para suas respectivas formas em maiúsculo.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "tudo em minúsculo"\n' +
            'escreva(t.maiúsculo()) // "TUDO EM MINÚSCULO"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.maiúsculo()',
    },
    minúsculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<string> =>
            Promise.resolve(texto.toLowerCase()),
        assinaturaFormato: 'texto.minúsculo()',
        documentacao:
            '# `texto.minúsculo()` \n \n' +
            'Converte todos os caracteres alfabéticos para suas respectivas formas em minúsculo.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t = "TUDO EM MAIÚSCULO"\n' +
            'escreva(t.minúsculo()) // "tudo em maiúsculo"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.minúsculo()',
    },
    tudoMaiúsculo: {
        tipoRetorno: 'lógico',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<boolean> =>
            Promise.resolve(texto === texto.toUpperCase()),
        assinaturaFormato: 'texto.tudoMaiúsculo()',
        documentacao:
            '# `texto.tudoMaiúsculo()` \n\n' +
            'Devolve verdadeiro se todos os caracteres alfabéticos do texto estão em maiúsculo, e falso em caso contrário.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t1 = "TUDO EM MAIÚSCULO"\n' +
            'var t2 = "Tudo em Maiúsculo"\n' +
            't1.tudoMaiúsculo() // verdadeiro\n' +
            't2.tudoMaiúsculo() // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.tudoMaiúsculo()',
    },
    tudoMinúsculo: {
        tipoRetorno: 'lógico',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, texto: string): Promise<boolean> =>
            Promise.resolve(texto === texto.toLowerCase()),
        assinaturaFormato: 'texto.tudoMinúsculo()',
        documentacao:
            '# `texto.tudoMinúsculo()` \n\n' +
            'Devolve verdadeiro se todos os caracteres alfabéticos do texto estão em minúsculo, e falso em caso contrário.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```delegua\nvar t1 = "tudo em minúsculo"\n' +
            'var t2 = "Tudo em Minúsculo"\n' +
            't1.tudoMinúsculo() // verdadeiro\n' +
            't2.tudoMinúsculo() // falso\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.tudoMinúsculo()',
    },
} as { [nome: string]: PrimitivaInterface };
