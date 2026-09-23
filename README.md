# Monitoramento de Temperatura.

Crie um site simples para o meu projeto de Monitoramento e Controle de Temperatura com ESP32.

Sou iniciante no Lovable e nunca utilizei a plataforma. Quero começar apenas pelo desenvolvimento da interface do site. Não faça integração com ESP32, sensores, localhost ou banco de dados neste momento. Use dados fictícios para demonstrar o funcionamento da interface.

Contexto do projeto

O projeto utiliza um sensor DHT11 para medir temperatura e umidade. O ESP32 será responsável por receber as leituras e controlar duas saídas:

Heater (aquecedor), acionado por um relé.

Ventilador pequeno, utilizado para resfriar.

O projeto terá uma lógica de controle de temperatura com histerese, mas a integração com o hardware será feita posteriormente.

O que o site deve mostrar

Temperatura atual: mostrar a temperatura em graus Celsius, usando um valor fictício.

Umidade atual: mostrar a umidade em porcentagem.

Indicação visual da temperatura: utilizar uma indicação simples baseada na temperatura, inspirada no projeto Termômetro Colorido.

Estado do Heater: mostrar se está ligado ou desligado.

Estado do Ventilador: mostrar se está ligado ou desligado.

Temperatura desejada: exibir um valor de referência, por exemplo, 25 °C.

Faixa de histerese: mostrar os limites de temperatura utilizados no controle.

Status do sistema: indicar se o sistema está em funcionamento.

Estilo visual

Interface simples, organizada e fácil de entender.

Design de um painel de monitoramento.

Não precisa ser muito bonito ou sofisticado.

Utilizar cartões para apresentar os dados.

Cores intuitivas para temperatura, heater e ventilador.

Layout responsivo para computador.

Evitar animações exageradas e elementos desnecessários.

Importante

Quero que o código seja organizado e fácil de compreender para uma estudante de Engenharia da Computação que está aprendendo desenvolvimento Web.

Crie a primeira versão do site com dados simulados. Não implemente a comunicação com o ESP32 agora. Primeiro quero visualizar e testar a interface.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0cb77b56-8047-4246-b97d-3cb9fd794f56).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
