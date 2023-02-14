import React, { useEffect, useState } from 'react';
import Square from './Square';
import Piece from './Piece';
import piece_icons from './files/piece_icons';

const Board = () => {
    const [game, setGame] = useState([
        [Piece('rook', 'black'), Piece('knight', 'black'), Piece('bishop', 'black'), Piece('queen', 'black'), Piece('king', 'black'), Piece('bishop', 'black'), Piece('knight', 'black'), Piece('rook', 'black')],
        Array(8).fill(Piece('pawn', 'black')),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(Piece('pawn', 'white')),
        [Piece('rook', 'white'), Piece('knight', 'white'), Piece('bishop', 'white'), Piece('queen', 'white'), Piece('king', 'white'), Piece('bishop', 'white'), Piece('knight', 'white'), Piece('rook', 'white')],
    ]);

    const [selected, setSelected] = useState({ x: null, y: null });
    const [invalidMove, setInvalidMove] = useState(false);
    const [whitesMove, setWhitesMove] = useState(true);
    const [lastMove, setLastMove] = useState({ x: null, y: null });
    const [isInCheck, setIsInCheck] = useState(false);
    const [whiteKing, setWhiteKing] = useState({ x: 4, y: 7 });
    const [blackKing, setBlackKing] = useState({ x: 4, y: 0 });
    const [deadPieces, setDeadPieces] = useState({ whitePieces: [], blackPieces: [] });

    const handleSquareClick = (x, y) => {
        if (selected.x === null && selectCorrectSquare(game[y][x])) {
            setSelected({ x, y });
        } else if (selected.x !== null) {
            if (game[y][x] && game[y][x].color === game[selected.y][selected.x].color) {
                setSelected({ x, y });
            } else {
                const gameCopy = JSON.parse(JSON.stringify(game));
                const kingPos = whitesMove ? whiteKing : blackKing;

                let isValidMove = checkIsValidMove(gameCopy, x, y, kingPos);

                if (isValidMove.validMove) { // if it is a valid move
                    if (isInCheck) { // if it is in check
                        // check if new position is still in check
                        if (findIsInCheck(isValidMove.gameCopy, isValidMove.kingPos)) {
                            console.log('Invalid move');
                        } else {
                            updateGame(isValidMove.gameCopy, x, y, isValidMove.kingPos);
                        }
                    } else { // if it isnt in check
                        updateGame(isValidMove.gameCopy, x, y, isValidMove.kingPos);
                    }
                } else { // if its not a valid move
                    console.log('Invalid move');
                    setInvalidMove(true);
                }
                setSelected({ x: null, y: null });
            }
        }
    };

    const selectCorrectSquare = (piece) => {
        if (piece) {
            if (piece.color === 'white' && whitesMove) {
                return true;
            } else if (piece.color === 'black' && !whitesMove) {
                return true;
            }
        }
        return false
    }

    const updateGame = (gameCopy, x, y, kingPos) => {
        let isChecked = false;
        if (whitesMove) {
            isChecked = findIsInCheck(gameCopy, blackKing);
            setWhiteKing({ x: kingPos.x, y: kingPos.y });
        } else {
            isChecked = findIsInCheck(gameCopy, whiteKing);
            setBlackKing({ x: kingPos.x, y: kingPos.y });
        }
        setIsInCheck(isChecked);
        setGame(gameCopy);
        setInvalidMove(false);
        setWhitesMove(!whitesMove);
        setLastMove({ x, y });
    }

    const checkIsValidMove = (gameCopy, x, y, kingPos) => {
        const piece = gameCopy[selected.y][selected.x];
        let pieceMoveResponse = { validMove: false, enPassant: false, castle: false }
        let response = { validMove: false, gameCopy: gameCopy, kingPos: kingPos };

        switch (piece.name) {
            case 'pawn':
                pieceMoveResponse = isValidPawnMove(gameCopy, selected, x, y, lastMove);
                break;
            case 'rook':
                pieceMoveResponse = isValidRookMove(gameCopy, selected, x, y);
                break;
            case 'bishop':
                pieceMoveResponse = isValidBishopMove(gameCopy, selected, x, y);
                break;
            case 'knight':
                pieceMoveResponse = isValidKnightMove(gameCopy, selected, x, y);
                break;
            case 'queen':
                pieceMoveResponse = isValidQueenMove(gameCopy, selected, x, y);
                break;
            case 'king':
                pieceMoveResponse = isValidKingMove(gameCopy, selected, x, y);
                if (pieceMoveResponse.validMove) { // if the king was moved, update kingPos
                    response.kingPos.x = x;
                    response.kingPos.y = y;
                }
                break;
        }

        if (pieceMoveResponse.validMove) {
            let pieceCaptured = null;
            if (pieceMoveResponse.enPassant) { // if en passant, null the pawn
                pieceCaptured = gameCopy[lastMove.y][lastMove.x];
                gameCopy[lastMove.y][lastMove.x] = null;
                gameCopy[y][x] = game[selected.y][selected.x];
                gameCopy[y][x].hasMoved = true;
            }
            else if (pieceMoveResponse.castle) { // if castle, move the rook from the original position to the king's side
                let castleMove = 0;
                if (x < 4) {
                    gameCopy[selected.y][0] = null;
                    gameCopy[selected.y][3] = game[selected.y][0];
                    gameCopy[selected.y][3].hasMoved = true;
                    castleMove = -2;
                } else {
                    gameCopy[selected.y][7] = null;
                    gameCopy[selected.y][5] = game[selected.y][7];
                    gameCopy[selected.y][5].hasMoved = true;
                    castleMove = 2;
                }
                gameCopy[y][selected.x + castleMove] = game[selected.y][selected.x]; // move the king
                gameCopy[y][selected.x + castleMove].hasMoved = true;
                response.kingPos.x = selected.x + castleMove;
                response.kingPos.y = y;
            } else {
                pieceCaptured = gameCopy[y][x];
                gameCopy[y][x] = game[selected.y][selected.x]; // move the selected piece to the new position
                gameCopy[y][x].hasMoved = true;
            }
            gameCopy[selected.y][selected.x] = null; // set original piece location to null

            // check if the new move created a discovered check
            if (!findIsInCheck(gameCopy, response.kingPos)) {
                response.gameCopy = gameCopy;
                response.validMove = true;
                if (pieceCaptured) {
                    if (piece.color === 'white') {
                        setDeadPieces({ whitePieces: deadPieces.whitePieces, blackPieces: deadPieces.blackPieces.concat(pieceCaptured) });
                    } else {
                        setDeadPieces({ whitePieces: deadPieces.whitePieces.concat(pieceCaptured), blackPieces: deadPieces.blackPieces });
                    }
                }
            }
        }

        return response;
    }

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
                    enPassant: false,
                    castle: false,
                };
            }
            // Check if the pawn is capturing a black piece
            else if (y === selectedY - 1 && Math.abs(x - selectedX) === 1 && game[y][x] && game[y][x].color === 'black') {
                return {
                    validMove: true,
                    enPassant: false,
                    castle: false
                };
            }
            // Check for white pawn's initial two-square move
            else if (selectedY === 6 && y === 4 && x === selectedX && !game[5][x] && !game[4][x]) {
                return {
                    validMove: true,
                    enPassant: false,
                    castle: false
                };
            }
            // Check for en passant
            else if (selectedY === previousY && x === previousX && Math.abs(selectedX - x) === 1 && game[previousY][previousX].color === 'black' && game[previousY][previousX].name === 'pawn') {
                return {
                    validMove: true,
                    enPassant: true,
                    castle: false
                };
            }
        }
        // Check if the selected pawn is black
        else {
            // Check if the pawn is moving forward one square and there is no piece in that square
            if (y === selectedY + 1 && x === selectedX && !game[y][x]) {
                return {
                    validMove: true,
                    enPassant: false,
                    castle: false
                };
            }
            // Check if the pawn is capturing a white piece
            else if (y === selectedY + 1 && Math.abs(x - selectedX) === 1 && game[y][x] && game[y][x].color === 'white') {
                return {
                    validMove: true,
                    enPassant: false,
                    castle: false
                };
            }
            // Check for black pawn's initial two-square move
            else if (selectedY === 1 && y === 3 && x === selectedX && !game[2][x] && !game[3][x]) {
                return {
                    validMove: true,
                    enPassant: false,
                    castle: false
                };
            }
            // check for black's en passant capture
            else if (selectedY === previousY && x === previousX && Math.abs(selectedX - x) === 1 && game[previousY][previousX].color === 'white' && game[previousY][previousX].name === 'pawn') {
                return {
                    validMove: true,
                    enPassant: true,
                    castle: false
                };
            }
        }
        // Return false if the move is not valid
        return {
            validMove: false,
            enPassant: false,
            castle: false
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
                    return { validMove: false, enPassant: false, castle: false };
                }
            }
            if (!game[y][x] || game[y][x].color !== piece.color) {
                return { validMove: true, enPassant: false, castle: false };
            }
        }
        // Check if move is along the column
        else if (selectedY === y) {
            const minX = Math.min(selectedX, x);
            const maxX = Math.max(selectedX, x);
            for (let i = minX + 1; i < maxX; i++) {
                if (game[y][i]) {
                    return { validMove: false, enPassant: false, castle: false };
                }
            }
            if (!game[y][x] || game[y][x].color !== piece.color) {
                return { validMove: true, enPassant: false, castle: false };
            }
        }

        return { validMove: false, enPassant: false, castle: false };
    };

    const isValidBishopMove = (game, selected, x, y) => {
        const { x: selectedX, y: selectedY } = selected;
        const color = game[selectedY][selectedX].color;
        // Check if move is along a diagonal
        if (Math.abs(selectedX - x) === Math.abs(selectedY - y)) {
            let squareCheck = Math.abs(selectedX - x); // number of squares that need to be checked
            let xIncrementer = -((selectedX - x) / squareCheck);
            let yIncrementer = -((selectedY - y) / squareCheck);
            let i = 1;
            // check that all squares up to target square are unoccupied
            while (i < squareCheck) {
                if (game[selectedY + yIncrementer * i][selectedX + xIncrementer * i]) {
                    return { validMove: false, enPassant: false, castle: false };
                }
                i++;
            }
            // check target square to ensure its unoccupied or occupied by opposing color
            if (!game[y][x] || game[y][x].color !== color) {
                return { validMove: true, enPassant: false, castle: false };
            }
        }

        return { validMove: false, enPassant: false, castle: false };
    };

    const isValidKnightMove = (game, selected, x, y) => {
        const { x: selectedX, y: selectedY } = selected;
        const color = game[selectedY][selectedX].color;
        // Check if move is L-shaped
        if ((Math.abs(selectedX - x) === 2 && Math.abs(selectedY - y) === 1) ||
            (Math.abs(selectedX - x) === 1 && Math.abs(selectedY - y) === 2)) {
            if (!game[y][x] || game[y][x].color !== color) {
                return { validMove: true, enPassant: false, castle: false };
            }
        }

        return { validMove: false, enPassant: false, castle: false };
    };

    const isValidQueenMove = (game, selected, x, y) => {
        let validRookMove = isValidRookMove(game, selected, x, y);
        let validBishopMove = isValidBishopMove(game, selected, x, y);

        if (validRookMove.validMove || validBishopMove.validMove) {
            return { validMove: true, enPassant: false, castle: false };
        }
        return { validMove: false, enPassant: false, castle: false };
    };

    const isValidKingMove = (game, selected, x, y) => {
        const { x: selectedX, y: selectedY } = selected;
        const color = game[selectedY][selectedX].color;

        // verify that the player is not in check
        if (!isInCheck) {
            // check if user is trying to castle by moving king 2 sqaures
            if (Math.abs(selectedX - x) >= 2) {
                // y values must be the same in order to castle
                if (selectedY === y) {
                    // check that all squares inbetween the rook and the king are unoccupied
                    let squareCheck = 2;
                    let xIncrementer = 1;
                    let rookX = 7;
                    if (x - selectedX < 0) {
                        squareCheck = 3;
                        xIncrementer = -1;
                        rookX = 0;
                    }
                    let i = 1;
                    while (i <= squareCheck) {
                        if (game[selectedY][selectedX + xIncrementer * i]) {
                            return { validMove: false, enPassant: false, castle: false };
                        }
                        i++;
                    }
                    // check to make sure that the king and the rook have not moved
                    if (!game[selectedY][rookX].hasMoved && !game[selectedY][selectedX].hasMoved) {
                        return { validMove: true, enPassant: false, castle: true }
                    }
                }
            }
        }

        // Check if move is one square in any direction
        if (Math.abs(selectedX - x) <= 1 && Math.abs(selectedY - y) <= 1) {
            if (!game[y][x] || game[y][x].color !== color) {
                return { validMove: true, enPassant: false, castle: false };
            }
        }

        return { validMove: false, enPassant: false, castle: false };
    };

    const findIsInCheck = (gameCopy, kingPos) => {
        const targetX = kingPos.x;
        const targetY = kingPos.y;
        const king = gameCopy[targetY][targetX];
        const playerColor = king.color;

        // check verticals
        let yCoord = targetY - 1;
        while (yCoord >= 0) {
            // empty square
            if (!gameCopy[yCoord][targetX]) {
                yCoord--;
            } else {
                const piece = gameCopy[yCoord][targetX];
                if (piece.name === 'rook' && piece.color !== playerColor || piece.name === 'queen' && piece.color !== playerColor) {
                    return true;
                }
                break;
            }
        }
        yCoord = targetY + 1;
        while (yCoord <= 7) {
            // empty square
            if (!gameCopy[yCoord][targetX]) {
                yCoord++;
            } else {
                const piece = gameCopy[yCoord][targetX];
                if (piece.name === 'rook' && piece.color !== playerColor || piece.name === 'queen' && piece.color !== playerColor) {
                    return true;
                }
                break;
            }
        }
        // check horizontals
        let xCoord = targetX - 1;
        while (xCoord >= 0) {
            // empty square
            if (!gameCopy[targetY][xCoord]) {
                xCoord--;
            } else {
                const piece = gameCopy[targetY][xCoord];
                if (piece.name === 'rook' && piece.color !== playerColor || piece.name === 'queen' && piece.color !== playerColor) {
                    return true;
                }
                break;
            }
        }
        xCoord = targetX + 1;
        while (xCoord <= 7) {
            // empty square
            if (!gameCopy[targetY][xCoord]) {
                xCoord++;
            } else {
                const piece = gameCopy[targetY][xCoord];
                if (piece.name === 'rook' && piece.color !== playerColor || piece.name === 'queen' && piece.color !== playerColor) {
                    return true;
                }
                break;
            }
        }

        // check diagonals
        // bottom right
        xCoord = targetX + 1;
        yCoord = targetY + 1;
        while (xCoord <= 7 && yCoord <= 7) {
            // empty square
            if (!gameCopy[yCoord][xCoord]) {
                xCoord++;
                yCoord++;
            } else {
                const piece = gameCopy[yCoord][xCoord];
                if (piece.name === 'bishop' && piece.color !== playerColor || piece.name === 'queen' && piece.color !== playerColor) {
                    return true;
                }
                break;
            }
        }
        // bottom left
        xCoord = targetX - 1;
        yCoord = targetY + 1;
        while (xCoord >= 0 && yCoord <= 7) {
            // empty square
            if (!gameCopy[yCoord][xCoord]) {
                xCoord--;
                yCoord++;
            } else {
                const piece = gameCopy[yCoord][xCoord];
                if (piece.name === 'bishop' && piece.color !== playerColor || piece.name === 'queen' && piece.color !== playerColor) {
                    return true;
                }
                break;
            }
        }
        // top left
        xCoord = targetX - 1;
        yCoord = targetY - 1;
        while (xCoord >= 0 && yCoord >= 0) {
            // empty square
            if (!gameCopy[yCoord][xCoord]) {
                xCoord--;
                yCoord--;
            } else {
                const piece = gameCopy[yCoord][xCoord];
                if (piece.name === 'bishop' && piece.color !== playerColor || piece.name === 'queen' && piece.color !== playerColor) {
                    return true;
                }
                break;
            }
        }
        // top right
        xCoord = targetX + 1;
        yCoord = targetY - 1;
        while (xCoord <= 7 && yCoord >= 0) {
            // empty square
            if (!gameCopy[yCoord][xCoord]) {
                xCoord++;
                yCoord--;
            } else {
                const piece = gameCopy[yCoord][xCoord];
                if (piece.name === 'bishop' && piece.color !== playerColor || piece.name === 'queen' && piece.color !== playerColor) {
                    return true;
                }
                break;
            }
        }

        // check knight positions
        // outer left positions
        xCoord = targetX - 2;
        if (xCoord >= 0) {
            if (targetY - 1 >= 0) {
                if (gameCopy[targetY - 1][xCoord] && gameCopy[targetY - 1][xCoord].name === 'knight' && gameCopy[targetY - 1][xCoord].color !== playerColor) {
                    return true;
                }
            }
            if (targetY + 1 <= 7) {
                if (gameCopy[targetY + 1][xCoord] && gameCopy[targetY + 1][xCoord].name === 'knight' && gameCopy[targetY + 1][xCoord].color !== playerColor) {
                    return true;
                }
            }
        }
        // outer right positions
        xCoord = targetX + 2;
        if (xCoord <= 7) {
            if (targetY - 1 >= 0) {
                if (gameCopy[targetY - 1][xCoord] && gameCopy[targetY - 1][xCoord].name === 'knight' && gameCopy[targetY - 1][xCoord].color !== playerColor) {
                    return true;
                }
            }
            if (targetY + 1 <= 7) {
                if (gameCopy[targetY + 1][xCoord] && gameCopy[targetY + 1][xCoord].name === 'knight' && gameCopy[targetY + 1][xCoord].color !== playerColor) {
                    return true;
                }
            }
        }
        // inner left positions
        xCoord = targetX - 1;
        if (xCoord >= 0) {
            if (targetY - 2 >= 0) {
                if (gameCopy[targetY - 2][xCoord] && gameCopy[targetY - 2][xCoord].name === 'knight' && gameCopy[targetY - 2][xCoord].color !== playerColor) {
                    return true;
                }
            }
            if (targetY + 2 <= 7) {
                if (gameCopy[targetY + 2][xCoord] && gameCopy[targetY + 2][xCoord].name === 'knight' && gameCopy[targetY + 2][xCoord].color !== playerColor) {
                    return true;
                }
            }
        }
        // inner right positions
        xCoord = targetX + 1;
        if (xCoord >= 0) {
            if (targetY - 2 >= 0) {
                if (gameCopy[targetY - 2][xCoord] && gameCopy[targetY - 2][xCoord].name === 'knight' && gameCopy[targetY - 2][xCoord].color !== playerColor) {
                    return true;
                }
            }
            if (targetY + 2 <= 7) {
                if (gameCopy[targetY + 2][xCoord] && gameCopy[targetY + 2][xCoord].name === 'knight' && gameCopy[targetY + 2][xCoord].color !== playerColor) {
                    return true;
                }
            }
        }

        // check for enemy king
        // check top row
        yCoord = targetY - 1;
        if (yCoord >= 0) {
            if (targetX - 1 >= 0) {
                if (gameCopy[yCoord][targetX - 1] && gameCopy[yCoord][targetX - 1].name === 'king' && gameCopy[yCoord][targetX - 1].color !== playerColor) {
                    return true;
                }
            }
            if (gameCopy[yCoord][targetX] && gameCopy[yCoord][targetX].name === 'king' && gameCopy[yCoord][targetX].color !== playerColor) {
                return true;
            }
            if (targetX + 1 <= 7) {
                if (gameCopy[yCoord][targetX + 1] && gameCopy[yCoord][targetX + 1].name === 'king' && gameCopy[yCoord][targetX + 1].color !== playerColor) {
                    return true;
                }
            }
        }
        // check middle row
        yCoord = targetY;
        if (targetX - 1 >= 0) {
            if (gameCopy[yCoord][targetX - 1] && gameCopy[yCoord][targetX - 1].name === 'king' && gameCopy[yCoord][targetX - 1].color !== playerColor) {
                return true;
            }
        }
        if (gameCopy[yCoord][targetX] && gameCopy[yCoord][targetX].name === 'king' && gameCopy[yCoord][targetX].color !== playerColor) {
            return true;
        }
        if (targetX + 1 <= 7) {
            if (gameCopy[yCoord][targetX + 1] && gameCopy[yCoord][targetX + 1].name === 'king' && gameCopy[yCoord][targetX + 1].color !== playerColor) {
                return true;
            }
        }
        // check bottom row
        yCoord = targetY + 1;
        if (yCoord <= 7) {
            if (targetX - 1 >= 0) {
                if (gameCopy[yCoord][targetX - 1] && gameCopy[yCoord][targetX - 1].name === 'king' && gameCopy[yCoord][targetX - 1].color !== playerColor) {
                    return true;
                }
            }
            if (gameCopy[yCoord][targetX] && gameCopy[yCoord][targetX].name === 'king' && gameCopy[yCoord][targetX].color !== playerColor) {
                return true;
            }
            if (targetX + 1 <= 7) {
                if (gameCopy[yCoord][targetX + 1] && gameCopy[yCoord][targetX + 1].name === 'king' && gameCopy[yCoord][targetX + 1].color !== playerColor) {
                    return true;
                }
            }
        }

        // check for pawns
        if (playerColor === 'white') {
            if (gameCopy[targetY - 1][targetX - 1] && gameCopy[targetY - 1][targetX - 1].name === 'pawn' && gameCopy[targetY - 1][targetX - 1].color !== playerColor) {
                return true;
            }
            if (gameCopy[targetY - 1][targetX + 1] && gameCopy[targetY - 1][targetX + 1].name === 'pawn' && gameCopy[targetY - 1][targetX + 1].color !== playerColor) {
                return true;
            }
        } else {
            if (gameCopy[targetY + 1][targetX - 1] && gameCopy[targetY + 1][targetX - 1].name === 'pawn' && gameCopy[targetY + 1][targetX - 1].color !== playerColor) {
                return true;
            }
            if (gameCopy[targetY + 1][targetX + 1] && gameCopy[targetY + 1][targetX + 1].name === 'pawn' && gameCopy[targetY + 1][targetX + 1].color !== playerColor) {
                return true;
            }
        }

        return false;
    };

    const renderSquare = (i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const black = (x + y) % 2 === 1;
        const color = black ? 'grey' : 'white';
        const piece = game[y][x];
        let pieceSelected = false;
        if (selected.x === x && selected.y === y) {
            pieceSelected = true;
        }
        return (
            <Square
                x={x}
                y={y}
                color={color}
                piece={piece}
                selected={pieceSelected}
                onClick={() => handleSquareClick(x, y)}
            />
        );
    };

    const squares = Array(64).fill().map((_, i) => renderSquare(i));

    const whitePieces = deadPieces.whitePieces.map((piece) => (
        <div style={{
            width: '30px',
            height: '30px',
            backgroundImage: `url(${piece_icons[piece.color + '_' + piece.name]})`,
            backgroundSize: 'cover',
        }} />
    ));

    const blackPieces = deadPieces.blackPieces.map((piece) => (
        <div style={{
            width: '30px',
            height: '30px',
            backgroundImage: `url(${piece_icons[piece.color + '_' + piece.name]})`,
            backgroundSize: 'cover',
        }} />
    ));

    return (
        <>
            <div>turn: {whitesMove ? 'white' : 'black'} {isInCheck && ' !!! PLAYER IS IN CHECK !!!'}</div>
            {whitePieces.length > 0 &&
                <div style={{ display: 'flex', flexWrap: 'wrap', height: '30px', width: '400px' }}>
                    {whitePieces}
                </div>
            }
            <div style={{ display: 'flex', flexWrap: 'wrap', height: '400px', width: '400px', border: '1px solid black' }}>
                {squares}
            </div>
            {blackPieces.length > 0 &&
                <div style={{ display: 'flex', flexWrap: 'wrap', height: '30px', width: '400px' }}>
                    {blackPieces}
                </div>
            }
            <div>selected x: {selected.x}, selected y: {selected.y}</div>
            <div>last move: {lastMove.x}, {lastMove.y}</div>
            {invalidMove && <div>Invalid Move!</div>}
        </>
    );
};

export default Board;