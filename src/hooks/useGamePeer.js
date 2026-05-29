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
    timeLimit: 60, // Default 60 seconds
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
  const connections = useRef({});
  const stateRef = useRef(INITIAL_STATE);
  const currentPeerId = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const broadcastState = useCallback((newState) => {
    setGameState(newState);
    Object.values(connections.current).forEach(conn => {
      if (conn.open) {
        conn.send({ type: 'STATE_UPDATE', state: newState });
      }
    });
  }, []);

  const handleAction = useCallback((action, fromPeerId) => {
    setGameState(prevState => {
      let newState = _.cloneDeep(prevState);

      switch (action.type) {
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
          if (isHost) {
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

        case 'START_GAME':
          newState.status = 'REVEAL';
          newState.round = 1;
          newState.currentWord = getRandomWord(newState.settings.customWords);
          const activePlayers = newState.players.filter(p => !p.eliminated);
          const shuffled = _.shuffle(activePlayers);
          const imposterIds = shuffled.slice(0, Math.min(newState.settings.imposterCount, activePlayers.length - 1)).map(p => p.id);
          newState.players = newState.players.map(p => ({
            ...p,
            isImposter: imposterIds.includes(p.id),
            isReady: false,
            song: null,
            votedFor: null,
            eliminated: false,
          }));
          break;

        case 'START_SEARCH':
          newState.status = 'SEARCH';
          newState.players.forEach(p => p.isReady = false);
          newState.timeLeft = newState.settings.timeLimit;
          break;

        case 'TICK':
          if (isHost && newState.status === 'SEARCH') {
            newState.timeLeft -= 1;
            if (newState.timeLeft <= 0) {
              // Kick anyone not ready
              const notReadyIds = newState.players.filter(p => !p.eliminated && !p.isReady).map(p => p.id);
              newState.players = newState.players.filter(p => p.eliminated || p.isReady || p.isHost);
              notReadyIds.forEach(id => {
                const conn = connections.current[id];
                if (conn) {
                  conn.send({ type: 'KICKED', reason: 'Time exceeded' });
                  conn.close();
                  delete connections.current[id];
                }
              });

              if (newState.players.filter(p => !p.eliminated).length < 3) {
                 newState.status = 'LOBBY';
                 newState.roomId = prevState.roomId;
              } else {
                 newState.status = 'PLAYBACK';
                 newState.currentPlayingPlayerIndex = 0;
              }
            }
          }
          break;

        case 'SUBMIT_SONG':
          const player = newState.players.find(p => p.id === fromPeerId);
          if (player) {
            player.song = action.song;
            player.isReady = true;
          }
          if (newState.players.filter(p => !p.eliminated).every(p => p.isReady)) {
            newState.status = 'PLAYBACK';
            newState.currentPlayingPlayerIndex = 0;
            newState.players.forEach(p => p.isReady = false);
          }
          break;

        case 'NEXT_SONG':
          newState.currentPlayingPlayerIndex += 1;
          const remainingPlayers = newState.players.filter(p => !p.eliminated);
          if (newState.currentPlayingPlayerIndex >= remainingPlayers.length) {
            newState.status = 'VOTING';
            newState.players.forEach(p => p.isReady = false);
          }
          break;

        case 'VOTE':
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

      if (isHost) broadcastState(newState);
      return newState;
    });
  }, [isHost, broadcastState]);

  // Host Timer Logic
  useEffect(() => {
    if (isHost && gameState.status === 'SEARCH') {
      timerRef.current = setInterval(() => {
        handleAction({ type: 'TICK' }, currentPeerId.current);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isHost, gameState.status, handleAction]);

  const createRoom = useCallback((name) => {
    const code = generateRoomCode();
    const newPeer = new Peer(code);

    newPeer.on('open', (id) => {
      setPeer(newPeer);
      setIsHost(true);
      currentPeerId.current = id;

      const hostPlayer = { id, name: name || 'Host', isHost: true, isReady: false, score: 0, eliminated: false };
      const newState = {
        ...INITIAL_STATE,
        roomId: id,
        players: [hostPlayer]
      };
      setGameState(newState);
      stateRef.current = newState;
    });

    newPeer.on('connection', (conn) => {
      conn.on('open', () => {
        connections.current[conn.peer] = conn;
        conn.on('data', (data) => {
          handleAction(data, conn.peer);
        });
        conn.send({ type: 'STATE_UPDATE', state: stateRef.current });
      });

      conn.on('close', () => {
        delete connections.current[conn.peer];
      });
    });

    newPeer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        createRoom(name);
      } else {
        console.error(err);
        setError(err.message);
      }
    });
  }, [handleAction]);

  const joinRoom = useCallback((roomId, name) => {
    const newPeer = new Peer();

    newPeer.on('open', (id) => {
      setPeer(newPeer);
      setIsHost(false);
      currentPeerId.current = id;

      const conn = newPeer.connect(roomId);
      conn.on('open', () => {
        connections.current[roomId] = conn;
        conn.send({ type: 'JOIN', name });

        conn.on('data', (data) => {
          if (data.type === 'STATE_UPDATE') {
            setGameState(data.state);
          } else if (data.type === 'KICKED') {
            setError(data.reason || 'You were kicked from the room');
            setGameState(INITIAL_STATE);
          }
        });
      });

      conn.on('error', (err) => {
        setError('Room not found or connection failed');
      });
    });

    newPeer.on('error', (err) => {
      console.error(err);
      setError(err.message);
    });
  }, []);

  const sendAction = useCallback((action) => {
    if (isHost) {
      handleAction(action, currentPeerId.current);
    } else {
      const hostConn = connections.current[gameState.roomId];
      if (hostConn && hostConn.open) {
        hostConn.send(action);
      }
    }
  }, [isHost, handleAction, gameState.roomId]);

  return {
    peerId: currentPeerId.current,
    gameState,
    isHost,
    error,
    createRoom,
    joinRoom,
    sendAction,
  };
}
