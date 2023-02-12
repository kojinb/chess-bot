import React from 'react';

const pieces = {
  white_pawn: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Chess_plt60.png',
  black_pawn: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Chess_pdt60.png',
  white_rook: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png',
  black_rook: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Chess_rdt60.png',
  white_knight: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png',
  black_knight: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chess_ndt60.png',
  white_bishop: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png',
  black_bishop: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Chess_bdt60.png',
  white_queen: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png',
  black_queen: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Chess_qdt60.png',
  white_king: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Chess_klt60.png',
  black_king: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Chess_kdt60.png'
};

const Square = (props) => {
  const style = {
    width: '50px',
    height: '50px',
    backgroundColor: props.color,
    backgroundImage: `url(${pieces[props.piece]})`,
    backgroundSize: 'cover',
  };
  return (
    <div
      style={style}
      onClick={() => props.onClick(props.x, props.y)}
    ></div>
  );
};

export default Square;