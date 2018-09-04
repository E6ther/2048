let tiles = new Array(4);
for (let i = 0; i < 4; ++i) {
    tiles[i] = new Array(4);
    for (let j = 0; j < 4; ++j) {
        tiles[i][j] = 0;
    }
}

let tileContainer = document.getElementsByClassName("tile-container")[0];
let moveQueue = [];
let keyBan = [false, false, false, false];
let newTileTimeout;  // 生成新块的延时函数
let currentScore = 0;
let bestScore = 0;
let scoreAdd = 0;

function draw_tile(Tile, tileType) {
    // console.log("draw-start");
    for (let i = 0; i < Tile.length; ++i) {
        let x = Math.floor(Tile[i] / 4);
        let y = Tile[i] % 4;
        let className;
        let tile = document.createElement("div");
        let inner = document.createElement("div");
        // console.log(x, y);
        // console.log(tiles[x][y]);
        if (tiles[x][y] <= 8192) {
            className = "tile tile-{0} tile-position-{1}-{2}".format(tiles[x][y], x + 1, y + 1);
        } else if (tiles[x][y] === 131072) {
            className = "tile tile-{0} tile-position-{1}-{2}".format("max", x + 1, y + 1);
        } else {
            className = "tile tile-{0} tile-position-{1}-{2}".format("super", x + 1, y + 1);
        }
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
    // console.log("draw-end");
}

window.document.onkeydown = function (e) {
    e = e || window.event;

    // tileDelete();
    if (e && (e.keyCode === 38 || e.keyCode === 75 || e.keyCode === 87)) {
        // 38:方向上    75:K(vim上)    87:W
        // moveUp();
        moveQueue.push(1);
        // Move();
        return false;
    } else if (e && (e.keyCode === 40 || e.keyCode === 74 || e.keyCode === 83)) {
        // 40:方向下    74:J(vim下)    87:S
        // moveDown();
        moveQueue.push(2);
        // Move();
        return false;
    } else if (e && (e.keyCode === 37 || e.keyCode === 72 || e.keyCode === 65)) {
        // 37:方向左    72:H(vim左)    65:A
        // moveLeft();
        moveQueue.push(3);
        // Move();
        return false;
    } else if (e && (e.keyCode === 39 || e.keyCode === 76 || e.keyCode === 68)) {
        // 39:方向右    76:L(vim右)    68:D
        // moveRight();
        moveQueue.push(4);
        // Move();
        return false;
    }
    // tileCheck();
};


function MoveQueue() {
    // let interval =
    setInterval(function () {
        if (moveQueue.length === 0) {
            // clearInterval(interval);
            // console.log("check");
            // tileCheck();
            // tileDelete();
            // console.log("--111--");
        } else {
            let newFlag = false;
            let keyType = moveQueue.shift();
            let keyDownFlag = true;
            while (keyBan[keyType - 1]) {
                if (moveQueue.length === 0) {
                    keyDownFlag = false;
                    // console.log("keyban-kazhu");
                    break;
                }
                keyType = moveQueue.shift();
            }
            if (keyDownFlag) {
                // console.log("--------");
                tileCheck();
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
                if (newFlag) {
                    newTile();
                    updateScore();
                }

                overJudge();
            }
        }
    }, 95)
}

function moveUp() {
    // console.log("upup");
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
    if (newFlag === false) {
        keyBan[0] = true;
    } else {
        for (let i = 0; i < keyBan.length; ++i) {
            keyBan[i] = false;
        }
    }
    return newFlag;
}

function moveDown() {
    // console.log("down");
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
    if (newFlag === false) {
        keyBan[1] = true;
    } else {
        for (let i = 0; i < keyBan.length; ++i) {
            keyBan[i] = false;
        }
    }
    return newFlag;
}

function moveLeft() {
    // console.log("left");
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
    if (newFlag === false) {
        keyBan[2] = true;
    } else {
        for (let i = 0; i < keyBan.length; ++i) {
            keyBan[i] = false;
        }
    }
    return newFlag;
}

function moveRight() {
    // console.log("Right");
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
    if (newFlag === false) {
        keyBan[3] = true;
    } else {
        for (let i = 0; i < keyBan.length; ++i) {
            keyBan[i] = false;
        }
    }
    return newFlag;
}

function restart() {
    for (let i = 0; i < 4; ++i) {
        keyBan[i] = false;
        for (let j = 0; j < 4; ++j) {
            tiles[i][j] = 0;
        }
    }
    moveQueue = [];
    clearTimeout(newTileTimeout);
    currentScore = 0;
    let gameMessage = getClass("game-message")[0];
    gameMessage.classList.remove("game-over");
    tileCheck();
    updateScore();
    newTile();
    newTile();
}

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
    newTileTimeout = setTimeout(function () {
        draw_tile([position], 1);
    }, 90);
}

function moveTile(oldPos, newPos) {
    let tileWidth = 110;
    let currentX = Math.floor(oldPos / 4) * tileWidth;
    let currentY = oldPos % 4 * tileWidth;
    let newX = Math.floor(newPos / 4) * tileWidth;
    let newY = newPos % 4 * tileWidth;
    let offsetX = (newX - currentX) / 10;
    let offsetY = (newY - currentY) / 10;
    let oldClassName = "tile-position-{0}-{1}".format(Math.floor(oldPos / 4) + 1, oldPos % 4 + 1);
    let newClassName = "tile-position-{0}-{1}".format(Math.floor(newPos / 4) + 1, newPos % 4 + 1);
    let tile = getClass(oldClassName)[0];

    if (tile) {
        tile.removeAttribute("style");
        let interval = setInterval(function () {
            tile.style.transform = "translate({0}px, {1}px)".format(currentY += offsetY, currentX += offsetX);
            if (currentX === newX && currentY === newY) {
                tile.classList.remove(oldClassName);
                tile.classList.add(newClassName);
                tile.removeAttribute("style");
                clearInterval(interval);
            }
        }, 8);
    }
}

// function tileDelete() {  // 删除旧的方块
//     // console.log("delete-start");
//     for (let i = 1; i <= 4; ++i) {
//         for (let j = 1; j <= 4; ++j) {
//             let tile = getClass("tile-position-" + i + "-" + j);
//             for (let k = 0; k < tile.length; ++k) {
//                 if (tile[k].className.indexOf("tile-merged") >= 0) {
//                     for (let l = 0; l < tile.length; ++l) {
//                         if (tile[l].className.indexOf("tile-merged") >= 0) {
//                             tile[l].classList.remove("tile-merged");
//                         } else {
//                             // console.log(tile[l]);
//                             tileContainer.removeChild(tile[l]);
//                         }
//                     }
//                     break;
//                 } else if (tile[k].className.indexOf("tile-new")) {
//                     tile[k].classList.remove("tile-new");
//                 }
//             }
//         }
//     }
//     // console.log("dtlete-end");
// }

function tileCheck() {  // 核对并修正页面中方块与数组中方块一致
    clearTimeout(newTileTimeout);
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            let tile = getClass("tile-position-{0}-{1}".format(i + 1, j + 1));
            if (tiles[i][j] === 0) {
                for (let k = 0; k < tile.length; ++k) {
                    tileContainer.removeChild(tile[k])
                }
            } else {
                let className;
                if (tiles[i][j] === 131072) {
                    className = "tile-max";
                } else if (tiles[i][j] <= 8192) {
                    className = "tile-" + tiles[i][j];
                } else {
                    className = "tile-super";
                }
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

function updateScore() {
    let ScoreContainer = getClass("score-container")[0];
    let BestContainer = getClass("best-container")[0];
    currentScore += scoreAdd;
    ScoreContainer.innerHTML = currentScore;
    BestContainer.innerHTML = bestScore > currentScore ? bestScore : currentScore;
    if (scoreAdd !== 0) {
        let ScoreAdd = document.createElement("div");
        ScoreAdd.classList.add("score-addition");
        ScoreAdd.innerHTML = "+" + scoreAdd;
        ScoreContainer.appendChild(ScoreAdd);
    }
    scoreAdd = 0;
}

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

    let gameMessage = getClass("game-message")[0];
    gameMessage.classList.add("game-over");
    return true;
}

let startX, startY;

function mouseDown(e) {
    e = e || window.event;
    // console.log("st ", e);
    startX = e.screenX || e.changedTouches[0].screenX;
    startY = e.screenY || e.changedTouches[0].screenY;
    // console.log("start ", startX, startY);
}

function mouseUp(e) {
    e = e || window.event;
    // console.log("end ", e);
    let endX = e.screenX || e.changedTouches[0].screenX;
    let endY = e.screenY || e.changedTouches[0].screenY;
    let offsetX = endX - startX;
    let offsetY = endY - startY;
    // console.log("end ", endX, endY);
    // console.log(offsetX, offsetY);
    if (Math.abs(offsetX) < Math.abs(offsetY)) {
        if (offsetY > 50) {
            moveQueue.push(2);
        } else if (offsetY < -50) {
            moveQueue.push(1);
        }
    } else {
        if (offsetX > 50) {
            moveQueue.push(4);
        } else if (offsetX < -50) {
            moveQueue.push(3);
        }
    }
}


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

window.onload = function () {
    restart();
    MoveQueue();
    let a = getClass("restart-game")[0];
    a.addEventListener("click", restart, false);
    let a2 = getClass("retry-button")[0];
    a2.addEventListener("click", restart, false);
    let gameContainer = getClass("game-container")[0];
    gameContainer.addEventListener("mousedown", mouseDown, false);
    gameContainer.addEventListener("mouseup", mouseUp, false);
    gameContainer.addEventListener("touchstart", mouseDown, false);
    gameContainer.addEventListener("touchend", mouseUp, false);

};