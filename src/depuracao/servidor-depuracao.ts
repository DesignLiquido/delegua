import * as net from 'net';

import { Delegua } from '../delegua';

export class ServidorDepuracao {
    instanciaDelegua: Delegua;

    constructor(_instanciaDelegua: Delegua) {
        this.instanciaDelegua = _instanciaDelegua;
    }

    private operarConexao(conexao: net.Socket) {
        const enderecoRemoto = conexao.remoteAddress + ':' + conexao.remotePort;
        process.stdout.write('\n[Depurador] Nova conexão de cliente de ' + enderecoRemoto + '\ndelegua> ');

        conexao.setEncoding('utf8');

        function aoReceberDados(dados: Buffer) {
            const comando: string = String(dados).replace(/\r?\n|\r/g, "");
            process.stdout.write('\n[Depurador] Dados da conexão vindos de ' + enderecoRemoto + ': ' + comando + '\ndelegua> ');

            switch (comando) {
                case "adentrar-escopo":
                    conexao.write("Recebido comando 'adentrar-escopo'\n");
                    break;
                case "continuar":
                    conexao.write("Recebido comando 'continuar'\n");
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
                    conexao.write(String(this.instanciaDelegua) + '\n');
                    break;
            }
        }

        function aoFecharConexao() {
            process.stdout.write('\n[Depurador] Conexão de ' + enderecoRemoto + ' fechada\ndelegua> ');  
        }

        function aoObterErro(erro: Error) {
            process.stdout.write('\n[Depurador] Conexão ' + enderecoRemoto + ' com erro: ' + erro.message + '\ndelegua> ');  
        }

        conexao.on('data', aoReceberDados);  
        conexao.once('close', aoFecharConexao);  
        conexao.on('error', aoObterErro);
    }

    iniciarServidorDepuracao(): net.AddressInfo {
        const servidor: net.Server = net.createServer();
        servidor.on('connection', this.operarConexao);

        servidor.listen(7777);

        return servidor.address() as net.AddressInfo;
    }
}