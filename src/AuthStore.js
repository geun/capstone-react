import { observable, action, computed } from 'mobx';
import Caver from 'caver-js';

export default class AuthStore {
	@observable authToken = null;

	constructor(rootStore) {
		this.rootStore = rootStore;
		this.authToken = localStorage.getItem('auth_token');

		this.cav = new Caver('https://api.baobab.klaytn.net:8651');
	}

	@action setToken(token) {
		this.authToken = token.token_type + ' ' + token.access_token;
		localStorage.setItem('auth_token', this.authToken);
		localStorage.setItem('refresh_token', token.refresh_token);

		this.rootStore.httpService.getMe().then(me => {
			this.integrateWallet(me.private_key);
		});
	}

	@action deleteToken() {
		this.rootStore.itemStore.clearCartItems();
		localStorage.removeItem('auth_token');
		localStorage.removeItem('refresh_token');
		this.authToken = null;
	}

	@computed get isLoggedIn() {
		return this.authToken != null;
	}

	get refreshToken() {
		return localStorage.getItem('refresh_token');
	}

	@action
	integrateWallet = async privateKey => {
		const walletInstance = this.cav.klay.accounts.privateKeyToAccount(
			privateKey,
		);
		this.cav.klay.accounts.wallet.add(walletInstance);
		sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
	};
}
