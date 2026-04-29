
class MySelect extends HTMLElement {
  #selectButton;
  #selectPopup;
  #selectPopupSearch;
  #optionsBox;
  #isInitialized = false;

  connectedCallback() {
    if (this.#isInitialized) {
      return;
    }

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
          display: inline-block;
          font-family: Arial, sans-serif;
        }

        .select-root {
          position: relative;
          width: 260px;
        }

        .select-button {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #94a3b8;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          text-align: left;
          cursor: pointer;
        }

        .select-popup {
          margin-top: 8px;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #f8fafc;
        }

        .select-popup-search {
          box-sizing: border-box;
          width: 100%;
          margin-bottom: 8px;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
        }

        .select-popup-options {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e293b;
          cursor: pointer;
        }
      </style>
      <div class="select-root">
        <button type="button" class="select-button">Select option</button>
        <div class="select-popup">
          <input class="select-popup-search" placeholder="Search..." />
          <div class="select-popup-options"></div>
        </div>
      </div>
    `;

    this.replaceChildren(template.content.cloneNode(true));

    this.#selectButton = this.querySelector('.select-button');
    this.#selectPopup = this.querySelector('.select-popup');
    this.#selectPopupSearch = this.querySelector('.select-popup-search');
    this.#optionsBox = this.#renderOptions(options);
    this.#selectPopup.append(this.#optionsBox);
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
