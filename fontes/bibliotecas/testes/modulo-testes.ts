import { SimboloInterface } from '../../interfaces';
import { ErroDeAssertiva } from '../../excecoes/erro-de-assertiva';
import { FuncaoPadrao } from '../../interpretador/estruturas/funcao-padrao';
import { DeleguaModulo } from '../../interpretador/estruturas/modulo';
import { RegistroTestes } from './registro-testes';
import { construirModuloAfirmar } from './modulo-afirmar';

function simboloAtual(interpretador: any): SimboloInterface {
    return {
        hashArquivo: interpretador.hashArquivoDeclaracaoAtual,
        linha: interpretador.linhaDeclaracaoAtual,
    } as SimboloInterface;
}

export function construirModuloDeTestes(interpretador: any, registro: RegistroTestes): DeleguaModulo {
    const modulo = new DeleguaModulo('testes');

    (modulo.componentes as any)['afirmar'] = construirModuloAfirmar();

    modulo.componentes['grupo'] = new FuncaoPadrao(
        2,
        async function (_visitante: any, nomeRaw: any, funcaoRaw: any) {
            const nome: string = interpretador.resolverValor(nomeRaw);
            const funcao = interpretador.resolverValor(funcaoRaw);
            const suiteAnterior = registro.suiteAtual;
            registro.suiteAtual = suiteAnterior ? `${suiteAnterior} > ${nome}` : nome;
            const emDeclaracaoTenteAnterior = interpretador.emDeclaracaoTente;
            interpretador.emDeclaracaoTente = true;
            try {
                await funcao.chamar(interpretador, [], null);
            } finally {
                registro.suiteAtual = suiteAnterior;
                interpretador.emDeclaracaoTente = emDeclaracaoTenteAnterior;
            }
        }
    );

    modulo.componentes['teste'] = new FuncaoPadrao(
        2,
        async function (_visitante: any, nomeRaw: any, funcaoRaw: any) {
            const nome: string = interpretador.resolverValor(nomeRaw);
            const funcao = interpretador.resolverValor(funcaoRaw);
            const inicio = Date.now();
            const emDeclaracaoTenteAnterior = interpretador.emDeclaracaoTente;
            interpretador.emDeclaracaoTente = true;
            try {
                await funcao.chamar(interpretador, [], null);
                registro.resultados.push({
                    nomeSuite: registro.suiteAtual,
                    nomeTeste: nome,
                    status: 'passou',
                    tempoMs: Date.now() - inicio,
                });
            } catch (e: any) {
                registro.resultados.push({
                    nomeSuite: registro.suiteAtual,
                    nomeTeste: nome,
                    status: 'falhou',
                    mensagemErro: e.mensagem || e.message || String(e),
                    tempoMs: Date.now() - inicio,
                });
            } finally {
                interpretador.emDeclaracaoTente = emDeclaracaoTenteAnterior;
            }
        }
    );

    modulo.componentes['lancarErro'] = new FuncaoPadrao(
        1,
        function (_visitante: any, mensagemRaw: any) {
            const mensagem: string = interpretador.resolverValor(mensagemRaw);
            return Promise.reject(
                new ErroDeAssertiva(simboloAtual(interpretador), String(mensagem))
            );
        }
    );

    return modulo;
}
