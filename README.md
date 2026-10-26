# Sistema Mottainai — Front-end

Aplicação web administrativa feita com React, TypeScript e Vite para demonstrar telas de estoque, produtos, usuários e relatórios.

## Requisitos e comandos

- Node.js e npm instalados.
- `npm ci`: instala as dependências listadas no lockfile.
- `npm run dev`: inicia a aplicação local.
- `npm run build`: gera o build normal de produção.
- `npm run lint`: executa a análise estática do ESLint.
- `npm test`: executa os testes Node e Vitest.

## Estado da integração

O front-end ainda não está conectado a uma API de autenticação ou de dados. O login demonstrativo só é habilitado em desenvolvimento; no build normal de produção, o mock não autentica usuários e sessões mock antigas são descartadas. Os registros em `src/data/` são demonstrações locais, sem persistência nem sincronização com um servidor.

Uma autenticação real requer um serviço de servidor que valide credenciais e gerencie a sessão com cookie `HttpOnly`. O projeto não contém o contrato nem o endereço dessa API, portanto o login de produção permanece desativado até essa integração.

## Acessibilidade

A interface oferece preferências de tema, contraste, tipografia e espaçamento. A opção “Contraste baixo” reduz deliberadamente o contraste conforme a preferência da pessoa usuária e não representa um modo conforme WCAG AA. A verificação de contraste deve usar o tema padrão.

## Auditoria Lighthouse

Execute `npm run lighthouse:ci` para gerar um build local específico de auditoria e percorrer as rotas configuradas em `scripts/lighthouse-routes.cjs`. O script usa uma sessão mock local para alcançar páginas privadas. Esse build de auditoria não deve ser publicado.

Os relatórios HTML e JSON são gravados em `.lighthouseci/reports/`, diretório ignorado pelo Git. Para a auditoria, `LIGHTHOUSE_AUTH_TOKEN` pode fornecer um token de sessão de teste; sem essa variável, o script cria um token local de demonstração.
