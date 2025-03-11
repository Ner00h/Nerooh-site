# Nerooh Site

Interface web para controle de impressora 3D com funcionalidades de chat, histórico de comandos e gerenciamento de usuários.

## Funcionalidades

- Controle da impressora 3D com botões para movimentação nos eixos X, Y e Z
- Console para envio de comandos G-code
- Chat para comunicação entre usuários
- Histórico de comandos com status de sucesso/erro
- Sistema de autenticação com suporte a e-mail/senha, Google e Facebook
- Edição de perfil com opções de avatar personalizável

## Configuração

### Autenticação

O projeto utiliza Firebase para autenticação e banco de dados. As credenciais já estão configuradas no arquivo `auth.js`.

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build
```

## Deploy no GitHub Pages

Este projeto está configurado para ser facilmente hospedado no GitHub Pages. Siga os passos abaixo:

1. Crie um repositório no GitHub
2. Faça push do código para o repositório:
   ```bash
   git init
   git add .
   git commit -m "Primeiro commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/nerooh-site.git
   git push -u origin main
   ```
3. O GitHub Actions irá automaticamente fazer o build e deploy do site para o GitHub Pages

Após o deploy, seu site estará disponível em: `https://seu-usuario.github.io/nerooh-site/`

## Segurança

As credenciais do Firebase para aplicações web são consideradas "públicas" por natureza, pois são visíveis no código do navegador. No entanto, o Firebase oferece regras de segurança que você pode configurar no console do Firebase para restringir o acesso aos seus dados.

## Tecnologias Utilizadas

- Vite.js
- Firebase (Autenticação, Realtime Database)
- JavaScript Vanilla
- CSS3 