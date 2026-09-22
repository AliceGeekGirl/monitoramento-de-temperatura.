import { createFileRoute } from "@tanstack/react-router";

// ============================================================
// DADOS SIMULADOS
// ------------------------------------------------------------
// Por enquanto o site usa valores fixos para podermos visualizar
// e testar a interface. Quando a conexão com o ESP32 for feita,
// estes valores passarão a vir das leituras reais do DHT11.
// ============================================================
const dados = {
  temperatura: 27.4, // temperatura em °C (viria do DHT11)
  umidade: 58, // umidade relativa em % (viria do DHT11)
  temperaturaDesejada: 25, // temperatura alvo do controle, em °C
  histerese: 1, // tolerância do controle, em °C
  sistemaAtivo: true, // se o sistema está em funcionamento
};

// Limites da faixa de histerese: o controle tenta manter a
// temperatura DENTRO desta faixa (desejada - histerese até
// desejada + histerese).
const limiteInferior = dados.temperaturaDesejada - dados.histerese; // 24 °C
const limiteSuperior = dados.temperaturaDesejada + dados.histerese; // 26 °C

// ============================================================
// LÓGICA DE CONTROLE (SIMULADA)
// ------------------------------------------------------------
// Mesma lógica que o ESP32 usará depois, com histerese:
// - Muito FRIO  (abaixo do limite inferior) -> liga o Heater
// - Muito QUENTE (acima do limite superior) -> liga o Ventilador
// - Dentro da faixa -> tudo desligado
// ============================================================
const heaterLigado = dados.temperatura < limiteInferior;
const ventiladorLigado = dados.temperatura > limiteSuperior;

// ============================================================
// CLASSIFICAÇÃO DA TEMPERATURA (Termômetro Colorido)
// ------------------------------------------------------------
// Cada faixa de temperatura recebe uma cor e um rótulo para
// facilitar a leitura rápida do painel.
// ============================================================
function classificarTemperatura(temp: number) {
  if (temp < 18) {
    return { rotulo: "Frio", classe: "text-temp-frio" };
  }
  if (temp <= 28) {
    return { rotulo: "Agradável", classe: "text-temp-ok" };
  }
  return { rotulo: "Quente", classe: "text-temp-quente" };
}

const classificacao = classificarTemperatura(dados.temperatura);

// Posição do marcador na barra do termômetro (escala de 0 a 40 °C).
const posicaoNaBarra = Math.min(Math.max((dados.temperatura / 40) * 100, 0), 100);

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
function CartaoTemperatura() {
  return (
    <Cartao titulo="Temperatura atual">
      <p className={`mt-2 text-5xl font-bold ${classificacao.classe}`}>
        {dados.temperatura.toFixed(1)}
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
        <div
          className="absolute top-1/2 h-5 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground"
          style={{ left: `${posicaoNaBarra}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>0 °C</span>
        <span>40 °C</span>
      </div>
    </Cartao>
  );
}

// Cartão de umidade atual, com uma barra de progresso simples.
function CartaoUmidade() {
  return (
    <Cartao titulo="Umidade atual">
      <p className="mt-2 text-5xl font-bold text-foreground">
        {dados.umidade}
        <span className="ml-1 text-2xl font-medium">%</span>
      </p>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${dados.umidade}%` }}
        />
      </div>
    </Cartao>
  );
}

// Cartão de estado (ligado/desligado) do Heater e do Ventilador.
function CartaoDispositivo({
  nome,
  ligado,
  corQuandoLigado,
}: {
  nome: string;
  ligado: boolean;
  corQuandoLigado: string;
}) {
  return (
    <Cartao titulo={nome}>
      <div className="mt-2 flex items-center gap-3">
        {/* Bolinha colorida: acesa quando o dispositivo está ligado */}
        <span
          className={`h-4 w-4 rounded-full ${
            ligado ? corQuandoLigado : "bg-muted-foreground/30"
          }`}
        />
        <span
          className={`text-2xl font-semibold ${
            ligado ? corQuandoLigado : "text-muted-foreground"
          }`}
        >
          {ligado ? "Ligado" : "Desligado"}
        </span>
      </div>
    </Cartao>
  );
}

// Cartão com a configuração do controle: temperatura desejada e
// faixa de histerese.
function CartaoControle() {
  return (
    <Cartao titulo="Controle de temperatura">
      <div className="mt-3 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            Temperatura desejada
          </span>
          <span className="text-2xl font-bold text-foreground">
            {dados.temperaturaDesejada} °C
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            Faixa de histerese
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

          {/* Status do sistema: verde quando em funcionamento */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <span
              className={`h-3 w-3 rounded-full ${
                dados.sistemaAtivo ? "bg-temp-ok" : "bg-destructive"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              {dados.sistemaAtivo ? "Sistema em funcionamento" : "Sistema parado"}
            </span>
          </div>
        </header>

        {/* Grade de cartões: 1 coluna no celular, 2 em telas médias,
            3 em telas grandes */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CartaoTemperatura />
          <CartaoUmidade />
          <CartaoControle />
          <CartaoDispositivo
            nome="Heater (aquecedor)"
            ligado={heaterLigado}
            corQuandoLigado="bg-heater text-heater"
          />
          <CartaoDispositivo
            nome="Ventilador"
            ligado={ventiladorLigado}
            corQuandoLigado="bg-ventilador text-ventilador"
          />
        </div>

        {/* Aviso de que os dados ainda são simulados */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Dados simulados para teste da interface. A conexão com o ESP32
          será adicionada em uma próxima etapa.
        </p>
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
