import { InterpretadorInterface } from '../../../interfaces';
import { PrimitivaInterface } from '../../../interfaces/primitiva-interface';
import { InformacaoElementoSintatico } from '../../../informacao-elemento-sintatico';
import { implementacaoParticao } from '../../primitivas-texto';
import { ErroEmTempoDeExecucao } from '../../../excecoes';

const particao_comum = (nome: string) => {
    return {
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
        assinaturaFormato: `texto.${nome}(separador: texto)`,
        documentacao:
            `# texto.${nome}(separador) \n \n` +
            'Divide o texto na primeira ocorrência do separador e retorna uma tupla com: ' +
            'o que vem antes, o separador e o que vem depois.',
        exemploCodigo: `texto.${nome}(" ")`,
    };
};

export default {
    aparar: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
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
    capitalizar: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string
        ): Promise<string> => {
            if (!texto) return Promise.resolve(texto);

            return Promise.resolve(
                texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
            );
        },
        assinaturaFormato: 'texto.capitalizar()',
        documentacao:
            '# `texto.capitalizar()` \n \n' +
            'Transforma a primeira letra do texto em maiúscula e o restante em minúscula.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nt = "oLa mUnDo"\n' +
            'escreva(t.capitalizar()) // "Ola mundo"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.capitalizar()',
    },
    comeca_com: {
        tipoRetorno: 'lógico',
        argumentos: [
            new InformacaoElementoSintatico(
                'prefixo',
                'texto',
                true,
                [],
                'O prefixo a ser verificado no início do texto.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            prefixo: string
        ): Promise<boolean> => Promise.resolve(texto.startsWith(prefixo)),
        assinaturaFormato: 'texto.comeca_com(prefixo: texto)',
        documentacao: '# `texto.comeca_com(prefixo)` \n \n Verifica se um texto começa com o prefixo especificado.',
        exemploCodigo: 'texto.comeca_com(prefixo)',
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
                'inteiro',
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
                'inteiro',
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
                'inteiro',
                false,
                [],
                '(Opcional) Índice inicial para começar a busca de trás para frente.'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            subtexto: string,
            indiceInicio?: number
        ): Promise<number> => {
            if (indiceInicio !== undefined) {
                if (indiceInicio < 0) indiceInicio = 0;
                if (indiceInicio > texto.length) indiceInicio = texto.length;

                return Promise.resolve(
                    texto.lastIndexOf(subtexto, indiceInicio)
                );
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
                'inteiro',
                true,
                [],
                'A posição inicial da fatia.'
            ),
            new InformacaoElementoSintatico(
                'fim',
                'inteiro',
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
            '\n\n```pitugues\nt = "Um dois três quatro"\n' +
            't.fatiar(2, 7) // "dois"\n' +
            't.fatiar(8, 12) // "três"\n' +
            't.fatiar(8) // "três quatro", ou seja, seleciona tudo da posição 8 até o final do texto.\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: 'texto.fatiar(início, final)\n' + 'texto.fatiar(aPartirDaPosicao)',
    },
    formatar: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'elementos',
                'qualquer',
                true,
                [],
                'Os elementos a serem formatados.'
            ),
        ],
        implementacao: async (
            interpretador: InterpretadorInterface,
            mascara: string,
            ...argumentos: any[]
        ): Promise<string> => {
            const extrairElementos = (args: any[]): any[] => {
                if (args.length !== 1) return args;

                const primeiro = args[0];

                if (Array.isArray(primeiro)) return primeiro;

                if (primeiro?.elementos) return primeiro.elementos;

                if (primeiro?.valores) return primeiro.valores;

                return args;
            };

            const aplicarAlinhamento = (texto: string, configuracao: string): string => {
                const match = configuracao.match(/^(.*?)([<>^])(\d+)$/);
                if (!match) return texto;

                const preenchimento = match[1] || ' ';
                const alinhamento = match[2];
                const largura = parseInt(match[3], 10);

                if (texto.length >= largura) return texto;

                switch (alinhamento) {
                    case '<':
                        return texto.padEnd(largura, preenchimento);
                    case '>':
                        return texto.padStart(largura, preenchimento);
                    case '^': {
                        const total = largura - texto.length;
                        const esquerda = Math.floor(total / 2);
                        const direita = total - esquerda;

                        return (
                            preenchimento.repeat(esquerda) + texto + preenchimento.repeat(direita)
                        );
                    }
                    default:
                        return texto;
                }
            };

            const processarConfiguracaoNumerica = (valor: any, configuracao: string): string => {
                const formatadoresNumericos = ['f', '%', 'x', 'X', 'b'];
                const ehNumerico =
                    formatadoresNumericos.some((f) => configuracao.includes(f)) ||
                    /^0\d+$/.test(configuracao);

                if (ehNumerico && typeof valor !== 'number') {
                    const tipoExibido = typeof valor === 'string' ? 'texto' : typeof valor;

                    throw new ErroEmTempoDeExecucao(
                        null,
                        `Erro: Código de formato desconhecido para objeto do tipo '${tipoExibido}'.`,
                        interpretador.linhaDeclaracaoAtual
                    );
                }

                if (typeof valor !== 'number') return String(valor);

                // Bases
                if (configuracao === 'x') return Math.trunc(valor).toString(16);

                if (configuracao === 'X') return Math.trunc(valor).toString(16).toUpperCase();

                if (configuracao === 'b') return Math.trunc(valor).toString(2);

                // Zero padding (ex: 05)
                const matchZero = configuracao.match(/^0(\d+)$/);
                if (matchZero) {
                    const largura = parseInt(matchZero[1], 10);
                    const negativo = valor < 0;
                    const strAbs = Math.abs(valor)
                        .toString()
                        .padStart(negativo ? largura - 1 : largura, '0');

                    return negativo ? `-${strAbs}` : strAbs;
                }

                // Casas decimais / percentual (ex: .2f, .1%)
                const matchCasas = configuracao.match(/\.(\d+)([f%])/);
                if (matchCasas) {
                    const casas = parseInt(matchCasas[1], 10);
                    const tipo = matchCasas[2];

                    let numero = tipo === '%' ? valor * 100 : valor;
                    let formatado = numero.toFixed(casas);

                    if (configuracao.includes(',')) {
                        const [inteiro, decimal] = formatado.split('.');
                        formatado =
                            inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
                            (decimal ? '.' + decimal : '');
                    }

                    return tipo === '%' ? `${formatado}%` : formatado;
                }

                // Padrão: duas casas decimais
                return valor.toFixed(2);
            };

            const ehMascaraDepuracao = (miolo: string): boolean => {
                return miolo.endsWith('=') && !/^(?:[!=<>]=|[<>])$/.test(miolo.slice(-2));
            };

            const elementos = extrairElementos(argumentos);
            let indice = 0;

            return mascara.replace(/\{([^}]*)\}/g, (matchLiteral, miolo) => {
                if (indice >= elementos.length) return matchLiteral;

                const valor = interpretador.resolverValor(elementos[indice]);
                const mioloLimpo = miolo.trimEnd();

                let resultado: string;

                if (mioloLimpo.startsWith(':')) {
                    const configuracao = mioloLimpo.substring(1);
                    const ehAlinhamento = /^(.*?)([<>^])(\d+)$/.test(configuracao);

                    resultado = ehAlinhamento
                        ? aplicarAlinhamento(String(valor), configuracao)
                        : processarConfiguracaoNumerica(valor, configuracao);
                } else if (ehMascaraDepuracao(mioloLimpo)) {
                    const representacao = typeof valor === 'string' ? `'${valor}'` : String(valor);

                    resultado = miolo + representacao;
                } else {
                    resultado = String(valor);
                }

                indice++;

                return resultado;
            });
        },
        assinaturaFormato: 'texto.formatar(...elementos: qualquer)',
        documentacao:
            '# `texto.formatar(...valores)` \n\n Formata valores com base na máscara de texto.',
        exemploCodigo: '"{:.2f}".formatar(1.2345)',
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
    maiusculo: {
        tipoRetorno: 'texto',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
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
    particao: particao_comum('particao'),
    partição: particao_comum('partição'),
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
            new InformacaoElementoSintatico(
                'substituto',
                'texto',
                true,
                [],
                'A substituição'
            ),
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
            '\n\n```pitugues\nt = "Eu gosto de caju"\n' +
            't.substituir("caju", "graviola") // Resultado será "Eu gosto de graviola"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: "texto.substituir('palavra a ser substituída','nova palavra')",
    },
    substituir_tudo: {
        tipoRetorno: 'texto',
        argumentos: [
            new InformacaoElementoSintatico(
                'textoASerSubstituido',
                'texto',
                true,
                [],
                'Texto a ser substituído.'
            ),
            new InformacaoElementoSintatico(
                'substituto',
                'texto',
                true,
                [],
                'A substituição'
            ),
        ],
        implementacao: (
            interpretador: InterpretadorInterface,
            texto: string,
            elemento: string,
            substituto: string
        ): Promise<string> => Promise.resolve(texto.split(elemento).join(substituto)),
        assinaturaFormato: 'texto.substituir_tudo(textoASerSubstituido: texto, substituto: texto)',
        documentacao:
            '# `texto.substituir_tudo(textoASerSubstituido, substituto)` \n \n' +
            'Substitui TODAS as ocorrências no texto do primeiro parâmetro pelo segundo parâmetro.' +
            '\n\n ## Exemplo de Código\n' +
            '\n\n```pitugues\nt = "O rato roeu a roupa do rei de roma"\n' +
            't.substituir_tudo("r", "p") // Resultado será "O pato poeu a poupa do pei de poma"\n```' +
            '\n\n ### Formas de uso \n',
        exemploCodigo: "texto.substituir_tudo('palavra a ser substituída','nova palavra')",
    },
    tamanho: {
        tipoRetorno: 'inteiro',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
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
            texto: string
        ): Promise<boolean> => Promise.resolve(texto === texto.toUpperCase() && texto !== texto.toLowerCase()),
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
            texto: string
        ): Promise<boolean> => Promise.resolve(texto === texto.toLowerCase() && texto !== texto.toUpperCase()),
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
