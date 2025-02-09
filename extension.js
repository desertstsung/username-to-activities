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
		
		handleDragOver(source, _actor, _x, _y, _time) {
			if (source != Main.xdndHandler)
				return DND.DragMotionResult.CONTINUE;

			if (this._xdndTimeOut != 0)
				GLib.source_remove(this._xdndTimeOut);
			GLib.Source.set_name_by_id(this._xdndTimeOut, '[gnome-shell] this._xdndToggleOverview');

			return DND.DragMotionResult.CONTINUE;
		}

		vfunc_captured_event(event) {
			if (event.type() == Clutter.EventType.BUTTON_PRESS ||
				event.type() == Clutter.EventType.TOUCH_BEGIN) {
				if (!Main.overview.shouldToggleByCornerOrButton())
					return Clutter.EVENT_STOP;
			}
			return Clutter.EVENT_PROPAGATE;
		}

		vfunc_event(event) {
			if (event.type() == Clutter.EventType.TOUCH_END ||
				event.type() == Clutter.EventType.BUTTON_RELEASE) {
				if (Main.overview.shouldToggleByCornerOrButton())
					Main.overview.toggle();
			}

			return Clutter.EVENT_PROPAGATE;
		}

		vfunc_key_release_event(keyEvent) {
			let symbol = keyEvent.keyval;
			if (symbol == Clutter.KEY_Return || symbol == Clutter.KEY_space) {
				if (Main.overview.shouldToggleByCornerOrButton()) {
					Main.overview.toggle();
					return Clutter.EVENT_STOP;
				}
			}

			return Clutter.EVENT_PROPAGATE;
		}

		_xdndToggleOverview() {
			let [x, y] = global.get_pointer();
			let pickedActor = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);

			if (pickedActor == this && Main.overview.shouldToggleByCornerOrButton())
				Main.overview.toggle();

			GLib.source_remove(this._xdndTimeOut);
			this._xdndTimeOut = 0;
			return GLib.SOURCE_REMOVE;
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
