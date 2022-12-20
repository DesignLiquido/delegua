import * as processoFilho from 'child_process';
import * as caminho from 'path';
import fs from 'fs'

import { ErroEmTempoDeExecucao } from '../excecoes';
import { FuncaoPadrao } from '../estruturas/funcao-padrao';
import { DeleguaModulo } from '../estruturas/modulo';
import { ClassePadrao } from '../estruturas/classe-padrao';

const carregarBibliotecaDelegua = (nome: string) => {
    let dadosDoModulo: any;

    try {
        dadosDoModulo = require(nome);
    } catch (erro: any) {
        // Biblioteca não existe localmente. Tentar importação global
        try {
            dadosDoModulo = importarPacoteDeleguaCompleto(nome);
        } catch (erro2: any) {
            throw new ErroEmTempoDeExecucao(
                null,
                `Biblioteca ${nome} não encontrada para importação.`
            );
        }
    }

    return modularizarBiblioteca(dadosDoModulo, nome);
};

const carregarBiblioteca = async (
    nomeDaBiblioteca: string,
    caminhoDaBiblioteca: any
) => {
    let dadosDoModulo: any;

    try {
        dadosDoModulo = require(caminhoDaBiblioteca);
    } catch (erro: any) {
        try {
            dadosDoModulo = await importarPacoteExternoCompleto(nomeDaBiblioteca);
        } catch (erro2: any) {
            throw new ErroEmTempoDeExecucao(
                null,
                `Biblioteca ${nomeDaBiblioteca} não encontrada para importação. Informações adicionais: ${erro2?.message || "(nenhuma)"}`
            );
        }
    }

    return modularizarBiblioteca(dadosDoModulo, nomeDaBiblioteca);
};

const modularizarBiblioteca = (dadosDoModulo: any, nome: string) => {
    const novoModulo = new DeleguaModulo(nome);

    const chaves = Object.keys(dadosDoModulo);
    for (let i = 0; i < chaves.length; i++) {
        const moduloAtual = dadosDoModulo[chaves[i]];

        if (typeof moduloAtual === 'function') {
            // Por definição, funções tradicionais e classes são identificadas em JavaScript como "functions".
            // A forma de diferenciar é verificando a propriedade `prototype`.
            // Se dentro dessa propriedade temos outras propriedades cujo tipo também seja `function`,
            // podemos dizer que a "function" é uma classe.
            // Caso contrário, é uma função (`FuncaoPadrao`).
            if (
                moduloAtual?.prototype && Object.entries(moduloAtual.prototype).some(
                    (f: [string, any]) => typeof f[1] === 'function'
                )
            ) {
                const classePadrao = new ClassePadrao(chaves[i], moduloAtual);
                for (const [nome, corpoMetodo] of Object.entries(
                    moduloAtual.prototype
                )) {
                    classePadrao.metodos[nome] = corpoMetodo;
                }

                novoModulo.componentes[chaves[i]] = classePadrao;
            } else {
                novoModulo.componentes[chaves[i]] = new FuncaoPadrao(
                    moduloAtual.length,
                    moduloAtual
                );
            }
        } else {
            novoModulo.componentes[chaves[i]] = moduloAtual;
        }
    }

    return novoModulo;
};

const importarPacoteCaminhoBase = async (caminhoRelativo) => {
    let resultado = null;
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const global = processoFilho.spawnSync(npm, ['root', '--location=global']);

    const caminhoAbsoluto = caminho.join(
        (global.output[1]).toString().trim()) + `\\${caminhoRelativo}\\package.json`;

    let arquivoInicio = JSON.parse(fs.readFileSync(caminhoAbsoluto, 'utf-8')).main || 'index.js';

    await import(caminho.join(
        'file:///' +(global.output[1]).toString().trim()) + `\\${caminhoRelativo}\\${arquivoInicio.replace('./', '')}`).then(resposta => {
            resultado = resposta;
        });
    
    return resultado;
}

const importarPacoteDeleguaCompleto = async (nome: string) => {
    return await importarPacoteCaminhoBase(`delegua\\node_modules\\${nome}`);
};

const importarPacoteExternoCompleto = async (nome: string) => {
    return await importarPacoteCaminhoBase(nome);
};

const verificaModulosDelegua = (nome: string): string | boolean => {
    const modulos = {
        estatistica: '@designliquido/delegua-estatistica',
        estatística: '@designliquido/delegua-estatistica',
        fisica: '@designliquido/delegua-fisica',
        física: '@designliquido/delegua-fisica',
        json: '@designliquido/delegua-json',
        matematica: '@designliquido/delegua-matematica',
        matemática: '@designliquido/delegua-matematica',
        tempo: '@designliquido/delegua-tempo',
    };

    if (Object.keys(modulos).includes(nome)) {
        return modulos[nome].toString();
    }

    return false;
};

export default async function (nome: string) {
    const nomeBibliotecaResolvido: string | boolean =
        verificaModulosDelegua(nome);
    return nomeBibliotecaResolvido
        ? carregarBibliotecaDelegua(String(nomeBibliotecaResolvido))
        : await carregarBiblioteca(nome, nome);
}
