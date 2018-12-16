let tileContainer;
let tiles = [];
let winFlag = 0;
let currentScore = 0;
let bestScore = 0;
let scoreAdd = 0;
let gridStack = [];
let redoStack = [];
let startX, startY;

// 向网页中添加新方块
function draw_tile(Tile, tileType) {
    // tileType 1:新方块  2:合并方块  3:其他方块

    for (let i = 0; i < Tile.length; ++i) {
        let x = Math.floor(Tile[i] / 4);
        let y = Tile[i] % 4;
        let className;
        let tile = document.createElement("div");
        let inner = document.createElement("div");

        className = "tile tile-{0} tile-position-{1}-{2}".format(tiles[x][y], x + 1, y + 1);

        if (tileType === 1) {
            tile.className = className + " tile-new";
        } else if (tileType === 2) {
            tile.className = className + " tile-merged";
        } else {
            tile.className = className;
        }

        inner.className = "tile-inner";
        inner.innerHTML = tiles[x][y];
        tile.appendChild(inner);
        tileContainer.appendChild(tile);
    }
}

// 绑定键盘事件
window.document.onkeydown = function (e) {
    e = e || window.event;

    if (e && (e.keyCode === 38 || e.keyCode === 75 || e.keyCode === 87)) {
        // 38:方向上    75:K(vim上)    87:W
        Move(1);
        return false;
    } else if (e && (e.keyCode === 40 || e.keyCode === 74 || e.keyCode === 83)) {
        // 40:方向下    74:J(vim下)    87:S
        Move(2);
        return false;
    } else if (e && (e.keyCode === 37 || e.keyCode === 72 || e.keyCode === 65)) {
        // 37:方向左    72:H(vim左)    65:A
        Move(3);
        return false;
    } else if (e && (e.keyCode === 39 || e.keyCode === 76 || e.keyCode === 68)) {
        // 39:方向右    76:L(vim右)    68:D
        Move(4);
        return false;
    }
};

// 移动
function Move(keyType) {
    if (winFlag !== 1) {
        let newFlag;
        tileCheck();
        let gridStr = grid2string();
        switch (keyType) {
            case 1 :
                newFlag = moveUp();
                break;
            case 2 :
                newFlag = moveDown();
                break;
            case 3 :
                newFlag = moveLeft();
                break;
            case 4 :
                newFlag = moveRight();
                break;
        }
        afterMove(newFlag, gridStr);
    }
}

// 移动方块之后的后续工作
function afterMove(newFlag, gridStr) {
    if (newFlag) {
        newTile();
        updateScore();
        gridStore(gridStr);

        // 清空重做栈
        redoStack = [];
    }

    if (overJudge()) {
        gameOver();
    } else if (winFlag === 0 && winJudge()) {
        gameWin();
    } else {
        gameStore();
        revokeJudge();
        redoJudge();
    }
}

// 上移
function moveUp() {
    let mergeTile = [];
    let newFlag = false;
    for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 4; ++j) {
            if (tiles[i][j]) { // 有数
                for (let k = i + 1; k < 4; ++k) {
                    if (tiles[k][j]) {
                        if (tiles[i][j] === tiles[k][j]) {
                            moveTile(k * 4 + j, i * 4 + j);
                            mergeTile.push(i * 4 + j);
                            tiles[i][j] += tiles[k][j];
                            tiles[k][j] = 0;
                            scoreAdd += tiles[i][j];
                            newFlag = true;
                        }
                        break;
                    }
                }
            } else { // 无数
                for (let k = i + 1; k < 4; ++k) {
                    if (tiles[k][j]) {
                        moveTile(k * 4 + j, i * 4 + j);
                        tiles[i][j] = tiles[k][j];
                        tiles[k][j] = 0;
                        newFlag = true;
                        for (let l = k + 1; l < 4; ++l) {
                            if (tiles[l][j]) {
                                if (tiles[i][j] === tiles[l][j]) {
                                    moveTile(l * 4 + j, i * 4 + j);
                                    mergeTile.push(i * 4 + j);
                                    tiles[i][j] += tiles[l][j];
                                    tiles[l][j] = 0;
                                    scoreAdd += tiles[i][j];
                                    newFlag = true;
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    draw_tile(mergeTile, 2);
    return newFlag;
}

// 下移
function moveDown() {
    let mergeTile = [];
    let newFlag = false;
    for (let i = 3; i > 0; --i) {
        for (let j = 0; j < 4; ++j) {
            if (tiles[i][j]) { // 有数
                for (let k = i - 1; k >= 0; --k) {
                    if (tiles[k][j]) {
                        if (tiles[i][j] === tiles[k][j]) {
                            moveTile(k * 4 + j, i * 4 + j);
                            mergeTile.push(i * 4 + j);
                            tiles[i][j] += tiles[k][j];
                            tiles[k][j] = 0;
                            scoreAdd += tiles[i][j];
                            newFlag = true;
                        }
                        break;
                    }
                }
            } else { // 无数
                for (let k = i - 1; k >= 0; --k) {
                    if (tiles[k][j]) {
                        moveTile(k * 4 + j, i * 4 + j);
                        tiles[i][j] = tiles[k][j];
                        tiles[k][j] = 0;
                        newFlag = true;
                        for (let l = k - 1; l >= 0; --l) {
                            if (tiles[l][j]) {
                                if (tiles[i][j] === tiles[l][j]) {
                                    moveTile(l * 4 + j, i * 4 + j);
                                    mergeTile.push(i * 4 + j);
                                    tiles[i][j] += tiles[l][j];
                                    tiles[l][j] = 0;
                                    scoreAdd += tiles[i][j];
                                    newFlag = true;
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    draw_tile(mergeTile, 2);
    return newFlag;
}

// 左移
function moveLeft() {
    let mergeTile = [];
    let newFlag = false;
    for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 4; ++j) {
            if (tiles[j][i]) {  // 有数
                for (let k = i + 1; k < 4; ++k) {
                    if (tiles[j][k]) {
                        if (tiles[j][i] === tiles[j][k]) {
                            moveTile(j * 4 + k, j * 4 + i);
                            mergeTile.push(j * 4 + i);
                            tiles[j][i] += tiles[j][k];
                            tiles[j][k] = 0;
                            scoreAdd += tiles[j][i];
                            newFlag = true;
                        }
                        break;
                    }
                }
            } else {  // 无数
                for (let k = i + 1; k < 4; ++k) {
                    if (tiles[j][k]) {
                        moveTile(j * 4 + k, j * 4 + i);
                        tiles[j][i] = tiles[j][k];
                        tiles[j][k] = 0;
                        newFlag = true;
                        for (let l = k + 1; l < 4; ++l) {
                            if (tiles[j][l]) {
                                if (tiles[j][i] === tiles[j][l]) {
                                    moveTile(j * 4 + l, j * 4 + i);
                                    mergeTile.push(j * 4 + i);
                                    tiles[j][i] += tiles[j][l];
                                    tiles[j][l] = 0;
                                    scoreAdd += tiles[j][i];
                                    newFlag = true;
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    draw_tile(mergeTile, 2);
    return newFlag;
}

// 右移
function moveRight() {
    let mergeTile = [];
    let newFlag = false;
    for (let i = 3; i > 0; --i) {
        for (let j = 3; j >= 0; --j) {
            if (tiles[j][i]) {  // 有数
                for (let k = i - 1; k >= 0; --k) {
                    if (tiles[j][k]) {
                        if (tiles[j][i] === tiles[j][k]) {
                            moveTile(j * 4 + k, j * 4 + i);
                            mergeTile.push(j * 4 + i);
                            tiles[j][i] += tiles[j][k];
                            tiles[j][k] = 0;
                            scoreAdd += tiles[j][i];
                            newFlag = true;
                        }
                        break;
                    }
                }
            } else {  // 无数
                for (let k = i - 1; k >= 0; --k) {
                    if (tiles[j][k]) {
                        moveTile(j * 4 + k, j * 4 + i);
                        tiles[j][i] = tiles[j][k];
                        tiles[j][k] = 0;
                        newFlag = true;
                        for (let l = k - 1; l >= 0; --l) {
                            if (tiles[j][l]) {
                                if (tiles[j][i] === tiles[j][l]) {
                                    moveTile(j * 4 + l, j * 4 + i);
                                    mergeTile.push(j * 4 + i);
                                    tiles[j][i] += tiles[j][l];
                                    tiles[j][l] = 0;
                                    scoreAdd += tiles[j][i];
                                    newFlag = true;
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    draw_tile(mergeTile, 2);
    return newFlag;
}

// 新的游戏
function restart() {
    // 棋盘数组清零
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            tiles[i][j] = 0;
        }
    }

    // 分数清零
    currentScore = 0;

    // 去掉两种提示框
    let gameMessage = getClass("game-message")[0];
    gameMessage.classList.remove("game-over");
    gameMessage.classList.remove("game-won");

    let storage = window.localStorage;
    storage.removeItem("gameStatus");

    // 清空两个数组
    gridStack = [];
    redoStack = [];
    revokeJudge();
    redoJudge();

    //
    tileCheck();
    updateScore();
    newTile();
    newTile();
}

// 产生新方块
function newTile() {
    // 24出现概率为(chance-1):1
    let chance = 21;

    let tileNum = Math.floor(Math.random() * chance);
    tileNum = (tileNum === chance - 1) ? 4 : 2;
    let position = Math.floor(Math.random() * 16);
    while (tiles[Math.floor(position / 4)][position % 4]) {
        position = (position + 1) % 16;
    }
    tiles[Math.floor(position / 4)][position % 4] = tileNum;

    draw_tile([position], 1);
}

// 将方块从oldPos移动到newPos
function moveTile(oldPos, newPos) {
    let oldClassName = "tile-position-{0}-{1}".format(Math.floor(oldPos / 4) + 1, oldPos % 4 + 1);
    let newClassName = "tile-position-{0}-{1}".format(Math.floor(newPos / 4) + 1, newPos % 4 + 1);
    let tile = getClass(oldClassName)[0];

    if (tile) {
        tile.classList.remove(oldClassName);
        tile.classList.add(newClassName);
    }
}

// 核对并修正页面中方块与数组中方块一致
function tileCheck() {
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            let tile = getClass("tile-position-{0}-{1}".format(i + 1, j + 1));
            if (tiles[i][j] === 0) {
                for (let k = 0; k < tile.length; ++k) {
                    tileContainer.removeChild(tile[k])
                }
            } else {
                let className = "tile-" + tiles[i][j];

                if (tile.length === 0) {
                    draw_tile([i * 4 + j], 0);
                } else {
                    let flag = true;
                    for (let k = 0; k < tile.length; ++k) {
                        if (tile[k].className.indexOf(className) >= 0) {
                            flag = false;
                        } else {
                            tileContainer.removeChild(tile[k]);
                        }
                    }
                    if (flag) {
                        draw_tile([i * 4 + j], 0);
                    }
                }
            }
        }
    }
    let tile = getClass("tile-new");
    for (let i = 0; i < tile.length; ++i) {
        tile[i].classList.remove("tile-new");
    }
    tile = getClass("tile-merged");
    for (let i = 0; i < tile.length; ++i) {
        tile[i].classList.remove("tile-merged");
    }
}

// 更新分数
function updateScore() {
    let ScoreContainer = getClass("score-container")[0];
    let BestContainer = getClass("best-container")[0];
    currentScore += scoreAdd;
    ScoreContainer.innerHTML = currentScore;
    bestScore = bestScore > currentScore ? bestScore : currentScore;
    BestContainer.innerHTML = bestScore;

    if (scoreAdd !== 0) {
        let ScoreAdd = document.createElement("div");
        ScoreAdd.classList.add("score-addition");
        ScoreAdd.innerHTML = "+" + scoreAdd;
        ScoreContainer.appendChild(ScoreAdd);
    }
    scoreAdd = 0;
}

// 判断游戏结束
function overJudge() {
    // 判断是否还有空格
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            if (tiles[i][j] === 0) {
                return false;
            }
        }
    }
    // 判断当前和右、下能否合并
    for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 3; ++j) {
            if (tiles[i][j] === tiles[i][j + 1] || tiles[i][j] === tiles[i + 1][j]) {
                return false;
            }
        }
    }
    // 判断最后一列和最后一行能否合并
    for (let i = 0; i < 3; ++i) {
        if (tiles[i][3] === tiles[i + 1][3] || tiles[3][i] === tiles[3][i + 1]) {
            return false;
        }
    }

    return true;
}

// 游戏结束弹出提示框
function gameOver() {
    let gameMessage = getClass("game-message")[0];
    let p = gameMessage.getElementsByTagName("p")[0];
    p.innerHTML = "Game over!";
    gameMessage.classList.add("game-over");
    let storage = window.localStorage;
    storage.removeItem("gameStatus");
    tileCheck();

    gridStack = [];
    redoStack = [];
    revokeJudge();
    redoJudge();
}

// 判断合出2048方块
function winJudge() {
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            if (tiles[i][j] === 2048 && winFlag === 0) {
                return true;
            }
        }
    }
    return false;
}

// 游戏胜利弹出提示框
function gameWin() {
    let gameMessage = getClass("game-message")[0];
    let p = gameMessage.getElementsByTagName("p")[0];
    p.innerHTML = "You win!";
    gameMessage.classList.add("game-won");
    winFlag = 1;

    gridStack = [];
    redoStack = [];
    revokeJudge();
    redoJudge();
}

// 游戏胜利继续游戏
function keepGoing() {
    winFlag = -1;
    let gameMessage = getClass("game-message")[0];
    gameMessage.classList.remove("game-won");
}

// 鼠标按下
function mouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    startX = e.screenX || e.changedTouches[0].screenX;
    startY = e.screenY || e.changedTouches[0].screenY;
}

// 鼠标移动
function mouseMove(e) {
    e.preventDefault();
}

// 鼠标松开
function mouseUp(e) {
    e = e || window.event;
    e.preventDefault();

    let endX = e.screenX || e.changedTouches[0].screenX;
    let endY = e.screenY || e.changedTouches[0].screenY;
    let offsetX = endX - startX;
    let offsetY = endY - startY;

    if (Math.abs(offsetX) < Math.abs(offsetY)) {
        if (offsetY > 50) {
            Move(2);
        } else if (offsetY < -50) {
            Move(1);
        }
    } else {
        if (offsetX > 50) {
            Move(4);
        } else if (offsetX < -50) {
            Move(3);
        }
    }
}

// 本地化存储游戏
function gameStore() {
    let storage = window.localStorage;
    let gameStatus = {
        "grid": tiles,
        "score": currentScore,
        "winFlag": winFlag
    };
    let gameStatusStr = JSON.stringify(gameStatus);
    storage.setItem("gameStatus", gameStatusStr);
    let localBestScore = storage.getItem("bestScore");
    if (localBestScore === null || parseInt(localBestScore) < bestScore) {
        storage.setItem("bestScore", bestScore);
    }
}

// 从本地化存储中载入游戏
function gameLoad() {
    let storage = window.localStorage;
    let gameStatusStr = storage.getItem("gameStatus");
    if (gameStatusStr === null) {
        return false;
    }
    let gameStatus = JSON.parse(gameStatusStr);
    tiles = gameStatus.grid;
    currentScore = gameStatus.score;
    winFlag = gameStatus.winFlag;
    bestScore = parseInt(storage.getItem("bestScore"));

    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            if (tiles[i][j]) {
                draw_tile([i * 4 + j], 1);
            }
        }
    }
    return true;
}

// 棋盘中方块转化成字符串
function grid2string() {
    let gridStr = "";
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            gridStr = gridStr + tiles[i][j] + "-";
        }
    }
    return gridStr;
}

// 字符串转化成棋盘方块
function string2grid(str) {
    let grids = str.split("-");
    tileContainer.innerHTML = "";
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            tiles[i][j] = parseInt(grids[i * 4 + j]);
            if (tiles[i][j]) {
                draw_tile([i * 4 + j], 1);
            }
        }
    }
}

// 向撤销栈中存入棋盘
function gridStore(gridStr) {
    if (gridStack.length > 400) {
        gridStack.shift();
    }
    gridStack.push(gridStr);
}

// 判断撤销栈是否为空
function revokeJudge() {
    if (gridStack.length > 0) {
        getClass("game-revoke")[0].classList.remove("disable");
    } else {
        getClass("game-revoke")[0].classList.add("disable");
    }
}

// 判断重做栈是否为空
function redoJudge() {
    if (redoStack.length > 0) {
        getClass("game-redo")[0].classList.remove("disable");
    } else {
        getClass("game-redo")[0].classList.add("disable");
    }
}

// 撤销
function moveRevoke() {
    if (gridStack.length > 0) {
        redoStack.push(grid2string());
        string2grid(gridStack.pop());
        gameStore();
        revokeJudge();
        redoJudge();
    }
}

// 重做
function moveRedo() {
    if (redoStack.length > 0) {
        gridStack.push(grid2string());
        string2grid(redoStack.pop());
        gameStore();
        revokeJudge();
        redoJudge();
    }
}

// 初始化
function Init() {
    tileContainer = document.getElementsByClassName("tile-container")[0];
    tiles = new Array(4);

    for (let i = 0; i < 4; ++i) {
        tiles[i] = new Array(4);
        for (let j = 0; j < 4; ++j) {
            tiles[i][j] = 0;
        }
    }

    let restartButton = getClass("restart-game")[0];
    restartButton.addEventListener("click", restart, false);

    let retry = getClass("retry-button")[0];
    retry.addEventListener("click", restart, false);
    retry.addEventListener("touchend", restart, false);

    let keepGoingButton = getClass("keep-playing-button")[0];
    keepGoingButton.addEventListener("click", keepGoing, false);
    keepGoingButton.addEventListener("touchend", keepGoing, false);

    let gameContainer = getClass("game-container")[0];
    gameContainer.addEventListener("mousedown", mouseDown, false);
    gameContainer.addEventListener("mouseup", mouseUp, false);
    gameContainer.addEventListener("mousemove", mouseMove, false);
    gameContainer.addEventListener("touchstart", mouseDown, false);
    gameContainer.addEventListener("touchend", mouseUp, false);
    gameContainer.addEventListener("touchmove", mouseMove, false);

    let gameRevoke = getClass("game-revoke")[0];
    gameRevoke.addEventListener("click", moveRevoke, false);

    let gameRedo = getClass("game-redo")[0];
    gameRedo.addEventListener("click", moveRedo, false);

    if (gameLoad()) {
        updateScore();
    } else {
        restart();
    }
}

// 重写string的format函数，使之可以格式化字符串
String.prototype.format = function (args) {
    let result = this;
    if (arguments.length > 0) {
        if (arguments.length === 1 && typeof (args) === "object") {
            for (let key in args) {
                if (args[key] !== undefined) {
                    let reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (let i = 0; i < arguments.length; i++) {
                if (arguments[i] !== undefined) {
                    let reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};

// 根据类名获取节点
function getClass(className, oParent) {

    if (!oParent) {
        oParent = document;
    }

    let oChild = oParent.getElementsByTagName('*');
    let arr = [];

    for (let i = 0, len = oChild.length; i < len; i++) {
        // indexOf，在字符串中查找指定字符，如果查找到了，返回该字符
        // 在字符串中的索引；如果没有找到，返回-1
        // 索引有可能为0，所以大于等于0就意味着找到
        if (oChild[i].className.indexOf(className) >= 0) {
            arr.push(oChild[i]);
        }
    }
    return arr;
}

// 页面载入
window.onload = function () {
    Init();
};

// 测试函数
function test(c) {
    if (c === undefined) {
        c = 1;
    }
    let cc = c;
    for (let i = 0; i < 4; ++i) {
        if (i % 2) {
            for (let j = 3; j >= 0; --j) {
                tiles[i][j] = cc;
                cc *= 2;
            }
        } else {
            for (let j = 0; j < 4; ++j) {
                tiles[i][j] = cc;
                cc *= 2;
            }
        }
    }
    tiles[0][0] = c * 2;
    tileCheck();
}
