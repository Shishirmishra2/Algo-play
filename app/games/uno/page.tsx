"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";

type Color = "Red" | "Green" | "Blue" | "Yellow" | "Black";
type Value =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "Skip"
  | "Reverse"
  | "Draw Two"
  | "Wild"
  | "Wild Draw Four";
type Card = { color: Color; value: Value; id: string };

const COLORS: Color[] = ["Red", "Green", "Blue", "Yellow"];
const VALUES: Value[] = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "Skip",
  "Reverse",
  "Draw Two",
];

function generateDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (const color of COLORS) {
    deck.push({ color, value: "0", id: `${id++}` });
    for (const val of VALUES.slice(1)) {
      deck.push({ color, value: val, id: `${id++}` });
      deck.push({ color, value: val, id: `${id++}` });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ color: "Black", value: "Wild", id: `${id++}` });
    deck.push({
      color: "Black",
      value: "Wild Draw Four",
      id: `${id++}`,
    });
  }
  return deck.sort(() => Math.random() - 0.5);
}

const COLOR_STYLES: Record<Color, string> = {
  Red: "bg-red-600 border-red-400",
  Green: "bg-green-600 border-green-400",
  Blue: "bg-blue-600 border-blue-400",
  Yellow: "bg-yellow-500 border-yellow-300",
  Black: "bg-gray-900 border-gray-500",
};

const COLOR_BG: Record<Color, string> = {
  Red: "bg-red-900/20 border-red-500/50",
  Green: "bg-green-900/20 border-green-500/50",
  Blue: "bg-blue-900/20 border-blue-500/50",
  Yellow: "bg-yellow-900/20 border-yellow-500/50",
  Black: "bg-gray-900/20 border-gray-500/50",
};

function canPlay(card: Card, topCard: Card, activeColor: Color): boolean {
  if (card.value === "Wild" || card.value === "Wild Draw Four") return true;
  return card.color === activeColor || card.value === topCard.value;
}

function CardView({
  card,
  small = false,
  onClick,
  disabled = false,
  selected = false,
}: {
  card: Card;
  small?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${
        small ? "w-10 h-14 text-xs" : "w-14 h-20 text-sm"
      } rounded-lg border-2 flex flex-col items-center justify-center font-bold transition-all shrink-0
        ${COLOR_STYLES[card.color]}
        ${selected ? "ring-2 ring-white scale-110" : ""}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-105 cursor-pointer"
        }
        text-white shadow-lg`}
    >
      <span className={small ? "text-xs" : "text-xs leading-tight text-center px-0.5"}>
        {card.value}
      </span>
    </button>
  );
}

export default function UNO() {
  const initGame = () => {
    const deck = generateDeck();
    const playerHand = deck.splice(0, 7);
    const botHand = deck.splice(0, 7);
    let topCard = deck.pop()!;
    while (topCard.color === "Black") {
      deck.unshift(topCard);
      topCard = deck.pop()!;
    }
    return {
      deck,
      playerHand,
      botHand,
      topCard,
      activeColor: topCard.color as Color,
      isPlayerTurn: true,
      gameOver: false,
      winner: "",
    };
  };

  const [state, setState] = useState(initGame);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [colorPicker, setColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);

  const playCard = (card: Card, chosenColor?: Color) => {
    if (!state.isPlayerTurn || state.gameOver) return;
    if (!canPlay(card, state.topCard, state.activeColor)) {
      toast.error("Can't play that card!");
      return;
    }

    let { deck, playerHand, botHand } = state;
    playerHand = playerHand.filter((c) => c.id !== card.id);

    let newActiveColor =
      card.color === "Black" ? chosenColor || "Red" : card.color;
    let skipBot = false;
    let botDraw = 0;

    if (card.value === "Skip" || card.value === "Reverse") skipBot = true;
    if (card.value === "Draw Two") {
      botDraw = 2;
      skipBot = true;
    }
    if (card.value === "Wild Draw Four") {
      botDraw = 4;
      skipBot = true;
    }

    for (let i = 0; i < botDraw; i++) {
      if (!deck.length) deck = generateDeck();
      botHand.push(deck.pop()!);
    }

    if (!playerHand.length) {
      setState((s) => ({
        ...s,
        playerHand,
        botHand,
        deck,
        topCard: card,
        activeColor: newActiveColor,
        gameOver: true,
        winner: "You",
      }));
      toast.success("🎉 You win! UNO!");
      return;
    }

    setState((s) => ({
      ...s,
      playerHand,
      botHand,
      deck,
      topCard: card,
      activeColor: newActiveColor,
      isPlayerTurn: skipBot ? true : false,
    }));
    setSelectedCard(null);

    if (!skipBot)
      setTimeout(
        () =>
          doBotTurn(deck, playerHand, botHand, card, newActiveColor),
        800
      );
  };

  const doBotTurn = (
    deck: Card[],
    playerHand: Card[],
    botHand: Card[],
    topCard: Card,
    activeColor: Color
  ) => {
    setState((prev) => {
      let { deck: d, playerHand: ph, botHand: bh } = prev;
      const playable = bh.filter((c) => canPlay(c, topCard, activeColor));

      if (!playable.length) {
        if (!d.length) d = generateDeck();
        const drawn = d.pop()!;
        bh = [...bh, drawn];
        if (!canPlay(drawn, topCard, activeColor)) {
          return { ...prev, deck: d, botHand: bh, isPlayerTurn: true };
        }
        bh = bh.filter((c) => c.id !== drawn.id);
        const newColor =
          drawn.color === "Black"
            ? COLORS[Math.floor(Math.random() * 4)]
            : drawn.color;
        if (!bh.length)
          return {
            ...prev,
            deck: d,
            botHand: bh,
            topCard: drawn,
            activeColor: newColor,
            gameOver: true,
            winner: "Bot",
          };
        return {
          ...prev,
          deck: d,
          botHand: bh,
          topCard: drawn,
          activeColor: newColor,
          isPlayerTurn: true,
        };
      }

      const card = playable[Math.floor(Math.random() * playable.length)];
      bh = bh.filter((c) => c.id !== card.id);
      const newColor =
        card.color === "Black"
          ? COLORS[Math.floor(Math.random() * 4)]
          : card.color;

      let skipPlayer =
        card.value === "Skip" ||
        card.value === "Reverse" ||
        card.value === "Draw Two" ||
        card.value === "Wild Draw Four";
      let playerDraw =
        card.value === "Draw Two"
          ? 2
          : card.value === "Wild Draw Four"
          ? 4
          : 0;
      for (let i = 0; i < playerDraw; i++) {
        if (!d.length) d = generateDeck();
        ph = [...ph, d.pop()!];
      }

      if (!bh.length) {
        toast.error("Bot wins! 🤖");
        return {
          ...prev,
          deck: d,
          playerHand: ph,
          botHand: bh,
          topCard: card,
          activeColor: newColor,
          gameOver: true,
          winner: "Bot",
        };
      }

      if (bh.length === 1) toast.error("Bot says UNO! 😱");

      return {
        ...prev,
        deck: d,
        playerHand: ph,
        botHand: bh,
        topCard: card,
        activeColor: newColor,
        isPlayerTurn: !skipPlayer,
      };
    });
  };

  const handleCardClick = (card: Card) => {
    if (!state.isPlayerTurn || state.gameOver) return;
    if (!canPlay(card, state.topCard, state.activeColor)) {
      toast.error("Can't play that card!");
      return;
    }
    if (card.color === "Black") {
      setPendingWildCard(card);
      setColorPicker(true);
    } else {
      playCard(card);
    }
  };

  const handleColorChoice = (color: Color) => {
    if (!pendingWildCard) return;
    setColorPicker(false);
    playCard(pendingWildCard, color);
    setPendingWildCard(null);
  };

  const drawCard = () => {
    if (!state.isPlayerTurn || state.gameOver) return;
    let { deck, playerHand } = state;
    if (!deck.length) deck = generateDeck();
    const drawn = deck.pop()!;
    playerHand = [...playerHand, drawn];
    toast(`Drew: ${drawn.color} ${drawn.value}`);
    if (canPlay(drawn, state.topCard, state.activeColor)) {
      setState((s) => ({ ...s, deck, playerHand }));
    } else {
      setState((s) => ({ ...s, deck, playerHand, isPlayerTurn: false }));
      setTimeout(
        () =>
          doBotTurn(deck, playerHand, state.botHand, state.topCard, state.activeColor),
        800
      );
    }
  };

  return (
    <div className="min-h-screen text-white p-4 pb-24">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/games"
            className="text-white hover:text-purple-300"
          >
            <ArrowLeftIcon size={24} />
          </Link>
          <h1 className="text-2xl font-bold">UNO</h1>
        </div>

        {state.gameOver && (
          <div
            className={`text-center py-4 rounded-xl mb-4 text-xl font-bold ${
              state.winner === "You"
                ? "bg-green-900/40 text-green-400"
                : "bg-red-900/40 text-red-400"
            }`}
          >
            {state.winner === "You" ? "🎉 You Win!" : "🤖 Bot Wins!"}
            <Button
              onClick={() => {
                setState(initGame());
                setSelectedCard(null);
              }}
              className="ml-4 bg-purple-600 hover:bg-purple-700 text-sm"
            >
              Play Again
            </Button>
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">
            Bot ({state.botHand.length} cards)
          </p>
          <div className="flex gap-1 flex-wrap">
            {state.botHand.map((_, i) => (
              <div
                key={i}
                className="w-8 h-12 bg-gray-700 border border-gray-600 rounded-md flex items-center justify-center text-gray-500 text-xs"
              >
                🂠
              </div>
            ))}
          </div>
        </div>

        <div
          className={`border-2 rounded-2xl p-4 mb-4 flex items-center justify-between ${
            COLOR_BG[state.activeColor]
          }`}
        >
          <div className="text-sm text-gray-300">
            <div>
              Active color:{" "}
              <span
                className={`font-bold ${
                  state.activeColor === "Yellow"
                    ? "text-yellow-400"
                    : state.activeColor === "Red"
                    ? "text-red-400"
                    : state.activeColor === "Green"
                    ? "text-green-400"
                    : "text-blue-400"
                }`}
              >
                {state.activeColor}
              </span>
            </div>
            <div className="text-xs mt-1">
              {state.isPlayerTurn ? "Your turn" : "Bot's turn..."}
            </div>
          </div>
          <CardView card={state.topCard} />
          <div className="flex flex-col gap-2">
            <button
              onClick={drawCard}
              disabled={!state.isPlayerTurn || state.gameOver}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 border border-gray-500 rounded-lg p-2 text-xs text-center cursor-pointer"
            >
              Draw
              <br />
              Card
            </button>
          </div>
        </div>

        {colorPicker && (
          <div className="mb-4 p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-center mb-3">Choose a color:</p>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChoice(c)}
                  className={`h-12 rounded-xl border-2 font-bold text-white text-xs ${COLOR_STYLES[c]}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-400 mb-2">
            Your hand ({state.playerHand.length} cards)
          </p>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {state.playerHand.map((card) => (
              <CardView
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
                disabled={
                  !state.isPlayerTurn ||
                  state.gameOver ||
                  !canPlay(card, state.topCard, state.activeColor)
                }
                selected={selectedCard === card.id}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Tap a card to play it. Grayed cards can't be played.
        </p>
      </div>
    </div>
  );
}

