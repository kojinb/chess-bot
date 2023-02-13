import React, {useState} from 'react';

var Piece = function(name, color) {
    return {
        'name': name, 
        'color': color,
        'hasMoved': false,
    };
}

export default Piece;