//Net Shogi
var canvas;  //オブジェクト
var ctx;     //コンテキスト
var nametbl = [
 "玉","飛","角","金","銀","桂","香","歩",
 ""  ,"竜","馬",""  ,"全","圭","杏","と"
];
var x1 = [ 0, 1, 1, 1, 0,-1,-1,-1, 1,-1];    //移動量x
var y1 = [-1,-1, 0, 1, 1, 1, 0,-1,-2,-2];    //移動量y
var movtbl = [
 [ 1,1,1,1,1,1,1,1,0,0 ],    //0:王将/玉将
 [ 2,0,2,0,2,0,2,0,0,0 ],    //1:飛車
 [ 0,2,0,2,0,2,0,2,0,0 ],    //2:角行
 [ 1,1,1,0,1,0,1,1,0,0 ],    //3:金将
 [ 1,1,0,1,0,1,0,1,0,0 ],    //4:銀将
 [ 0,0,0,0,0,0,0,0,1,1 ],    //5:桂馬
 [ 2,0,0,0,0,0,0,0,0,0 ],    //6:香車
 [ 1,0,0,0,0,0,0,0,0,0 ],    //7:歩兵
 [ 0,0,0,0,0,0,0,0,0,0 ],    //8:----
 [ 2,1,2,1,2,1,2,1,0,0 ],    //9:竜王
 [ 1,2,1,2,1,2,1,2,0,0 ],    //10:竜馬
 [ 0,0,0,0,0,0,0,0,0,0 ],    //11:----
 [ 1,1,1,0,1,0,1,1,0,0 ],    //12:成銀
 [ 1,1,1,0,1,0,1,1,0,0 ],    //13:成桂
 [ 1,1,1,0,1,0,1,1,0,0 ],    //14:成香
 [ 1,1,1,0,1,0,1,1,0,0 ]     //15:と金
];
var setup = [    //駒の配置
 [ 7, 7, 7, 7, 7, 7, 7, 7, 7],
 [-1, 2,-1,-1,-1,-1,-1, 1,-1],
 [ 6, 5, 4, 3, 0, 3, 4, 5, 6]
];
var fontcolor = ["black","maroon"];    //文字の色
var boxcolor = ["LimeGreen","gray" ,"blue" ,"red"];        //線の色
var fillcolor= ["LimeGreen","Khaki","white","LightPink"];  //盤面の色
var psize = 32;           //マスのピクセル数
var board = [];           //将棋盤バッファ
var bw = 19,bh = 11;      //将棋盤バッファのサイズ
var ofsx = 5,ofsy = 1;    //将棋盤のオフセット座標
var turn = 0;             //0=先手/1=後手
var startx = -1,starty = -1;   //選択した座標
var username = ["ipad","iphone","android"];    //端末の名前
var playtbl = ["先手","後手"];
//将棋盤の情報
function piece() {
    this.id = -1;         //駒の種類(-1=駒がない)
    this.player = 0;      //駒の向き(0=先手/1=後手)
    this.movable = false; //移動可能フラグ
}
//初期化処理
function init(){
    canvas = document.getElementById("world");
    canvas.width = 640;
    canvas.height = 400;
    ctx = canvas.getContext('2d');
    ctx.font = "24px 'ＭＳ Ｐゴシック'";
    user = window.navigator.userAgent.toLowerCase();
    for(i=0; i<username.length; i++){
        if(user.indexOf(username[i]) > 0)break;
    }
    if(i < username.length){
        document.addEventListener("touchstart", touchstart);
    }else{
        document.addEventListener("mousedown", mousedown);
    }
    board = new Array(bh);
    for(y=0; y<bh; y++){
        board[y] = new Array(bw);
        for(x=0; x<bw; x++){
            board[y][x] = new piece();   //将棋盤バッファの初期化
        }
    }
    for(y=0; y<3; y++){
        for(x=0; x<9; x++){
            board[ofsy+y+6][ofsx+x].id = setup[y][x];   //駒の配置
            board[ofsy+y+6][ofsx+x].player = 0;
            board[ofsy+2-y][ofsx+8-x].id = setup[y][x];
            board[ofsy+2-y][ofsx+8-x].player = 1;
        }
    }
    redraw();
    datsave();
}
//スマホ/タブレット用のタッチイベント
function touchstart(e){
    if (e.targetTouches.length == 1){
        touch = e.targetTouches[0];
        touchpiece(touch.pageX ,touch.pageY);
    }
}
//PC用のクリックイベント
function mousedown(e){
    touchpiece(e.clientX ,e.clientY);
}
//駒の移動処理
function touchpiece(tx,ty){
    element = document.getElementById("idselect");
    if(element.value != turn) return;    //相手の番の場合は無効
    cx = Math.floor((tx-8)/psize);
    cy = Math.floor((ty-8)/psize);
    if(isinside(cx,cy,0,0,bw,bh)==false)return;
    if(startx == -1){
        movestart(cx,cy);    //移動開始
    }else{
        moveend(cx,cy);      //移動終了
        startx = -1;
        redraw();    //画面全体を再描画
    }
}
//移動開始
function movestart(cx,cy){
    id = board[cy][cx].id;
    if(id == -1)return;    //駒が存在しないと無効
    player = board[cy][cx].player;
    if(player!=turn)return;    //相手の駒は無効
    startx = cx;
    starty = cy;
    drawpiece(startx,starty,id,player,2);    //駒を白色に
    if(isinside(startx,starty,ofsx,ofsy,9,9)==false){
        for(x=ofsx; x<(ofsx+9); x++){  //配置可能マスを描画
            pawn = 0;
            for(y=ofsy; y<(ofsy+9); y++){
                if(id != 7)break;
                id2 = board[y][x].id;
                player2 = board[y][x].player;
                if((player == player2)&&(id2 == 7)){
                    pawn++;    //歩の数をカウント
                }
            }
            if(pawn > 0)continue;    //二歩の場合は無効
            margin = [ 0,0,0,0,0,2,1,1 ];
            flip = 1-(player*2);
            y = ofsy+(player*8)+(margin[id]*flip);
            while(isinside(x,y,ofsx,ofsy,9,9) == true){
                if(board[y][x].id == -1){ //盤面を赤色に
                    drawpiece(x,y,-1,0,3);
                    board[y][x].movable = true;
                }
                y += flip;
            }
        }
        return;
    }
    for(dir=0; dir<10; dir++){    //移動可能マスを描画
        x = startx;
        y = starty;
        flip = 1-(player*2);
        while(movtbl[id][dir] > 0){
            x += x1[dir];
            y += y1[dir]*flip;
            if(isinside(x,y,ofsx,ofsy,9,9) == false)break; //盤の外へ
            id2 = board[y][x].id;
            player2 = board[y][x].player;
            if((id2 != -1)&&(player == player2))break;   //駒を検出
            drawpiece(x,y,id2,player2,3);    //盤面を赤色に
            board[y][x].movable = true;
            if(id2 != -1)break;              //相手の駒を検出
            if(movtbl[id][dir] == 1)break;
        }
    }
}
//移動終了
function moveend(endx,endy){
    if(board[endy][endx].movable == false)return;    //移動不可能
    id    = board[starty][startx].id;
    player = board[starty][startx].player;
    if(isinside(startx,starty,ofsx,ofsy,9,9) == true){
        exist1 = isinside(startx,starty,ofsx,ofsy+6*player,9,3);
        exist2 = isinside(endx  ,endy  ,ofsx,ofsy+6*player,9,3);
        if((exist1 == true)||(exist2 == true)){  //敵陣に入るor出る
            if((id < 8)&&(nametbl[id | 8] != "")){   //成っていない
               if(confirm("成りますか？")){
                   board[starty][startx].id |= 8;    //成る
               }
            }
        }
    }
    if(board[endy][endx].id != -1){    //移動先に駒が存在する
        tx = (1-player)*(bw-3)+1;
        ty = (1-player)*(bh-3)+1;
        tx1 = (player*2)-1;
        ty1 = (player*2)-1;
        for(i=0; i<20; i++){
            x = tx+(i % 3)*tx1;
            y = ty+Math.floor(i/3)*ty1;
            if(board[y][x].id == -1)break;   //空き領域を検出
        }
        board[y][x].id = board[endy][endx].id & 7;   //持ち駒の追加
        board[y][x].player = player;
    }
    board[endy][endx].id     = board[starty][startx].id;
    board[endy][endx].player = board[starty][startx].player;
    board[starty][startx].id = -1;
    turn ^= 1;    //プレイヤーの切り替え
    datsave();
}
//駒を描画
function drawpiece(x,y,id,player,color){
    px = x*psize;
    py = y*psize;
    ctx.fillStyle = boxcolor[color];
    ctx.fillRect(px, py, psize, psize);
    ctx.fillStyle = fillcolor[color];
    ctx.fillRect(px+1, py+1, psize-2, psize-2);
    if(id == -1)return;
    ctx.fillStyle = fontcolor[(id >> 3)& 1];
    if(player){
        px = -px-psize;
        py = -py-psize;
        ctx.rotate(Math.PI);
    }
    ctx.fillText(nametbl[id],px+4,py+24,300);
    if(player)ctx.rotate(Math.PI);
}
//駒が範囲内に存在するか判定
function isinside(x,y,ax,ay,w,h){
    if((x<ax)||(x>=(ax+w))||(y<ay)||(y>=(ay+h)))return(false);
    return(true);
}
//画面全体を再描画
function redraw(){
    for(y=0; y<bh; y++){
        for(x=0; x<bw; x++){
            if(isinside(x,y,ofsx,ofsy,9,9))c=1; else c=0;
            id = board[y][x].id;
            player = board[y][x].player;
            drawpiece(x,y,id,player,c);    //駒を描画
            board[y][x].movable = false;
        }
    }
    element = document.getElementById("idselect");
    if(element.value == turn) ban="(あなたの番)"; else ban="(相手の番)";
    ctx.fillStyle = fontcolor[0];
    ctx.fillText(playtbl[turn]+ban ,220 ,(1-turn)*318+26,300);
}
//サーバへリクエスト送信
function sendrequest( url, data, callback){
    if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest();
    }else{
        alert("Error:XMLHttpRequest");
        return;
    }
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            callback(xhr);
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(data);
}
//将棋盤バッファをサーバへ書き込み
function datsave(){
    data = "buf=";
    board[0][0].player = turn;
    for(y=0; y<bh; y++){
        for(x=0; x<bw; x++){
            data += board[y][x].id +",";
            data += board[y][x].player + ",";
       }
    }
    sendrequest( "./shogi.php", data,  callback);
}
//将棋盤バッファをサーバから読み込み
function datload(){
    data = "";
    sendrequest( "./shogi.php", data,  callback);
}
//コールバック関数
function callback(xhr){
    res = xhr.responseText;
//    element = document.getElementById("idresult");
//    element.innerHTML = res;
    if(res != ""){
        v = res.split(",");
        for(y=0; y<bh; y++){
            for(x=0; x<bw; x++){
                i = (x+(y*bw))*2;
                board[y][x].id = Number(v[i]);
                board[y][x].player = Number(v[i+1]);
            }
        }
        turn = board[0][0].player;
        redraw();
    }
    element = document.getElementById("idselect");
    if(element.value != turn){     //相手の番の場合
        setTimeout("datload()",3000);
    }
}
//先手/後手の選択
function changeplayer(obj){
    if(obj.value != turn){     //相手の番の場合
        setTimeout("datload()",3000);
    }
}
