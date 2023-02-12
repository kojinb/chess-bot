import React, { useEffect, useState } from 'react';
import Square from './Square';

const Board = () => {
    const [game, setGame] = useState([
        ['black_rook', 'black_knight', 'black_bishop', 'black_queen', 'black_king', 'black_bishop', 'black_knight', 'black_rook'],
        Array(8).fill('black_pawn'),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill('white_pawn'),
        ['white_rook', 'white_knight', 'white_bishop', 'white_queen', 'white_king', 'white_bishop', 'white_knight', 'white_rook'],
    ]);
    const [selected, setSelected] = useState({ x: null, y: null });
    const [invalidMove, setInvalidMove] = useState(false);

    const handleSquareClick = (x, y) => {
        console.log("current selected: " + selected.x + " " + selected.y);
        console.log("new selected: " + x + " " + y);
        if (selected.x === null) {
            setSelected({ x, y });
        } else {
            const gameCopy = JSON.parse(JSON.stringify(game));
            const piece = game[selected.y][selected.x];
            let isValidMove = false;
            switch (piece) {
                case 'white_pawn':
                    isValidMove = isValidPawnMove(game, selected, x, y, 'white');
                    break;
                case 'black_pawn':
                    isValidMove = isValidPawnMove(game, selected, x, y, 'black');
                    break;
                case 'rook':
                    isValidMove = isValidRookMove(game, selected, x, y);
                    break;
                // cases for other pieces
            }
            if (isValidMove) {
                gameCopy[selected.y][selected.x] = null;
                gameCopy[y][x] = game[selected.y][selected.x];
                setGame(gameCopy);
                setInvalidMove(false);
            } else {
                console.log('Invalid move');
                setInvalidMove(true);
            }
            setSelected({ x: null, y: null});
        }
    };

    const isValidPawnMove = (game, selected, x, y, color) => {
        // Destructure the x and y values of the selected square from the `selected` object
        const { x: selectedX, y: selectedY } = selected;
        // Check if the selected pawn is white
        if (color === 'white') {
            // Check if the pawn is moving forward one square and there is no piece in that square
            if (y === selectedY - 1 && x === selectedX && !game[y][x]) {
                return true;
            }
            // Check if the pawn is capturing a black piece
            else if (y === selectedY - 1 && Math.abs(x - selectedX) === 1 && game[y][x] && game[y][x].color === 'black') {
                return true;
            }
            // Check for white pawn's initial two-square move
            else if (selectedY === 6 && y === 4 && x === selectedX && !game[5][x] && !game[4][x]) {
                return true;
            }
        }
        // Check if the selected pawn is black
        else {
            // Check if the pawn is moving forward one square and there is no piece in that square
            if (y === selectedY + 1 && x === selectedX && !game[y][x]) {
                return true;
            }
            // Check if the pawn is capturing a white piece
            else if (y === selectedY + 1 && Math.abs(x - selectedX) === 1 && game[y][x] && game[y][x].color === 'white') {
                return true;
            }
            // Check for black pawn's initial two-square move
            else if (selectedY === 1 && y === 3 && x === selectedX && !game[2][x] && !game[3][x]) {
                return true;
            }
        }
        // Return false if the move is not valid
        return false;
    };

    const isValidRookMove = (game, selected, x, y) => {
        // code to verify if rook move is valid
    };

    const renderSquare = (i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const black = (x + y) % 2 === 1;
        const color = black ? 'grey' : 'white';
        const piece = game[y][x];
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
            {invalidMove && <div>Invalid Move!</div>}
        </>
    );
};

export default Board;