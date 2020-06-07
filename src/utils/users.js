const users = []

//addUser
const addUser = ({id,username,room}) =>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room){
        return {
            error:'username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room == room && user.username == username
    })
    //validate
    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = {id,username,room}
    users.push(user)
    return {user}
}

//remove user
const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id==id)
    if(index!=-1){
        return users.splice(index, 1)[0] //we remove the user and get back a array
    }
}

//get user by id
const getUser = (id)=>{
    return users.find((user)=>user.id==id)
}

//get users in a room
const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>user.room==room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}