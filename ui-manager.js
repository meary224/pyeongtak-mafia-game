class UIManager {
    constructor() {
        this.gameSetupEl = document.getElementById('gameSetup');
        this.gameBoardEl = document.getElementById('gameBoard');
        this.gameEndEl = document.getElementById('gameEnd');
        this.playerListEl = document.getElementById('playerList');
        this.gameStatusEl = document.getElementById('gameStatus');
        this.actionPanelEl = document.getElementById('actionPanel');
        this.startBtn = document.getElementById('startBtn');
        this.nextPhaseBtn = document.getElementById('nextPhaseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.playerCountInput = document.getElementById('playerCount');
        this.playerNamesInput = document.getElementById('playerNames');
        this.resultMessageEl = document.getElementById('resultMessage');
    }

    showGameSetup() {
        this.gameSetupEl.style.display = 'block';
        this.gameBoardEl.style.display = 'none';
        this.gameEndEl.style.display = 'none';
    }

    showGameBoard() {
        this.gameSetupEl.style.display = 'none';
        this.gameBoardEl.style.display = 'block';
        this.gameEndEl.style.display = 'none';
    }

    showGameEnd() {
        this.gameSetupEl.style.display = 'none';
        this.gameBoardEl.style.display = 'none';
        this.gameEndEl.style.display = 'block';
    }

    getPlayerNames() {
        const names = this.playerNamesInput.value.trim().split(',').map(n => n.trim()).filter(n => n);
        return names.length > 0 ? names : null;
    }

    getPlayerCount() {
        return parseInt(this.playerCountInput.value);
    }

    updateGameStatus(phase, description) {
        this.gameStatusEl.innerHTML = `
            <h3>${phase}</h3>
            <p>${description}</p>
        `;
    }

    renderPlayerList(players) {
        this.playerListEl.innerHTML = '';
        players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = `player-card ${player.alive ? 'alive' : 'dead'} player-${player.id}`;
            
            let roleDisplay = '';
            if (player.alive) {
                roleDisplay = `<div class="player-role">?</div>`;
            } else {
                roleDisplay = `<div class="player-role">${player.role}</div>`;
            }

            playerCard.innerHTML = `
                <div class="player-name ${player.alive ? '' : 'dead-marker'}">${player.name}</div>
                ${roleDisplay}
                <div class="player-status">${player.alive ? '생존' : '사망'}</div>
            `;

            this.playerListEl.appendChild(playerCard);
        });
    }

    renderActionPanel(actions, callback) {
        this.actionPanelEl.innerHTML = '';
        
        if (!actions || actions.length === 0) {
            this.actionPanelEl.innerHTML = '<p>현재 할 수 있는 행동이 없습니다.</p>';
            return;
        }

        const title = document.createElement('h3');
        title.textContent = '행동 선택';
        this.actionPanelEl.appendChild(title);

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'action-buttons';

        actions.forEach((action, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.textContent = action.text;
            btn.addEventListener('click', () => {
                callback(action.id, action.targetId);
                this.clearActionPanel();
            });
            buttonsDiv.appendChild(btn);
        });

        this.actionPanelEl.appendChild(buttonsDiv);
    }

    clearActionPanel() {
        this.actionPanelEl.innerHTML = '';
    }

    selectPlayer(playerId) {
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`.player-${playerId}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }

    deselectPlayer() {
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    showEndMessage(winnerTeam, players) {
        let message = '';
        
        if (winnerTeam === 'mafia') {
            message = '<h2>🎭 마피아 승리!</h2>';
        } else if (winnerTeam === 'citizen') {
            message = '<h2>🛡️ 시민 승리!</h2>';
        }

        message += '<p>게임 결과:</p><ul style="text-align: left; margin: 15px 0;">';
        
        players.forEach(player => {
            const roleText = player.role === 'mafia' ? '마피아 🎭' : 
                           player.role === 'police' ? '경찰 🔫' : '시민 👨';
            const statusText = player.alive ? '생존' : '사망';
            message += `<li><strong>${player.name}</strong> - ${roleText} (${statusText})</li>`;
        });
        
        message += '</ul>';
        
        this.resultMessageEl.innerHTML = message;
    }

    disableNextPhaseButton() {
        this.nextPhaseBtn.disabled = true;
        this.nextPhaseBtn.style.opacity = '0.5';
    }

    enableNextPhaseButton() {
        this.nextPhaseBtn.disabled = false;
        this.nextPhaseBtn.style.opacity = '1';
    }
}
