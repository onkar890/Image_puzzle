    const container = document.getElementById('puzzle-container');
    const moveCountSpan = document.getElementById('move-count');
    const timeCountSpan = document.getElementById('time-count');
    const difficultySelect = document.getElementById('difficulty');
    const uploadInput = document.getElementById('upload');
    const highScoresDiv = document.getElementById('high-scores');

    let gridSize = 3;
    let tileSize;
    let tiles = [];
    let moveCount = 0;
    let timeCount = 0;
    let timerInterval;
    let imageURL = '';

    // Load saved difficulty from localStorage
    const savedDifficulty = localStorage.getItem('puzzleDifficulty');
    if (savedDifficulty) {
      difficultySelect.value = savedDifficulty;
      gridSize = parseInt(savedDifficulty);
    }

    // Load high scores from localStorage
    let highScores = JSON.parse(localStorage.getItem('puzzleHighScores')) || {};
highScores = {
  3: typeof highScores[3] === 'number' ? highScores[3] : Infinity,
  4: typeof highScores[4] === 'number' ? highScores[4] : Infinity,
  5: typeof highScores[5] === 'number' ? highScores[5] : Infinity
};
    updateHighScoresDisplay();

    uploadInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        imageURL = URL.createObjectURL(file);
      } else {
        alert('Please upload a valid image file.');
        imageURL = 'https://picsum.photos/450';
        uploadInput.value = '';
      }
    });

    function startGame() {
      // Save selected difficulty
      gridSize = parseInt(difficultySelect.value);
      localStorage.setItem('puzzleDifficulty', gridSize);

      // Calculate tile size
      const containerWidth = Math.min(window.innerWidth * 0.9, 450);
      tileSize = containerWidth / gridSize;
      moveCount = 0;
      timeCount = 0;
      moveCountSpan.textContent = moveCount;
      timeCountSpan.textContent = `${timeCount}s`;
      tiles = [];
      container.innerHTML = '';

      // Clear previous timer
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeCount++;
        timeCountSpan.textContent = `${timeCount}s`;
      }, 1000);

      container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
      container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const index = row * gridSize + col;
          const tile = document.createElement('div');
          tile.className = 'tile';
          tile.style.width = `${tileSize}px`;
          tile.style.height = `${tileSize}px`;
          tile.style.backgroundImage = `url(${imageURL})`;
          tile.style.backgroundSize = `${containerWidth}px ${containerWidth}px`;
          tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;
          tile.dataset.index = index;

          tile.setAttribute('draggable', true);
          tile.addEventListener('dragstart', onDragStart);
          tile.addEventListener('dragover', onDragOver);
          tile.addEventListener('drop', onDrop);

          tiles.push(tile);
        }
      }

      // Shuffle tiles
      tiles = tiles.sort(() => Math.random() - 0.5);
      tiles.forEach(tile => container.appendChild(tile));
    }

    let draggedTile = null;

    function onDragStart(e) {
      draggedTile = e.target;
      setTimeout(() => draggedTile.classList.add('dragging'), 0);
    }

    function onDragOver(e) {
      e.preventDefault();
    }

    function onDrop(e) {
      e.preventDefault();
      const targetTile = e.target;

      // Ensure the target is a tile
      if (!targetTile.classList.contains('tile')) return;

      draggedTile.classList.remove('dragging');
      if (draggedTile === targetTile) return;

      // Get current positions
      const draggedIndex = Array.from(container.children).indexOf(draggedTile);
      const targetIndex = Array.from(container.children).indexOf(targetTile);

      // Clone tiles to avoid DOM reference issues
      const draggedClone = draggedTile.cloneNode(true);
      const targetClone = targetTile.cloneNode(true);

      // Re-attach event listeners to clones
      draggedClone.addEventListener('dragstart', onDragStart);
      draggedClone.addEventListener('dragover', onDragOver);
      draggedClone.addEventListener('drop', onDrop);
      targetClone.addEventListener('dragstart', onDragStart);
      targetClone.addEventListener('dragover', onDragOver);
      targetClone.addEventListener('drop', onDrop);

      // Replace tiles in the DOM
      container.replaceChild(targetClone, draggedTile);
      container.replaceChild(draggedClone, targetTile);

      moveCount++;
      moveCountSpan.textContent = moveCount;

      checkWin();
    }

    function checkWin() {
      const tiles = Array.from(container.children);
      const isSolved = tiles.every((tile, index) => parseInt(tile.dataset.index) === index);
      if (isSolved) {
        clearInterval(timerInterval);
        if (moveCount < highScores[gridSize]) {
          highScores[gridSize] = moveCount;
          localStorage.setItem('puzzleHighScores', JSON.stringify(highScores));
          updateHighScoresDisplay();
        }
        setTimeout(() => alert(`Congratulations! You solved the puzzle in ${moveCount} moves and ${timeCount} seconds.`), 100);
      }
    }

    function updateHighScoresDisplay() {
      highScoresDiv.innerHTML = `High Scores: 3x3: ${highScores[3] === Infinity ? '-' : highScores[3]} moves | 4x4: ${highScores[4] === Infinity ? '-' : highScores[4]} moves | 5x5: ${highScores[5] === Infinity ? '-' : highScores[5]} moves`;
    }
