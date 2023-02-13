import React, { useEffect, useState } from 'react';
import Square from './Square';
import Piece from './Piece';

const Board = () => {
    const [game, setGame] = useState([
        [Piece('rook', 'black'), Piece('knight', 'black'), Piece('bishop', 'black'), Piece('queen', 'black'), Piece('king', 'black'), Piece('bishop', 'black'), Piece('knight', 'black'), Piece('rook', 'black')],
        Array(8).fill(Piece('pawn', 'black')),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(Piece('pawn', 'white')),
        [Piece('rook', 'white'), Piece('knight', 'white'), Piece('bishop', 'white'), Piece('king', 'white'), Piece('queen', 'white'), Piece('bishop', 'white'), Piece('knight', 'white'), Piece('rook', 'white')],
    ]);

    const [selected, setSelected] = useState({ x: null, y: null });
    const [invalidMove, setInvalidMove] = useState(false);
    const [whitesMove, setWhitesMove] = useState(true);
    const [lastMove, setLastMove] = useState({ x: null, y: null });

    const handleSquareClick = (x, y) => {
        if (selected.x === null) {
            setSelected({ x, y });
        } else {
            const gameCopy = JSON.parse(JSON.stringify(game));
            const piece = game[selected.y][selected.x];
            let isValidMove = { validMove: false, enPassant: false };
            switch (piece.name) {
                case 'pawn':
                    isValidMove = isValidPawnMove(game, selected, x, y, lastMove);
                    break;
                case 'rook':
                    isValidMove = isValidRookMove(game, selected, x, y);
                    break;
                // cases for other pieces
            }
            if (isValidMove.validMove) {
                if (isValidMove.enPassant) {
                    gameCopy[lastMove.y][lastMove.x] = null;
                }
                gameCopy[selected.y][selected.x] = null;
                gameCopy[y][x] = game[selected.y][selected.x];
                setGame(gameCopy);
                setInvalidMove(false);
                setWhitesMove(!whitesMove);
                setLastMove({ x, y });
            } else {
                console.log('Invalid move');
                setInvalidMove(true);
            }
            setSelected({ x: null, y: null });
        }
    };

    const isValidPawnMove = (game, selected, x, y, previous_move) => {
        // Destructure the x and y values of the selected square from the `selected` object
        const { x: selectedX, y: selectedY } = selected;
        const { x: previousX, y: previousY } = previous_move;
        const piece = game[selectedY][selectedX];

        // Check if the selected pawn is white
        if (piece.color === 'white' && whitesMove) {
            // Check if the pawn is moving forward one square and there is no piece in that square
            if (y === selectedY - 1 && x === selectedX && !game[y][x]) {
                return {
                    validMove: true,
                    enPassant: false
                };
            }
            // Check if the pawn is capturing a black piece
            else if (y === selectedY - 1 && Math.abs(x - selectedX) === 1 && game[y][x] && game[y][x].color === 'black') {
                return {
                    validMove: true,
                    enPassant: false
                };
            }
            // Check for white pawn's initial two-square move
            else if (selectedY === 6 && y === 4 && x === selectedX && !game[5][x] && !game[4][x]) {
                return {
                    validMove: true,
                    enPassant: false
                };
            }
            // Check for en passant
            else if (selectedY === previousY && x === previousX && Math.abs(selectedX - x) === 1 && game[previousY][previousX].color === 'black' && game[previousY][previousX].name === 'pawn') {
                return {
                    validMove: true,
                    enPassant: true
                };
            }
        }
        // Check if the selected pawn is black
        else {
            // Check if the pawn is moving forward one square and there is no piece in that square
            if (y === selectedY + 1 && x === selectedX && !game[y][x]) {
                return {
                    validMove: true,
                    enPassant: false
                };
            }
            // Check if the pawn is capturing a white piece
            else if (y === selectedY + 1 && Math.abs(x - selectedX) === 1 && game[y][x] && game[y][x].color === 'white') {
                return {
                    validMove: true,
                    enPassant: false
                };
            }
            // Check for black pawn's initial two-square move
            else if (selectedY === 1 && y === 3 && x === selectedX && !game[2][x] && !game[3][x]) {
                return {
                    validMove: true,
                    enPassant: false
                };
            }
            // check for black's en passant capture
            else if (selectedY === previousY && x === previousX && Math.abs(selectedX - x) === 1 && game[previousY][previousX].color === 'white' && game[previousY][previousX].name === 'pawn') {
                return {
                    validMove: true,
                    enPassant: true
                };
            }
        }
        // Return false if the move is not valid
        return {
            validMove: false,
            enPassant: false
        };
    };

    const isValidRookMove = (game, selected, x, y) => {
        // code to verify if rook move is valid
        const { x: selectedX, y: selectedY } = selected;
        const piece = game[selectedY][selectedX];

        // Check if move is along the row
        if (selectedX === x) {
            const minY = Math.min(selectedY, y);
            const maxY = Math.max(selectedY, y);
            for (let i = minY + 1; i < maxY; i++) {
                if (game[i][x]) {
                    return {validMove: false, enPassant: false};
                }
            }
            if (!game[y][x] || game[y][x].color !== piece.color) {
                return {validMove: true, enPassant: false};
            }
        }
        // Check if move is along the column
        else if (selectedY === y) {
            const minX = Math.min(selectedX, x);
            const maxX = Math.max(selectedX, x);
            for (let i = minX + 1; i < maxX; i++) {
                if (game[y][i]) {
                    return {validMove: false, enPassant: false};
                }
            }
            if (!game[y][x] || game[y][x].color !== piece.color) {
                return {validMove: true, enPassant: false};
            }
        }

        return {validMove: false, enPassant: false};
    };

    const renderSquare = (i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const black = (x + y) % 2 === 1;
        const color = black ? 'grey' : 'white';
        const piece = game[y][x];
        let pieceName = '';
        let pieceColor = '';
        if (piece) {
            pieceName = piece.name;
            pieceColor = piece.color;
        }
        return (
            <Square
                x={x}
                y={y}
                color={color}
                piece={piece}
                onClick={() => handleSquareClick(x, y)}
            />
        );
    };

    const squares = Array(64).fill().map((_, i) => renderSquare(i));

    return (
        <>
            <div style={{ display: 'flex', flexWrap: 'wrap', height: '400px', width: '400px', border: '1px solid black' }}>
                {squares}
            </div>
            <div>selected x: {selected.x}, selected y: {selected.y}</div>
            <div>last move: {lastMove.x}, {lastMove.y}</div>
            {invalidMove && <div>Invalid Move!</div>}
        </>
    );
};

export default Board;