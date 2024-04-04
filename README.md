# Proposta do Trabalho

O objetivo do trabalho é desenvolver um Servidor PUB/SUB juntamente com uma biblioteca cliente em *NodeJS*.
O servidor internamente guarda os tópicos como um nó em um grafo e cada *subscriber* é representado como um nó adjacente aos nós dos tópicos em que são inscritos.

## Tipos de nós

Existem dois tipos de nós no grafo:

- Tópicos
- Subscribers

Nós do tipo tópico podem se ligar com nós do tipo tópico e do tipo subscriber.
Nós do tipo subscriber se ligam somente a nós do tipo tópico.

## Possíveis ações

Possíveis ações no sistema:

- Publicar mensagens em tópicos
- Subscrever em um tópico
- Desinscrever em um tópico

## Possíveis mensagens

- Operação: Enviar dados pra um tópico (client -> server)
- Operação: Se inscrever em um tópico (client -> server)
- Operação: Se desinscrever do tópico (client -> server)
- Resultado da operação (server -> client)
- Nova mensagem no tópico (server -> client)

## Formato da mensagem

Operação:

```ts
{
  operation: 'PUBLISH' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'MESSAGE',
  topic: string,
  metadata: Record<string, any>,
  data: Buffer | null
}
```

Resposta de Operação:

```ts
{
  status: 'OK' | 'ERROR' | 'RCVD',
  details?: string
}
```