with open("client/src/pages/Arcade.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# 1. Find the modal content to copy
start_modal = -1
end_modal = -1
for i, line in enumerate(lines):
    if '<div className="curr-modal-grid">' in line:
        start_modal = i
    if '</div>' in line and '<!-- Right Side' not in line:
        # We need to find the exact end of curr-modal-grid
        pass

# Actually, we know the exact line numbers from our previous view_file:
# 681: <div className="curr-modal-grid">
# 837: </div>
# Wait, let's just extract it dynamically by counting div tags
modal_content = []
in_modal = False
div_count = 0
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<div className="curr-modal-grid">' in line:
        in_modal = True
        start_idx = i
    
    if in_modal:
        modal_content.append(line)
        div_count += line.count('<div') - line.count('</div')
        if div_count == 0:
            end_idx = i
            break

# Also find the dashboard to wrap
dash_start = -1
dash_end = -1
for i, line in enumerate(lines):
    if '<motion.div' in line and 'key="curriculum-dashboard"' in line:
        dash_start = i
dash_count = 0
for i in range(dash_start, len(lines)):
    dash_count += lines[i].count('<div') - lines[i].count('</div')
    dash_count += lines[i].count('<motion.div') - lines[i].count('</motion.div')
    if dash_count == 0:
        dash_end = i
        break

dash_content = "".join(lines[dash_start:dash_end+1])
modal_str = "".join(modal_content).replace('curr-modal-grid', 'curr-page-grid').replace('curr-modal-left', 'curr-page-left').replace('curr-modal-right', 'curr-page-right')

new_logic = f"""                        activeSubjModal ? (
                            <motion.div
                                key="curriculum-subject-view"
                                initial={{{{ opacity: 0, x: 20 }}}}
                                animate={{{{ opacity: 1, x: 0 }}}}
                                exit={{{{ opacity: 0, x: -20 }}}}
                                transition={{{{ duration: 0.3 }}}}
                                className="curr-subject-page-container"
                            >
                                <button className="curr-back-btn" onClick={{() => {{
                                    setActiveSubjModal(null);
                                    setEthicalChoice(null);
                                    setGenAiResponse('');
                                    setMlResult(null);
                                    setArchLogs([]);
                                }}}}>
                                    <ArrowLeft size={{16}} /> Back to Curriculum Track
                                </button>
{modal_str}                            </motion.div>
                        ) : (
{dash_content}                        )
"""

# Now replace dash_content in the original string with new_logic
original_text = "".join(lines)
new_text = original_text.replace(dash_content, new_logic)

# Remove the bottom modal overlay
import re
new_text = re.sub(r"\{\/\* Immersive Subject Modal \*\/\}.*?</AnimatePresence>", "", new_text, flags=re.DOTALL)

with open("client/src/pages/Arcade.jsx", "w", encoding="utf-8") as f:
    f.write(new_text)

print("Done successfully!")
