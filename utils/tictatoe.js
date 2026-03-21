/**
 * TicTacToe Game Logic - AGM Game-Engine
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

class TicTacToe {
  constructor(playerX, playerO) {
    this.playerX = playerX; // JID du Joueur X
    this.playerO = playerO; // JID du Joueur O
    this.board = Array(9).fill(null);
    this.currentTurn = playerX;
    this.turns = 0;
    this.winner = null;
    this.isTie = false;
  }

  /**
   * Exécuter un coup
   * @param {string} playerJid - JID du joueur qui joue
   * @param {number} index - Position (0-8)
   */
  turn(playerJid, index) {
    if (this.winner || this.isTie) return { status: false, msg: 'ɢᴀᴍᴇ ᴀʟʀᴇᴀᴅʏ ᴏᴠᴇʀ' };
    if (playerJid !== this.currentTurn) return { status: false, msg: 'ɴᴏᴛ ʏᴏᴜʀ ᴛᴜʀɴ' };
    if (index < 0 || index > 8 || this.board[index]) return { status: false, msg: 'ɪɴᴠᴀʟɪᴅ ᴍᴏᴠᴇ' };

    const isO = playerJid === this.playerO;
    this.board[index] = isO ? 'O' : 'X';
    this.turns++;
    
    this.checkWinner();

    if (!this.winner) {
      if (this.turns === 9) {
        this.isTie = true;
      } else {
        // Switch de tour
        this.currentTurn = isO ? this.playerX : this.playerO;
      }
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
        this.winner = this.board[a] === 'X' ? this.playerX : this.playerO;
        return;
      }
    }
  }

  /**
   * Rendu visuel de la grille pour WhatsApp
   */
  render() {
    const icons = {
      'X': '❌',
      'O': '⭕',
      null: '⬜'
    };

    let grid = this.board.map((cell, i) => {
      const icon = cell ? icons[cell] : `*${i + 1}*`;
      return icon;
    });

    return `
╭╼━≪• ᴛɪᴄ-ᴛᴀᴄ-ᴛᴏᴇ •≫━╾╮
┃  ${grid[0]}  ┃  ${grid[1]}  ┃  ${grid[2]}  ┃
┃  ${grid[3]}  ┃  ${grid[4]}  ┃  ${grid[5]}  ┃
┃  ${grid[6]}  ┃  ${grid[7]}  ┃  ${grid[8]}  ┃
╰━━━━━━━━━━━━━━━╯
`.trim();
  }
}

module.exports = TicTacToe;
