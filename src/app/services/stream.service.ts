import {
	collection,
	doc,
	DocumentData,
	DocumentReference,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	Timestamp,
	updateDoc
} from 'firebase/firestore';
import { concatMap, EMPTY, Observable, take } from 'rxjs';
import { servers } from 'src/app/configuration/server';

import { Injectable } from '@angular/core';
import { addDoc, collectionData, docData, Firestore } from '@angular/fire/firestore';
import { UserService } from '@services/user.service';
import { User } from '../models';

@Injectable({
	providedIn: 'root'
})
export class StreamService {
	private pc: RTCPeerConnection = new RTCPeerConnection(servers);

	private streamerStream!: MediaStream;
	private viewStream!: MediaStream;

	constructor(
		private readonly firestore: Firestore,
		private readonly userService: UserService
	) { }

	public registerPeerConnectionListeners() {
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

	createRoom(): Observable<void> {
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(async currentUser => {
				if (!currentUser) throw new Error('Not Authenticated!');
				await this.initStream();
				await this.saveRoom(currentUser.uid);
				this.addLocalTracks();
				this.addRoomListener(currentUser.uid);
				this.collectIceCandidates(currentUser.uid);
			})
		);
	}

	joinRoomById(roomId: string): Observable<void> {
		const roomRef = doc(this.firestore, 'rooms', roomId);
		return docData(roomRef).pipe(
			take(1),
			concatMap(async room => {
				if (!room) throw new Error('Room Not Found!');
				this.addRemoteTracks();
				const offer = room['offer'];
				await this.createSDPAnswer(offer, roomRef);
				this.collectIceCandidates(roomId);
			})
		);
	}

	collectIceCandidates(roomId: string): void {
		const localCandidateRef = collection(this.firestore, 'rooms', roomId, 'offerCandidates');

		this.pc.addEventListener('icecandidate', event => {
			if (!event.candidate) return;
			console.log('Save Candidate:', event.candidate);
			addDoc(localCandidateRef, event.candidate.toJSON());
		});

		const remoteCandidateRef = collection(this.firestore, 'rooms', roomId, 'answerCandidates');
		onSnapshot(remoteCandidateRef, snapshot => {
			snapshot.docChanges().forEach(change => {
				if (change.type === 'added') {
					const candidate = new RTCIceCandidate(change.doc.data());
					console.log('Add ICE Candidate:', candidate);
					this.pc.addIceCandidate(candidate);
				}
			});
		});
	}

	getChat(roomId: string): Observable<any[]> {
		const ref = collection(this.firestore, 'rooms', roomId, 'chat');
		const queryAll = query(ref, orderBy('date', 'asc'));
		return collectionData(queryAll) as Observable<any[]>;
	}

	addMessage(roomId: string, message: string): Observable<any> {
		const ref = collection(this.firestore, 'rooms', roomId, 'chat');
		const date = Timestamp.fromDate(new Date());
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(user => {
				return addDoc(ref, {
					text: message,
					senderId: user?.uid,
					senderName: user?.displayName,
					date: date
				});
			})
		);
	}

	private async createSDPAnswer(offer: any, roomRef: DocumentReference<DocumentData>): Promise<void> {
		await this.pc.setRemoteDescription(offer);
		const answerDescription = await this.pc.createAnswer();
		await this.pc.setLocalDescription(answerDescription);
		const answer = {
			sdp: answerDescription.sdp,
			type: answerDescription.type
		};
		await updateDoc(roomRef, { answer });
	}

	private addRemoteTracks(): void {
		this.pc.addEventListener('track', event => {
			console.log('Got remote track:', event.streams[0]);
			event.streams[0].getTracks().forEach(track => {
				console.log('Add a track to the remoteStream:', track);
				this.remoteStream.addTrack(track);
			});
		});
	}

	private async initStream(): Promise<void> {
		this.streamerStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
	}

	private async saveRoom(streamId: string): Promise<void> {
		const offerDescription = await this.pc.createOffer();
		await this.pc.setLocalDescription(offerDescription);
		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type
		};
		const roomRef = doc(this.firestore, 'rooms', streamId);
		await setDoc(roomRef, { offer }).then(() =>
			console.log(`offer has been saved. id=${streamId}, offer=${offerDescription}`)
		);
	}

	private addLocalTracks(): void {
		this.streamerStream.getTracks().forEach(track => {
			this.pc.addTrack(track, this.streamerStream);
		});
	}

	private addRoomListener(streamId: string): void {
		const roomRef = doc(this.firestore, 'rooms', streamId);
		onSnapshot(roomRef, async snapshot => {
			console.log('Got updated stream:', snapshot.data());
			const data = snapshot.data();
			if (!this.pc.currentRemoteDescription && data?.['answer']) {
				console.log('Set remote description: ', data['answer']);
				const answer = new RTCSessionDescription(data['answer']);
				await this.pc.setRemoteDescription(answer);
			}
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
