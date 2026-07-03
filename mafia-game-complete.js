class MafiaGame {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.players = [];
        this.currentPhase = 'day'; // day, night, discussion, vote
        this.round = 1;
        this.gameActive = true;
        this.selectedPlayer = null;
    }

    initializeGame(playerNames) {
        // 플레이어 생성
        this.players = playerNames.map((name, index) => ({
            id: index + 1,
            name: name,
            role: null,
            alive: true
        }));

        // 역할 배정
        this.assignRoles();
        this.currentPhase = 'day';
        this.round = 1;
        this.gameActive = true;
    }

    assignRoles() {
        const playerCount = this.players.length;
        const mafiaCount = Math.ceil(playerCount / 3); // 1/3이 마피아
        const policeCount = Math.ceil(playerCount / 4); // 1/4이 경찰
        const citizenCount = playerCount - mafiaCount - policeCount;

        // 역할 배열 생성
        const roles = [];
        for (let i = 0; i < mafiaCount; i++) roles.push('mafia');
        for (let i = 0; i < policeCount; i++) roles.push('police');
        for (let i = 0; i < citizenCount; i++) roles.push('citizen');

        // 무작위로 섞기
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }

        // 플레이어에게 역할 배정
        this.players.forEach((player, index) => {
            player.role = roles[index];
        });
    }

    startGame() {
        this.uiManager.showGameBoard();
        this.updateDisplay();
    }

    updateDisplay() {
        this.uiManager.renderPlayerList(this.players);
        this.updatePhaseDisplay();
    }

    updatePhaseDisplay() {
        const dayCount = this.players.filter(p => p.alive).length;
        const mafiaCount = this.players.filter(p => p.alive && p.role === 'mafia').length;

        let phaseText = '';
        let description = '';

        if (this.currentPhase === 'day') {
            phaseText = `🌞 낮 시간 (라운드 ${this.round})`;
            description = `생존자: ${dayCount}명 | 마피아: ${mafiaCount}명<br>마을 사람들이 모여 누가 마피아인지 투표합니다.`;
        } else if (this.currentPhase === 'discussion') {
            phaseText = '💬 토론 시간';
            description = '플레이어들이 누가 마피아인지 이야기합니다. 아래에서 의심되는 사람을 선택하세요.';
        } else if (this.currentPhase === 'vote') {
            phaseText = '🗳️ 투표 시간';
            description = '의심되는 사람에게 투표하세요. 가장 많은 표를 받은 사람이 제거됩니다.';
        } else if (this.currentPhase === 'night') {
            phaseText = '🌙 밤 시간';
            description = '마피아는 제거할 시민을 선택합니다. 경찰은 보호할 사람을 선택합니다.';
        }

        this.uiManager.updateGameStatus(phaseText, description);
    }

    moveToNextPhase() {
        if (!this.gameActive) return;

        // 승리 조건 확인
        const gameResult = this.checkWinCondition();
        if (gameResult) {
            this.endGame(gameResult.winner, gameResult.message);
            return;
        }

        // 다음 페이즈로 이동
        if (this.currentPhase === 'day') {
            this.currentPhase = 'discussion';
        } else if (this.currentPhase === 'discussion') {
            this.currentPhase = 'vote';
        } else if (this.currentPhase === 'vote') {
            this.executeVote();
            
            // 투표 후 승리 조건 다시 확인
            const gameResult = this.checkWinCondition();
            if (gameResult) {
                this.endGame(gameResult.winner, gameResult.message);
                return;
            }
            
            this.currentPhase = 'night';
        } else if (this.currentPhase === 'night') {
            this.executeMafiaAction();
            this.round++;
            this.currentPhase = 'day';
        }

        this.updateDisplay();
    }

    executeVote() {
        // 더미 투표 처리 (실제 게임에서는 플레이어들이 투표)
        const alivePlayers = this.players.filter(p => p.alive);
        if (alivePlayers.length > 0) {
            const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            randomPlayer.alive = false;
        }
    }

    executeMafiaAction() {
        const aliveMafia = this.players.filter(p => p.alive && p.role === 'mafia');
        const aliveCitizens = this.players.filter(p => p.alive && p.role !== 'mafia');

        if (aliveMafia.length > 0 && aliveCitizens.length > 0) {
            const target = aliveCitizens[Math.floor(Math.random() * aliveCitizens.length)];
            target.alive = false;
        }
    }

    checkWinCondition() {
        const aliveMafia = this.players.filter(p => p.alive && p.role === 'mafia');
        const aliveCitizens = this.players.filter(p => p.alive && p.role !== 'mafia');

        if (aliveMafia.length === 0) {
            return { winner: 'citizen', message: '시민이 모든 마피아를 제거했습니다!' };
        }

        if (aliveMafia.length >= aliveCitizens.length) {
            return { winner: 'mafia', message: '마피아가 시민 수보다 많아졌습니다!' };
        }

        return null;
    }

    endGame(winner, message) {
        this.gameActive = false;
        this.uiManager.showGameEnd();
        this.uiManager.showEndMessage(winner, this.players);
    }

    resetGame() {
        this.players = [];
        this.currentPhase = 'day';
        this.round = 1;
        this.gameActive = true;
        this.selectedPlayer = null;
        this.uiManager.showGameSetup();
    }
}

// ===== 게임 초기화 =====
const uiManager = new UIManager();
let game = null;

// 게임 시작 버튼
uiManager.startBtn.addEventListener('click', () => {
    const playerNames = uiManager.getPlayerNames();
    
    if (!playerNames) {
        alert('플레이어 이름을 입력해주세요!');
        return;
    }

    if (playerNames.length < 5) {
        alert('최소 5명 이상이어야 합니다!');
        return;
    }

    game = new MafiaGame(uiManager);
    game.initializeGame(playerNames);
    game.startGame();
});

// 다음 단계 버튼
uiManager.nextPhaseBtn.addEventListener('click', () => {
    if (game) {
        game.moveToNextPhase();
    }
});

// 재시작 버튼
uiManager.restartBtn.addEventListener('click', () => {
    uiManager.playerNamesInput.value = '';
    uiManager.playerCountInput.value = '8';
    if (game) {
        game.resetGame();
    }
});

// 초기 화면 표시
uiManager.showGameSetup();
