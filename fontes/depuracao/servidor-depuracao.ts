import * as net from 'net';
import { Declaracao } from '../declaracoes';

import {
    DeleguaInterface,
    InterpretadorComDepuracaoInterface,
    RetornoExecucaoInterface,
} from '../interfaces';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import cyrb53 from './cyrb53';
import { PontoParada } from './ponto-parada';

export class ServidorDepuracao {
    instanciaDelegua: DeleguaInterface;
    servidor: net.Server;
    conexoes: { [chave: number]: any };
    contadorConexoes: number;
    interpretador: InterpretadorComDepuracaoInterface;

    constructor(_instanciaDelegua: DeleguaInterface) {
        this.instanciaDelegua = _instanciaDelegua;
        this.instanciaDelegua.funcaoDeRetorno =
            this.escreverSaidaParaTodosClientes.bind(this);
        this.interpretador = this.instanciaDelegua
            .interpretador as InterpretadorComDepuracaoInterface;
        this.interpretador.funcaoDeRetorno =
            this.escreverSaidaParaTodosClientes.bind(this);
        // Isso é só um exemplo de definição de ponto de parada para testar
        // `Interpretador.executar()`.
        // Deve ser removido num futuro próximo.
        /* (this.instanciaDelegua.interpretador as InterpretadorComDepuracaoInterface).pontosParada.push({
            hashArquivo: cyrb53("D:\\GitHub\\delegua\\testes\\exemplos\\index.delegua"),
            linha: 1
        }); */

        this.servidor = net.createServer();
        this.conexoes = {};
        this.contadorConexoes = 0;
        this.operarConexao.bind(this);
    }

    validarPontoParada = (
        caminhoArquivo: string,
        linha: number,
        conexao: net.Socket
    ): any => {
        const hashArquivo = cyrb53(caminhoArquivo.toLowerCase());
        if (
            !this.instanciaDelegua.arquivosAbertos.hasOwnProperty(hashArquivo)
        ) {
            conexao.write(
                `[adicionar-ponto-parada]: Arquivo '${caminhoArquivo}' não encontrado\n`
            );
            return { sucesso: false };
        }

        if (
            this.instanciaDelegua.conteudoArquivosAbertos[hashArquivo].length <
            linha
        ) {
            conexao.write(
                `[adicionar-ponto-parada]: Linha ${linha} não existente em arquivo '${caminhoArquivo}'\n`
            );
            return { sucesso: false };
        }

        return { sucesso: true, hashArquivo, linha };
    };

    comandoAdentrarEscopo = (conexao: net.Socket): any => {
        let linhasResposta = '';
        linhasResposta += "Recebido comando 'adentrar-escopo'\n";
        linhasResposta += '--- adentrar-escopo-resposta ---\n';

        this.interpretador.comandoAdentrarEscopo = true;
        this.interpretador.pontoDeParadaAtivo = false;
        this.interpretador.interpretacaoApenasUmaInstrucao();

        conexao.write(linhasResposta);
    };

    comandoAdicionarPontoParada = (
        comando: string[],
        conexao: net.Socket
    ): any => {
        conexao.write("Recebido comando 'adicionar-ponto-parada'\n");
        if (comando.length < 3) {
            conexao.write(
                `[adicionar-ponto-parada]: Formato: adicionar-ponto-parada /caminho/do/arquivo.egua 1\n`
            );
            return;
        }

        const validacaoPontoParada: any = this.validarPontoParada(
            comando[1],
            parseInt(comando[2]),
            conexao
        );
        if (validacaoPontoParada.sucesso) {
            this.interpretador.pontosParada.push({
                hashArquivo: validacaoPontoParada.hashArquivo,
                linha: validacaoPontoParada.linha,
            });
        }
    };

    comandoAvaliar = (comando: string[], conexao: net.Socket): any => {
        let linhasResposta = '';

        comando.shift();
        const expressaoAvaliar = comando.join(' ');
        let retornoInterpretacao: RetornoExecucaoInterface;
        let textoInterpretacao: string[];
        try {
            retornoInterpretacao =
                this.instanciaDelegua.executarUmaLinha(expressaoAvaliar);
            textoInterpretacao = retornoInterpretacao.resultado;
        } catch (erro: any) {
            textoInterpretacao = [String(erro)];
        }

        linhasResposta += "Recebido comando 'avaliar'\n";
        linhasResposta += '--- avaliar-resposta ---\n';
        linhasResposta += textoInterpretacao.join('\n') + '\n';
        linhasResposta += '--- fim-avaliar-resposta ---\n';
        conexao.write(linhasResposta);
    };

    comandoContinuar = (conexao: net.Socket): any => {
        let linhasResposta = '';

        linhasResposta += "Recebido comando 'continuar'\n";
        this.interpretador.pontoDeParadaAtivo = false;
        this.interpretador.continuarInterpretacao();

        linhasResposta += '--- continuar-resposta ---\n';
        conexao.write(linhasResposta);
    };

    comandoPilhaExecucao = (conexao: net.Socket): any => {
        let linhasResposta = '';
        linhasResposta += "Recebido comando 'pilha-execucao'\n";
        const pilhaEscoposExecucao: PilhaEscoposExecucaoInterface =
            this.interpretador.pilhaEscoposExecucao;

        linhasResposta += '--- pilha-execucao-resposta ---\n';
        try {
            for (let i = pilhaEscoposExecucao.pilha.length - 1; i > 0; i--) {
                const elementoPilha = pilhaEscoposExecucao.pilha[i];
                const posicaoDeclaracaoAtual: number =
                    elementoPilha.declaracaoAtual >=
                    elementoPilha.declaracoes.length
                        ? elementoPilha.declaracoes.length - 1
                        : elementoPilha.declaracaoAtual;
                const declaracaoAtual: Declaracao =
                    elementoPilha.declaracoes[posicaoDeclaracaoAtual];

                linhasResposta +=
                    this.instanciaDelegua.conteudoArquivosAbertos[
                        declaracaoAtual.hashArquivo
                    ][declaracaoAtual.linha - 1].trim() +
                    ' --- ' +
                    this.instanciaDelegua.arquivosAbertos[
                        declaracaoAtual.hashArquivo
                    ] +
                    '::' +
                    declaracaoAtual.assinaturaMetodo +
                    '::' +
                    declaracaoAtual.linha +
                    '\n';
            }

            linhasResposta += '--- fim-pilha-execucao-resposta ---\n';
            conexao.write(linhasResposta);
        } catch (erro: any) {
            conexao.write(erro + '\n');
        }
    };

    comandoPontosParada = (conexao: net.Socket): any => {
        let linhasResposta = '';
        linhasResposta += "Recebido comando 'pontos-parada'\n";
        for (const pontoParada of this.interpretador.pontosParada) {
            linhasResposta +=
                this.instanciaDelegua.arquivosAbertos[pontoParada.hashArquivo] +
                ': ' +
                pontoParada.linha +
                '\n';
        }

        conexao.write(linhasResposta);
    };

    comandoProximo = (conexao: net.Socket): any => {
        let linhasResposta = '';
        linhasResposta += "Recebido comando 'proximo'\n";
        linhasResposta += '--- proximo-resposta ---\n';
        this.interpretador.comandoProximo = true;
        this.interpretador.pontoDeParadaAtivo = false;
        this.interpretador.interpretacaoApenasUmaInstrucao();
        this.interpretador.comandoProximo = false;
        conexao.write(linhasResposta);
    };

    comandoRemoverPontoParada = (
        comando: string[],
        conexao: net.Socket
    ): any => {
        let linhasResposta = '';
        linhasResposta += "Recebido comando 'remover-ponto-parada'\n";
        if (comando.length < 3) {
            linhasResposta += `[adicionar-ponto-parada]: Formato: adicionar-ponto-parada /caminho/do/arquivo.egua 1\n`;
            conexao.write(linhasResposta);
            return;
        }

        const validacaoPontoParada: any = this.validarPontoParada(
            comando[1],
            parseInt(comando[2]),
            conexao
        );
        if (validacaoPontoParada.sucesso) {
            this.interpretador.pontosParada =
                this.interpretador.pontosParada.filter(
                    (p: PontoParada) =>
                        p.hashArquivo !== validacaoPontoParada.hashArquivo &&
                        p.linha !== validacaoPontoParada.linha
                );
        }
    };

    comandoSairEscopo = (conexao: net.Socket): any => {
        conexao.write("Recebido comando 'sair-escopo'\n");
        this.interpretador.pontoDeParadaAtivo = false;
        this.interpretador.proximoESair();
    };

    comandoVariaveis = (conexao: net.Socket): any => {
        let linhasResposta = '';
        linhasResposta +=
            "Recebido comando 'variaveis'. Enviando variáveis do escopo atual\n";
        const todasVariaveis =
            this.interpretador.pilhaEscoposExecucao.obterTodasVariaveis([]);

        linhasResposta += '--- variaveis-resposta ---\n';
        for (const grupoVariavel of todasVariaveis) {
            for (const [nomeVariavel, valor] of Object.entries(grupoVariavel)) {
                if (valor) {
                    linhasResposta +=
                        nomeVariavel +
                        ' :: ' +
                        Object.getPrototypeOf(valor).constructor.name +
                        ' :: ' +
                        valor +
                        '\n';
                }
            }
        }

        linhasResposta += '--- fim-variaveis-resposta ---\n';
        conexao.write(linhasResposta);
    };

    /**
     * Função que descreve como conexão com clientes de depuração deve ser operada.
     * @param conexao Instância de conexão, tipo net.Socket.
     */
    operarConexao = (conexao: net.Socket) => {
        const enderecoRemoto = conexao.remoteAddress + ':' + conexao.remotePort;
        process.stdout.write(
            '\n[Depurador] Nova conexão de cliente de ' +
                enderecoRemoto +
                '\ndelegua> '
        );

        conexao.setEncoding('utf8');
        this.conexoes[this.contadorConexoes++] = conexao;

        // Aqui, dados pode ter uma série de comandos, sendo um por linha.
        const aoReceberDados: any = (dados: Buffer) => {
            const comandos: string[] = String(dados).split('\n');
            process.stdout.write(
                '\n[Depurador] Dados da conexão vindos de ' +
                    enderecoRemoto +
                    ': ' +
                    comandos +
                    '\ndelegua> '
            );
            for (const comando of comandos) {
                const partesComando: string[] = comando.split(' ');
                switch (partesComando[0]) {
                    case 'adentrar-escopo':
                        this.comandoAdentrarEscopo(conexao);
                        break;
                    case 'adicionar-ponto-parada':
                        this.comandoAdicionarPontoParada(
                            partesComando,
                            conexao
                        );
                        break;
                    case 'avaliar':
                        this.comandoAvaliar(partesComando, conexao);
                        break;
                    case 'continuar':
                        this.comandoContinuar(conexao);
                        break;
                    case 'pilha-execucao':
                        this.comandoPilhaExecucao(conexao);
                        break;
                    case 'pontos-parada':
                        this.comandoPontosParada(conexao);
                        break;
                    case 'proximo':
                        this.comandoProximo(conexao);
                        break;
                    case 'remover-ponto-parada':
                        this.comandoRemoverPontoParada(partesComando, conexao);
                        break;
                    case 'sair-escopo':
                        this.comandoSairEscopo(conexao);
                        break;
                    case 'tchau':
                        conexao.write(
                            "Recebido comando 'tchau'. Conexão será encerrada\n"
                        );
                        this.finalizarServidorDepuracao();
                        return;
                    case 'variaveis':
                        this.comandoVariaveis(conexao);
                        break;
                }
            }
        };

        const aoFecharConexao = () => {
            process.stdout.write(
                '\n[Depurador] Conexão de ' +
                    enderecoRemoto +
                    ' fechada\ndelegua> '
            );
        };

        const aoObterErro = (erro: Error) => {
            process.stdout.write(
                '\n[Depurador] Conexão ' +
                    enderecoRemoto +
                    ' com erro: ' +
                    erro.message +
                    '\ndelegua> '
            );
        };

        // `.bind()` é necessário aqui para que os eventos não usem net.Socket ou net.Server como o `this`,
        // como acontece normalmente se o `.bind()` não é chamado.
        conexao.on('data', aoReceberDados.bind(this));
        conexao.once('close', aoFecharConexao.bind(this));
        conexao.on('error', aoObterErro.bind(this));
    };

    iniciarServidorDepuracao(): net.AddressInfo {
        // É necessário mudar o `this` aqui por `.bind()`, senão `this` será net.Server dentro dos métodos.
        this.servidor.on('connection', this.operarConexao.bind(this));

        this.servidor.listen(7777);
        process.stdout.write(
            '\n[Depurador] Servidor de depuração iniciado na porta 7777'
        );

        return this.servidor.address() as net.AddressInfo;
    }

    escreverSaidaParaTodosClientes(mensagem: string) {
        Object.keys(this.conexoes).forEach((chave) => {
            this.conexoes[chave].write(
                'Enviando mensagem de saída\n--- mensagem-saida ---\n' +
                    mensagem +
                    '\n'
            );
        });
    }

    finalizarServidorDepuracao(): void {
        Object.keys(this.conexoes).forEach((chave) => {
            this.conexoes[chave].write('--- finalizando ---\n');
            this.conexoes[chave].end();
        });

        this.servidor.close();
    }
}
