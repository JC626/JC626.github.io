let SnakeGame = class {
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

  // FIXME need a bunch of IDs to prepare the game?
  constructor(canvasID) {
    this.canvasID = canvasID;
    this.snakeBoard = document.getElementById(canvasID);
    this.snakeCtx = this.snakeBoard.getContext("2d");
  }

  setupGame() {
    let parent = this;
    $("#open-snake-btn").on("click", function() {
      $("#arcade-modal").modal("hide");
      $("#snake-modal").modal("show");
      // Show default state
      $("#snake-score-heading").addClass("d-none");
      $("#snake-game-over").addClass("d-none");
      $("#snake-start-btn").removeClass("d-none");
      parent.snakeCtx.clearRect(0, 0, parent.snakeBoard.width, parent.snakeBoard.height);
    })
    $("#snake-start-btn").on("click", function(event) {
      parent.snakeCtx.clearRect(0, 0, parent.snakeBoard.width, parent.snakeBoard.height);
      $(this).addClass("d-none");
      $("#snake-score").removeClass("d-none");
      parent.resetSnake();
    })

    parent.snakeBoard.addEventListener("keydown", parent.changeSnakeDirection.bind(this));
  }


  resetSnake() {
    $("#snake-game-over").addClass("d-none");
    $("#snake-score-heading").removeClass("d-none");
    this.snakeScore = 0;
    this.numFood = 0;
    $("#snake-score").text(this.snakeScore);
    // Reset snake's starting position
    this.snake = [];
    let defaultX = this.snakeBoard.width / 2;
    let defaultY = this.snakeBoard.width / 2;

    for (let i = 0; i < 5; i++) {
      this.snake.push({
        x: defaultX - i * SnakeGame.PIXEL_LENGTH,
        y: defaultY
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
    let parent = this;
    setTimeout(function() {
      setTimeout(parent.startSnake.bind(parent), 100);
    }, 100)
  }


  startSnake() {
    if (this.gameOver() || !$("#snake-modal").hasClass("show")) {
      if ($("#snake-modal").hasClass("show")) {
        $("#snake-game-over").removeClass("d-none");
        this.snakeCtx.globalAlpha = 0.1;
        this.snakeCtx.fillStyle = "grey";
        this.snakeCtx.fillRect(0, 0, this.snakeBoard.width, this.snakeBoard.height);
      }
    }
    else {
      // Randomly add food at different timings
      if (this.numFood < 1 || (Math.random() < (0.12 / this.numFood) && this.numFood < SnakeGame.MAX_FOOD)) {
        this.createFood();
      }
      this.clearBoard();

      for (let foodX of this.foodMap.keys()) {
        for (let foodY of this.foodMap.get(foodX)) {
          this.drawFood(foodX, foodY);
        }
      }
      this.moveSnake();
      this.drawSnake();
      setTimeout(this.startSnake.bind(this), 100);
    }
  }

  drawSnake() {
    let parent = this;
    this.snake.forEach(function drawSnakePart(snakePart) {
      parent.snakeCtx.fillStyle = "lightblue";
      parent.snakeCtx.strokestyle = "darkblue";
      parent.snakeCtx.fillRect(snakePart.x, snakePart.y, SnakeGame.PIXEL_LENGTH, SnakeGame.PIXEL_LENGTH);
      parent.snakeCtx.strokeRect(snakePart.x, snakePart.y, SnakeGame.PIXEL_LENGTH, SnakeGame.PIXEL_LENGTH);
    });
  }

  clearBoard() {
    this.snakeCtx.globalAlpha = 1;
    //  Select the colour to fill the drawing
    this.snakeCtx.fillStyle = SnakeGame.BOARD_BACKGROUND;
    //  Select the colour for the border of the snakeBoard
    this.snakeCtx.strokestyle = SnakeGame.BOARD_BORDER;
    // Draw a "filled" rectangle to cover the entire snakeBoard
    this.snakeCtx.fillRect(0, 0, this.snakeBoard.width, this.snakeBoard.height);
    // Draw a "border" around the entire snakeBoard
    this.snakeCtx.strokeRect(0, 0, this.snakeBoard.width, this.snakeBoard.height);
  }

  moveSnake() {
    let head = {
      x: this.snake[0].x + this.dx,
      y: this.snake[0].y + this.dy
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

  changeSnakeDirection(event) {
    console.log(this);
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

  gameOver() {
    for (let i = 4; i < this.snake.length; i++) {
      // Has the snake collided?
      if (this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y) {
        return true;
      }
    }
    const hitLeftWall = this.snake[0].x < 0;
    const hitRightWall = this.snake[0].x >= this.snakeBoard.width - SnakeGame.PIXEL_LENGTH;
    const hitTopWall = this.snake[0].y < 0;
    const hitBottomWall = this.snake[0].y >= this.snakeBoard.height - SnakeGame.PIXEL_LENGTH;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
  }

  createCoordinate(min, max) {
    return Math.round((Math.random() * (max - min) + min) / SnakeGame.PIXEL_LENGTH) * SnakeGame.PIXEL_LENGTH;
  }

  createFood() {
    let foodX = this.createCoordinate(0, this.snakeBoard.width - SnakeGame.PIXEL_LENGTH);
    let foodY = this.createCoordinate(0, this.snakeBoard.height - SnakeGame.PIXEL_LENGTH);

    let hasAteFood;
    this.snake.forEach(function snakeAteFood(part) {
      if (part.x === foodX && part.y === foodY) {
        hasAteFood = createFood();
      }
    });
    let foodSet = this.foodMap.get(foodX) || new Set();
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


  drawFood(x, y) {
    this.snakeCtx.fillStyle = "lightgreen";
    this.snakeCtx.strokestyle = "darkgreen";
    this.snakeCtx.fillRect(x, y, SnakeGame.PIXEL_LENGTH, SnakeGame.PIXEL_LENGTH);
    this.snakeCtx.strokeRect(x, y, SnakeGame.PIXEL_LENGTH, SnakeGame.PIXEL_LENGTH);
  }
}
