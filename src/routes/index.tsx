import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

// ============================================================
// ENDEREÇO DO ESP32
// ------------------------------------------------------------
// O ESP32 disponibiliza as leituras no caminho /dados da rede
// local dele. A interface busca esse endereço periodicamente
// usando a função fetch() do próprio navegador.
// IP real do ESP32 na rede Wi-Fi compartilhada.
// ============================================================
const URL_ESP32 = "http://192.168.62.55/dados";

// Intervalo entre as buscas, em milissegundos (2 segundos).
const INTERVALO_BUSCA_MS = 2000;

// Tempo máximo de espera pela resposta, em milissegundos.
// Se o ESP32 não responder dentro desse prazo, tratamos como
// falha de conexão (evita a interface ficar travada esperando).
const TEMPO_LIMITE_MS = 3000;

// ============================================================
// CONFIGURAÇÃO DO CONTROLE
// ------------------------------------------------------------
// Mesma configuração definida no ESP32: temperatura desejada
// de 23 °C e faixa de controle de 20 a 25 °C.
// A lógica de histerese roda no próprio ESP32 — a interface
// apenas mostra o resultado (estado do aquecedor e do
// ventilador que vêm prontos no JSON).
// ============================================================
const temperaturaDesejada = 23; // temperatura alvo, em °C
const limiteInferior = 20; // limite inferior da faixa, em °C
const limiteSuperior = 25; // limite superior da faixa, em °C

// ============================================================
// FORMATO DO JSON RECEBIDO DO ESP32
// ------------------------------------------------------------
// O ESP32 responde no formato:
// {
//   "temperatura": 27.4,
//   "umidade": 58.0,
//   "aquecedor": false,
//   "ventilador": true
// }
// ============================================================
type DadosESP32 = {
  temperatura: number;
  umidade: number;
  aquecedor: boolean;
  ventilador: boolean;
};

// ============================================================
// CLASSIFICAÇÃO DA TEMPERATURA (Termômetro Colorido)
// ------------------------------------------------------------
// Cada faixa de temperatura recebe uma cor e um rótulo para
// facilitar a leitura rápida do painel:
// - Abaixo de 20 °C -> Frio
// - Acima de 25 °C  -> Quente
// - Entre 20 e 25   -> Agradável
// Quando ainda não há leitura (temperatura nula), mostramos
// "Sem dados" em cor neutra.
// ============================================================
function classificarTemperatura(temp: number | null) {
  if (temp === null) {
    return { rotulo: "Sem dados", classe: "text-muted-foreground" };
  }
  if (temp < limiteInferior) {
    return { rotulo: "Frio", classe: "text-temp-frio" };
  }
  if (temp > limiteSuperior) {
    return { rotulo: "Quente", classe: "text-temp-quente" };
  }
  return { rotulo: "Agradável", classe: "text-temp-ok" };
}

// ============================================================
// COMPONENTE REUTILIZÁVEL: CARTÃO
// ------------------------------------------------------------
// Todos os dados do painel aparecem dentro de um cartão igual
// a este, só mudando o título e o conteúdo.
// ============================================================
function Cartao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {titulo}
      </h2>
      {children}
    </div>
  );
}

// Cartão de temperatura atual, com número grande, cor da faixa
// e uma barra estilo termômetro colorido.
function CartaoTemperatura({ temperatura }: { temperatura: number | null }) {
  const classificacao = classificarTemperatura(temperatura);

  // Posição do marcador na barra do termômetro (escala de 0 a 40 °C).
  // Sem leitura, o marcador não aparece.
  const posicaoNaBarra =
    temperatura === null
      ? 0
      : Math.min(Math.max((temperatura / 40) * 100, 0), 100);

  return (
    <Cartao titulo="Temperatura atual">
      <p className={`mt-2 text-5xl font-bold ${classificacao.classe}`}>
        {temperatura === null ? "--" : temperatura.toFixed(1)}
        <span className="ml-1 text-2xl font-medium">°C</span>
      </p>
      <p className={`mt-1 text-sm font-medium ${classificacao.classe}`}>
        {classificacao.rotulo}
      </p>

      {/* Barra estilo termômetro colorido, com marcador na posição
          da temperatura atual. Escala fixa de 0 a 40 °C. */}
      <div
        className="relative mt-4 h-3 rounded-full"
        style={{ background: "var(--gradient-termometro)" }}
      >
        {temperatura !== null && (
          <div
            className="absolute top-1/2 h-5 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground"
            style={{ left: `${posicaoNaBarra}%` }}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>0 °C</span>
        <span>40 °C</span>
      </div>
    </Cartao>
  );
}

// Cartão de umidade atual, com uma barra de progresso simples.
function CartaoUmidade({ umidade }: { umidade: number | null }) {
  return (
    <Cartao titulo="Umidade atual">
      <p className="mt-2 text-5xl font-bold text-foreground">
        {umidade === null ? "--" : Math.round(umidade)}
        <span className="ml-1 text-2xl font-medium">%</span>
      </p>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: umidade === null ? "0%" : `${Math.min(umidade, 100)}%` }}
        />
      </div>
    </Cartao>
  );
}

// Item individual de dispositivo: bolinha colorida (acesa quando o
// dispositivo está ligado) e texto "Ligado" ou "Desligado".
// Quando ainda não há leitura (ligado = null), mostra "—" neutro.
// Este item não tem cartão próprio — ele fica dentro do cartão
// "Dispositivos", ao lado do outro item.
function ItemDispositivo({
  nome,
  ligado,
  corBolinha,
  corTexto,
}: {
  nome: string;
  ligado: boolean | null;
  corBolinha: string; // classe de FUNDO da bolinha quando ligado
  corTexto: string; // classe de COR DO TEXTO quando ligado
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{nome}</span>
      <div className="flex items-center gap-2">
        <span
          className={`h-4 w-4 rounded-full ${
            ligado === true ? corBolinha : "bg-muted-foreground/30"
          }`}
        />
        <span
          className={`text-xl font-semibold ${
            ligado === true ? corTexto : "text-muted-foreground"
          }`}
        >
          {ligado === null ? "—" : ligado ? "Ligado" : "Desligado"}
        </span>
      </div>
    </div>
  );
}

// Cartão único com o estado dos dois dispositivos, um ao lado do outro.
// Os estados vêm prontos do ESP32 (aquecedor e ventilador no JSON).
function CartaoDispositivos({
  aquecedorLigado,
  ventiladorLigado,
}: {
  aquecedorLigado: boolean | null;
  ventiladorLigado: boolean | null;
}) {
  return (
    <Cartao titulo="Dispositivos">
      {/* Duas colunas iguais: Aquecedor à esquerda, Ventilador à direita */}
      <div className="mt-3 grid grid-cols-2 gap-4">
        <ItemDispositivo
          nome="Aquecedor (Heater)"
          ligado={aquecedorLigado}
          corBolinha="bg-heater"
          corTexto="text-heater"
        />
        <ItemDispositivo
          nome="Ventilador"
          ligado={ventiladorLigado}
          corBolinha="bg-ventilador"
          corTexto="text-ventilador"
        />
      </div>
    </Cartao>
  );
}

// Cartão com a configuração do controle: temperatura desejada e
// faixa de controle.
function CartaoControle() {
  return (
    <Cartao titulo="Controle de temperatura">
      <div className="mt-3 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            Temperatura desejada
          </span>
          <span className="text-2xl font-bold text-foreground">
            {temperaturaDesejada} °C
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            Faixa de controle (histerese)
          </span>
          <span className="text-2xl font-bold text-foreground">
            {limiteInferior} – {limiteSuperior} °C
          </span>
        </div>
      </div>
    </Cartao>
  );
}

// Página principal do painel.
function PainelMonitoramento() {
  // Últimos dados recebidos do ESP32 (null = ainda não recebeu nada).
  const [dados, setDados] = useState<DadosESP32 | null>(null);

  // true quando a última busca ao ESP32 deu certo.
  const [conectado, setConectado] = useState(false);

  // ============================================================
  // BUSCA PERIÓDICA DOS DADOS DO ESP32
  // ------------------------------------------------------------
  // O useEffect agenda a primeira busca imediatamente e repete
  // a cada 2 segundos. Quando a página é fechada, o "return"
  // limpa o agendamento (evita buscas desnecessárias no fundo).
  // Se qualquer passo falhar (ESP32 fora do ar, sem resposta...),
  // apenas marcamos "desconectado" — a interface continua no ar.
  // ============================================================
  useEffect(() => {
    let cancelado = false; // evita atualizar o estado após a página fechar

    async function buscarDados() {
      try {
        // Controlador para abortar a busca se demorar demais.
        const controle = new AbortController();
        const tempoLimite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

        const resposta = await fetch(URL_ESP32, {
          signal: controle.signal,
          cache: "no-store", // sempre busca dados novos
        });

        clearTimeout(tempoLimite);

        if (!resposta.ok) {
          throw new Error(`Resposta inesperada: ${resposta.status}`);
        }

        // Converte o corpo da resposta (texto) em objeto JavaScript.
        const json = await resposta.json();

        if (cancelado) return;

        // Garante que temperatura e umidade sejam números válidos.
        // Se vierem vazios ou inválidos, tratamos como falha de leitura.
        const temperaturaLida = Number(json?.temperatura);
        const umidadeLida = Number(json?.umidade);
        if (Number.isNaN(temperaturaLida) || Number.isNaN(umidadeLida)) {
          throw new Error("Leitura inválida recebida do ESP32");
        }

        setDados({
          temperatura: temperaturaLida,
          umidade: umidadeLida,
          aquecedor: Boolean(json?.aquecedor),
          ventilador: Boolean(json?.ventilador),
        });
        setConectado(true);
      } catch {
        // Falhou a comunicação: marca como desconectado, mas mantém
        // os últimos valores na tela (a interface não quebra).
        if (!cancelado) {
          setConectado(false);
        }
      }
    }

    buscarDados(); // primeira busca, sem esperar os 2 segundos
    const intervalo = setInterval(buscarDados, INTERVALO_BUSCA_MS);

    // Limpeza: para o intervalo quando a página sai da tela.
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, []);

  // Valores para os cartões: null enquanto não chega a primeira leitura.
  const temperatura = dados === null ? null : dados.temperatura;
  const umidade = dados === null ? null : dados.umidade;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Cabeçalho com título e status geral do sistema */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Monitoramento de Temperatura
            </h1>
            <p className="text-sm text-muted-foreground">
              ESP32 + sensor DHT11
            </p>
          </div>

          {/* Status da comunicação: verde quando o ESP32 responde,
              vermelho quando está desconectado */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <span
              className={`h-3 w-3 rounded-full ${
                conectado ? "bg-temp-ok" : "bg-destructive"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              {conectado ? "Sistema em funcionamento" : "ESP32 desconectado"}
            </span>
          </div>
        </header>

        {/* Grade de cartões: 1 coluna no celular, 2 em telas médias,
            3 em telas grandes */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CartaoTemperatura temperatura={temperatura} />
          <CartaoUmidade umidade={umidade} />
          <CartaoControle />
          <CartaoDispositivos
            aquecedorLigado={dados === null ? null : dados.aquecedor}
            ventiladorLigado={dados === null ? null : dados.ventilador}
          />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monitor de Temperatura — ESP32" },
      {
        name: "description",
        content:
          "Painel de monitoramento de temperatura e umidade com ESP32 e sensor DHT11.",
      },
      { property: "og:title", content: "Monitor de Temperatura — ESP32" },
      {
        property: "og:description",
        content:
          "Painel de monitoramento de temperatura e umidade com ESP32 e sensor DHT11.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PainelMonitoramento,
});
