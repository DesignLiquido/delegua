import * as net from 'net';

import { Delegua } from '../delegua';
import { InterpretadorComDepuracaoInterface } from '../interfaces';
import { PilhaEscoposExecucao } from '../interpretador/pilha-escopos-execucao';
import cyrb53 from './cyrb53';

export class ServidorDepuracao {
    instanciaDelegua: Delegua;
    servidor: net.Server;
    conexoes: {[chave: number]: any}
    contadorConexoes: number;

    constructor(_instanciaDelegua: Delegua) {
        this.instanciaDelegua = _instanciaDelegua;
        // Isso é só um exemplo de definição de ponto de parada para testar
        // `Interpretador.executar()`. 
        // Deve ser removido num futuro próximo.
        (this.instanciaDelegua.interpretador as any).pontosParada.push({
            hashArquivo: cyrb53('./testes/exemplos/importacao/importacao-2.egua'),
            linha: 4
        });
        this.servidor = net.createServer();
        this.conexoes = {};
        this.contadorConexoes = 0;
        this.operarConexao.bind(this);
    }

    operarConexao = (conexao: net.Socket) => {
        const enderecoRemoto = conexao.remoteAddress + ':' + conexao.remotePort;
        // process.stdout.write('\n[Depurador] Nova conexão de cliente de ' + enderecoRemoto + '\ndelegua> ');

        conexao.setEncoding('utf8');
        this.conexoes[this.contadorConexoes++] = conexao;

        const aoReceberDados: any = (dados: Buffer) => {
            const comando: string[] = String(dados).replace(/\r?\n|\r/g, "").split(' ');
            // process.stdout.write('\n[Depurador] Dados da conexão vindos de ' + enderecoRemoto + ': ' + comando + '\ndelegua> ');
            const interpretadorInterface = (this.instanciaDelegua.interpretador as InterpretadorComDepuracaoInterface);

            switch (comando[0]) {
                case "adentrar-escopo":
                    conexao.write("Recebido comando 'adentrar-escopo'\n");
                    interpretadorInterface.adentrarEscopoAtivo = true;
                    interpretadorInterface.pontoDeParadaAtivo = false;
                    interpretadorInterface.interpretacaoApenasUmaInstrucao();
                    break;
                case "adicionar-ponto-parada":
                    conexao.write("Recebido comando 'adicionar-ponto-parada'\n");
                    Object.entries(this.instanciaDelegua.arquivosAbertos).forEach(([hashArquivo, caminhoArquivo]) => { 
                        conexao.write(hashArquivo + ': ' + caminhoArquivo + '\n');
                    });  
                    break;
                case "continuar":
                    conexao.write("Recebido comando 'continuar'\n");
                    interpretadorInterface.pontoDeParadaAtivo = false;
                    interpretadorInterface.continuarInterpretacao();
                    break;
                case "pilha-execucao":
                    conexao.write("Recebido comando 'pilha-execucao'\n");
                    const pilhaEscoposExecucao: PilhaEscoposExecucao = (interpretadorInterface as any).pilhaExecucao;
                    /* for (const elementoPilha of pilhaEscoposExecucao) {
                        conexao.write(elementoPilha.identificador + ' - ' + this.instanciaDelegua.arquivosAbertos[elementoPilha.hashArquivo] + ':' + elementoPilha.linha + '\n');
                    } */
                    
                    break;
                case "proximo":
                    conexao.write("Recebido comando 'proximo'\n");
                    (interpretadorInterface as any).pontoDeParadaAtivo = false;
                    interpretadorInterface.interpretacaoApenasUmaInstrucao();
                    break;
                case "remover-ponto-parada":
                    conexao.write("Recebido comando 'remover-ponto-parada'\n");
                    // conexao.write("Declaração atual: " + interpretadorInterface.declaracaoAtual + '\n')
                    // conexao.write("Objeto da declaração atual: " + JSON.stringify((this.instanciaDelegua.interpretador as any).declaracoes[interpretadorInterface.declaracaoAtual]) + '\n')
                    break;
                case "sair-escopo":
                    conexao.write("Recebido comando 'sair-escopo'\n");
                    (interpretadorInterface as any).pontoDeParadaAtivo = false;
                    interpretadorInterface.proximoESair();
                    break;
                case "tchau":
                    conexao.write("Recebido comando 'tchau'. Conexão será encerrada\n");
                    conexao.destroy();
                    break;
                case "variaveis":
                    conexao.write("Recebido comando 'variaveis'. Enviando variáveis do escopo atual\n");
                    conexao.write(JSON.stringify((this.instanciaDelegua.interpretador.pilhaEscoposExecucao as any).obterTodasVariaveis()) + '\n');
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

    finalizarServidorDepuracao(): void {
        Object.keys(this.conexoes).forEach((chave) => {
            this.conexoes[chave].destroy();
        });

        this.servidor.close();
    }
}