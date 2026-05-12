import { SimboloInterface } from '../../interfaces';
import { ErroDeAssertiva } from '../../excecoes/erro-de-assertiva';
import { FuncaoPadrao } from '../../interpretador/estruturas/funcao-padrao';
import { DeleguaModulo } from '../../interpretador/estruturas/modulo';
import { EscopoHooks, ItemColetado, RegistroTestes } from './registro-testes';
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

    async function executarTeste(nome: string, fn: any): Promise<void> {
        const inicio = Date.now();
        const emDeclaracaoTenteAnterior = interpretador.emDeclaracaoTente;
        interpretador.emDeclaracaoTente = true;

        for (const escopo of registro.pilhaEscopos) {
            for (const h of escopo.antesDeCada) {
                await h.chamar(interpretador, [], null);
            }
        }

        try {
            await fn.chamar(interpretador, [], null);
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
            for (const escopo of [...registro.pilhaEscopos].reverse()) {
                for (const h of escopo.depoisDeCada) {
                    await h.chamar(interpretador, [], null);
                }
            }
            interpretador.emDeclaracaoTente = emDeclaracaoTenteAnterior;
        }
    }

    async function executarGrupo(nome: string, fn: any): Promise<void> {
        const suiteAnterior = registro.suiteAtual;
        registro.suiteAtual = suiteAnterior ? `${suiteAnterior} > ${nome}` : nome;

        const escopo: EscopoHooks = {
            antesDeCada: [],
            antesDeTodos: [],
            depoisDeCada: [],
            depoisDeTodos: [],
            itensColetados: [],
            temApenas: false,
        };

        registro.pilhaEscopos.push(escopo);
        const modoColetarAnterior = registro.modoColeta;
        registro.modoColeta = true;
        const emDeclaracaoTenteAnterior = interpretador.emDeclaracaoTente;
        interpretador.emDeclaracaoTente = true;

        try {
            await fn.chamar(interpretador, [], null);

            registro.modoColeta = modoColetarAnterior;

            for (const h of escopo.antesDeTodos) {
                await h.chamar(interpretador, [], null);
            }

            for (const item of escopo.itensColetados) {
                if (escopo.temApenas && !item.apenas) continue;

                if (item.pular) {
                    if (item.tipo === 'teste') {
                        registro.resultados.push({
                            nomeSuite: registro.suiteAtual,
                            nomeTeste: item.nome,
                            status: 'pulado',
                            tempoMs: 0,
                        });
                    }
                    continue;
                }

                if (item.tipo === 'teste') {
                    await executarTeste(item.nome, item.fn);
                } else {
                    await executarGrupo(item.nome, item.fn);
                }
            }

            for (const h of escopo.depoisDeTodos) {
                await h.chamar(interpretador, [], null);
            }
        } finally {
            registro.pilhaEscopos.pop();
            registro.modoColeta = modoColetarAnterior;
            registro.suiteAtual = suiteAnterior;
            interpretador.emDeclaracaoTente = emDeclaracaoTenteAnterior;
        }
    }

    function coletarOuExecutar(
        tipo: 'teste' | 'grupo',
        nome: string,
        fn: any,
        pular: boolean,
        apenas: boolean
    ): Promise<void> {
        if (registro.modoColeta && registro.pilhaEscopos.length > 0) {
            const escopoAtual = registro.pilhaEscopos[registro.pilhaEscopos.length - 1];
            if (apenas) escopoAtual.temApenas = true;
            escopoAtual.itensColetados.push({ tipo, nome, fn, pular, apenas } as ItemColetado);
            return Promise.resolve();
        }

        if (pular) {
            if (tipo === 'teste') {
                registro.resultados.push({
                    nomeSuite: registro.suiteAtual,
                    nomeTeste: nome,
                    status: 'pulado',
                    tempoMs: 0,
                });
            }
            return Promise.resolve();
        }

        return tipo === 'teste' ? executarTeste(nome, fn) : executarGrupo(nome, fn);
    }

    const grupoFn = new FuncaoPadrao(
        2,
        async function (_visitante: any, nomeRaw: any, funcaoRaw: any) {
            const nome: string = interpretador.resolverValor(nomeRaw);
            const fn = interpretador.resolverValor(funcaoRaw);
            return coletarOuExecutar('grupo', nome, fn, false, false);
        }
    );

    (grupoFn as any)['pular'] = new FuncaoPadrao(
        2,
        async function (_visitante: any, nomeRaw: any, funcaoRaw: any) {
            const nome: string = interpretador.resolverValor(nomeRaw);
            const fn = interpretador.resolverValor(funcaoRaw);
            return coletarOuExecutar('grupo', nome, fn, true, false);
        }
    );

    (grupoFn as any)['apenas'] = new FuncaoPadrao(
        2,
        async function (_visitante: any, nomeRaw: any, funcaoRaw: any) {
            const nome: string = interpretador.resolverValor(nomeRaw);
            const fn = interpretador.resolverValor(funcaoRaw);
            return coletarOuExecutar('grupo', nome, fn, false, true);
        }
    );

    modulo.componentes['grupo'] = grupoFn;

    const testeFn = new FuncaoPadrao(
        2,
        async function (_visitante: any, nomeRaw: any, funcaoRaw: any) {
            const nome: string = interpretador.resolverValor(nomeRaw);
            const fn = interpretador.resolverValor(funcaoRaw);
            return coletarOuExecutar('teste', nome, fn, false, false);
        }
    );

    (testeFn as any)['pular'] = new FuncaoPadrao(
        2,
        async function (_visitante: any, nomeRaw: any, funcaoRaw: any) {
            const nome: string = interpretador.resolverValor(nomeRaw);
            const fn = interpretador.resolverValor(funcaoRaw);
            return coletarOuExecutar('teste', nome, fn, true, false);
        }
    );

    (testeFn as any)['apenas'] = new FuncaoPadrao(
        2,
        async function (_visitante: any, nomeRaw: any, funcaoRaw: any) {
            const nome: string = interpretador.resolverValor(nomeRaw);
            const fn = interpretador.resolverValor(funcaoRaw);
            return coletarOuExecutar('teste', nome, fn, false, true);
        }
    );

    modulo.componentes['teste'] = testeFn;

    function registrarHook(campo: 'antesDeCada' | 'antesDeTodos' | 'depoisDeCada' | 'depoisDeTodos') {
        return new FuncaoPadrao(
            1,
            function (_visitante: any, funcaoRaw: any) {
                const fn = interpretador.resolverValor(funcaoRaw);
                if (registro.pilhaEscopos.length > 0) {
                    registro.pilhaEscopos[registro.pilhaEscopos.length - 1][campo].push(fn);
                }
                return Promise.resolve(null);
            }
        );
    }

    modulo.componentes['antesDeCada'] = registrarHook('antesDeCada');
    modulo.componentes['antesDeTodos'] = registrarHook('antesDeTodos');
    modulo.componentes['depoisDeCada'] = registrarHook('depoisDeCada');
    modulo.componentes['depoisDeTodos'] = registrarHook('depoisDeTodos');

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
