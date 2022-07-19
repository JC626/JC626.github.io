const SnakeGame = class {
  static BOARD_BACKGROUND = "white";
  static BOARD_BORDER = "black";
  static PIXEL_LENGTH = 10;
  static MAX_FOOD = 5;

  static LEFT_KEY = 37;
  static RIGHT_KEY = 39;
  static UP_KEY = 38;
  static DOWN_KEY = 40;

  snakeBoard;
  snakeCtx;
  foodMap;
  numFood;

  snake;
  dx;
  dy;

  snakeScore;

  canvasID;

  /**
   * Create a new game of Snake.
   * @param {Number} canvasID ID of the Canvas element
   */
  constructor(canvasID) {
    this.canvasID = canvasID;
    this.snakeBoard = document.getElementById(canvasID);
    this.snakeCtx = this.snakeBoard.getContext("2d");
  }

  /**
   * Setup the snake game by registering the event listeners that initiate
   * Snake.
   */
  setupGame() {
    const parent = this;
    $("#open-snake-btn").on("click", function() {
      $("#arcade-modal").modal("hide");
      $("#snake-modal").modal("show");
      // Show default state
      $("#snake-score-heading").addClass("d-none");
      $("#snake-game-over").addClass("d-none");
      $("#snake-start-btn").removeClass("d-none");
      parent.snakeCtx.clearRect(
          0,
          0,
          parent.snakeBoard.width,
          parent.snakeBoard.height,
      );
    });
    $("#snake-start-btn").on("click", function(event) {
      parent.snakeCtx.clearRect(
          0,
          0,
          parent.snakeBoard.width,
          parent.snakeBoard.height,
      );
      $("#snake-start-btn").addClass("d-none");
      $("#snake-score").removeClass("d-none");
      parent.resetSnake();
    });

    parent.snakeBoard.addEventListener(
        "keydown",
        // Bind so we can reference fields from snakeGame
        parent.changeSnakeDirection.bind(this),
    );
  }

  /**
   * Reset the state of the snake game to its initial state.
   * Initial state is where the score is 0, snake starts at the center of the
   * board moving right and no food is on the board.
   */
  resetSnake() {
    $("#snake-game-over").addClass("d-none");
    $("#snake-score-heading").removeClass("d-none");
    this.snakeScore = 0;
    this.numFood = 0;
    $("#snake-score").text(this.snakeScore);
    // Reset snake's starting position
    this.snake = [];
    const defaultX = this.snakeBoard.width / 2;
    const defaultY = this.snakeBoard.width / 2;

    for (let i = 0; i < 5; i++) {
      this.snake.push({
        x: defaultX - i * SnakeGame.PIXEL_LENGTH,
        y: defaultY,
      });
    }
    this.foodMap = new Map();
    // Always start the snake moving right
    this.dx = SnakeGame.PIXEL_LENGTH;
    this.dy = 0;
    // Pause the snake's position momentarily before starting
    this.clearBoard();
    this.snakeBoard.focus();
    this.drawSnake();
    const parent = this;
    // Only start snake game after a delay of 100ms
    setTimeout(function() {
      // Bind so we can reference fields from snakeGame
      setTimeout(parent.runSnake.bind(parent), 100);
    }, 100);
  }

  /**
   * Run the snake game by updating what is shown on the board until
   * the game is over or the board is hidden (as the modal disappeared).
   */
  runSnake() {
    if (this.gameOver() || !$("#snake-modal").hasClass("show")) {
      if ($("#snake-modal").hasClass("show")) {
        $("#snake-game-over").removeClass("d-none");
        this.snakeCtx.globalAlpha = 0.1;
        this.snakeCtx.fillStyle = "grey";
        this.snakeCtx.fillRect(
            0,
            0,
            this.snakeBoard.width,
            this.snakeBoard.height,
        );
      }
    }
    else {
      // Randomly add food at different timings
      if (
        this.numFood < 1 ||
        (Math.random() < 0.12 / this.numFood &&
          this.numFood < SnakeGame.MAX_FOOD)
      ) {
        this.createFood();
      }
      this.clearBoard();

      for (const foodX of this.foodMap.keys()) {
        for (const foodY of this.foodMap.get(foodX)) {
          this.drawFood(foodX, foodY);
        }
      }
      this.moveSnake();
      this.drawSnake();
      // Bind so we can reference fields from snakeGame
      setTimeout(this.runSnake.bind(this), 100);
    }
  }

  /**
   * Draw the snake on the board.
   */
  drawSnake() {
    const parent = this;
    this.snake.forEach(function drawSnakePart(snakePart) {
      parent.snakeCtx.fillStyle = "lightblue";
      parent.snakeCtx.strokestyle = "darkblue";
      parent.snakeCtx.fillRect(
          snakePart.x,
          snakePart.y,
          SnakeGame.PIXEL_LENGTH,
          SnakeGame.PIXEL_LENGTH,
      );
      parent.snakeCtx.strokeRect(
          snakePart.x,
          snakePart.y,
          SnakeGame.PIXEL_LENGTH,
          SnakeGame.PIXEL_LENGTH,
      );
    });
  }

  /**
   * Clear all objects on the board.
   */
  clearBoard() {
    this.snakeCtx.globalAlpha = 1;
    //  Select the colour to fill the drawing
    this.snakeCtx.fillStyle = SnakeGame.BOARD_BACKGROUND;
    //  Select the colour for the border of the snakeBoard
    this.snakeCtx.strokestyle = SnakeGame.BOARD_BORDER;
    // Draw a "filled" rectangle to cover the entire snakeBoard
    this.snakeCtx.fillRect(0, 0, this.snakeBoard.width, this.snakeBoard.height);
    // Draw a "border" around the entire snakeBoard
    this.snakeCtx.strokeRect(
        0,
        0,
        this.snakeBoard.width,
        this.snakeBoard.height,
    );
  }

  /**
   * Move snake by one game pixel based on the direction it is moving towards.
   */
  moveSnake() {
    const head = {
      x: this.snake[0].x + this.dx,
      y: this.snake[0].y + this.dy,
    };
    this.snake.unshift(head);
    // Snake has eaten food
    if (this.foodMap.has(head.x) && this.foodMap.get(head.x).has(head.y)) {
      this.foodMap.get(head.x).delete(head.y);
      if (this.foodMap.get(head.x).size === 0) {
        this.foodMap.delete(head.x);
      }
      this.numFood--;
      this.createFood();
      this.snakeScore++;
      $("#snake-score").text(this.snakeScore);
    }
    else {
      this.snake.pop();
    }
  }

  /**
   * Determine the direction the snake is travelling based on the user's
   * keyboard input.
   * @param {Event} event An event triggered by a user's key press
   */
  changeSnakeDirection(event) {
    event.preventDefault();
    const keyPressed = event.keyCode;
    const goingUp = this.dy === -SnakeGame.PIXEL_LENGTH;
    const goingDown = this.dy === SnakeGame.PIXEL_LENGTH;
    const goingRight = this.dx === SnakeGame.PIXEL_LENGTH;
    const goingLeft = this.dx === -SnakeGame.PIXEL_LENGTH;

    if (keyPressed === SnakeGame.LEFT_KEY && !goingRight) {
      this.dx = -SnakeGame.PIXEL_LENGTH;
      this.dy = 0;
    }
    else if (keyPressed === SnakeGame.UP_KEY && !goingDown) {
      this.dx = 0;
      this.dy = -SnakeGame.PIXEL_LENGTH;
    }
    else if (keyPressed === SnakeGame.RIGHT_KEY && !goingLeft) {
      this.dx = SnakeGame.PIXEL_LENGTH;
      this.dy = 0;
    }
    else if (keyPressed === SnakeGame.DOWN_KEY && !goingUp) {
      this.dx = 0;
      this.dy = SnakeGame.PIXEL_LENGTH;
    }
  }

  /**
   * Determine whether the game is over and should be stopped.
   * @return {boolean} Whether the game is over
   */
  gameOver() {
    for (let i = 4; i < this.snake.length; i++) {
      // Has the snake collided?
      if (
        this.snake[i].x === this.snake[0].x &&
        this.snake[i].y === this.snake[0].y
      ) {
        return true;
      }
    }
    const hitLeftWall = this.snake[0].x < 0;
    const hitRightWall =
      this.snake[0].x >= this.snakeBoard.width - SnakeGame.PIXEL_LENGTH;
    const hitTopWall = this.snake[0].y < 0;
    const hitBottomWall =
      this.snake[0].y >= this.snakeBoard.height - SnakeGame.PIXEL_LENGTH;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
  }

  /**
   * Create a random coordinate between the min and max values (inclusive).
   * @param {number} min Minimum boundary value
   * @param {number} max Maximum boundary value
   * @return {number} A coordinate.
   */
  createCoordinate(min, max) {
    return (
      Math.round((Math.random() * (max - min) + min) / SnakeGame.PIXEL_LENGTH) *
      SnakeGame.PIXEL_LENGTH
    );
  }

  /**
   * Add new food to the game board.
   * @return {boolean} Whether food has been added to the game or not.
   */
  createFood() {
    const foodX = this.createCoordinate(
        0,
        this.snakeBoard.width - SnakeGame.PIXEL_LENGTH,
    );
    const foodY = this.createCoordinate(
        0,
        this.snakeBoard.height - SnakeGame.PIXEL_LENGTH,
    );

    let hasAteFood;
    this.snake.forEach(function snakeAteFood(part) {
      if (part.x === foodX && part.y === foodY) {
        hasAteFood = createFood();
      }
    });
    const foodSet = this.foodMap.get(foodX) || new Set();
    if (hasAteFood) {
      if (foodSet.has(foodY)) {
        numFood--;
        foodSet.delete(foodY);
        if (foodSet.size === 0) {
          this.foodMap.delete(foodX);
        }
      }
    }
    else if (this.numFood < SnakeGame.MAX_FOOD) {
      foodSet.add(foodY);
      this.foodMap.set(foodX, foodSet);
      this.numFood++;
    }
    return !hasAteFood;
  }

  /**
   * Draw food onto the snake board.
   * @param {number} x X axis of where to draw food relative to the board
   * @param {number} y Y axis of where to draw food relative to the board
   */
  drawFood(x, y) {
    this.snakeCtx.fillStyle = "lightgreen";
    this.snakeCtx.strokestyle = "darkgreen";
    this.snakeCtx.fillRect(
        x,
        y,
        SnakeGame.PIXEL_LENGTH,
        SnakeGame.PIXEL_LENGTH,
    );
    this.snakeCtx.strokeRect(
        x,
        y,
        SnakeGame.PIXEL_LENGTH,
        SnakeGame.PIXEL_LENGTH,
    );
  }
};
