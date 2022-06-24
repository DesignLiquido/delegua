import * as net from 'net';
import { Declaracao } from '../declaracoes';

import { Delegua } from '../delegua';
import { InterpretadorComDepuracaoInterface } from '../interfaces';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';
import cyrb53 from './cyrb53';

export class ServidorDepuracao {
    instanciaDelegua: Delegua;
    servidor: net.Server;
    conexoes: {[chave: number]: any}
    contadorConexoes: number;

    constructor(_instanciaDelegua: Delegua) {
        this.instanciaDelegua = _instanciaDelegua;
        this.instanciaDelegua.funcaoDeRetorno = this.escreverSaidaParaTodosClientes.bind(this);
        const interpretador = (this.instanciaDelegua.interpretador as InterpretadorComDepuracaoInterface);
        interpretador.funcaoDeRetorno = this.escreverSaidaParaTodosClientes.bind(this);
        // Isso é só um exemplo de definição de ponto de parada para testar
        // `Interpretador.executar()`. 
        // Deve ser removido num futuro próximo.
        /* (this.instanciaDelegua.interpretador as any).pontosParada.push({
            hashArquivo: cyrb53('./testes/exemplos/importacao/importacao-2.egua'),
            linha: 4
        }); */
        (this.instanciaDelegua.interpretador as InterpretadorComDepuracaoInterface).pontosParada.push({
            hashArquivo: cyrb53('./testes/exemplos/index.delegua'),
            linha: 1
        });
        
        this.servidor = net.createServer();
        this.conexoes = {};
        this.contadorConexoes = 0;
        this.operarConexao.bind(this);
    }

    operarConexao = (conexao: net.Socket) => {
        const enderecoRemoto = conexao.remoteAddress + ':' + conexao.remotePort;
        process.stdout.write('\n[Depurador] Nova conexão de cliente de ' + enderecoRemoto + '\ndelegua> ');

        conexao.setEncoding('utf8');
        this.conexoes[this.contadorConexoes++] = conexao;

        const aoReceberDados: any = (dados: Buffer) => {
            const comando: string[] = String(dados).replace(/\r?\n|\r/g, "").split(' ');
            process.stdout.write('\n[Depurador] Dados da conexão vindos de ' + enderecoRemoto + ': ' + comando + '\ndelegua> ');
            const interpretadorInterface = (this.instanciaDelegua.interpretador as InterpretadorComDepuracaoInterface);
            const arquivosAbertos = this.instanciaDelegua.arquivosAbertos;
            const conteudoArquivosAbertos = this.instanciaDelegua.conteudoArquivosAbertos;

            const validarPontoParada = (caminhoArquivo: string, linha: number): any => {
                const hashArquivo = cyrb53(caminhoArquivo);
                if (!arquivosAbertos.hasOwnProperty(hashArquivo)) {
                    conexao.write(`[adicionar-ponto-parada]: Arquivo '${caminhoArquivo}' não encontrado\n`);
                    return { sucesso: false };
                }

                if (conteudoArquivosAbertos[hashArquivo].length < linha) {
                    conexao.write(`[adicionar-ponto-parada]: Linha ${linha} não existente em arquivo '${caminhoArquivo}'\n`);
                    return { sucesso: false };
                }

                return { sucesso: true, hashArquivo, linha };
            }

            let validacaoPontoParada: any;
            let linhasResposta: string = "";
            switch (comando[0]) {
                case "adentrar-escopo":
                    conexao.write("Recebido comando 'adentrar-escopo'\n");
                    interpretadorInterface.adentrarEscopoAtivo = true;
                    interpretadorInterface.pontoDeParadaAtivo = false;
                    interpretadorInterface.interpretacaoApenasUmaInstrucao();
                    break;
                case "adicionar-ponto-parada":
                    conexao.write("Recebido comando 'adicionar-ponto-parada'\n");
                    if (comando.length < 3) {
                        conexao.write(`[adicionar-ponto-parada]: Formato: adicionar-ponto-parada /caminho/do/arquivo.egua 1\n`);
                        break;
                    }

                    validacaoPontoParada = validarPontoParada(comando[1], parseInt(comando[2]));
                    if (validacaoPontoParada.sucesso) {
                        interpretadorInterface.pontosParada.push({
                            hashArquivo: validacaoPontoParada.hashArquivo,
                            linha: validacaoPontoParada.linha
                        }); 
                    }

                    break;
                case "continuar":
                    conexao.write("Recebido comando 'continuar'\n");
                    interpretadorInterface.pontoDeParadaAtivo = false;
                    interpretadorInterface.continuarInterpretacao();
                    break;
                case "pilha-execucao":
                    linhasResposta += "Recebido comando 'pilha-execucao'\n";
                    const pilhaEscoposExecucao: PilhaEscoposExecucaoInterface = interpretadorInterface.pilhaEscoposExecucao;

                    linhasResposta += '--- pilha-execucao-resposta ---\n';
                    for (let i = 1; i < pilhaEscoposExecucao.pilha.length; i++) {
                        const elementoPilha = pilhaEscoposExecucao.pilha[i];
                        const posicaoDeclaracaoAtual: number = 
                            elementoPilha.declaracaoAtual >= elementoPilha.declaracoes.length ? elementoPilha.declaracoes.length - 1 : elementoPilha.declaracaoAtual;
                        let declaracaoAtual: Declaracao = elementoPilha.declaracoes[posicaoDeclaracaoAtual];

                        linhasResposta += conteudoArquivosAbertos[declaracaoAtual.hashArquivo][declaracaoAtual.linha - 1].trim() + ' --- ' + 
                            this.instanciaDelegua.arquivosAbertos[declaracaoAtual.hashArquivo] + '::' + 
                            declaracaoAtual.linha + '\n';
                        
                    }

                    linhasResposta += '--- fim-pilha-execucao-resposta ---\n';
                    conexao.write(linhasResposta);

                    break;
                case "pontos-parada":
                    linhasResposta += "Recebido comando 'pontos-parada'\n";
                    for (let pontoParada of interpretadorInterface.pontosParada) {
                        linhasResposta += this.instanciaDelegua.arquivosAbertos[pontoParada.hashArquivo] + ": " + 
                            pontoParada.linha + "\n";
                    }

                    conexao.write(linhasResposta);
                    break;
                case "proximo":
                    conexao.write("Recebido comando 'proximo'\n");
                    interpretadorInterface.pontoDeParadaAtivo = false;
                    interpretadorInterface.interpretacaoApenasUmaInstrucao();
                    break;
                case "remover-ponto-parada":
                    linhasResposta += "Recebido comando 'remover-ponto-parada'\n";
                    if (comando.length < 3) {
                        linhasResposta += `[adicionar-ponto-parada]: Formato: adicionar-ponto-parada /caminho/do/arquivo.egua 1\n`;
                        conexao.write(linhasResposta);
                        break;
                    }

                    validacaoPontoParada = validarPontoParada(comando[1], parseInt(comando[2]));
                    if (validacaoPontoParada.sucesso) {
                        interpretadorInterface.pontosParada = interpretadorInterface.pontosParada.filter(
                            (p) =>
                                p.hashArquivo !== validacaoPontoParada.hashArquivo &&
                                p.linha !== validacaoPontoParada.linha
                        );
                    }
                    break;
                case "sair-escopo":
                    conexao.write("Recebido comando 'sair-escopo'\n");
                    interpretadorInterface.pontoDeParadaAtivo = false;
                    interpretadorInterface.proximoESair();
                    break;
                case "tchau":
                    conexao.write("Recebido comando 'tchau'. Conexão será encerrada\n");
                    conexao.destroy();
                    break;
                case "variaveis":
                    linhasResposta += "Recebido comando 'variaveis'. Enviando variáveis do escopo atual\n";
                    const todasVariaveis = interpretadorInterface.pilhaEscoposExecucao.obterTodasVariaveis([]);

                    linhasResposta += '--- variaveis-resposta ---\n';
                    for (let grupoVariavel of todasVariaveis) {
                        for (const [nomeVariavel, valor] of Object.entries(grupoVariavel)) {
                            linhasResposta += nomeVariavel + " :: " + Object.getPrototypeOf(valor).constructor.name + " :: " + valor + '\n';
                        }
                    }

                    linhasResposta += '--- fim-variaveis-resposta ---\n';
                    conexao.write(linhasResposta);
                    break;
            }
        }

        const aoFecharConexao = () => {
            process.stdout.write('\n[Depurador] Conexão de ' + enderecoRemoto + ' fechada\ndelegua> ');  
        }

        const aoObterErro = (erro: Error) => {
            process.stdout.write('\n[Depurador] Conexão ' + enderecoRemoto + ' com erro: ' + erro.message + '\ndelegua> ');  
        }

        // `.bind()` é necessário aqui para que os eventos não usem net.Socket ou net.Server como o `this`, 
        // como acontece normalmente se o `.bind()` não é chamado.
        conexao.on('data', aoReceberDados.bind(this));
        conexao.once('close', aoFecharConexao.bind(this));  
        conexao.on('error', aoObterErro.bind(this));
    }

    iniciarServidorDepuracao(): net.AddressInfo {
        // É necessário mudar o `this` aqui por `.bind()`, senão `this` será net.Server dentro dos métodos.
        this.servidor.on('connection', this.operarConexao.bind(this));

        this.servidor.listen(7777);

        return this.servidor.address() as net.AddressInfo;
    }

    escreverSaidaParaTodosClientes(mensagem: string) {
        Object.keys(this.conexoes).forEach((chave) => {
            this.conexoes[chave].write('Enviando mensagem de saída\n--- mensagem-saida ---\n' + mensagem + '\n');
        });
    }

    finalizarServidorDepuracao(): void {
        Object.keys(this.conexoes).forEach((chave) => {
            this.conexoes[chave].destroy();
        });

        this.servidor.close();
    }
}