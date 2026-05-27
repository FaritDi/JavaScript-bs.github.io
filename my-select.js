
class MySelect extends HTMLElement {
  #shadow;
  #selectButton;
  #selectPopup;
  #searchSlot;
  #defaultSearchInput;
  #activeSearchInput;
  #optionsBox;
  #optionsData = [];
  #selectedValues = new Set();
  #isInitialized = false;
  #onOutsideClick = (event) => {
    if (!event.composedPath().includes(this)) {
      this.#closePopup();
    }
  };

  #onSearchInput = (event) => {
    this.#applyFilter(event.target.value);
  };

  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: Arial, sans-serif;
        }

        .select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 220px;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: #f8fafc;
        }

        .label {
          font-size: 14px;
          color: #334155;
        }

        .native-select {
          padding: 8px 10px;
          border: 1px solid #94a3b8;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          cursor: pointer;
        }

        .native-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
      </style>
      <label class="select-wrapper">
        <span class="label">Choose a value:</span>
        <select class="native-select">
          <option value="js">JavaScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </label>
    `;

    options.forEach((option) => {
      const optionElement = optionTemplate.content.firstElementChild.cloneNode(true);
      optionElement.dataset.value = option.value;
      optionElement.querySelector('input').value = option.value;
      optionElement.querySelector('.option-text').textContent = option.text;
      optionsContainer.append(optionElement);
    });

    return optionsContainer;
  }
}

const name = document.currentScript?.dataset?.name || 'my-select';

if (!customElements.get(name)) {
  customElements.define(name, MySelect);
}
