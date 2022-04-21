/*  forked from https://github.com/PRATAP-KUMAR/replace-activities-text  */
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const { Atk, Clutter, GLib, GObject, Meta, Shell, St } = imports.gi;

let newact;

var NewActivitiesButton = GObject.registerClass(
	class NewActivitiesButton extends PanelMenu.Button {
		_init() {
			super._init(0.0, null, true);
			this.accessible_role = Atk.Role.TOGGLE_BUTTON;

			this.name = 'panelActivities';

			/* Translators: If there is no suitable word for "Activities"
			   in your language, you can use the word for "Overview". */
			this._label = new St.Label({
				text: GLib.get_real_name(),
				y_align: Clutter.ActorAlign.CENTER,
			});
			this.add_actor(this._label);

			this.label_actor = this._label;

			this._xdndTimeOut = 0;
		}
	}
);

function enable() {
	Main.panel.statusArea.activities.container.hide();
	newact = new NewActivitiesButton();
	Main.panel.addToStatusArea('activities-icon-button', newact, 0, 'left');
}

function disable() {
	newact.destroy();
	newact = null;
	if (Main.sessionMode.currentMode == 'unlock-dialog')
		Main.panel.statusArea.activities.container.hide();
	else
		Main.panel.statusArea.activities.container.show();
}
