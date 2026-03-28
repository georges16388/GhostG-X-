/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - TicTacToe Game Engine
 * Prestige Edition - Fun & Interactive
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

class TicTacToe {
  constructor(playerX, playerO) {
    this.playerX = playerX; // JID du joueur X
    this.playerO = playerO; // JID du joueur O
    this.board = Array(9).fill(null);
    this.currentTurn = playerX;
    this.turns = 0;
    this.winner = null;
    this.isDraw = false;
  }

  /**
   * Jouer un coup
   * @param {string} sender - JID de celui qui joue
   * @param {number} index - Position (0-8)
   */
  play(sender, index) {
    if (this.winner || this.isDraw) return { status: false, msg: "La partie est terminée." };
    if (sender !== this.currentTurn) return { status: false, msg: "Ce n'est pas ton tour !" };
    if (index < 0 || index > 8 || this.board[index]) return { status: false, msg: "Case invalide ou déjà occupée." };

    const icon = sender === this.playerX ? '❌' : '⭕';
    this.board[index] = icon;
    this.turns++;
    
    this.checkWinner();

    if (!this.winner && this.turns === 9) {
      this.isDraw = true;
    } else if (!this.winner) {
      this.currentTurn = (sender === this.playerX) ? this.playerO : this.playerX;
    }

    return { status: true };
  }

  checkWinner() {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
      [0, 4, 8], [2, 4, 6]              // Diagonales
    ];

    for (const [a, b, c] of winConditions) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winner = this.currentTurn;
        return;
      }
    }
  }

  /**
   * Rendu visuel du plateau pour WhatsApp
   */
  render() {
    const b = this.board.map((cell, i) => cell || `*${i + 1}*`);
    return `
*╭╼━≪• ɢʜᴏsᴛɢ-x ɢᴀᴍᴇ •≫━╾╮*
*┃*
*┃* ${b[0]}  |  ${b[1]}  |  ${b[2]}
*┃* ─────────
*┃* ${b[3]}  |  ${b[4]}  |  ${b[5]}
*┃* ─────────
*┃* ${b[6]}  |  ${b[7]}  |  ${b[8]}
*┃*
*╰━━━━━━━━━━━━━━━╯*`.trim();
  }
}

module.exports = TicTacToe;
