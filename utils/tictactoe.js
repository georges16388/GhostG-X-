/**
 * ᴛɪᴄ-ᴛᴀᴄ-ᴛᴏᴇ ɢᴀᴍᴇ ʟᴏɢɪᴄ - ᴘʀᴇᴍɪᴜᴍ ꜱᴍᴀʟʟ ᴄᴀᴘꜱ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

class TicTacToe {
  constructor(playerX, playerO) {
    this.playerX = playerX;
    this.playerO = playerO;
    this.board = Array(9).fill(null);
    this.currentTurn = playerX;
    this.turns = 0;
    this.winner = null;
    this.isTie = false;
  }

  /**
   * Jouer un coup
   * @param {boolean} isO - true si joueur O, false si X
   * @param {number} index - position 0-8
   */
  turn(isO, index) {
    if (this.winner || this.isTie) return false;
    if (this.board[index]) return false;

    this.board[index] = isO ? 'O' : 'X';
    this.turns++;

    this.checkWinner();

    if (!this.winner) {
      if (this.turns === 9) this.isTie = true;
      else this.currentTurn = isO ? this.playerX : this.playerO;
    }

    return true;
  }

  checkWinner() {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
      [0, 4, 8], [2, 4, 6]              // diagonales
    ];

    for (const [a, b, c] of winConditions) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winner = this.board[a] === 'X' ? this.playerX : this.playerO;
        return;
      }
    }
  }

  /**
   * Rendu visuel pour WhatsApp
   */
  render() {
    const icons = { 'X': '❌', 'O': '⭕', null: '⬜' };
    const grid = this.board.map((cell, i) => cell ? icons[cell] : `*${i + 1}*`);

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