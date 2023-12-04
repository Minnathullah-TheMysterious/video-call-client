import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";

const Room = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const socket = useSocket();

  const handleUserJoined = useCallback((data) => {
    const { email, id } = data;

    setRemoteSocketId(id);

    console.log(`${email} joined the room`);
  }, []);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      console.log({ from, offer });

      setRemoteSocketId(from);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      await peer.setLocalDescription(ans);
      console.log("Call Accepted");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegotiationneededIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:negotiation:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegotiationneededFinal = useCallback(async ({ from, ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:negotiation:needed", handleNegotiationneededIncoming);
    socket.on("peer:negotiation:final", handleNegotiationneededFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:negotiation:needed", handleNegotiationneededIncoming);
      socket.off("peer:negotiation:final", handleNegotiationneededFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegotiationneededIncoming,
    handleNegotiationneededFinal,
  ]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handleNegotiationneeded = useCallback(
    async (ev) => {
      const offer = await peer.getOffer();
      socket.emit("peer:negotiation:needed", { offer, to: remoteSocketId });
    },
    [remoteSocketId, socket]
  );

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationneeded);

    return () => {
      peer.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationneeded
      );
    };
  }, [handleNegotiationneeded]);

  const handleCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setMyStream(stream);

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);
  return (
    <>
      <h1 className="text-center text-4xl font-extrabold my-10 font-serif tracking-widest">
        Room Page
      </h1>
      <h4 className="m-10 font-semibold text-lg">
        {remoteSocketId ? "Connected" : "No one in room"}
      </h4>
      {myStream && (
        <button
          className="px-3 py-1 mx-8 font-bold font-serif text-lg rounded-sm text-white bg-green-600 hover:cursor-pointer hover:bg-green-700 active:bg-green-600"
          onClick={sendStreams}
        >
          Send Stream
        </button>
      )}
      {remoteSocketId ? (
        <button
          className="px-3 py-1 mx-8 font-bold font-serif text-lg rounded-sm text-white bg-green-600 hover:cursor-pointer hover:bg-green-700 active:bg-green-600"
          onClick={handleCall}
        >
          Call
        </button>
      ) : null}
      <div className="flex justify-evenly">
        {myStream && (
          <div className="flex flex-col">
            <h1 className="mt-10 mb-3 font-semibold text-lg">My Stream</h1>
            <ReactPlayer
              playing
              muted
              height={300}
              width={500}
              url={myStream}
            />
          </div>
        )}
        {remoteStream && (
          <div className="flex flex-col">
            <h1 className="mt-10 mb-3 font-semibold text-lg">Remote Stream</h1>
            <ReactPlayer
              playing
              muted
              height={300}
              width={500}
              url={remoteStream}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Room;
