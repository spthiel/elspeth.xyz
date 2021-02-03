import './Playerlist.css'
import React, {useEffect, useState} from 'react';
import {addEventListener, removeListener, sendData} from "../../api/Dispatcher";
import {SetNamePacket} from "../../api/Packets";
import {Listener} from "../../api/Listener";

function PlayerList() {

    const [players, setPlayers] = useState([]);

    const onKeyPress = (event) => {
        if (event.code === "Enter") {
            sendData(new SetNamePacket(event.target.value))
        }
    }

    useEffect(() => {
        let listenerId = addEventListener(new Listener('sync', (data) => {
            console.log(data);
            setPlayers(data);
        }))

        return () => {
            removeListener('sync', listenerId);
        }
    })

    return (
        <React.Fragment>
            <input type="text" placeholder="Set name" onKeyPress={onKeyPress}/>
            <div className="player-list">
                {players.map((player, i) => <Player key={i} player={player}/>)}
            </div>
        </React.Fragment>
    );
}

function Player(props) {
    return (
        <span className="player">{props.player.name}</span>
    )
}

export default PlayerList;
