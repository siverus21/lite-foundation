import { Modal } from '../../modules/modal.js';
import { FormSlider } from '../../modules/form-slider.js';
import { Animations } from '../../modules/animations.js';
import { Tabs } from '../../modules/tabs.js';
import { Accordion } from '../../modules/accordion.js';
import { Offcanvas } from '../../modules/offcanvas.js';
import { Dropdown } from '../../modules/dropdown.js';
import { Tooltip } from '../../modules/tooltip.js';
import { Menus } from '../../modules/menus.js';

/**
 * Register and run enabled UI modules (see config/features.js builds).
 * GENERATED — do not edit by hand.
 */
export function initModules() {
  const modules = [
    Modal,
    FormSlider,
    Animations,
    Tabs,
    Accordion,
    Offcanvas,
    Dropdown,
    Tooltip,
    Menus,
  ];

  modules.forEach((Module) => {
    try {
      new Module();
    } catch (error) {
      console.error('[lite-foundation] module init failed:', Module.name, error);
    }
  });
}
