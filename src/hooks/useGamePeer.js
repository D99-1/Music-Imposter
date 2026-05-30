import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { getRandomWord } from '../utils/words';
import _ from 'lodash';

const INITIAL_STATE = {
  roomId: null,
  players: [],
  status: 'LOBBY',
  round: 1,
  settings: {
    maxRounds: 3,
    imposterCount: 1,
    customWords: [],
    timeLimit: 60,
  },
  currentWord: null,
  currentPlayingPlayerIndex: 0,
  winner: null,
  lastEliminated: null,
  timeLeft: 0,
};

const generateRoomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export function useGamePeer() {
  const [peer, setPeer] = useState(null);
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);
  const [activePeerId, setActivePeerId] = useState(null);

  const connections = useRef({});
  const timerRef = useRef(null);

  const stateRef = useRef(gameState);
  const isHostRef = useRef(isHost);
  const activePeerIdRef = useRef(activePeerId);

  useEffect(() => { stateRef.current = gameState; }, [gameState]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { activePeerIdRef.current = activePeerId; }, [activePeerId]);

  const broadcastState = useCallback((state) => {
    if (!isHostRef.current) return;
    Object.values(connections.current).forEach(conn => {
      if (conn.open) {
        conn.send({ type: 'STATE_UPDATE', state });
      }
    });
  }, []);

  const handleAction = useCallback((action, fromPeerId) => {
    const currentIsHost = isHostRef.current;
    const currentState = stateRef.current;

    console.log('[GamePeer] Action:', action.type, 'from:', fromPeerId, 'isHost:', currentIsHost);

    if (!currentIsHost && !['STATE_UPDATE', 'KICKED'].includes(action.type)) {
      const hostConn = connections.current[currentState.roomId];
      if (hostConn && hostConn.open) {
        hostConn.send(action);
      }
      return;
    }

    setGameState(prevState => {
      let newState = _.cloneDeep(prevState);

      switch (action.type) {
        case 'STATE_UPDATE':
          return action.state;

        case 'KICKED':
          setError(action.reason || 'You were kicked from the room');
          return INITIAL_STATE;

        case 'JOIN':
          if (!newState.players.find(p => p.id === fromPeerId)) {
            newState.players.push({
              id: fromPeerId,
              name: action.name || 'Anonymous',
              isHost: false,
              isReady: false,
              score: 0,
              eliminated: false,
            });
          }
          break;

        case 'KICK_PLAYER':
          if (currentIsHost) {
            newState.players = newState.players.filter(p => p.id !== action.targetId);
            const conn = connections.current[action.targetId];
            if (conn) {
              conn.send({ type: 'KICKED' });
              conn.close();
              delete connections.current[action.targetId];
            }
          }
          break;

        case 'UPDATE_SETTINGS':
          newState.settings = { ...newState.settings, ...action.settings };
          break;

        case 'START_GAME': {
          newState.status = 'REVEAL';
          newState.round = 1;
          newState.currentWord = getRandomWord(newState.settings.customWords);
          const eligiblePlayers = newState.players.filter(p => !p.eliminated);
          const shuffled = _.shuffle(eligiblePlayers);
          const imposterCount = Math.max(1, Math.min(newState.settings.imposterCount, eligiblePlayers.length - 1));
          const imposterIds = shuffled.slice(0, imposterCount).map(p => p.id);
          newState.players = newState.players.map(p => ({
            ...p,
            isImposter: imposterIds.includes(p.id),
            isReady: false,
            song: null,
            votedFor: null,
            eliminated: false,
          }));
          break;
        }

        case 'START_SEARCH':
          newState.status = 'SEARCH';
          newState.players.forEach(p => { p.isReady = false; });
          newState.timeLeft = newState.settings.timeLimit;
          break;

        case 'TICK':
          if (currentIsHost && newState.status === 'SEARCH') {
            newState.timeLeft -= 1;
            if (newState.timeLeft <= 0) {
              const readyPlayers = newState.players.filter(p => !p.eliminated && p.isReady);
              if (readyPlayers.length < 3) {
                 newState.status = 'LOBBY';
              } else {
                 newState.status = 'PLAYBACK';
                 newState.currentPlayingPlayerIndex = 0;
              }
            }
          }
          break;

        case 'SUBMIT_SONG': {
          const player = newState.players.find(p => p.id === fromPeerId);
          if (player) {
            player.song = action.song;
            player.isReady = true;
          }
          const activeOnes = newState.players.filter(p => !p.eliminated);
          if (activeOnes.every(p => p.isReady)) {
            newState.status = 'PLAYBACK';
            newState.currentPlayingPlayerIndex = 0;
            newState.players.forEach(p => { p.isReady = false; });
          }
          break;
        }

        case 'NEXT_SONG': {
          newState.currentPlayingPlayerIndex += 1;
          const playersWithSongs = newState.players.filter(p => !p.eliminated && p.song);
          if (newState.currentPlayingPlayerIndex >= playersWithSongs.length) {
            newState.status = 'VOTING';
            newState.players.forEach(p => { p.isReady = false; });
          }
          break;
        }

        case 'VOTE': {
          const voter = newState.players.find(p => p.id === fromPeerId);
          if (voter && !voter.eliminated) {
            voter.votedFor = action.targetId;
            voter.isReady = true;
          }
          const votingPlayers = newState.players.filter(p => !p.eliminated);
          if (votingPlayers.every(p => p.isReady)) {
            newState.status = 'RESULTS';
            const votes = _.countBy(votingPlayers, 'votedFor');
            const maxVotes = _.max(Object.values(votes)) || 0;
            const mostVotedIds = Object.keys(votes).filter(id => votes[id] === maxVotes);
            const eliminatedId = mostVotedIds[0];
            const eliminatedPlayer = newState.players.find(p => p.id === eliminatedId);

            if (eliminatedPlayer) {
              eliminatedPlayer.eliminated = true;
              newState.lastEliminated = {
                name: eliminatedPlayer.name,
                isImposter: eliminatedPlayer.isImposter
              };

              const remainingImposters = newState.players.filter(p => !p.eliminated && p.isImposter);
              if (remainingImposters.length === 0) {
                newState.status = 'GAME_OVER';
                newState.winner = 'CREW';
              } else {
                const remainingCrew = newState.players.filter(p => !p.eliminated && !p.isImposter);
                if (remainingCrew.length <= remainingImposters.length) {
                  newState.status = 'GAME_OVER';
                  newState.winner = 'IMPOSTERS';
                }
              }
            }
          }
          break;
        }

        case 'NEXT_ROUND':
          if (newState.status === 'RESULTS') {
            newState.round += 1;
            if (newState.round > newState.settings.maxRounds) {
               newState.status = 'GAME_OVER';
               newState.winner = 'IMPOSTERS';
            } else {
              newState.status = 'REVEAL';
              newState.currentWord = getRandomWord(newState.settings.customWords);
              newState.players.forEach(p => {
                p.isReady = false;
                p.song = null;
                p.votedFor = null;
              });
            }
          }
          break;

        case 'RESET':
          newState = {
            ...INITIAL_STATE,
            roomId: prevState.roomId,
            players: prevState.players.map(p => ({
              ...p,
              eliminated: false,
              score: 0,
              isImposter: false,
              song: null,
              isReady: false,
              votedFor: null
            })),
            settings: prevState.settings
          };
          break;
      }
      return newState;
    });
  }, []);

  useEffect(() => {
    if (isHost && gameState.roomId) {
      broadcastState(gameState);
    }
  }, [gameState, isHost, broadcastState]);

  useEffect(() => {
    if (isHost && gameState.status === 'SEARCH') {
      timerRef.current = setInterval(() => {
        handleAction({ type: 'TICK' }, activePeerIdRef.current);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHost, gameState.status, handleAction]);

  const createRoom = useCallback(function createRoomInternal(name) {
    const code = generateRoomCode();
    const newPeer = new Peer(code, { debug: 1 });
    newPeer.on('open', (id) => {
      setPeer(newPeer);
      setIsHost(true);
      setActivePeerId(id);
      setGameState({
        ...INITIAL_STATE,
        roomId: id,
        players: [{ id, name: name || 'Host', isHost: true, isReady: false, score: 0, eliminated: false }]
      });
    });
    newPeer.on('connection', (conn) => {
      conn.on('open', () => {
        connections.current[conn.peer] = conn;
        conn.on('data', (data) => handleAction(data, conn.peer));
        conn.send({ type: 'STATE_UPDATE', state: stateRef.current });
      });
      conn.on('close', () => {
        delete connections.current[conn.peer];
        setGameState(prev => ({
          ...prev,
          players: prev.players.filter(p => p.id !== conn.peer)
        }));
      });
    });
    newPeer.on('error', (err) => {
      if (err.type === 'unavailable-id') createRoomInternal(name);
      else setError(err.message);
    });
  }, [handleAction]);

  const joinRoom = useCallback((roomId, name) => {
    const newPeer = new Peer(null, { debug: 1 });
    newPeer.on('open', (id) => {
      setPeer(newPeer);
      setIsHost(false);
      setActivePeerId(id);
      const conn = newPeer.connect(roomId, { reliable: true });
      conn.on('open', () => {
        connections.current[roomId] = conn;
        conn.send({ type: 'JOIN', name });
        conn.on('data', (data) => handleAction(data, roomId));
      });
      conn.on('close', () => {
        setError('Connection to host lost');
        setGameState(INITIAL_STATE);
      });
      conn.on('error', () => setError('Room not found or connection failed'));
    });
    newPeer.on('error', (err) => setError(err.message));
  }, [handleAction]);

  const leaveRoom = useCallback(() => {
    if (peer) peer.destroy();
    setPeer(null);
    setIsHost(false);
    setGameState(INITIAL_STATE);
    connections.current = {};
    setActivePeerId(null);
  }, [peer]);

  const sendAction = useCallback((action) => {
    handleAction(action, activePeerIdRef.current);
  }, [handleAction]);

  return { peerId: activePeerId, gameState, isHost, error, createRoom, joinRoom, leaveRoom, sendAction };
}
