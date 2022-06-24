import { App,  Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import {Timer} from './src/timer';

interface MyPluginSettings {
	focus: number;
	break: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	focus: 220,
	break: 5,
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	statusBarDisplay: HTMLElement;
	timer: Timer;


	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon('clock', 'tomato timer', (evt: MouseEvent) => {
			new PluginControlModal(this.app, this).open();
		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');
		this.statusBarDisplay = this.addStatusBarItem();

		this.addCommand({
			id: 'start-tomato-timer-focus',
			name: 'start focus period',
			callback: () => {
				this.timer.reset();
				this.timer.play();
			}
		});

		this.addCommand({
			id: 'start-tomato-timer-break',
			name: 'start break period',
			callback: () => {
				this.timer.mode = 'break';
				this.timer.reset();
				this.timer.play();
			}
		});

		this.addCommand({
			id: 'pause-tomato-timer',
			name: 'pause timer',
			callback: () => {
				this.timer.pause();
			}
		});

		this.addCommand({
			id: 'reset-tomato-timer',
			name: 'reset timer',
			callback: () => {
				this.timer.reset();
			}
		});

		

		this.addSettingTab(new TomatoTimerSettingTab(this.app, this));

		this.registerInterval(window.setInterval(() => {
			this.updateStatusBarItem();
		}, 1000));
	}

	updateStatusBarItem(){
		if (!this.timer) {
			this.statusBarDisplay.setText(`Loading timer...`);
		}
		this.timer.tick();
		let min = String(Math.floor(this.timer.time / 60));
		let sec = String(this.timer.time % 60);
		if (sec.length === 1) {
			sec = '0' + sec;
		}
		if (min.length === 1) {
			min = '0' + min;
		}

		this.statusBarDisplay.setText(`(${this.timer.mode}) ${min}:${sec}`);
	}

	onunload() {}

	async loadSettings() {
		const data = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
		this.timer = new Timer(this.settings.focus, this.settings.break);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class PluginControlModal extends Modal {
	plugin: MyPlugin;
	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
		this.contentEl.className = 'my-plugin-modal';
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.createEl('h2', {text: 'Tomato Timer'});
		// append modal view
		// contentEl.createDiv('modal-content').innerHTML = modal_view;
		new Setting(contentEl)
			.addDropdown((drop) => {
			drop
			.addOption('off','off')
			.addOption('focus', 'focus')
			.addOption('focus', 'break')
			.onChange((value) => {
				this.plugin.timer.setMode(value);
			})})
			.setName('Mode');
		
		new Setting(contentEl)
			.addButton((btn) =>
			btn
			.setButtonText('play')
			.setCta()
			.onClick(() => {
				this.close();
				this.plugin.timer.play();
			}))
			.setName('Play');
		
		new Setting(contentEl)
			.addButton((btn) =>
			btn
			.setButtonText('pause')
			.setCta()
			.onClick(() => {
				this.close();
				this.plugin.timer.pause();
			}))
			.setName('Pause');
		
		new Setting(contentEl)
			.addButton((btn) =>
			btn
			.setButtonText('reset')
			.setCta()
			.onClick(() => {
				this.close();
				this.plugin.timer.reset();
			}))
			.setName('Reset: reset timer to initial state.');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class TomatoTimerSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h2', {text: 'Potato Timer'});

		new Setting(containerEl)
			.setName('Pomodoro')
			.setDesc('focus duration')
			.addText(text => text
				.setPlaceholder('Enter integer (minutes)')
				.setValue(String(this.plugin.settings.focus))
				.onChange(async (value) => {
					this.plugin.settings.focus = Number(value);
					this.plugin.timer.focus_duration = this.plugin.settings.focus * 60;
					this.plugin.timer.reset();
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Short Break')
			.setDesc('break duration')
			.addText(text => text
				.setPlaceholder('Enter integer (minutes)')
				.setValue(String(this.plugin.settings.break))
				.onChange(async (value) => {
					this.plugin.settings.break = Number(value);
					this.plugin.timer.break_duration = this.plugin.settings.break * 60;
					this.plugin.timer.reset();
					await this.plugin.saveSettings();
				}));
	}
}
