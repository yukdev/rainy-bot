import type { ChatInputCommandInteraction, Message } from 'discord.js';
import type { Player } from './player';
import { Cop, Medic } from './player';

/**
 * Mafia Game Class
 */
export class Game {
	id: string;
	interaction: ChatInputCommandInteraction;
	players: Player[];
	votes: Record<string, number>;
	accused: Player | null;
	inProgress: boolean;
	state: 'setup' | 'nomination' | 'defense' | 'hanging';
	nominationMessages: Message[];
	day: number;
	cycle: 'day' | 'night';
	dayTime: number;
	dayOver: boolean;
	timerIntervalId: NodeJS.Timeout | string | number | undefined;

	constructor(interaction: ChatInputCommandInteraction, id: string) {
		this.id = id;
		this.interaction = interaction;
		this.players = [];
		this.votes = {};
		this.accused = null;
		this.inProgress = false;
		this.state = 'setup';
		this.nominationMessages = [];
		this.day = 0;
		this.cycle = 'day';
		this.dayTime = 300;
		this.dayOver = false;
		this.timerIntervalId;
	}

	checkForWin() {
		const allTowniesDead = this.players
			.filter((p) => p.role === 'townie')
			.every((p) => p.alive === false);
		const allMafiaDead = this.players
			.filter((p) => p.role === 'mafia')
			.every((p) => p.alive === false);
		const mafiaIsMajority =
			this.players.filter((p) => p.role === 'mafia').length >=
			this.players.length / 2;

		if (allTowniesDead || mafiaIsMajority) {
			return 'mafia';
		}
		if (allMafiaDead) {
			return 'townies';
		}

		return;
	}

	addPlayer(player: Player) {
		this.players.push(player);
	}

	vote(voter: Player, target: Player) {
		if (this.votes[target.name]) {
			this.votes[target.name] += 1;
		} else {
			this.votes[target.name] = 1;
		}
		voter.voted = true;
	}

	determineHanging() {
		// check if there is a majority vote
		const majorityExists = Object.values(this.votes).some(
			(vote) => vote > this.players.length / 2,
		);

		return majorityExists;
	}

	clearVotes() {
		this.votes = {};
		this.players.forEach((p) => (p.voted = false));
		this.accused = null;
	}

	startDayTimer(callback) {
		this.timerIntervalId = setInterval(async () => {
			this.dayTime -= 1;
			console.log('startTimer: ', this.dayTime);
			if (this.dayTime <= 0) {
				clearInterval(this.timerIntervalId);
				if (this.state !== 'defense' && this.state !== 'hanging') {
					// not sure if this is correct
					if (this.interaction.channel) {
						await this.interaction.channel.send(
							'**Time is up!** It is now night time.',
						);
					}
					// delete all nomination messages
					this.nominationMessages.forEach(
						async (m) => await m.delete(),
					);
					callback();
				}
			}
		}, 1000);
	}

	pauseDayTimer() {
		console.log('pauseTimer: ', this.dayTime);
		clearInterval(this.timerIntervalId);
	}

	getTimeLeft() {
		const minutesLeft = Math.floor(this.dayTime / 60);
		const secondsLeft = this.dayTime % 60;
		let timeLeftSentence = '';

		if (this.dayTime === 60) {
			timeLeftSentence = 'There is 1 minute left.';
		} else if (this.dayTime === 0) {
			timeLeftSentence = 'Time is up!';
		} else {
			timeLeftSentence = 'There ';

			if (secondsLeft > 1 || minutesLeft > 1) {
				timeLeftSentence += 'are ';
			} else {
				timeLeftSentence += 'is ';
			}

			if (minutesLeft > 0) {
				timeLeftSentence += `${minutesLeft} minute${
					minutesLeft === 1 ? '' : 's'
				}`;
			}

			if (secondsLeft > 0) {
				if (minutesLeft > 0) {
					timeLeftSentence += ' and ';
				}
				timeLeftSentence += `${secondsLeft} second${
					secondsLeft === 1 ? '' : 's'
				}`;
			}

			timeLeftSentence += ' left.';
		}

		return timeLeftSentence;
	}

	setupNewDay() {
		this.day += 1;
		this.cycle = 'day';
		this.dayTime = 300;
		this.timerIntervalId = undefined;
		this.clearVotes();
		this.players.forEach((p) => {
			if (p.alive) {
				if (p instanceof Cop || p instanceof Medic) {
					p.reset();
				}
				if (p.protected) {
					p.removeProtection();
				}
			}
			p.voted = false;
		});
	}
}
