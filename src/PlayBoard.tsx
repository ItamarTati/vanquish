import { useState, useEffect } from "react";
import Player from "./components/entities/Player";
import Enemy from "./components/entities/Enemy";
import Hand from "./components/Hand";
import DiscardDeck from "./components/DiscardDeck";
import DrawDeck from "./components/DrawDeck";
import EndTurn from "./components/EndTurn";


type CardType = {
  name: string;
  id: number;
  stats: number;
  energy: number;
};

// Ironclad's starter deck - missing Bash.
const initializeDeck = () => {
  const starterDeck = [
    {
      name: "Attack",
      id: 1,
      stats: 8,
      energy: 1,
    },
    {
      name: "Attack",
      id: 2,
      stats: 8,
      energy: 1,
    },
    {
      name: "Attack",
      id: 3,
      stats: 8,
      energy: 1,
    },
    {
      name: "Attack",
      id: 4,
      stats: 8,
      energy: 1,
    },
    {
      name: "Attack",
      id: 5,
      stats: 8,
      energy: 1,
    },
    {
      name: "Defend",
      id: 6,
      stats: 4,
      energy: 1,
    },
    {
      name: "Defend",
      id: 7,
      stats: 4,
      energy: 1,
    },
    {
      name: "Defend",
      id: 8,
      stats: 4,
      energy: 1,
    },
    {
      name: "Defend",
      id: 9,
      stats: 4,
      energy: 1,
    },
  ];

  return shuffle(starterDeck, "starter");
};

const shuffle = (deck: CardType[], name: string) => {
  let currentIndex = deck.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [deck[currentIndex], deck[randomIndex]] = [
      deck[randomIndex],
      deck[currentIndex],
    ];
  }

  return deck;
};


const PlayBoard = () => {
  const [deckCards, setDeckCards] = useState<CardType[]>([]);
  const [handCards, setHandCards] = useState<CardType[]>([]);
  const [discardCards, setDiscardCards] = useState<CardType[]>([]);
  // const [exhaustCards, setExhaustCards] = useState<CardType[]>([]); // todo
  const [turnNumber, setTurnNumber] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [playerHp, setPlayerHp] = useState(50);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [enemyHp, setEnemyHp] = useState(40);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [enemyMoves, setEnemyMoves] = useState([
    10, 20, 2, 10, 2, 20, 10, 15, 20,
  ]);
  const [modalOpen, setModalOpen] = useState(false);


  // initialize the shuffled starter deck and draw hand at start of the first battle
  useEffect(() => {
    const initialDeck = initializeDeck();
    const initialHand = initialDeck.splice(-5);
    setDeckCards(initialDeck);
    setHandCards(initialHand);
  }, []);

  // listen for playerTurn change to begin the enemy's turn
  useEffect(() => {
    if (playerHp <= 0) setModalOpen(true)
    if (playerTurn === false) {
      console.log("starting enemy turn");
      handleEnemyTurn();
    }
  }, [playerTurn]);

  const endTurn = () => {
    if (playerHp <= 0) return console.error("player is dead");
    if (!playerTurn) return console.error("not player turn");
    // clone discard card pile
    const newDiscardCards = [...discardCards];
    // add hand to discard pile
    newDiscardCards.push(...handCards);
    setHandCards([]);
    setDiscardCards(newDiscardCards);
    setPlayerTurn(false);
  };

  const handleEnemyTurn = () => {
    if (playerHp <= 0) return console.error("player is dead");
    if (playerTurn) return console.error("still player turn");

    // pause for a moment
    setTimeout(() => {
      // handle enemy attack,
      const remainingBlock = playerBlock - enemyMoves[turnNumber];
      if (remainingBlock <= 0) {
        setPlayerBlock(0);
        setPlayerHp((playerHp) => playerHp + remainingBlock);
      } else {
        setPlayerBlock(remainingBlock);
      }
      startPlayerTurn();
    }, 750);
  };

  const startPlayerTurn = () => {
    setPlayerEnergy(3);
    setTurnNumber((turnNumber) => turnNumber + 1);
    dealHand();
    console.log("starting player turn");
    setPlayerTurn(true);
  };

  const dealHand = () => {
    const newDeckCards = [...deckCards];
    const newHandCards = [];
    // deal 5 cards
    for (let i = 0; i < 5; i++) {
      // if no more cards are in drawDeck, transfer all discardCards to drawDeck
      if (newDeckCards.length === 0) {
        console.log("shuffling discard pile into draw pile");
        newDeckCards.push(...discardCards);
        setDiscardCards([]);
        setDeckCards(newDeckCards);
      }
      // take cards from deck and put them into our hand
      if (newDeckCards.length > 0) newHandCards.push(newDeckCards.pop());
    }

    setDeckCards(newDeckCards);
    setHandCards(newHandCards as CardType[]);
  };

  const cardClick = (id: number) => {
    if (!playerTurn) return;
    if (playerHp <= 0) return;
    if (playerEnergy <= 0) return;
    const newDiscardCards = [...discardCards];
    const clickedCard = handCards.find((card) => card.id === id);

    if (clickedCard) {
      //play card
      if (clickedCard.name === "Attack") {
        setEnemyHp((enemyHp) => enemyHp - clickedCard.stats);
      }
      if (clickedCard.name === "Defend") {
        setPlayerBlock((playerBlock) => playerBlock + clickedCard.stats);
      }
      //discard
      newDiscardCards.push(clickedCard);
      setPlayerEnergy((playerEnergy) => playerEnergy - clickedCard.energy);
    }

    setHandCards((handCards) => handCards.filter((card) => card.id != id));
    setDiscardCards(newDiscardCards);
  };

  const resetGame = () => {
    console.error("still player turn");
    console.log('reset game')
    const initialDeck = initializeDeck();
    const initialHand = initialDeck.splice(-5);
    setDeckCards(initialDeck);
    setHandCards(initialHand);
    setDiscardCards([]);
    setTurnNumber(0);
    setPlayerTurn(true);
    setPlayerHp(50);
    setPlayerBlock(0);
    setPlayerEnergy(3);
    setEnemyHp(40);
    setEnemyBlock(0);
    setEnemyMoves([
      10, 20, 2, 10, 2, 20, 10, 15, 20,
    ]);
    setModalOpen(false);
  }

  return (
    <>
      <span className="absolute left-7">Energy: {playerEnergy}</span>
      <DrawDeck cards={deckCards} />
      <Player hp={playerHp} block={playerBlock} />
      <Enemy hp={enemyHp} block={enemyBlock} move={enemyMoves[turnNumber]} />
      <EndTurn playerTurn={playerTurn} click={endTurn} />
      <Hand cards={handCards} cardClick={cardClick} />
      <DiscardDeck cards={discardCards} />


      {modalOpen ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl font-semibold text-black text-center">
                    Game Over You lose!!!
                  </h3>
                </div>
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-lg text-black">
                    Would You like to try again?
                  </p>
                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => resetGame()}
                  >
                    Reset Game
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default PlayBoard;

//TODO add max hand capacity of 10 to dealHand()
//TODO add out of energy notice
//TODO click discard pile to show cards inside (ordered)
//TODO click draw pile to show cards inside (unordered)
//TODO add more cards
//TODO exhaust deck
//TODO more enemies - never ending?
//TODO relic rewards
//TODO characters
//TODO emojis/card art
//TODO Auth, add a back end
//TODO high score leaderboard
//TODO brainstorm altering the game design
