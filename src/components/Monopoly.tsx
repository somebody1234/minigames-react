import React, { useCallback, useEffect, useState } from "react";
import { uniqueNamesGenerator, countries } from "unique-names-generator";

interface Player {
  name: string;
  token: string;
  location: number;
  money: number;
  properties: OwnedProperty[];
}

interface OwnedProperty {
  property: Property;
  houses: number;
}

interface Property {
  name: string;
  group: string;
  cost: number;
  houseCost: number;
  maxHouses: number;
  rent: [number, number, number, number, number, number];
}

interface Group {
  name: string;
  count: number;
}

interface Board {
  properties: Property[];
  groups: Group[];
}

function countProperties(
  player: Player,
  predicate: (property: Property) => boolean
) {
  let count = 0;
  for (const property of player.properties) {
    if (predicate(property.property)) {
      count += 1;
    }
  }
  return count;
}

function rentAmount(board: Board, owner: Player, property: Property) {
  if (property.name === "Go") return;
  const owned = owner.properties.find(
    (owned) => property.name === owned.property.name
  );
  if (!owned) return;
  let amount = property.rent[owned.houses];
  if (owned.houses === 0) {
    const ownedInGroup = countProperties(
      owner,
      (other) => property.group == other.group
    );
    const groupSize = board.groups.find(
      (group) => group.name === property.group
    )?.count;
    if (ownedInGroup === groupSize) {
      amount *= 2;
    }
  }
  return amount;
}

const propertyNamesSet = new Set<string>();
let i = 1;
while (propertyNamesSet.size < 40) {
  propertyNamesSet.add(
    uniqueNamesGenerator({
      dictionaries: [countries.filter((name) => name.length < 12)],
      seed: i,
    })
  );
  i += 1;
}
const propertyNames = [...propertyNamesSet];

const DEFAULT_BOARD: Board = {
  properties: Array.from(
    { length: 40 },
    (_, i): Property =>
      i === 0
        ? {
            name: "Go",
            group: "",
            cost: Infinity,
            houseCost: 0,
            maxHouses: 0,
            rent: [0, 0, 0, 0, 0, 0],
          }
        : {
            name: propertyNames[i],
            group: `${Math.floor((i - 1) / 3)}`,
            cost: i * 20,
            houseCost: 50 + 50 * Math.floor(i / 10),
            maxHouses: 5,
            rent: [i * 2, i * 10, i * 20, i * 30, i * 50, i * 100],
          }
  ),
  groups: Array.from(
    { length: 14 },
    (_, i): Group => ({ name: `${i}`, count: i === 13 ? 1 : 3 })
  ),
};

const COLORS = [
  "text-[#ff8888]",
  "text-[#8888ff]",
  "text-[#88ff88]",
  "text-[#ffff88]",
  "text-[#ff88ff]",
  "text-[#88ffff]",
  "text-[#88bbff]",
  "text-[#ffbb88]",
  "text-[#ff88bb]",
  "text-[#bb88ff]",
  "text-[#bbff44]",
  "text-[#dd66ff]",
  "text-[#44bb66]",
];

function gridArea(i: number) {
  return i < 11
    ? `${11 - i} / 1`
    : i < 21
    ? `1 / ${i - 9}`
    : i < 31
    ? `${i - 19} / 11`
    : `11 / ${41 - i}`;
}

function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

function rollDice() {
  return rollDie() + rollDie();
}

function canBuyProperty(player: Player, players: Player[], property: Property) {
  return (
    property.cost < player.money &&
    players.every(
      (player) =>
        !player.properties.some(
          (ownedProperty) => ownedProperty.property.name === property.name
        )
    )
  );
}

function compareOwnedProperties(a: OwnedProperty, b: OwnedProperty) {
  return Number(a.property.group) - Number(b.property.group);
}

function buyProperty(player: Player, property: Property) {
  const newPlayer = { ...player };
  newPlayer.money -= property.cost;
  newPlayer.properties = [
    ...newPlayer.properties,
    { houses: 0, property },
  ].sort(compareOwnedProperties);
  return newPlayer;
}

function propertyColor(property: Property) {
  return COLORS[Number(property.group)];
}

function PropertyCount({ property }: { property: OwnedProperty }) {
  return (
    <span className="text-xs">
      <span className={propertyColor(property.property)}>
        {property.property.name}
      </span>{" "}
      <span className="whitespace-nowrap">
        {property.houses === 5 ? "🏨" : property.houses + "🏘️"}
      </span>
    </span>
  );
}

export default function Monopoly() {
  const [board] = useState(DEFAULT_BOARD);
  const [movedThisTurn, setMovedThisTurn] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    { name: "alice", token: "🥶", location: 0, money: 1500, properties: [] },
    { name: "bob", token: "😎", location: 0, money: 1500, properties: [] },
  ]);
  const [turn, setTurn] = useState(0);
  const currentPlayer = players[turn];
  const currentProperty = board.properties[currentPlayer.location];

  const updatePlayer = useCallback(
    (index: number, map: (player: Player) => Player) => {
      setPlayers((oldPlayers) =>
        oldPlayers.map((oldPlayer, i) =>
          i === index ? map(oldPlayer) : oldPlayer
        )
      );
    },
    []
  );

  const movePlayer = useCallback(
    (index: number) => {
      const spaces = rollDice();
      updatePlayer(index, (player) => {
        const newLocation =
          (player.location + spaces) % board.properties.length;
        const newPlayer = { ...player };
        if (newLocation < player.location) {
          newPlayer.money += 200;
        }
        newPlayer.location = newLocation;
        return newPlayer;
      });
      setMovedThisTurn(true);
    },
    [board.properties.length, updatePlayer]
  );

  const playerBuyProperty = useCallback(
    (index: number) => {
      updatePlayer(index, (player) =>
        buyProperty(player, board.properties[player.location])
      );
    },
    [board.properties, updatePlayer]
  );

  const endTurn = useCallback(() => {
    setTurn((oldTurn) => (oldTurn + 1) % players.length);
    setMovedThisTurn(false);
  }, [players.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "1": {
          if (!movedThisTurn) {
            movePlayer(turn);
          }
          break;
        }
        case "2": {
          if (canBuyProperty(currentPlayer, players, currentProperty)) {
            playerBuyProperty(turn);
          }
          break;
        }
        case "3": {
          if (movedThisTurn) {
            endTurn();
          }
          break;
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [
    currentPlayer,
    currentProperty,
    board.properties,
    playerBuyProperty,
    players,
    movePlayer,
    movedThisTurn,
    endTurn,
    turn,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-5xl font-bold">totally not monopoly</h1>
      <div>
        it is {currentPlayer.name}&apos;s ({currentPlayer.token}&apos;s) turn
      </div>
      <div className="flex gap-4 mx-auto">
        <button
          disabled={movedThisTurn}
          title={movedThisTurn ? "you have already moved this turn" : undefined}
          className="px-2 py-0 bg-[#39ad39] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => movePlayer(turn)}
        >
          move
        </button>
        <button
          disabled={!canBuyProperty(currentPlayer, players, currentProperty)}
          title={
            currentProperty.cost === Infinity
              ? "you can't buy " + currentProperty.name + "..."
              : !canBuyProperty(currentPlayer, players, currentProperty)
              ? currentPlayer.money < currentProperty.cost
                ? "ur too broke to buy this property -_-"
                : "someone already owns this property"
              : undefined
          }
          className="px-2 py-0 bg-[#39ad39] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => playerBuyProperty(turn)}
        >
          buy
        </button>
        <button
          disabled={!movedThisTurn}
          title={
            !movedThisTurn ? "please move before ending your turn" : undefined
          }
          className="px-2 py-0 bg-[#ad3948] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={endTurn}
        >
          end turn
        </button>
      </div>
      <div className="grid gap-2 [grid-template-areas:'jail_top_free'_'left_center_right'_'go_bottom_gotojail']">
        {board.properties.map((property, i) => (
          <div
            key={i}
            className={`h-16 w-20 grid place-items-center rounded even:bg-white/10 ${
              COLORS[Math.floor((i - 1) / 3)]
            }`}
            style={{ gridArea: gridArea(i) }}
          >
            {property.name}
          </div>
        ))}
        {players.map((player, i) => (
          <div
            key={i}
            className="text-3xl m-auto"
            style={{ gridArea: gridArea(player.location) }}
          >
            {player.token}
          </div>
        ))}
        {players.map((player, i) => {
          const row = 6 - Math.floor(players.length / 2) + i;
          return (
            <React.Fragment key={i}>
              <div
                className="m-auto"
                style={{
                  gridArea: `${row} / 2`,
                }}
              >
                <span className="text-xl">{player.name}</span>
                <br />
                <span className="text-3xl">{player.token}</span>
              </div>
              <div
                className="m-auto"
                style={{
                  gridArea: `${row} / 3`,
                }}
              >
                <span className="text-xl">${player.money}</span>
              </div>
              {Array.from(
                { length: Math.ceil(player.properties.length / 2) },
                (_, i) => {
                  return (
                    <div
                      key={i}
                      className="m-auto"
                      style={{ gridArea: `${row} / ${i + 4}` }}
                    >
                      <PropertyCount property={player.properties[i * 2]} />
                      {player.properties.length > i * 2 + 1 && (
                        <>
                          <br />
                          <PropertyCount
                            property={player.properties[i * 2 + 1]}
                          />
                        </>
                      )}
                    </div>
                  );
                }
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
