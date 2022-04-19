import * as net from 'net';

import { Delegua } from '../../src/delegua';

export class ServidorDepuracao {
    instanciaDelegua: Delegua;

    constructor(_instanciaDelegua: Delegua) {
        this.instanciaDelegua = _instanciaDelegua;
        this.operarConexao.bind(this);
    }

    operarConexao = (conexao: net.Socket) => {
        const enderecoRemoto = conexao.remoteAddress + ':' + conexao.remotePort;
        process.stdout.write('\n[Depurador] Nova conexão de cliente de ' + enderecoRemoto + '\ndelegua> ');

        conexao.setEncoding('utf8');

        const aoReceberDados: any = (dados: Buffer) => {
            const comando: string = String(dados).replace(/\r?\n|\r/g, "");
            process.stdout.write('\n[Depurador] Dados da conexão vindos de ' + enderecoRemoto + ': ' + comando + '\ndelegua> ');

            switch (comando) {
                case "adentrar-escopo":
                    conexao.write("Recebido comando 'adentrar-escopo'\n");
                    break;
                case "continuar":
                    conexao.write("Recebido comando 'continuar'\n");
                    break;
                case "pilha-execucao":
                    conexao.write("Recebido comando 'pilha-execucao'\n");
                    break;
                case "proximo":
                    conexao.write("Recebido comando 'proximo'\n");
                    break;
                case "sair-escopo":
                    conexao.write("Recebido comando 'sair-escopo'\n");
                    break;
                case "tchau":
                    conexao.write("Recebido comando 'tchau'. Conexão será encerrada\n");
                    conexao.destroy();
                    break;
                case "variaveis":
                    conexao.write("Recebido comando 'variaveis'. Enviando variáveis do escopo atual\n");
                    conexao.write(JSON.stringify(this.instanciaDelegua.interpretador.ambiente.obterTodasVariaveis()) + '\n');
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
        const servidor: net.Server = net.createServer();
        // É necessário mudar o `this` aqui por `.bind()`, senão `this` será net.Server dentro dos métodos.
        servidor.on('connection', this.operarConexao.bind(this));

        servidor.listen(7777);

        return servidor.address() as net.AddressInfo;
    }
}