
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
    if (this.#isInitialized) {
      return;
    }

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#createTemplate();
    this.#isInitialized = true;
  }

  disconnectedCallback() {
    this.#closePopup();
    this.#unbindSearchInput();
  }

  get value() {
    return Array.from(this.#selectedValues).join(',');
  }

  set value(nextValue) {
    const nextSet = new Set(
      String(nextValue || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    );

    this.#selectedValues = nextSet;
    this.#syncCheckboxes();
    this.#updateButtonLabel();
  }

  #createTemplate() {
    this.#optionsData = Array.from(this.querySelectorAll('option')).map((option) => ({
      value: option.value,
      text: option.textContent?.trim() || '',
    }));
    this.querySelectorAll('option').forEach((option) => option.remove());

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          position: relative;
          display: inline-block;
          font-family: Inter, Arial, sans-serif;
        }

        .select-root {
          width: 260px;
        }

        .select-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          min-height: 42px;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #ffffff;
          color: #334155;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .select-button:hover {
          border-color: #94a3b8;
        }

        .select-button:focus-visible {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
        }

        .select-button-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .select-button-arrow {
          flex: 0 0 auto;
          margin-left: 10px;
          color: #64748b;
          transition: transform 0.2s ease;
        }

        .select-button.open .select-button-arrow {
          transform: rotate(180deg);
        }

        .select-popup {
          display: none;
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          z-index: 10;
          width: 100%;
          box-sizing: border-box;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: var(--select-popup-background, white);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        }

        .select-popup.open {
          display: block;
        }

        .select-popup slot[name="search"] {
          display: block;
          margin-bottom: 8px;
        }

        .select-popup ::slotted([slot="search"]) {
          display: block;
          margin-bottom: 8px;
        }

        .select-popup-search {
          box-sizing: border-box;
          width: 100%;
          padding: 8px 9px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
        }

        .select-popup-search:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .select-popup-options {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 220px;
          overflow: auto;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 6px;
          border-radius: 4px;
          color: #0f172a;
          cursor: pointer;
        }

        .option:hover {
          background: #f1f5f9;
        }
      </style>
      <div class="select-root">
        <button type="button" class="select-button">
          <span class="select-button-label">Select</span>
          <span class="select-button-arrow">▼</span>
        </button>
        <div class="select-popup">
          <slot name="search">
            <input class="select-popup-search" placeholder="Search..." />
          </slot>
        </div>
      </div>
    `;

    this.#shadow.replaceChildren(template.content.cloneNode(true));
    this.replaceChildren();

    this.#selectButton = this.#shadow.querySelector('.select-button');
    this.#selectPopup = this.#shadow.querySelector('.select-popup');
    this.#searchSlot = this.#shadow.querySelector('slot[name="search"]');
    this.#defaultSearchInput = this.#shadow.querySelector('.select-popup-search');
    this.#optionsBox = this.#renderOptions(this.#optionsData);
    this.#selectPopup.append(this.#optionsBox);

    this.#selectButton.addEventListener('click', () => this.#openPopup());
    this.#optionsBox.addEventListener('change', (event) => this.#onOptionChange(event));
    this.#searchSlot.addEventListener('slotchange', () => this.#bindSearchInput());
    this.#bindSearchInput();
    this.#updateButtonLabel();
  }

  #openPopup() {
    this.#selectPopup.classList.toggle('open');
    if (this.#selectPopup.classList.contains('open')) {
      this.#selectButton.classList.add('open');
      document.addEventListener('click', this.#onOutsideClick);
    } else {
      this.#selectButton.classList.remove('open');
      document.removeEventListener('click', this.#onOutsideClick);
    }
  }

  #closePopup() {
    this.#selectPopup.classList.remove('open');
    this.#selectButton.classList.remove('open');
    document.removeEventListener('click', this.#onOutsideClick);
  }

  #bindSearchInput() {
    this.#unbindSearchInput();

    const slotted = this.#searchSlot
      .assignedElements({ flatten: true })
      .find((element) => element.matches('input') || element.querySelector('input'));

    if (!slotted) {
      this.#activeSearchInput = this.#defaultSearchInput;
      this.#activeSearchInput.addEventListener('input', this.#onSearchInput);
      return;
    }

    this.#activeSearchInput = slotted.matches('input') ? slotted : slotted.querySelector('input');
    if (this.#activeSearchInput) {
      this.#activeSearchInput.addEventListener('input', this.#onSearchInput);
    }
  }

  #unbindSearchInput() {
    if (this.#activeSearchInput) {
      this.#activeSearchInput.removeEventListener('input', this.#onSearchInput);
      this.#activeSearchInput = null;
    }
  }

  #applyFilter(searchText) {
    const normalized = String(searchText || '').trim().toLowerCase();
    this.#optionsBox.querySelectorAll('.option').forEach((optionElement) => {
      const optionText = optionElement.querySelector('.option-text').textContent.toLowerCase();
      optionElement.style.display = optionText.includes(normalized) ? 'flex' : 'none';
    });
  }

  #onOptionChange(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'checkbox') {
      return;
    }

    if (input.checked) {
      this.#selectedValues.add(input.value);
    } else {
      this.#selectedValues.delete(input.value);
    }

    this.#updateButtonLabel();
  }

  #syncCheckboxes() {
    this.#optionsBox.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = this.#selectedValues.has(input.value);
    });
  }

  #updateButtonLabel() {
    const selectedLabels = this.#optionsData
      .filter((option) => this.#selectedValues.has(option.value))
      .map((option) => option.text);

    const label = this.#selectButton.querySelector('.select-button-label');
    label.textContent = selectedLabels.length ? selectedLabels.join(', ') : 'Select';
  }

  #renderOptions(options) {
    const optionsContainerTemplate = document.createElement('template');
    optionsContainerTemplate.innerHTML = `<div class="select-popup-options"></div>`;
    const optionsContainer = optionsContainerTemplate.content.firstElementChild.cloneNode(true);

    const optionTemplate = document.createElement('template');
    optionTemplate.innerHTML = `
      <label class="option" data-value="">
        <input type="checkbox" />
        <span class="option-text"></span>
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

const componentName = document.currentScript?.dataset?.name || 'my-select';

if (!customElements.get(componentName)) {
  customElements.define(componentName, MySelect);
}
