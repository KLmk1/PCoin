import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const BlockBlastBoard = ({ rows, cols, onScoreUpdate }) => {
  const [board, setBoard] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState(generateBlocks());
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    setBoard(createEmptyBoard(rows, cols));
  }, [rows, cols]);

  function createEmptyBoard(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  function generateBlocks() {
    return [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      [{ x: 0, y: 0 }, { x: 0, y: 1 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    ];
  }

  const handleBlockSelection = (block) => {
    setSelectedBlock(block);
  };

  const handleCellClick = (row, col) => {
    if (!selectedBlock) return;
    if (canPlaceBlock(row, col, selectedBlock)) {
      placeBlock(row, col, selectedBlock);
      setSelectedBlock(null);
    }
  };

  const canPlaceBlock = (row, col, block) => {
    return block.every(({ x, y }) => {
      const newX = col + x;
      const newY = row + y;
      return newX >= 0 && newX < cols && newY >= 0 && newY < rows && !board[newY][newX];
    });
  };

  const placeBlock = (row, col, block) => {
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((r) => [...r]);
      block.forEach(({ x, y }) => {
        newBoard[row + y][col + x] = 'filled';
      });
      return newBoard;
    });
    checkAndClearRows();
    onScoreUpdate(5);
  };

  const checkAndClearRows = () => {
    setBoard((prevBoard) => {
      const newBoard = prevBoard.filter(row => !row.every(cell => cell !== null));
      const clearedRows = rows - newBoard.length;
      if (clearedRows > 0) {
        const emptyRows = Array.from({ length: clearedRows }, () => Array(cols).fill(null));
        onScoreUpdate(clearedRows * 10);
        return [...emptyRows, ...newBoard];
      }
      return prevBoard;
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        {availableBlocks.map((block, index) => (
          <button key={index} onClick={() => handleBlockSelection(block)} style={{ margin: '5px' }}>
            Блок {index + 1}
          </button>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 30px)`,
          gridTemplateRows: `repeat(${rows}, 30px)`,
          gap: '2px',
          border: '2px solid black',
          padding: '5px',
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              style={{
                width: '30px',
                height: '30px',
                border: '1px solid gray',
                backgroundColor: cell ? 'gray' : 'white',
                cursor: selectedBlock ? 'pointer' : 'default',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

BlockBlastBoard.propTypes = {
  rows: PropTypes.number.isRequired,
  cols: PropTypes.number.isRequired,
  onScoreUpdate: PropTypes.func.isRequired,
};

export default BlockBlastBoard;
