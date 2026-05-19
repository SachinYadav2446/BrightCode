with open("client/src/pages/Arcade.css", "r", encoding="utf-8") as f:
    css = f.read()

# Replace modal grid with page grid
css = css.replace('.curr-modal-grid', '.curr-page-grid')
css = css.replace('.curr-modal-left', '.curr-page-left')
css = css.replace('.curr-modal-right', '.curr-page-right')

# Add styles for the full page container
new_styles = """
/* ── FULL PAGE SUBJECT VIEW ─────────────────────────────────────────────── */
.curr-subject-page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    animation: fadeIn 0.3s ease;
}

.curr-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: flex-start;
    margin-bottom: 24px;
}

.curr-back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.2);
}

.curr-page-grid {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 24px;
    flex: 1;
    min-height: 0; /* required for child overflow */
}

.curr-page-left {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
}

.curr-page-right {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Ensure tabs render horizontally and properly spaced */
.curr-modal-tabs {
    display: flex;
    flex-direction: row;
    gap: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 6px;
    margin-bottom: 24px;
    width: 100%;
}

.curr-modal-tab-btn {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
}
"""

css += new_styles

with open("client/src/pages/Arcade.css", "w", encoding="utf-8") as f:
    f.write(css)

print("CSS updated!")
