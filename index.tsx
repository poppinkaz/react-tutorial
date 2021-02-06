import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  //type setting

  type SquareType = 'X'|'O'|null;

  interface SquareProps {
      value: SquareType;
      highlight: boolean;
      onClick: () => void;
  }

  function Square(props: SquareProps){
    return (
      <button 
      className={props.highlight ? "square highlight" :"square"}
      onClick = {props.onClick}>
        {props.value}
      </button>    
    );
  }
  
  type boardSetting = {
    boardSize: number;
    boardRow: number[];
    boardSquares: number[];
  }

  interface BoardProps{
      squares: SquareType[];
      onClick: (i: number) => void;
      highlights: number[];
      
  }
  
  class Board extends React.Component<BoardProps,boardSetting, {}> {

    renderSquare(i: number) {
      return (
        <Square 
          value={this.props.squares[i]}
          highlight={this.props.highlights.includes(i)}
          onClick={() => this.props.onClick(i)}
        />
      );
    }
  
    render() {
      const boardSize = 3;
      const boardRow = [];

      for(let row: number = 0; row<boardSize; row++){
        const boardSquares = [];

        for(let col: number = 0; col< boardSize; col++){
          boardSquares[col] = this.renderSquare(row * 3 + col);
        }

        boardRow.push(
          <div className="board-row" key={row}>
            {boardSquares}
          </div> 
        )

      }

      return(
        <div>{boardRow}</div>
      );

    }
  }
  
  interface HistoryData{
    squares: SquareType[];
    location: {col: number, row: number}
  }

  interface GameState {
    history: HistoryData[];
    xIsNext: boolean;
    stepNumber: number;
    sortType: boolean; //false : 'ascending' , true : 'descending'
  }

  
  
  class Game extends React.Component <{}, GameState> {
    constructor(props: {}){
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null),
          location: {
            col: 0,
            row: 0
          }
        }],
        stepNumber: 0,
        xIsNext: true,
        sortType: false 
      }
    }

    

    handleClick(i: number) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          location: {
            col: i % 3 + 1,
            row: Math.trunc(i / 3 + 1),
          }
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    }

    toggleSortType(){
      if(this.state.sortType === false){
        this.setState({
          sortType: true,
        });
      }else if(this.state.sortType === true){
        this.setState({
          sortType: false,
        });
      }
    }

    jumpTo(step: number){
        this.setState({
            stepNumber: step,
            xIsNext: (step%2) === 0,
        });
    }

    render() { 
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winner = calculateWinner(current.squares);
      const finished = !current.squares.includes(null);

      const moves = history.map((step, move)=> {
          const desc = move ?
            'Go to move #' + move: 
            'Go to game start';

          const descLocation = move?
            `(${step.location.col},${step.location.row})` :
            '';
          
          return (
            <li key = {move}>
              <button onClick={() => this.jumpTo(move)} 
              className = {this.state.stepNumber === move? "selected": ""}
              > {desc} {descLocation}</button>
            </li>
          )
      });
      let status;
      let highlights: number[] = [];
      if (winner) {
        status = 'Winner: ' + winner.winner; //calculateWinnerの中のwinnerを返す
        highlights = winner.loc;　//calculateWinnerの中のlocを返す
        
      } else if(finished) {
        status = "Draw";
      }
      else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      } 

      return (
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              highlights = {highlights}
              onClick={(i: number) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>{this.state.sortType ? moves.reverse() : moves}</ol>
            <button type="button" onClick = {() =>this.toggleSortType()}>sort</button>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );

  type WinnerData = {
    winner: SquareType,
    loc: number[]
  }

  function calculateWinner(squares: Array<SquareType>): WinnerData | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {
          winner: squares[a],
          loc: lines[i]
        };
      }
    }
    return null;
  }
 