import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

import { Injectable } from '@angular/core';
import { addDoc, docData, Firestore } from '@angular/fire/firestore';
import { servers } from '@components/streaming/server';
import { UserService } from './user.service';
import { take } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class StreamService {
	private pc!: RTCPeerConnection;
	private streamerStream!: MediaStream;
	private viewStream!: MediaStream;

	constructor(
		private readonly firestore: Firestore
	) { }

	async initStreamer(): Promise<void> {
		this.pc = new RTCPeerConnection(servers);
		this.streamerStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
		this.streamerStream.getTracks().forEach(track => {
			this.pc.addTrack(track, this.streamerStream);
		});

		this.registerPeerConnectionListeners();
		this.pc.onicecandidate = event => {
			if (event.candidate) {
				const offerCandidates = collection(this.firestore, 'candidates');
				addDoc(offerCandidates, event.candidate.toJSON());
			}
		}
	}

	async createStream(userId: string): Promise<void> {
		const offer = await this.pc.createOffer();
		await this.pc.setLocalDescription(offer);

		const streamRef = doc(this.firestore, 'streams', userId);
		await setDoc(streamRef, { offer }).then(() =>
			console.log(`offer has been saved. id=${userId}, offer=${offer}`)
		);

		onSnapshot(streamRef, async snapshot => {
			console.log('Got updated stream:', snapshot.data());
			const data = snapshot.data();
			if (!this.pc.currentRemoteDescription && data?.['answer']) {
				console.log('Set remote description: ', data['answer']);
				const answer = new RTCSessionDescription(data['answer']);
				await this.pc.setRemoteDescription(answer);
			}
		});
		// const answerCandidates = collection(this.firestore, 'streams', userId, 'answerCandidates');
		// onSnapshot(streamRef, snapshot => {
		// 	const data = snapshot.data();
		// 	if (!this.pc.currentRemoteDescription && data?.['answer']) {
		// 		const answerDescription = new RTCSessionDescription(data['answer']);
		// 		this.pc.setRemoteDescription(answerDescription);
		// 	}
		// });

		// onSnapshot(answerCandidates, snapshot => {
		// 	snapshot.docChanges().forEach(change => {
		// 		if (change.type === 'added') {
		// 			const candidate = new RTCIceCandidate();
		// 		}
		// 	});
		// });
	}

	async removeStream(streamId: string): Promise<void> {
		this.localStream.getTracks().forEach(track => track.stop());

		if (this.remoteStream) {
			this.remoteStream.getTracks().forEach(track => track.stop());
		}

		if (this.pc) {
			this.pc.close();
		}
	}

	async join(streamId: string): Promise<void> {
		this.viewStream = new MediaStream();
		this.pc = new RTCPeerConnection(servers);
		const streamRef = doc(this.firestore, 'streams', streamId);
		docData(streamRef).pipe(
			take(1)
		).subscribe(async snapshot => {
			const offer = snapshot['offer'];

			console.log('Got stream:', snapshot);
			try {
				await this.pc.setRemoteDescription(offer);
				const answer = await this.pc.createAnswer();
				await this.pc.setLocalDescription(answer);
				await updateDoc(streamRef, { answer });
			} catch (error) {
				console.log(error);
			}
		});

		this.pc.addEventListener('track', event => {
			console.log('Got remote track:', event.streams[0]);
			event.streams[0].getTracks().forEach(track => {
				console.log('Add a track to the remoteStream:', track);
				this.viewStream.addTrack(track);
			});
		});

		// onSnapshot(streamRef, snapshot => {
		// 	snapshot.forEach(doc => {
		// 		const offer = doc.data()['offer'];
		// 		this.pc.setRemoteDescription(offer);
		// 	});
		// });

		// const candidateRef = collection(this.firestore, 'streams', streamId, 'offerCandidates');
		// onSnapshot(candidateRef, snapshot => {
		// 	snapshot.forEach(doc => {
		// 		const candidate = doc.data()['candidate'];
		// 		this.pc.addIceCandidate(new RTCIceCandidate(candidate));
		// 	});
		// });

		// const answer = await this.pc.createAnswer();
		// await this.pc.setLocalDescription(answer);

		// const streamRef = doc(this.firestore, 'streams', streamerId);
		// const answerCandidates = collection(this.firestore, 'streams', streamerId, 'answerCandidates');
		// this.pc.onicecandidate = event => {
		// 	event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
		// }
		// const answerDescription = await this.pc.createAnswer();
		// await this.pc.setLocalDescription(answerDescription)
	}


	private registerPeerConnectionListeners() {
		this.peerConnection.addEventListener('icegatheringstatechange', () => {
			console.log(
				`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
		});

		this.peerConnection.addEventListener('connectionstatechange', () => {
			console.log(`Connection state change: ${this.peerConnection.connectionState}`);
		});

		this.peerConnection.addEventListener('signalingstatechange', () => {
			console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
		});

		this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
			console.log(
				`ICE connection state change: ${this.peerConnection.iceConnectionState}`);
		});
	}

	get peerConnection() {
		return this.pc;
	}

	get localStream() {
		return this.streamerStream;
	}

	get remoteStream() {
		return this.viewStream;
	}
}
