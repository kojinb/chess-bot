import React, { useState } from 'react';
import piece_icons from './files/piece_icons';

const Square = (props) => {
  //let name = props.piece ? props.piece_color + "_" + props.piece : '';
  let name = props.piece ? props.piece.color + "_" + props.piece.name : '';

  const style = {
    width: '50px',
    height: '50px',
    backgroundColor: props.selected ? '#90EE90' : props.color,
    backgroundImage: `url(${piece_icons[name]})`,
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