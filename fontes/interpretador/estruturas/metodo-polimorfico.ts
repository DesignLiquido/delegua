import { InterpretadorInterface } from '../../interfaces';
import { inferirTipoVariavel } from '../../inferenciador';
import { ErroEmTempoDeExecucao } from '../../excecoes';
import { ArgumentoInterface } from '../argumento-interface';
import { Chamavel } from './chamavel';
import { DeleguaFuncao } from './delegua-funcao';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';

const tiposNumericos = ['inteiro', 'número', 'real', 'longo'];

const mapaDeNormalizacao: { [chave: string]: string } = {
    numero: 'número',
    logico: 'lógico',
    funcao: 'função',
    dicionario: 'dicionário',
    modulo: 'módulo',
};

function normalizarTipo(tipo: string | undefined): string {
    if (!tipo || tipo === 'qualquer') return 'qualquer';
    const tipoMinusculo = tipo.toLowerCase();
    return mapaDeNormalizacao[tipoMinusculo] || tipoMinusculo;
}

function tiposCompativeisParaDespacho(tipoParametro: string, tipoArgumento: string): number {
    const paramNorm = normalizarTipo(tipoParametro);
    const argNorm = normalizarTipo(tipoArgumento);

    if (paramNorm === 'qualquer') return 1;
    if (paramNorm === argNorm) return 3;
    if (tiposNumericos.includes(paramNorm) && tiposNumericos.includes(argNorm)) return 2;

    return -1;
}

/**
 * Proxy que encapsula múltiplas sobrecargas de um mesmo método,
 * resolvendo qual sobrecarga chamar em tempo de execução com base
 * nos tipos dos argumentos fornecidos.
 */
export class MetodoPolimorfico extends Chamavel {
    nome: string;
    sobrecargas: DeleguaFuncao[];
    instancia: ObjetoDeleguaClasse;

    constructor(nome: string, sobrecargas: DeleguaFuncao[], instancia?: ObjetoDeleguaClasse) {
        super();
        this.nome = nome;
        this.sobrecargas = sobrecargas;
        this.instancia = instancia;
    }

    aridade(): number {
        let maxAridade = 0;
        for (const sobrecarga of this.sobrecargas) {
            const a = sobrecarga.aridade();
            if (a > maxAridade) maxAridade = a;
        }
        return maxAridade;
    }

    private contarParametrosObrigatorios(sobrecarga: DeleguaFuncao): number {
        const parametros = sobrecarga.declaracao?.parametros || [];
        let obrigatorios = 0;
        for (const p of parametros) {
            if (p.abrangencia === 'multiplo') break;
            if (p.valorPadrao === undefined) {
                obrigatorios++;
            }
        }
        return obrigatorios;
    }

    private temParametroEspalhado(sobrecarga: DeleguaFuncao): boolean {
        const parametros = sobrecarga.declaracao?.parametros || [];
        return parametros.some((p) => p.abrangencia === 'multiplo');
    }

    resolverSobrecarga(argumentos: ArgumentoInterface[]): DeleguaFuncao {
        const numArgs = argumentos.length;
        let melhorPontuacao = -1;
        let melhorSobrecarga: DeleguaFuncao = null;

        for (const sobrecarga of this.sobrecargas) {
            const parametros = sobrecarga.declaracao?.parametros || [];
            const aridade = sobrecarga.aridade();
            const minParams = this.contarParametrosObrigatorios(sobrecarga);
            const temEspalhado = this.temParametroEspalhado(sobrecarga);

            // Verificar se a quantidade de argumentos é compatível
            if (temEspalhado) {
                if (numArgs < minParams) continue;
            } else {
                if (numArgs < minParams || numArgs > aridade) continue;
            }

            let pontuacao = 0;
            let compativel = true;

            for (let i = 0; i < numArgs && i < parametros.length; i++) {
                const parametro = parametros[i];
                if (parametro.abrangencia === 'multiplo') {
                    // Parâmetros espalhados aceitam qualquer coisa
                    pontuacao += 1;
                    break;
                }

                let valorArgumento =
                    argumentos[i] && argumentos[i].hasOwnProperty('valor')
                        ? argumentos[i].valor
                        : argumentos[i];
                // Se o valor é uma VariavelInterface, extrair o valor real
                if (
                    valorArgumento &&
                    typeof valorArgumento === 'object' &&
                    valorArgumento.hasOwnProperty('valor') &&
                    valorArgumento.hasOwnProperty('tipo')
                ) {
                    valorArgumento = valorArgumento.valor;
                }
                const tipoArgumento = inferirTipoVariavel(valorArgumento) as string;
                const resultado = tiposCompativeisParaDespacho(parametro.tipoDado, tipoArgumento);

                if (resultado < 0) {
                    compativel = false;
                    break;
                }
                pontuacao += resultado;
            }

            if (!compativel) continue;

            if (pontuacao > melhorPontuacao) {
                melhorPontuacao = pontuacao;
                melhorSobrecarga = sobrecarga;
            }
        }

        if (!melhorSobrecarga) {
            const tiposArgs = argumentos.map((a) => {
                let val = a && a.hasOwnProperty('valor') ? a.valor : a;
                if (
                    val &&
                    typeof val === 'object' &&
                    val.hasOwnProperty('valor') &&
                    val.hasOwnProperty('tipo')
                ) {
                    val = val.valor;
                }
                return normalizarTipo(inferirTipoVariavel(val) as string);
            });

            const assinaturas = this.sobrecargas.map((s) => {
                const params = s.declaracao?.parametros || [];
                const tipos = params.map((p) => p.tipoDado || 'qualquer');
                return `${this.nome}(${tipos.join(', ')})`;
            });

            throw new ErroEmTempoDeExecucao(
                null,
                `Nenhuma sobrecarga do método "${this.nome}" corresponde aos argumentos fornecidos (${tiposArgs.join(', ')}). ` +
                    `Sobrecargas disponíveis: ${assinaturas.join('; ')}.`
            );
        }

        return melhorSobrecarga;
    }

    async chamar(
        visitante: InterpretadorInterface,
        argumentos: ArgumentoInterface[]
    ): Promise<any> {
        const sobrecarga = this.resolverSobrecarga(argumentos);

        // Completar os argumentos não preenchidos com valores indefinidos
        // para a sobrecarga selecionada.
        const aridadeSobrecarga = sobrecarga.aridade();
        if (argumentos.length < aridadeSobrecarga) {
            const diferenca = aridadeSobrecarga - argumentos.length;
            for (let i = 0; i < diferenca; i++) {
                argumentos.push({ nome: null, valor: null });
            }
        }

        // Vincular a instância se existir
        let funcaoParaChamar = sobrecarga;
        if (this.instancia !== undefined) {
            funcaoParaChamar = sobrecarga.funcaoPorMetodoDeClasse(this.instancia);
        }

        return await funcaoParaChamar.chamar(visitante, argumentos);
    }

    funcaoPorMetodoDeClasse(instancia: ObjetoDeleguaClasse): MetodoPolimorfico {
        const sobrecargasVinculadas = this.sobrecargas.map((s) =>
            s.funcaoPorMetodoDeClasse(instancia)
        );
        return new MetodoPolimorfico(this.nome, sobrecargasVinculadas, instancia);
    }

    paraTexto(): string {
        const assinaturas = this.sobrecargas.map((s) => {
            const params = s.declaracao?.parametros || [];
            const tipos = params.map((p) => `${p.nome.lexema}: ${p.tipoDado || 'qualquer'}`);
            return `${this.nome}(${tipos.join(', ')})`;
        });
        return `<método-polimórfico nome=${this.nome} sobrecargas=[${assinaturas.join('; ')}] />`;
    }

    toString(): string {
        return this.paraTexto();
    }
}
