class MyPanel extends HTMLElement {
  #shadow;
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
    const header = this.dataset.header || 'Panel';
    const subheader = this.dataset.subheader || '';

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 520px;
          font-family: Inter, Arial, sans-serif;
        }

        .panel {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }

        .panel-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .panel-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
        }

        .panel-subtitle {
          margin-top: 4px;
          font-size: 13px;
          color: #64748b;
        }

        .panel-content {
          padding: 16px;
        }

        .panel-footer {
          padding: 10px 16px 16px;
          border-top: 1px solid #f1f5f9;
        }
      </style>
      <section class="panel">
        <header class="panel-header">
          <h2 class="panel-title">${header}</h2>
          <div class="panel-subtitle">${subheader}</div>
          <slot name="header"></slot>
        </header>
        <div class="panel-content">
          <slot></slot>
        </div>
        <footer class="panel-footer">
          <slot name="footer"></slot>
        </footer>
      </section>
    `;

    this.#shadow.replaceChildren(template.content.cloneNode(true));
  }
}

const panelComponentName = document.currentScript?.dataset?.name || 'my-panel';

if (!customElements.get(panelComponentName)) {
  customElements.define(panelComponentName, MyPanel);
}
