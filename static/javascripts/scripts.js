

const appid = "34d03177f6cb49d581ae8471b1da54a1";
const appcertificate = "3985109f51cf44479febb3f477247b21";
const channel = sessionStorage.getItem('room')
// token needs to get refreshed every 24 hours
const token = sessionStorage.getItem('token');
let UID=sessionStorage.getItem('UID');
let NAME=sessionStorage.getItem('name')
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
let localTracks = []
let remoteUsers = {}

let joinanddisplaystream = async () => {
    document.getElementById('room-name').innerText=channel
    client.on('user-published', userjoined)
    client.on('user-left',userleft)
    try{
        UID=await client.join(appid, channel, token, UID);
        
    }catch(error){
        console.error(error)
        window.open('/','_self')
    }
    // UID=await client.join(appid, channel, token, UID);
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let member= await createMember()
    let player = `  <div class="video-container" id="user-container-${UID}">
                    <div class="video-player" id="user-${UID}"></div>
                    <div class="username-wrapper"><span class=user-name>${member.name}</span></div>
                </div> `
    document.getElementById('video-streams').insertAdjacentHTML("beforeend", player)

    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])
}
let userjoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null) {
            player.remove()
        }
        let member=await getMember(user)
        player = `  <div class="video-container" id="user-container-${user.uid}">
                <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                <div class="video-player" id="user-${user.uid}"></div>
            </div> `
        document.getElementById('video-streams').insertAdjacentHTML("beforeend", player)
        user.videoTrack.play(`user-${user.uid}`)
    }
    if (mediaType === "audio") {
        user.audioTrack.play()
    }
 
}
let userleft=async(user)=>{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}
let clickcamera = async (e) => {
    // e.preventDefault()
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor='red'
    }
}
let clickmic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor='red'
    }
}
let createMember=async()=>{
    let response= await fetch('/create_member/',{
        method:'POST',
        headers:{
            'Content-type':'application/json'
        },
        body:JSON.stringify({'name':NAME,'room_name':channel,'UID':UID})
    })
    let member=await response.json()
    return member
}
let getMember=async(user)=>{
    let response=await fetch(`/get_member/?UID=${user.uid}&room_name=${channel}`)
    let member=await response.json()
    return member
}
let leavestream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
    deleteMember()
    window.open('/', '_self')
}
// let redirecttolobby = async () => {
//     window.open('/', '_self')
// }
let deleteMember=async ()=>{
    let response=await fetch('/delete_member/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME,'room_name':channel,'UID':UID})

    })
    let member= await response.json()
    // return member
}
window.addEventListener("beforeunload",deleteMember);
// document.getElementById('testbutton').addEventListener('click', redirecttolobby)

joinanddisplaystream()
document.getElementById('leave-btn').addEventListener('click', leavestream)
document.getElementById('mic-btn').addEventListener('click', clickmic)
document.getElementById('camera-btn').addEventListener('click', clickcamera)


