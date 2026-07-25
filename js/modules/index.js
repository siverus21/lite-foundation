import { Modal } from './modal.js';
import { Slider } from './slider.js';
import { FormSlider } from './form-slider.js';
import { Animations } from './animations.js';
import { Tabs } from './tabs.js';
import { Accordion } from './accordion.js';
import { Offcanvas } from './offcanvas.js';
import { Dropdown } from './dropdown.js';
import { Tooltip } from './tooltip.js';
import { Menus } from './menus.js';

/**
 * Register and run enabled UI modules (see config/features.js).
 * GENERATED — do not edit by hand.
 */
export function initModules() {
  const modules = [
    Modal,
    Slider,
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
