import sources from "./fontes.json";
export { sources };
export const claims = {
  access: {
    sources: ["G01", "T01", "T02"],
    text: "NFC e QR Code são dois caminhos para acessar um link.",
  },
  choice: {
    sources: ["G02", "G04"],
    text: "Publicar exige uma escolha do cliente e login em uma Conta do Google.",
  },
  honest: {
    sources: ["G04"],
    text: "Convide opiniões honestas de todos, sem recompensas ou seleção de clientes satisfeitos.",
  },
  local: {
    sources: ["G03"],
    text: "Relevância, distância e destaque influenciam a busca local. Avaliações podem contribuir para o destaque; a placa não garante posição e NFC não é um fator de SEO.",
  },
  compatibility: {
    sources: ["T01", "T02"],
    text: "A leitura NFC depende do aparelho, das configurações e do estado do sistema. Pode haver uma notificação e confirmação antes da abertura.",
  },
};
export const suggestions = [
  "Conte como foi. Com sinceridade.",
  "Sua opinião faz parte da nossa história.",
  "Cada experiência merece ser ouvida.",
];
export const disclaimer =
  "Simulação — premissas ilustrativas. Não representa resultado observado nem garantia.";
export const initialPersonalization = {
  name: "Seu estabelecimento",
  message: suggestions[0],
};
