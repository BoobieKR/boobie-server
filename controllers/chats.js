/**
 * @author Seungwoo Yeom
 * @date 2016.10.11
 */

'use strict';

let app = require('express')(),
    http = require('http').Server(app),
    User = require('../models/users');

http.listen(8080, function () {
    console.log('Socket IO server has been started on port 8080');
});

let io = require('socket.io').listen(http);

var SocketUser = function (userSocket) {
    this.socket = userSocket;
    this.userInfo = {};

    this.joinRoom = function (roomId) {
        this.roomId = roomId;
        return this.socket.join(roomId);
    };

    this.leaveRoom = function () {
        this.socket.emit('leaveRoom', {'type': 0});
        return this.socket.leave(this.roomId);
    };

    this.getAssignedRoom = function () {
        return this.roomId;
    }

    this.getSocket = function () {
        return this.socket;
    };

    this.setUserInfo = function (userInfo) {
        return this.userInfo = userInfo;
    };

    this.getUserInfo = function () {
        return this.userInfo;
    }
};

var UserManager = new function () {
    this.users = [];

    this.addUser = function (user) {
        this.users.push(user);
    };

    this.deleteUserById = function (socketId) {
        for (var userIdx in this.users) {
            if (this.users[userIdx].socket.id == socketId) {
                delete this.users[userIdx];
            }
        }
    };

    this.getUserById = function (socketId) {
        for (let user of this.users) {
            console.log(user);
            if (user.socket.id == socketId)
                return user;
        }
    };

    this.getAllUser = function () {
        return this.users;
    };

};

var RoomManager = new function () {
    this.rooms = io.sockets.adapter.rooms;
    this.roomLabels = [];

    this.emitAll = function (eventName, eventValue) {
        for (let room of rooms) {
            io.sockets.in(room).emit(eventName, eventValue);
        }
    };

    this.createRoom = function (user) {
        var socketId = user.getSocket().id;

        this.roomLabels.push(socketId);
        user.joinRoom(socketId);
    };

    this.deleteRoom = function (socketId) {
        var user = UserManager.getUserById(socketId);
        var assignedRoom = user.getAssignedRoom();
        //TODO sockets is undefined

        var remainUsers = Object.keys(this.rooms[assignedRoom].sockets);

        for (let user of remainUsers) {
            UserManager.getUserById(user).leaveRoom();
        }

        io.sockets.in(user.getAssignedRoom()).emit('disconnect');
        delete this.roomLabels[assignedRoom];
    }

    this.emitById = function (room, eventName, eventValue) {
        io.sockets.in(room).emit(eventName, eventValue);
    };

    this.isFull = function (roomId) {
        return this.rooms[roomId].length == 2;
    };

    this.isFullAll = function () {

        if(!this.roomLabels.length){
            return false;
        }

        for (let label of this.roomLabels) {
            if (this.rooms[label].length == 1) {
                return false;
            }
        }
        return true;
    }
};

io.sockets.on('connection', function (socket) {

    UserManager.addUser(new SocketUser(socket));
    console.log(socket.id + '연결되었습니다.');

    socket.on('watingForStranger', function (userInfo) {
        User.findOne({userToken: userInfo.userToken}, function (err, user) {
            if (!err) {
                if (user) {
                    var currentUser = UserManager.getUserById(socket.id);
                    currentUser.setUserInfo(user);
                    socket.emit('foundUser', {status: 'success', userInfo: user});
                    if (!RoomManager.roomLabels.length || RoomManager.isFullAll()) {
                        console.log('방이 한개도 없거나 전부 다 차서 방을 만들고 기다립니다.');
                        socket.emit('joinWithStranger', {'type': 0});
                        RoomManager.createRoom(currentUser);
                    } else {
                        for (let label of RoomManager.roomLabels) {
                            if (!RoomManager.isFull(label)) {
                                console.log('올ㅋ');
                                currentUser.joinRoom(label);
                                socket.emit('joinWithStranger', {'type': 1});
                                break;
                            }
                        }
                    }
                } else {
                    socket.emit('foundUser', {status: 'failed'});
                }
            } else {
                console.log('해당 유저를 찾는 중 에러가 발생했습니다.');
                socket.emit('foundUser', {status: 'error'});
            }
        });
    });

    socket.on('sendMessage', function (data) {
        var user = UserManager.getUserById(socket.id);
        RoomManager.emitById(user.getAssignedRoom(), 'receiveMessage', data);

        console.log(user.getUserInfo().userName + "님께서 메세지를 전송하셨습니다.");
    });

    socket.on('cancelRequest', function () {
        var user = UserManager.getUserById(socket.id);
        user.leaveRoom();
    });

    socket.on('disconnect', function () {
        console.log(socket.id + ' 유저가 나갔습니다.');

        // UserManager.deleteUserById(socket.id);
        RoomManager.deleteRoom(socket.id);

        // if (typeof userList[socket.id] !== 'undefined') {
        //     var disconnectRoom = userList[socket.id].room;
        //     socket.leave(disconnectRoom);
        //     io.sockets.in(disconnectRoom).emit('disconnect');
        //     delete userList[socket.id];
        //
        //     var clientsInRoom = io.sockets.adapter.rooms[disconnectRoom];
        //
        //     if (typeof clientsInRoom !== 'undefined') {
        //         var remainClients = Object.keys(clientsInRoom.sockets);
        //
        //         remainClients.forEach(function (clientId) {
        //             userList[clientId].socket.leave(userList[clientId].room);
        //             delete userList[clientId];
        //         });
        //     }
        // }
    });
});
/*fuck shit oh my goodness fuck your asshole */
