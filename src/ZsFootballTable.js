'use strict';

import templates from './ZsFootballTable.soy';
import Component from 'metal-component';
import Soy from 'metal-soy';

class ZsFootballTable extends Component  {
	created() {
		if (!this.rounds) {
			this.rounds = this.processMatches_();
		}

		this.selectedRound = this.rounds.length;
	}

	/**
	 * @param {Club} club
	 * @param {Number} goalFor
	 * @param {Number} goalAgainst
	 */
	addPoints_(club, goalFor, goalAgainst) {
		club.goalAgainst += goalAgainst;
		club.goalFor += goalFor;
		club.played += 1;

		if (goalFor > goalAgainst) {
			club.points += 3;
			club.won += 1;
		}
		else if (goalFor === goalAgainst) {
			club.points += 1;
			club.drawn += 1;
		}
		else {
			club.lost += 1;
		}
	}

	/**
	 *
	 */
	calculateRowClass_(club) {
		var className = '';

		if (club) {
			switch (club.position) {
				case 1:
					className = 'first';
					break;
				case 2:
					className = 'second';
					break;
				case 3:
					className = 'third';
					break;
				case 4:
					className = 'fourth';
					break;
				case 5:
					className = 'fifth';
					break;
				case 18:
					className = 'eighteenth';
					break;
				case 19:
					className = 'nineteenth';
					break;
				case 20:
					className = 'twentieth';
					break;
			}
		}

		return className;
	}

	/**
	 * @param {Event} event
	 */
	changeTableContents(event) {
		let rangeElement = event.delegateTarget;

		this.selectedRound = rangeElement.value;
	}

	/**
	 * @param {Object} clubRound
	 */
	cloneClubRound_(clubRound) {
		var object = {};

		Object.keys(clubRound).forEach(function(key) {
			let object2 = {};
			let club = clubRound[key];

			Object.keys(club).forEach(function(key2) {
				object2[key2] = club[key2];
			});

			object[key] = object2;
		});

		return object;
	}

	/**
	 * Generates a rounds object from the given matches.
	 * @param {Array} matches
	 */
	makeClubRounds_(matches) {
		var clubRounds = {};

		for (let i = 0; i < matches.length; i++) {
			let match = matches[i];

			let club1Name = match.homeClub;
			let club2Name = match.awayClub;
			let round = match.round;

			let clubRound = clubRounds[round] || (clubRounds[round - 1] ? this.cloneClubRound_(clubRounds[round - 1]) : {});

			let club1 = clubRound[club1Name];

			if (!club1) {
				club1 = {
					position: 0,
					lastPosition: 0,
					club: club1Name,
					played: 0,
					won: 0,
					drawn: 0,
					lost: 0,
					goalFor: 0,
					goalAgainst: 0,
					points: 0
				};
			}

			this.addPoints_(club1, match.homeGoals, match.awayGoals);

			clubRound[club1Name] = club1;

			let club2 = clubRound[club2Name];

			if (!club2) {
				club2 = {
					position: 0,
					lastPosition: 0,
					club: club2Name,
					played: 0,
					won: 0,
					drawn: 0,
					lost: 0,
					goalFor: 0,
					goalAgainst: 0,
					points: 0
				};
			}

			this.addPoints_(club2, match.awayGoals, match.homeGoals);

			clubRound[club2Name] = club2;

			clubRounds[round] = clubRound;
		}

		return clubRounds;
	}

	/**
	 * Transform the received matches objects to rounds
	 *
	 */
	processMatches_() {
		var clubRounds = this.makeClubRounds_(this.matches),
			rounds = [],
			clubPositions = {};


		Object.keys(clubRounds).forEach(function(key) {
			let clubRound = clubRounds[key];
			let round = [];

			Object.keys(clubRound).forEach(function(club) {
				round.push(clubRound[club]);
			});

			round.sort(function(club1, club2) {
				var pointsDifference = club1.points - club2.points;

				if (pointsDifference !== 0) {
					return pointsDifference;
				}
				else {
					let club1GoalDifference = club1.goalFor - club1.goalAgainst;
					let club2GoalDifference = club2.goalFor - club2.goalAgainst;

					if (club1GoalDifference !== club2GoalDifference) {
						return club1GoalDifference - club2GoalDifference;
					}
					else {
						return club1.goalFor - club2.goalFor;
					}
				}
			});

			round.reverse();

			round.forEach(function(club, index) {
				let clubName = club.club,
					lastPosition = clubPositions[clubName] || 0;

				club.position = clubPositions[clubName] = index + 1;
				club.lastPosition = lastPosition;
			});

			rounds.push(round);
		});

		return rounds;
	}
}
Soy.register(ZsFootballTable, templates);

/**
 *
 */
ZsFootballTable.STATE = {
	/**
	 * tableConfig
	 * @type {object}
	 */
	tableConfig: {
		valueFn: 'calculateRowClass_'
	},

	/**
	 * columConfig
	 * @type {object}
	 */
	columnConfig: {
		value: {
			position: true,
			lastPosition: true,
			club: true,
			played: true,
			won: true,
			drawn: true,
			lost: true,
			goalFor: true,
			goalAgainst: true,
			points: true
		}
	},

	/**
	 * Matches
	 * @type {Array}
	 */
	matches: {
		validator: Array.isArray,
		value: []
	},

	/**
	 * Rounds
	 * @type {Array}
	 */
	rounds: {
		validator: Array.isArray
	},

	/**
	 * 
	 * @type {Number}
	 */
	selectedRound: {
		value: 0
	},

	/**
	 * Column names
	 * @type {string}
	 */
	tableColumnNames: {
		value: {
			position:'Pos',
			lastPosition: 'Last Pos',
			club: 'Club',
			played: 'Played',
			won: 'Won',
			drawn: 'Drawn',
			lost: 'Lost',
			goalFor: 'Goal For',
			goalAgainst: 'Goal Against',
			points: 'Points'
		}
	},

	/**
	 * Column Css names
	 * @type {string}
	 */
	tableColumnClassNames: {
		value: ['position','last-position','club','played','won','drawn','lost','goal-for','goal-against','point']
	}
};

export default ZsFootballTable;
