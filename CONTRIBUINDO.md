# Contribuindo

Qualquer pessoa pode sugerir melhoramentos para a linguagem ou correções de bugs. Uma recomendação é abrir uma _issue_ no GitHub antes, para colher a opinião da comunidade e evitar rejeições de contribuições. 

Seguimos o padrão do GitHub para modificações. Modificações são feitas por meio de _Pull Requests_, que nos mostram quais partes do código mudaram da versão atual para a proposta de modificação.

Havendo aprovação dos mantenedores do projeto, juntamos a modificação ao código atual (_merge_) e lançamos novas versões de tempos em tempos. 

## Conhecimentos e Recomendações

O ambiente em que executamos é o Node.js que, basicamente, executa código JavaScript. Ou seja, se você tem conhecimento em JavaScript, é um primeiro passo para poder colaborar conosco. Por padrão, o Node.js vem com o NPM instalado, mas não o usamos. Usamos o Yarn, mais moderno e rápido. Você pode instalar o Yarn usando o comando abaixo (já tendo o NPM instalado):

```bash
npm install -g yarn
```

Feito isso, no diretório raiz do projeto, execute:

```bash
yarn
```

Isso deve baixar e instalar os pacotes que Delégua precisa para ser desenvolvida.

Delégua funciona em qualquer sistema operacional que tenha uma versão de Node.js compatível. 

Para os fontes, usamos [TypeScript](https://www.typescriptlang.org/) (versão mais recente). Normalmente desenvolvemos em Visual Studio Code, e, ao abrir o projeto nele, já temos as configurações para depurar (debugar) Delégua. Outros editores podem ser usados, mas não temos arquivos de suporte a todos eles.

Nós usamos testes unitários para testar todos os componentes de Delégua. Nossa biblioteca de testes é a Jest: https://jestjs.io/. Não é preciso escrever testes unitários para contribuir com a linguagem.

### Trabalhando na sua modificação

Recomendamos fazer um _fork_ do projeto (ou seja, uma cópia em separado), modificar essa cópia e abrir uma _Pull Request_ da sua cópia para o repositório oficial. [Este vídeo pode ajudar](https://www.youtube.com/watch?v=l1rwvDvD1og). 

Ao abrir uma _Pull Request_, fazemos alguns testes automatizados para verificar se sua modificação tem ou não problemas. Você pode fazer os mesmos testes no seu ambiente local usando o comando:

```bash
yarn testes
```

Isso testa a modificação com os exemplos de linguagem que temos no repositório. Para testar outros aspectos, use:

```bash
yarn testes-unitarios
```
