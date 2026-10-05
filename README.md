# 🌡️ Painel de Monitoramento e Controle de Temperatura (ESP32)

Este repositório contém a **interface web (Dashboard)** desenvolvida para o projeto de **Monitoramento e Controle de Temperatura com ESP32**. 

> 📌 **Nota de Créditos:** A ideia conceitual e os requisitos do projeto foram fornecidos como parte do escopo proposto para estudo, ficando sob minha responsabilidade o projeto da interface, organização do código web e futuras integrações.

---

## 📋 Sobre o Projeto

O objetivo principal deste projeto é criar uma interface amigável e intuitiva para monitorar variáveis ambientais e visualizar o estado de atuadores em tempo real. 

### Contexto do Sistema Hardware (Físico)
O projeto físico utiliza um **ESP32** conectado a um sensor **DHT11** para monitorar a temperatura e umidade. O sistema conta com uma lógica de **controle de temperatura com histerese**, atuando sobre dois dispositivos:
* 🔴 **Heater (Aquecedor):** Acionado via relé quando a temperatura cai abaixo do limite inferior.
* 🔵 **Ventilador:** Acionado para resfriamento quando a temperatura ultrapassa o limite superior.

---

## 🎨 A Interface Web (Frontend)

Nesta primeira etapa do desenvolvimento, o foco foi **exclusivamente o design e a experiência da interface (UI/UX)**, utilizando dados fictícios/simulados para validar o layout antes da integração com o hardware, sensores ou banco de dados.

### Destaques e Funcionalidades do Dashboard:
* **Leituras Atuais:** Exibição clara de Temperatura (°C) e Umidade (%).
* **Indicação Visual da Temperatura:** Cores dinâmicas e intuitivas baseadas na faixa de temperatura (inspirado no conceito do *Termômetro Colorido*).
* **Estado dos Atuadores:** Status visual em tempo real (Ligado/Desligado) do *Heater* e do *Ventilador*.
* **Parâmetros de Controle:** Exibição da Temperatura Desejada (setpoint) e da Faixa de Histerese configurada.
* **Status do Sistema:** Indicador visual do estado operacional do monitoramento.
* **Layout Responsivo:** Estruturação baseada em cartões (*cards*), organizada para fácil visualização em computadores.

---

## 🛠️ Tecnologias Utilizadas

* **[Lovable](https://lovable.dev/):** Plataforma utilizada para prototipagem rápida e geração inicial da interface web.
* **HTML5 / CSS3 / JavaScript:** Estruturação, estilização e lógica de simulação de dados do frontend.
* **Node.js & npm:** Gerenciamento de dependências e ambiente de execução local.

---

## 🚀 Como Executar o Projeto Localmente

Se você deseja clonar e rodar a interface na sua máquina local, siga os passos abaixo:

### Pré-requisitos
Certifique-se de ter o **Node.js** e o **npm** instalados em seu computador.

### Passo a passo

1. **Clone o repositório:**
   git clone https://github.com/seu-usuario/nome-do-repositorio.git
   cd nome-do-repositorio

2. **Instale as dependências:**
   npm install

3. **Inicie o servidor de desenvolvimento:**
   npm run dev

4. **Acesse no navegador:**
   Abra o endereço indicado no seu terminal (geralmente http://localhost:5173).

---

## 📐 Organização do Código

O código foi construído com foco em legibilidade e facilidade de manutenção para estudantes de **Engenharia da Computação**:
* **Componentes Limpos:** Estrutura modular para separação das responsabilidades visuais.
* **Dados Simulados:** Isolamento dos valores fictícios para facilidade de testes antes do vínculo com o ESP32.
* **Estilização Clara:** Utilização de classes intuitivas para visualização imediata do status de cada elemento.

---

## 💻 Desenvolvimento com Lovable

Este projeto foi gerado e estruturado inicialmente através do Lovable:
* **Desenvolvimento Ágil:** Permitiu a criação rápida da interface focando nos componentes visuais.
* **Sincronização Direta:** Alterações realizadas na plataforma são refletidas diretamente neste repositório.

---

## 📜 Licença

Este projeto é destina-se a fins educacionais e de aprendizado em Engenharia da Computação e desenvolvimento de interfaces.
