/**
 * TicTacToe Engine - GhostG-X Edition
 * Logic for win/draw/moves
 */

class TicTacToe {
    constructor(playerX = 'X', playerO = 'O') {
        this.board = Array(9).fill(null); // [null, null...]
        this.playerX = playerX;
        this.playerO = playerO;
        this.currentTurn = playerX; // X commence toujours
        this.winner = null;
        this.isDraw = false;
    }

    /**
     * Effectuer un mouvement
     * @param {number} index - Case de 0 à 8
     */
    move(index) {
        if (this.board[index] || this.winner || this.isDraw) return false;

        this.board[index] = this.currentTurn === this.playerX ? 'x' : 'o';
        this.checkWinner();

        if (!this.winner && !this.board.includes(null)) {
            this.isDraw = true;
        } else {
            this.currentTurn = this.currentTurn === this.playerX ? this.playerO : this.playerX;
        }
        return true;
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
            [0, 4, 8], [2, 4, 6]             // Diagonales
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a] === 'x' ? this.playerX : this.playerO;
                return;
            }
        }
    }

    /**
     * Retourne le plateau actuel avec des chiffres pour les cases vides
     */
    render() {
        return this.board.map((v, i) => v || (i + 1).toString());
    }
}

module.exports = TicTacToe;
