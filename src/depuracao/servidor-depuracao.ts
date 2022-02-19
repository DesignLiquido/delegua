import * as net from 'net';

function operarConexao(conexao: net.Socket) {
    const enderecoRemoto = conexao.remoteAddress + ':' + conexao.remotePort;
    process.stdout.write('\n[Depurador] Nova conexão de cliente de ' + enderecoRemoto + '\ndelegua> ');

    conexao.setEncoding('utf8');

    function aoReceberDados(dados: Buffer) {
        const comando: string = String(dados).replace(/\r?\n|\r/g, "");
        process.stdout.write('\n[Depurador] Dados da conexão vindos de ' + enderecoRemoto + ': ' + comando + '\ndelegua> ');

        switch (comando) {
            case "continuar":
                conexao.write("Recebido comando 'continuar'\n");
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

export function iniciarServidorDepuracao(): net.AddressInfo {
    const servidor: net.Server = net.createServer();
    servidor.on('connection', operarConexao);

    servidor.listen(7777);

    return servidor.address() as net.AddressInfo;
}
