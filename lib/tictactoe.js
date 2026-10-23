export default class TicTacToe {
    constructor(playerX, _playerO) {
        this.playerX = playerX;
        this.playerO = null;
        this.currentTurn = playerX;
        this.board = Array(9).fill(null);
        this.turns = 0;
        this.winner = null;
    }

    turn(isO, position) {
        if (this.winner || this.board[position] || (isO ? this.playerO : this.playerX) !== this.currentTurn) return false;
        this.board[position] = isO ? 'O' : 'X';
        this.turns += 1;
        this.winner = this.getWinner();
        if (!this.winner && this.turns < 9) this.currentTurn = this.currentTurn === this.playerX ? this.playerO : this.playerX;
        return true;
    }

    getWinner() {
        for (const [a, b, c] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a] === 'X' ? this.playerX : this.playerO;
            }
        }
        return null;
    }

    render() { return this.board.map((value, index) => value || String(index + 1)); }
}
