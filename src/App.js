import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://ta-te-ti-server.onrender.com");

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [mySymbol, setMySymbol] = useState(null);
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on("assignSymbol", setMySymbol);
    socket.on("boardUpdate", ({ board, turn }) => {
      setBoard(board);
      setTurn(turn);
      setWinner(checkWinner(board));
    });
  }, []);

  const handleClick = (i) => {
    if (winner || board[i] || turn !== mySymbol) return;
    const newBoard = [...board];
    newBoard[i] = mySymbol;
    socket.emit("playTurn", { board: newBoard, room });
  };

  const checkWinner = (b) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (const [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return board.every(Boolean) ? "Empate" : null;
  };

  const joinRoom = () => {
    socket.emit("joinRoom", room);
    setJoined(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 20, color: "white" }}>
      <h1 style={{ fontSize: 30, marginBottom: 20 }}>Ta Te Ti Online</h1>
      {!joined ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Código de sala" style={{ padding: 10, borderRadius: 4 }} />
          <button onClick={joinRoom} style={{ backgroundColor: "#4299e1", color: "white", padding: 10, borderRadius: 4 }}>Unirse</button>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 10, margin: 20 }}>
            {board.map((cell, i) => (
              <div
                key={i}
                onClick={() => handleClick(i)}
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#2d3748",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: "bold",
                  cursor: "pointer",
                  borderRadius: 8
                }}
              >
                {cell}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 20 }}>
            {winner ? (winner === "Empate" ? "Empate" : `Ganó ${winner}`) :
              turn === mySymbol ? "Tu turno" : "Turno rival"}
          </div>
        </>
      )}
    </div>
  );
}
