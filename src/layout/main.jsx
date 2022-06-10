import React, { useState,useEffect } from 'react';
import Header from '../components/appbar'
import './login.css'
import getGroupInfo from '../api/groupChat/getGroupInfo'
import WebIM from '../utils/WebIM';
import { loginWithToken, loginWithPassword } from '../api/loginChat'
import { EaseApp } from 'chat-uikit2'
import { createHashHistory } from 'history'
import store from '../redux/store'
import { setMyUserInfo, setUnread, setCurrentSessionId, setThreadInfo } from '../redux/actions'
import SessionInfoPopover from '../components/appbar/sessionInfo'
import GroupMemberInfoPopover from '../components/appbar/chatGroup/memberInfo'
import GroupSettingsDialog from '../components/appbar/chatGroup/groupSettings'
import { Report } from '../components/report';
import i18next from "i18next";
import { subFriendStatus } from '../api/presence'
import map3 from '../assets/notify.mp3'

import { changeTitle } from '../utils/notification'

import { truncate } from 'lodash';
import EditThreadPanel from '../components/thread/components/editThreadPanel'
import ThreadMembers from '../components/thread/components/threadMembers';
import ThreadDialog from '../components/thread/components/threadDialog'
// import { getSilentModeForConversation } from '../api/notificationPush'
const history = createHashHistory()

export default function Main() {
    //support edit thread 
    EaseApp.thread.setShowThread(true)
    EaseApp.thread.setHasThreadEditPanel(true)
    useEffect(() => {
        const webimAuth = sessionStorage.getItem('webim_auth')
        let webimAuthObj = {}
        if (webimAuth && WebIM.conn.logOut) {
            webimAuthObj = JSON.parse(webimAuth)
            if(webimAuthObj.password){
                loginWithPassword(webimAuthObj.agoraId, webimAuthObj.password)
            }else{
                loginWithToken(webimAuthObj.agoraId, webimAuthObj.accessToken)
            }
            store.dispatch(setMyUserInfo({ agoraId: webimAuthObj.agoraId, nickName: webimAuthObj.nickName }))
        }else if (WebIM.conn.logOut) {
            history.push('/login')  
        }
    }, [])
    const state = store.getState();
    const [sessionInfoAddEl, setSessionInfoAddEl] = useState(null)
    const [sessionInfo, setSessionInfo] = useState({});

    const [groupMemberInfoAddEl, setGroupMemberInfoAddEl] = useState(null)
    const [memberInfo, setMemberInfo] = useState({})
    const [presenceList, setPresenceList] = useState([])
    const [groupSettingAddEl, setGroupSettingAddEl] = useState(null)
    const [currentGroupId, setCurrentGroupId] = useState("");

    const [isShowReport, setShowReport] = useState(false)
    const [currentMsg, setCurrentMsg] = useState({})
    // session avatar click
    const handleClickSessionInfoDialog = (e,res) => {
        let {chatType,to} = res
        if (chatType === "singleChat") {
            setSessionInfoAddEl(e.target);
            setSessionInfo(res)
        } else if (chatType === "groupChat"){
            getGroupInfo(to)
            setGroupSettingAddEl(e.target)
            setCurrentGroupId(to)
        }
    }

    const handleClickGroupMemberInfoDialog = (e,res) => {
        let isGroupChat = res.chatType === "groupChat"
        if (isGroupChat) {
            subFriendStatus({usernames: [res.from]}).then(val => {
                setPresenceList(val)
                setMemberInfo(res)
                setGroupMemberInfoAddEl(e.target);
            })
        }
    }

    const handleonConversationClick = (session) => {
        console.log(session, 'handleonConversationClick')
        const { sessionType, sessionId } = session
        store.dispatch(setCurrentSessionId(sessionId))
        const { unread } = store.getState()
        console.log(unread, 'main')
        if (!unread[sessionType][sessionId]) {
            unread[sessionType][sessionId] = {}
        }
        unread[sessionType][sessionId] = {
            realNum: 0,
            fakeNum: 0
        }
        store.dispatch(setUnread(unread))
        changeTitle()
    }

    const onMessageEventClick = (e,data,msg) => {
        if(data.value === 'report'){
            setShowReport(true)
            setCurrentMsg(msg)
        }        
    }

    const [clickEditPanelEl,setClickEditPanelEl] = useState(null);
    const [membersPanelEl,setmembersPanelEl] = useState(null);
    const changeEditPanelStatus = (e,info) =>{
        if(e){
            setClickEditPanelEl(e.currentTarget)
            store.dispatch(setThreadInfo(info))
        }
        else{
            setClickEditPanelEl(e)
        }
    }
    const onchangeEditPanelStatus = (e,type)=>{
        store.dispatch(setThreadInfo({currentEditPage:type}))
        if(type === 'Members'){
            setmembersPanelEl(e.currentTarget)
        }
    }
    // const onOpenThreadPanel = (obj) => {
    //     console.log(obj, 'onOpenThreadPanel')
    //     getSilentModeForConversation({conversationId: obj.id, type: 'groupChat', flag: 'Thread' }).then(res => {
    //         console.log(res, 'getNotDisturbDuration')
    //     })
    // }
    return (
        <div className='main-container'>
            <EaseApp
                isShowReaction={true}
                header={<Header />}
                onChatAvatarClick={handleClickSessionInfoDialog}
                onAvatarChange={handleClickGroupMemberInfoDialog}
                onConversationClick={handleonConversationClick}
                customMessageList={[{name: i18next.t("Report"), value: 'report', position: 'others'}]}
                customMessageClick={onMessageEventClick}
                onEditThreadPanel={changeEditPanelStatus}
                // onOpenThreadPanel={onOpenThreadPanel}
                // isShowReaction
            />
            <SessionInfoPopover 
                open={sessionInfoAddEl}
                onClose={() => setSessionInfoAddEl(null)}
                sessionInfo={sessionInfo}/>
            <GroupMemberInfoPopover 
                open={groupMemberInfoAddEl}
                onClose={() => setGroupMemberInfoAddEl(null)}
                memberInfo={memberInfo}
                presenceList={presenceList}/>
            <GroupSettingsDialog 
                open={groupSettingAddEl}
                onClose={() => setGroupSettingAddEl(null)}
                currentGroupId={currentGroupId} />
            <Report open={isShowReport} onClose={() => {setShowReport(false)}} currentMsg={currentMsg}/>
            <EditThreadPanel 
                anchorEl={clickEditPanelEl} 
                onClose={() => setClickEditPanelEl(null)} 
                onchangeEditPanelStatus = {onchangeEditPanelStatus}/>
            <ThreadMembers membersPanelEl={membersPanelEl}/>
            <ThreadDialog/>
            <audio id="agoraChatSoundId" src={map3}></audio>
        </div>
    )
}

