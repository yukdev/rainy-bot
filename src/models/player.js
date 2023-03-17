// Player class for game of Mafia
class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.alive = true;
    this.nominated = false;
    this.voted = false;
    this.protected = false;
  }

  // kill this player
  kill() {
    this.alive = false;
  }

  removeProtection() {
    this.protected = false;
  }
}

class Mafia extends Player {
  constructor(name, id) {
    super(name, id);
    this.role = 'mafia';
    this.description =
      '\nYou are a member of the mafia.\nYou win when all townies are dead.\nEvery night, you can discuss with your fellow mafia to choose someone to kill.';
  }
}

class Townie extends Player {
  constructor(name, id) {
    super(name, id);
    this.role = 'townie';
    this.description =
      '\nYou are a townie.\nYou win when all mafia are dead.\nPlease work together with your fellow townies to find and kill all mafia.';
  }
}

class Cop extends Townie {
  constructor(name, id) {
    super(name, id);
    this.role = 'cop';
    this.roleExplanation = `\nIn addition to being a townie, you are a **${this.role}**.\nEvery night, you have the ability to investigate a player to see if they are a member of the mafia.`;
    this.checkedPlayer = null;
  }

  // actions
  investigate(player) {
    this.checkedPlayer = player.name;
    return player.role === 'mafia' ? 'mafia' : 'townie';
  }

  reset() {
    this.checkedPlayer = null;
  }
}

class Medic extends Townie {
  constructor(name, id) {
    super(name, id);
    this.role = 'medic';
    this.roleExplanation = `\nIn addition to being a townie, you are a **${this.role}**.\nEvery night, you have the ability to protect a player from being killed.\nYou cannot protect yourself nor can you protect the same person twice in a row.`;
    this.protectedPlayer = null;
  }

  protect(player) {
    player.protected = true;
    this.protectedPlayer = player.name;
  }

  reset() {
    this.protectedPlayer = null;
  }
}

// class Vigilante extends Townie {
//   constructor(name, id) {
//     super(name, id);
//     this.roleExplanation = `\nIn addition to being a townie, you are a **${this.role}**.\nYou have the ability to kill a player only once at night.`;
//   }
// }

module.exports = {
  Player,
  Mafia,
  Townie,
  Cop,
  Medic,
  // Vigilante,
};