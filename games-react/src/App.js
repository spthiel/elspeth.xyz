import logo from './logo.svg';
import './App.css';
import BorderLayout from "./layouts/BorderLayout/BorderLayout";
import PlayerList from "./components/playerlist/PlayerList";
import {addEventListener, removeListener} from "./api/Dispatcher";
import {Listener} from "./api/Listener";
import {useEffect, useState} from "react/cjs/react.production.min";

function App() {

    return (
        <BorderLayout
            left={
                <PlayerList/>
            }
            center={
                <div>
                    Test2
                </div>
            }
            right={
                <div/>
            }/>
    );
}

export default App;
