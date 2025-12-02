## Defesa contra SQL Injection (SQLi)

No projeto não há concatenação manual de strings para montar comandos de banco de dados
dentro dos controllers. Toda interação com o banco é feita por meio do Mongoose, usando 
métodos como `find`, `findOne`, `findById`, `findByIdAndUpdate` e `findByIdAndDelete`, 
sempre passando objetos como parâmetros (por exemplo, `{ email }`).

O Mongoose converte essas operações em queries parametrizadas para o MongoDB, o que 
impede que valores enviados pelo usuário sejam interpretados como comandos de banco. 
Assim, as vulnerabilidades de SQL Injection são mitigadas pela própria forma de acesso 
utilizada (queries parametrizadas via Mongoose).


## Defesa contra Cross-Site Scripting (XSS)

Todas as views EJS do projeto foram revisadas para garantir que dados vindos do usuário 
sejam sempre renderizados com o mecanismo de escape automático do EJS.

Em todas as páginas (`home.ejs`, `me.ejs`, `admin.ejs`, telas de login e registro), 
os valores são exibidos usando apenas a sintaxe:

```ejs
<%= variavel %>
```

O EJS, ao usar <%= %>, aplica o escaping de saída (output escaping), convertendo
caracteres especiais em entidades HTML, o que evita a execução de código JavaScript
injetado pelo usuário (XSS). Nenhuma view utiliza <%- variavel %>, que renderizaria
HTML sem escape e poderia abrir brechas de XSS.

## Defesa contra Força Bruta (Rate Limiting)

Para proteger as rotas de login contra ataques de força bruta, foi utilizado o 
middleware `express-rate-limit`.

Foi configurado um limitador com janela de 1 minuto (`windowMs = 1 * 60 * 1000`) 
permitindo no máximo 5 tentativas de login por IP (`max = 5`). A partir da 6ª tentativa 
dentro do mesmo minuto, o middleware bloqueia novas requisições e retorna a mensagem:

> "Muitas tentativas de login. Tente novamente em 1 minuto."

O limitador foi aplicado nas seguintes rotas POST de autenticação:

- `POST /login-user`
- `POST /login-admin`

Dessa forma, ataques de força bruta tentando adivinhar senhas são mitigados na camada 
de arquitetura, conforme solicitado na Tarefa 2 do trabalho.

## Defesa por Meio de Configurações Arquiteturais (Helmet)

Para aumentar a segurança global da aplicação, foi integrado o pacote `helmet`, que adiciona automaticamente diversos cabeçalhos de segurança HTTP (como `X-XSS-Protection`, `X-Frame-Options`, `Strict-Transport-Security` e outros).  

Essa camada de proteção reduz vulnerabilidades relacionadas a:

- Clickjacking  
- XSS baseado em navegador  
- Exposição indevida de servidor  
- Injeção de conteúdo  
- Uso incorreto de iframes  

O Helmet foi ativado no `server.js`:

```js
import helmet from "helmet";
app.use(helmet());
```

---

## Proteção de Variáveis Sensíveis (.env)

Todas as informações sensíveis, como `SESSION_SECRET`, `MONGO_URL` e `ADMIN_CODE`, foram retiradas do código e movidas para o arquivo `.env`.

Isso garante que:

- credenciais não fiquem expostas no repositório,  
- seja possível trocar senhas ou tokens sem alterar código,  
- ambientes diferentes possam usar configurações distintas com segurança.

Exemplo do `.env`:

```env
MONGO_URL=mongodb://127.0.0.1:27017/dcodemania
PORT=5000
SESSION_SECRET=umsegredobemforte123
ADMIN_CODE=segredo-super-admin-123
```

---

## Defesa contra Cross-Site Request Forgery (CSRF)

Para impedir ataques de falsificação de requisições entre sites (CSRF), foi integrado o middleware `csurf`, que gera um token único para cada sessão. Esse token deve ser enviado obrigatoriamente em todos os formulários POST.

Se o token estiver ausente ou inválido, a requisição é bloqueada automaticamente.

### Configuração no servidor:

```js
import csrf from "csurf";

const csrfProtection = csrf();
app.use(csrfProtection);

res.locals.csrfToken = req.csrfToken();
```

### Inclusão nos formulários:

```html
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

Essa defesa impede que sites externos enviem requisições maliciosas usando a sessão ativa do usuário.

---