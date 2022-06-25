# Elementos de depuração

O depurador foi pensado inicialmente para funcionar com o VSCode, mas em teoria pode ser escrito para qualquer editor.

A primeira fonte de inspiração foi [um artigo do Vassili Kaplan](https://www.codemag.com/article/1809051/Writing-Your-Own-Debugger-and-Language-Extensions-with-Visual-Studio-Code), em que ele dá um exemplo para um depurador para uma linguagem chamada CSCS. A parte do cliente de depuração é implementada [na extensão dessa linguagem para o VSCode](https://github.com/DesignLiquido/delegua-vscode). Já a parte de abrir o _socket_ é encontrada em outros artigos, específicos para JavaScript, como por exemplo:

- https://zetcode.com/javascript/socket/

Você pode depurar o depurador usando o VSCode. Para isso, você precisa iniciar um dos exemplos usando o _debug_ do VSCode e adicionar manualmente um ponto de parada (_breakpoint_) no fonte em que deseja parar. 

No construtor da classe `ServidorDepuracao` (`fontes\depuracao\servidor-depuracao.ts`), há o seguinte:

```js
constructor(_instanciaDelegua: Delegua) {
    this.instanciaDelegua = _instanciaDelegua;
    // Isso é só um exemplo de definição de ponto de parada para testar
    // `Interpretador.executar()`. 
    // Deve ser removido num futuro próximo.
    /* (this.instanciaDelegua.interpretador as any).pontosParada.push({
        hashArquivo: cyrb53('./testes/exemplos/importacao/importacao-2.egua'),
        linha: 4
    }); */

    ...
}
```

Descomente o bloco a seguir e atualize as referências (nome do arquivo, em que linha deseja parar). 

```js
constructor(_instanciaDelegua: Delegua) {
    this.instanciaDelegua = _instanciaDelegua;
    // Isso é só um exemplo de definição de ponto de parada para testar
    // `Interpretador.executar()`. 
    // Deve ser removido num futuro próximo.
    (this.instanciaDelegua.interpretador as any).pontosParada.push({
        hashArquivo: cyrb53('./testes/exemplos/importacao/importacao-2.egua'),
        linha: 4
    });

    ...
}
```

Se tudo estiver correto, ao executar um dos exemplos pelo debug do VSCode (neste caso, o "Importação (Delégua)"), o código irá executar até o ponto de parada e a seguinte mensagem aparecerá em console:

```
Ponto de parada encontrado.
```

Isso significa que Delégua está aguardando instruções de algum cliente de depuração para continuar. 

Uma forma bastante simples de usar um cliente de depuração é abrindo uma conexão usando o comando `nc` (Netcat), para qualquer sistema operacional:

```
nc localhost 7777
```

Isso abrirá um _socket_ entre o [Netcat](https://pt.wikipedia.org/wiki/Netcat) e a linguagem. 

Para desenvolvimento em Windows, caso o Netcat (`nc`) não esteja disponível, pode-se instalá-lo de duas formas:

- [Cygwin](http://ptcomputador.com/Sistemas/windows/228426.html)
- [Nmap](https://nmap.org/download#windows)

## Testando comandos

Os comandos implementados até então são:

- `adentrar-escopo`: conhecido em inglês como _Step Into_. De um ponto de parada (_breakpoint_), executa a instrução atual se esta não abre um bloco de escopo. Se abre, empilha o bloco e o adentra, parando na primeira instrução deste bloco;
- `adicionar-ponto-parada`: adiciona um ponto de parada (_breakpoint_) em um arquivo específico numa linha específica;
- `continuar`: de um ponto de parada (_breakpoint_), continua executando o código até 1) outro ponto de parada, ou 2) o final do programa;
- `pilha-execucao`: exibe a pilha de execução atual, com todos os escopos executados até o ponto de parada;
- `pontos-parada`: lista todos os pontos de parada;
- `proximo`: executa a instrução atual, parando na próxima instrução;
- `remover-ponto-parada`: Remove um ponto de parada (_breakpoint_) em um arquivo específico numa linha específica, se houver;
- `sair-escopo`: conhecida em inglês como _Step Out_, executa o resto do escopo atual e retorna ao escopo anterior, parando na próxima instrução. Se não houver mais instruções, finaliza a execução do programa;
- `tchau`: fecha a conexão com o servidor de depuração;
- `variáveis`: Mostra todas as variáveis instanciadas na execução atual.

`adicionar-ponto-parada` e `remover-ponto-parada` pedem dois argumentos: o caminho do arquivo fonte e a linha em que se deseja adicionar ou renover ponto de parada. Exemplo:

```
adicionar-ponto-parada ./testes/exemplos/importacao/importacao-2.egua 5
remover-ponto-parada ./testes/exemplos/importacao/importacao-2.egua 5
```

## Resposta dos comandos

Para cada comando, o _socket_ responde da seguinte forma:

### `avaliar`

Se texto após a palavra `avaliar` for sintaticamente correto e executar normalmente, este comando resolve o resultado da execução da seguinte forma:

**Exemplo**: Avaliando `2 + 2`

```
Recebido comando 'avaliar'  
--- avaliar-resposta ---    
4
--- fim-avaliar-resposta ---
```

**Exemplo**: Avaliando `aleatorio()`

```
Recebido comando 'avaliar'
--- avaliar-resposta ---
0.6485481243564946
--- fim-avaliar-resposta ---
```

### `pilha-execucao`

Quando há ponto de parada válido, o resultado é algo como:

```
Recebido comando 'pilha-execucao'
--- pilha-execucao-resposta ---
escreva('testando aspas simples'); --- D:\\GitHub\\delegua\\testes\\exemplos\\index.delegua::1
--- fim-pilha-execucao-resposta ---
```

A primeira linha da resposta é reservada para informações sobre a resposta em si. Neste caso, temos simplesmente `Recebido comando 'pilha-execucao'`.

`--- pilha-execucao-resposta ---` e `--- fim-pilha-execucao-resposta ---` são marcadores que indicam quando a resposta do comando (que é multilinha) começou e terminou, respectivamente.

### `proximo`

Executa uma instrução e devolve para os clientes de depuração o seguinte:

```
Recebido comando 'proximo'
--- proximo-resposta ---
```

### `variáveis`

Ao receber o comando, o depurador devolve o nome, o tipo e o valor da variável quando possível.