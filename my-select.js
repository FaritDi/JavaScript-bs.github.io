
class MySelect extends HTMLElement {
  #shadow;
  #selectButton;
  #selectPopup;
  #selectPopupSearch;
  #optionsBox;
  #isInitialized = false;

  connectedCallback() {
    if (this.#isInitialized) {
      return;
    }

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#createTemplate();
    this.#isInitialized = true;
  }

  #createTemplate() {
    const options = Array.from(this.querySelectorAll('option')).map((option) => ({
      value: option.value,
      text: option.textContent?.trim() || '',
    }));

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

        .select-popup-search {
          box-sizing: border-box;
          width: 100%;
          margin-bottom: 8px;
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
        <button type="button" class="select-button">Select option</button>
        <div class="select-popup">
          <input class="select-popup-search" placeholder="Search..." />
        </div>
      </div>
    `;

    this.#shadow.replaceChildren(template.content.cloneNode(true));
    this.replaceChildren();

    this.#selectButton = this.#shadow.querySelector('.select-button');
    this.#selectPopup = this.#shadow.querySelector('.select-popup');
    this.#selectPopupSearch = this.#shadow.querySelector('.select-popup-search');
    this.#optionsBox = this.#renderOptions(options);
    this.#selectPopup.append(this.#optionsBox);
    this.#selectButton.addEventListener('click', () => this.#openPopup());
  }

  #openPopup() {
    this.#selectPopup.classList.toggle('open');
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
