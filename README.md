# Event Stream

## Alunos
|Matrícula | Aluno |
| -- | -- |
| 16/0007739  |  Guilherme Marques Rosa |

## Sobre 

O objetivo do trabalho é desenvolver um Servidor PUB/SUB juntamente com uma biblioteca cliente em *NodeJS*.
O servidor internamente guarda os tópicos como um nó em um grafo e cada *subscriber* é representado como um nó adjacente aos nós dos tópicos em que são inscritos.

### Tipos de nós

Existem dois tipos de nós no grafo:

- Tópicos
- Subscribers

Nós do tipo tópico podem se ligar com nós do tipo tópico e do tipo subscriber.
Nós do tipo subscriber se ligam somente a nós do tipo tópico.

### Possíveis ações

Possíveis ações no sistema:

- Publicar mensagens em tópicos
- Subscrever em um tópico

### Possíveis mensagens

- Operação: Enviar dados pra um tópico (client -> server)
- Operação: Se inscrever em um tópico (client -> server)
- Resultado da operação (server -> client)
- Nova mensagem no tópico (server -> client)

## Screenshots
Video: https://youtu.be/XjQN4tVjezg

## Instalação 
**Linguagem**: Node 21

- Instale as dependências necessárias

```bash
npm install
```

## Uso 
O projeto consiste de dois workspaces, o servidor e um client exemplo. Para executar, abra terminais separados para cada função.

- Em um terminal, primeiro inicie o servidor: `npm run dev -w puppy-server`

O client é dividido em consumer e producer, ambos recebendo como parâmetro o tópico que vão se subscrever ou publicar.
- Em um novo terminal inicie um consumer passando uma lista de tópicos: `npm run dev:consumer -w puppy-client topic1,topic2,topic3`
- Em um novo terminal, inicie um producer passando como argumento o tópico onde será publicado: `npm run dev:producer -w puppy-client topic1`

O producer agora irá produzir mensagens que devem ser roteadas somente para os consumers subscritos no mesmo tópico agora.




