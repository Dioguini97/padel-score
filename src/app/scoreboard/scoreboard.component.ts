import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.css'
})
export class ScoreboardComponent {

  message: string = 'Let\'s Get Started!'; 

  isTiebreak: boolean = false;

  gamesForWinningSet: number = 6;
  setsForWinningMatch: number = 3;

  gamesPerSetTeamA: number[] = [];
  gamesPerSetTeamB: number[] = [];

  pointsPerGame: string[] = [];

  game: number = 1;
  set: number = 1;

  teamANumberOfSets: number = 0;
  teamBNumberOfSets: number = 0;

  teamANumberOfGamesThisSet: number = 0;
  teamBNumberOfGamesThisSet: number = 0;

  teamAPointsThisGame: number = 0;
  teamBPointsThisGame: number = 0;

  teamAScoreThisGame: number | string = 0;
  teamBScoreThisGame: number | string = 0;

  isDeuce: boolean = false;

  addPointToTeamA() {
    this.checkIfGameIsDeuced();
    this.teamAPointsThisGame++;
    this.message = 'Point to Team A!';
    this.checkForGameOver();
  }

  addPointToTeamB() {
    this.checkIfGameIsDeuced();
    this.teamBPointsThisGame++;
    this.message = 'Point to Team B!';
    this.checkForGameOver();
  }

  checkIfGameIsDeuced() {
    if (this.teamAPointsThisGame === 3 && this.teamBPointsThisGame === 3) {
      this.isDeuce = true;
      this.message = 'Deuce!';
    }
  }

  checkForTiebreakGame() {
    if (this.teamANumberOfGamesThisSet === this.gamesForWinningSet && this.teamBNumberOfGamesThisSet === this.gamesForWinningSet) {
      this.isTiebreak = true;
      this.message = 'Tiebreak!';
    };
  }

  checkForGameOver() {
    if (this.isTiebreak) {
      if ((this.teamAPointsThisGame >= 7 || this.teamBPointsThisGame >= 7) && (Math.abs(this.teamAPointsThisGame - this.teamBPointsThisGame) > 1)) {
        this.closeCurrentGame();
        this.closeCurrentSet();
      }
    }
    else if (this.isDeuce) {
      if (Math.abs(this.teamAPointsThisGame - this.teamBPointsThisGame) == 2) {
        this.closeCurrentGame();
      }
    }
    else {
      if (this.teamAPointsThisGame > 3 || this.teamBPointsThisGame > 3) {
        this.closeCurrentGame();
      }
    }
  }

  checkForSetOver() {
    if ((this.teamANumberOfGamesThisSet >= this.gamesForWinningSet || this.teamBNumberOfGamesThisSet >= this.gamesForWinningSet) && (Math.abs(this.teamANumberOfGamesThisSet - this.teamBNumberOfGamesThisSet) >= 2)) {
      this.closeCurrentSet();
    }
  }

  isDeucedGame() {
    if ((this.teamAPointsThisGame >= 3 && this.teamBPointsThisGame >= 3) && (this.teamAPointsThisGame === this.teamBPointsThisGame)) {
      this.isDeuce = true;
    };
  }

  isTiebreakGame() {
    if (this.teamANumberOfGamesThisSet === this.gamesForWinningSet && this.teamBNumberOfGamesThisSet === this.gamesForWinningSet) {
      this.isTiebreak = true;
    }
  }

  closeCurrentGame() {
    let pontos = this.pointsToScore(this.teamAPointsThisGame, this.teamBPointsThisGame);
    this.pointsPerGame.push(pontos);
    if (this.teamAPointsThisGame > this.teamBPointsThisGame) {
      this.teamANumberOfGamesThisSet++;
      this.message = 'Game to Team A!';
    }
    else {
      this.teamBNumberOfGamesThisSet++;
      this.message = 'Game to Team B!';
    }
    this.isDeuce = false;
    this.teamAPointsThisGame = 0;
    this.teamBPointsThisGame = 0;
    this.game++;
    this.checkForTiebreakGame();
    this.checkForSetOver();
  }

  closeCurrentSet() {
    if (this.teamANumberOfGamesThisSet > this.teamBNumberOfGamesThisSet) {
      this.teamANumberOfSets++;
      this.message = 'Set to Team A!';
    } else {
      this.teamBNumberOfSets++;
      this.message = 'Set to Team B!';
    }
    this.gamesPerSetTeamA.push(this.teamANumberOfGamesThisSet);
    this.gamesPerSetTeamB.push(this.teamBNumberOfGamesThisSet);
    this.teamANumberOfGamesThisSet = 0;
    this.teamBNumberOfGamesThisSet = 0;
    this.teamAPointsThisGame = 0;
    this.teamBPointsThisGame = 0;
    this.set++;
    this.game = 1;
    this.isTiebreak = false;
    this.isDeuce = false;
  }

  checkIfSetIsOver() {
    if ((this.teamANumberOfGamesThisSet >= this.gamesForWinningSet || this.teamBNumberOfGamesThisSet >= this.gamesForWinningSet) && (Math.abs(this.teamANumberOfGamesThisSet - this.teamBNumberOfGamesThisSet)) >= 2) {
      this.closeCurrentSet();
    }
    else if (this.teamANumberOfGamesThisSet === this.gamesForWinningSet && this.teamBNumberOfGamesThisSet === this.gamesForWinningSet) {
      // tiebreak
      this.isTiebreak = true;
    }
  }

  pointsToScore(pointA: number, pointB: number): string {
    if (this.isTiebreak) {
      return pointA.toString() + ' - ' + pointB.toString();
    }
    else if (this.isDeuce) {
      switch (pointA - pointB) {
        case 0:
          this.message = 'Deuce!'
          return '40 - 40';
        case 1:
          this.message = 'Advantage Team A!';
          return 'A - 40';
        case -1:
          this.message = 'Advantage Team B!';
          return '40 - A';
        case 2:
          this.message = 'Game Team A!';
          return 'W - 40';
        case -2:
          this.message = 'Game Team B!';
          return '40 - W';
      }
    }
    else {
      return this.pointToScore(pointA) + ' - ' + this.pointToScore(pointB);
    }
    return '';
  }

  pointToScore(point: number): string {
    switch (point) {
      case 0:
        return '0';
      case 1:
        return '15';
      case 2:
        return '30';
      case 3:
        return '40';
      default:
        return 'W';
    }
  }


}
