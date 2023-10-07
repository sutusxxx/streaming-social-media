import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

import { Injectable } from '@angular/core';
import { addDoc, Firestore } from '@angular/fire/firestore';
import { servers } from '@components/streaming/server';

@Injectable({
	providedIn: 'root'
})
export class StreamService {
	private pc: RTCPeerConnection = new RTCPeerConnection(servers);

	constructor(
		private readonly firestore: Firestore
	) { }

	async createOffer(userId: string): Promise<void> {
		const streamRef = doc(this.firestore, 'streams', userId);
		const offerCandidates = collection(this.firestore, 'streams', userId, 'offerCandidates');
		const answerCandidates = collection(this.firestore, 'streams', userId, 'answerCandidates');
		const offerDescription = await this.pc.createOffer();
		await this.pc.setLocalDescription(offerDescription);

		this.pc.onicecandidate = event => {
			event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
		}

		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type
		};

		await setDoc(streamRef, offer);

		onSnapshot(streamRef, snapshot => {
			const data = snapshot.data();
			if (!this.pc.currentRemoteDescription && data?.['answer']) {
				const answerDescription = new RTCSessionDescription(data['answer']);
				this.pc.setRemoteDescription(answerDescription);
			}
		});

		onSnapshot(answerCandidates, snapshot => {
			snapshot.docChanges().forEach(change => {
				if (change.type === 'added') {
					const candidate = new RTCIceCandidate();
				}
			});
		});
	}

	async join(streamerId: string): Promise<void> {
		const streamRef = doc(this.firestore, 'streams', streamerId);
		const answerCandidates = collection(this.firestore, 'streams', streamerId, 'answerCandidates');
		this.pc.onicecandidate = event => {
			event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
		}
	}

	get peerConnection() {
		return this.pc;
	}
}
