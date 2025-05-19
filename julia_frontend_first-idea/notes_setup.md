# Setup Vue.js 2 (Ubuntu)

- open terminal 

```bash
sudo apt update
sudo apt install nodejs npm
```

- after this you can check the installation

```bash
node -v
npm -v
```

- newer version of Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash - 
sudo apt-get install -y nodejs
```

- install CLI

```bash
sudo npm install -g @vue/cli
```

- to create a project:

```bash
vue create my-project
```

- install an IDE, example VS Code
- useful extension for Vue.js:

    1. Vetur
    2. Vue VSCode Snippets
    3. ESLint
    4. Prettier

- if you want to start your development server

```bash
npm run serve
```