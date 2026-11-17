# Configuração e validação

## Conectar o Supabase

1. Crie um projeto Supabase.
2. Execute **todo** o arquivo `supabase/schema.sql` no SQL Editor de um projeto novo. Ele cria tabelas, políticas RLS, perfil automático, funções e publicação das mensagens no Realtime. O script é uma migração inicial; não execute novamente em cima das mesmas tabelas.
3. Copie `.env.example` para `.env` e preencha:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=SUA-CHAVE-PUBLICA-ANON-OU-PUBLISHABLE
```

4. Use apenas a chave **pública**; nunca coloque `service_role` no aplicativo.
5. Reinicie com `npx expo start -c`. Com ambas as variáveis preenchidas, a demonstração é desativada e os serviços usam Supabase.
6. Em Authentication, habilite e-mail/senha e configure Site URL e Redirect URLs para seus endereços de desenvolvimento. Se a confirmação de e-mail estiver ativa, confirme o e-mail e volte à tela de login para entrar.
7. Cadastre duas contas e crie a primeira sala pelo app. Não há salas fictícias no ambiente real.
8. Confirme em Database → Publications que `messages` pertence a `supabase_realtime`.

## Funcionalidades

- Cadastro, login, restauração de sessão e logout.
- Perfil criado por gatilho no cadastro, avatar com iniciais e cor, edição do nome.
- Lista pública de salas para autenticados, busca e filtro Minhas salas.
- Criação atômica de sala e participação; entrar e sair explicitamente.
- Histórico das últimas 100 mensagens, agrupamento de autor e separadores de dias.
- Mensagens ao vivo por Postgres Changes, envio otimista e exclusão da própria mensagem com recuperação em caso de falha.
- Presença por canal Realtime e indicador de digitação efêmero, com expiração e limitação de frequência.
- Estados de carregamento, vazio, erro e nova tentativa; formulários validados e teclado adaptado no iOS.

Toque no ícone de lixeira ou segure uma mensagem própria para apagá-la. Mensagens de outras pessoas não oferecem essa ação.

## Arquitetura

```text
app/                 Rotas e telas (Expo Router)
src/components/      Componentes visuais e cabeçalho compartilhado
src/context/         Sessão e autenticação
src/hooks/           Consultas, mutações, presença e digitação
src/services/        Acesso aos dados; demonstração local isolada
src/lib/             Cliente Supabase, configuração e cache
src/schemas/         Validação dos formulários
src/theme/           Cores, espaços e cantos
src/types/           Tipos do domínio
src/utils/           Mensagens, avatares, erros e diálogos
supabase/schema.sql  Tabelas, RLS, gatilho e funções
supabase/tests/      Integração com Postgres via PGlite
__tests__/           Funções, serviços, mutações e fluxo local
```

O caminho é **tela → hook → serviço → Supabase/armazenamento local**. Os hooks de tempo real gerenciam a abertura e o fechamento dos canais. Telas não consultam o banco diretamente. Não há repositórios genéricos, contêiner de injeção ou classes sem necessidade.

`room_members` protege leitura e envio de mensagens no banco, além da interface. `is_room_member` evita recursão nas políticas. A consulta Minhas salas filtra explicitamente o usuário atual. Uma função expõe apenas a contagem dos membros para quem está fora. `create_room` cria sala e participação na mesma transação.

Os canais de presença e digitação são públicos, como no guia; eles transportam somente nome/id e avisos efêmeros. A proteção RLS das mensagens persistidas é independente. Para uma evolução com salas privadas, configure também autorização dos canais Realtime. O histórico carrega até 100 mensagens; paginação fica para uma próxima etapa.

## Verificar

```bash
npm run typecheck
npm test
npx expo export --platform web
npx expo export --platform android
```

- Jest: funções de avatar, agrupamento, digitação; regressões da participação, duplicação no envio, restauração na falha de exclusão; fluxo completo do armazenamento local.
- PGlite: gatilho, privilégios, políticas RLS, contagem sem exposição dos membros, criação de sala e revogação de acesso ao sair. Executa o mesmo SQL, substituindo apenas a publicação do Supabase, que não existe no Postgres local.
- O PGlite não testa WebSockets reais. Valide o tempo real com duas contas em dois aparelhos após conectar o Supabase.

Validação nesta entrega: **25 testes Jest e 15 testes PGlite passaram**, assim como a checagem de tipos e as exportações para web, Android e iOS. Exportar o pacote JavaScript nativo não gera um APK/IPA e não substitui testar em aparelho. O fluxo local foi conferido no navegador, também na largura de 390 px: criação de sala, envio, persistência ao recarregar e edição do perfil. O Supabase real e a comunicação entre dois aparelhos aguardam sua configuração.

Para servir a exportação web com suporte às rotas:

```bash
npx expo export --platform web
npx expo serve --port 8082
```

## Roteiro de teste com duas contas

1. Entre nas duas contas e abra a mesma sala. Antes de participar, o histórico deve estar bloqueado.
2. Entre na sala em ambas. Confira duas pessoas online.
3. Envie uma mensagem: ela deve aparecer uma vez em cada tela sem atualizar.
4. Digite no outro aparelho. O aviso deve aparecer e sumir após alguns segundos sem novas teclas.
5. Apague sua própria mensagem. Ela deve desaparecer nas duas telas. A outra conta não deve poder apagar por você.
6. Saia da sala. O histórico volta a ficar bloqueado e a presença diminui.
7. Renomeie o perfil e envie outra mensagem. Confira o novo nome.
8. Desative a rede, tente enviar/apagar e confira o erro e a recuperação. Ao reconectar, confira o histórico.
9. Encerre a sessão e entre com outra conta. Os dados da conta anterior não devem aparecer.

## Referências

Implementação baseada nos requisitos do guia ChatRoom fornecido pelo usuário, com adaptações no visual e correções cobertas por testes. A arte de GTA VI usada no cabeçalho foi fornecida como referência pelo usuário; projeto acadêmico não oficial. Para distribuir com identidade própria, substitua `assets/vice-sunset.png`.

Detalhes do transporte e das limitações de DELETE: [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes).
