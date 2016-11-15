/**
 * @author Seungwoo Yeom
 * @date 2016.10.11
 */

'use strict';

let app = require('express')(),
    http = require('http').Server(app),
    //TODO 유저 모델의 토큰으로 회원 검증 및 프로필 받기
    User = require('../models/users');

http.listen(8080, function () {
    console.log('Socket IO server has been started on port 8080');
});

let io = require('socket.io').listen(http);
var roomsQueue = [];
var userList = [];

io.sockets.on('connection', function (socket) {
    var ioRooms = io.sockets.adapter.rooms;

    userList[socket.id] = {'socket': socket, 'room' : ''};

    console.log(socket.id + '연결되었습니다.');

    socket.on('watingForStranger', function () {
        // 만들어진 방이 한개도 없을 때
        if (!roomsQueue.length) {
            roomsQueue.push(socket.id);
            socket.join(socket.id);
            userList[socket.id].room = socket.id;
            socket.emit('joinWithStranger', {'type': 0});
            console.log(socket.id + '상대방을 기다리는 중');
            console.log(ioRooms);
            console.log(userList);
        } else {
            // 만들어진 방이 1개 이상일 때
            var isNotFullAll = true;

            for (var idx in roomsQueue) {
                var element = roomsQueue[idx];
                console.log('방이 한개 이상이니 순회하면서 방을 찾아보자.');
                console.log(element);
                console.log(ioRooms[element]);
                if (ioRooms[element] === undefined) {
                    console.log('어라 이 방은 없는 방인데 ㅇㅂㅇ');
                    continue;
                }
                if (ioRooms[element].length == 1) {
                    isNotFullAll = false;
                    socket.join(element);
                    userList[socket.id].room = element;
                    console.log(userList);
                    io.sockets.in(element).emit('joinWithStranger', {'type': 1});
                    console.log('매칭되었습니다.');
                    console.log(ioRooms);
                }
            }

            if (isNotFullAll) {
                roomsQueue.push(socket.id);
                socket.join(socket.id);
                userList[socket.id].room = socket.id;
                socket.emit('joinWithStranger', {'type': 0});
                console.log(socket.id + '상대방을 기다리는 중');
                console.log(ioRooms);
            }
        }
    });

    socket.on('sendMessage', function (data) {
        console.log(socket.id + "님께서 메세지를 전송하셨습니다.");
        console.log(data.message);
        io.sockets.in(userList[socket.id].room).emit('receiveMessage', data);
    });

    socket.on('cancelRequest', function (data) {
        socket.leave(socket.id);
        delete roomsQueue[socket.id];
    });

    socket.on('disconnect', function (data) {

        console.log(socket.id + ' 유저가 나갔습니다.');
        console.log('유저 목록입니다.\n' + userList);

        if (typeof userList[socket.id] !== 'undefined') {
            var disconnectRoom = userList[socket.id].room;
            socket.leave(disconnectRoom);
            io.sockets.in(disconnectRoom).emit('disconnect');
            delete userList[socket.id];

            var clientsInRoom = io.sockets.adapter.rooms[disconnectRoom];

            if (typeof clientsInRoom !== 'undefined') {
                var remainClients = Object.keys(clientsInRoom.sockets);

                remainClients.forEach(function (clientId) {
                    userList[clientId].socket.leave(userList[clientId].room);
                    delete userList[clientId];
                });
            }
        }
    });
});
